/**
 * PayPal Orders v2 — Villa Paradise Tahiti (Phase E2).
 *
 * Two helpers:
 *   - `createPayPalOrder` : POST /v2/checkout/orders. Returns the order id
 *     plus the `approve` link the user must be redirected to.
 *   - `capturePayPalOrder`: POST /v2/checkout/orders/{id}/capture. Run
 *     after PayPal sends the user back to our `return_url` (we also run
 *     it again in the webhook for fire-and-forget reliability).
 *
 * Same shape as the Stripe helpers: a discriminated `{ ... } | { error }`
 * return — never throws across the boundary, so the API route can render
 * a clean error to the visitor.
 */

import { getPayPalAccessToken, PAYPAL_BASE } from './client'

/* ---------------------------------------------------------------------------
 * Site URL — production fallback
 * ------------------------------------------------------------------------- */

function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw && raw.length > 0) return raw.replace(/\/$/, '')
  return 'https://villaparadisetahiti.com'
}

/* ---------------------------------------------------------------------------
 * Create order
 * ------------------------------------------------------------------------- */

export interface CreatePayPalOrderParams {
  reservationId: string
  depositAmountUSD: number
  customer: { email: string }
  metadata: Record<string, string>
}

export type CreatePayPalOrderResult =
  | { orderId: string; approveUrl: string }
  | { error: string }

interface PayPalLink {
  href: string
  rel: string
  method?: string
}

interface PayPalOrderResponse {
  id?: string
  status?: string
  links?: PayPalLink[]
  // Only included on the capture response, but kept for shared shape.
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string
        status?: string
      }>
    }
  }>
}

/**
 * Create a PayPal order for the booking deposit (30% of total).
 *
 * `custom_id` carries the reservation id end-to-end so the webhook can
 * cross-reference it with the Resend payload built from the metadata.
 *
 * Note: PayPal does **not** support arbitrary string metadata the way
 * Stripe does. We attach the reservation id to `custom_id`, the
 * `reference_id`, and `invoice_id` for the highest chance of recovery —
 * customer-visible fields (`reference_id`) are also surfaced on the
 * approval screen, so we keep them clean.
 */
export async function createPayPalOrder(
  params: CreatePayPalOrderParams,
): Promise<CreatePayPalOrderResult> {
  const { reservationId, depositAmountUSD, customer, metadata } = params

  if (!depositAmountUSD || depositAmountUSD <= 0) {
    return { error: 'Computed deposit amount is zero — refusing to create PayPal order.' }
  }

  const token = await getPayPalAccessToken()
  if (!token) {
    return { error: 'PayPal is not configured on the server.' }
  }

  const siteUrl = getSiteUrl()

  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: reservationId,
        custom_id: reservationId,
        invoice_id: reservationId,
        description: 'Villa Paradise Tahiti — Booking Deposit (30%)',
        amount: {
          currency_code: 'USD',
          value: depositAmountUSD.toFixed(2),
        },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: 'Villa Paradise Tahiti',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${siteUrl}/booking/paypal/return?ref=${encodeURIComponent(reservationId)}`,
          cancel_url: `${siteUrl}/booking/cancel?ref=${encodeURIComponent(reservationId)}`,
          payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
        email_address: customer.email,
      },
    },
  }

  try {
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Idempotency: PayPal de-duplicates orders with the same request id
        // within 6 hours. The reservation id is unique enough for our scale.
        'PayPal-Request-Id': reservationId,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      // eslint-disable-next-line no-console
      console.error('[paypal:create-order] failed', res.status, errorText, { reservationId })
      return { error: `PayPal order creation failed (${res.status}).` }
    }

    const data = (await res.json()) as PayPalOrderResponse

    if (!data.id) {
      return { error: 'PayPal response missing order id.' }
    }

    const approveLink =
      data.links?.find((link) => link.rel === 'payer-action' || link.rel === 'approve')

    if (!approveLink) {
      return { error: 'PayPal response missing approve link.' }
    }

    // metadata is currently unused by PayPal but logged for traceability —
    // future TODO: persist it server-side so we can reconcile beyond the
    // 6-hour PayPal-Request-Id window.
    if (metadata && Object.keys(metadata).length > 0) {
      // eslint-disable-next-line no-console
      console.info('[paypal:create-order] created', {
        orderId: data.id,
        reservationId,
        keys: Object.keys(metadata).length,
      })
    }

    return { orderId: data.id, approveUrl: approveLink.href }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // eslint-disable-next-line no-console
    console.error('[paypal:create-order] exception', message)
    return { error: `PayPal order creation failed: ${message}` }
  }
}

/* ---------------------------------------------------------------------------
 * Capture order
 * ------------------------------------------------------------------------- */

export type CapturePayPalOrderResult =
  | { status: string; captureId?: string; reservationId?: string }
  | { error: string }

/**
 * Capture funds for an approved order. Idempotent on PayPal's side when
 * called twice with the same order id (after the first capture, subsequent
 * calls return `422 ORDER_ALREADY_CAPTURED`, which we treat as success).
 */
export async function capturePayPalOrder(
  orderId: string,
): Promise<CapturePayPalOrderResult> {
  const token = await getPayPalAccessToken()
  if (!token) {
    return { error: 'PayPal is not configured on the server.' }
  }

  try {
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Same idempotency strategy: same key → same response within 6h.
        'PayPal-Request-Id': `capture-${orderId}`,
      },
      // PayPal requires either an empty body or `{}` — both work.
      body: JSON.stringify({}),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      // Already-captured is not an error in our flow — treat as success
      // when PayPal reports the order as completed.
      if (errorText.includes('ORDER_ALREADY_CAPTURED')) {
        return { status: 'COMPLETED' }
      }
      // eslint-disable-next-line no-console
      console.error('[paypal:capture] failed', res.status, errorText, { orderId })
      return { error: `PayPal capture failed (${res.status}).` }
    }

    const data = (await res.json()) as PayPalOrderResponse & {
      purchase_units?: Array<{
        reference_id?: string
        payments?: {
          captures?: Array<{ id?: string; status?: string }>
        }
      }>
    }

    const unit = data.purchase_units?.[0]
    const capture = unit?.payments?.captures?.[0]

    return {
      status: data.status ?? capture?.status ?? 'UNKNOWN',
      captureId: capture?.id,
      reservationId: unit?.reference_id,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // eslint-disable-next-line no-console
    console.error('[paypal:capture] exception', message)
    return { error: `PayPal capture failed: ${message}` }
  }
}

/* ---------------------------------------------------------------------------
 * Fetch order (used by webhook + return page for safety re-checks)
 * ------------------------------------------------------------------------- */

export type GetPayPalOrderResult =
  | {
      id: string
      status: string
      reservationId?: string
      customerEmail?: string
      depositAmountUSD?: number
    }
  | { error: string }

/**
 * Look up an order's current state. Used by the webhook to extract the
 * `reservation_id` (custom_id) and the captured amount, and by the
 * `/booking/paypal/return` page if we ever need to redirect on failure.
 */
export async function getPayPalOrder(orderId: string): Promise<GetPayPalOrderResult> {
  const token = await getPayPalAccessToken()
  if (!token) return { error: 'PayPal is not configured on the server.' }

  try {
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      // eslint-disable-next-line no-console
      console.error('[paypal:get-order] failed', res.status, errorText, { orderId })
      return { error: `PayPal order lookup failed (${res.status}).` }
    }

    const data = (await res.json()) as {
      id?: string
      status?: string
      purchase_units?: Array<{
        reference_id?: string
        custom_id?: string
        amount?: { value?: string }
      }>
      payer?: { email_address?: string }
    }

    if (!data.id) {
      return { error: 'PayPal order response missing id.' }
    }

    const unit = data.purchase_units?.[0]
    const depositRaw = unit?.amount?.value
    const depositAmountUSD = depositRaw ? Number(depositRaw) : undefined

    return {
      id: data.id,
      status: data.status ?? 'UNKNOWN',
      reservationId: unit?.custom_id ?? unit?.reference_id,
      customerEmail: data.payer?.email_address,
      depositAmountUSD: Number.isFinite(depositAmountUSD) ? depositAmountUSD : undefined,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // eslint-disable-next-line no-console
    console.error('[paypal:get-order] exception', message)
    return { error: `PayPal order lookup failed: ${message}` }
  }
}

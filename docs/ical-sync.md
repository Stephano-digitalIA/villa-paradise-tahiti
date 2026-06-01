# iCal sync — Airbnb / Booking.com / VRBO

The site keeps a unified view of every external booking by polling each
host platform's iCal feed every hour. Persisted rows live in the Supabase
table `blocked_dates` (one row per external reservation) and feed:

- **/admin/calendar** — the visual occupancy grid
- **/admin/reservations/[id] → LinkClientPanel** — when a synced range
  matches a guest, the admin can attach it to a CRM client
- **/api/booking/availability** — public JSON consumed by the date picker

---

## 1. One-time setup

### a) Generate the 3 iCal URLs (host-side)

| Platform | Where to click |
|---|---|
| **Airbnb** | Today → Calendar → ⚙ (settings) → Sync calendars → **Export calendar** → copy the `.ics` URL |
| **Booking.com** | Extranet → Rates & Availability → **Sync calendars** → Export calendars tab → copy your property's iCal link |
| **VRBO** | Calendar → Settings → **Reservation manager** → iCal export → copy the URL |

These URLs **are credentials**: anyone with the link can read every
booking on the calendar. Never commit them.

### b) Configure environment variables

Locally in `.env.local`, on Netlify in *Site configuration →
Environment variables*. Add all 4 even if one source isn't ready yet —
empty values are tolerated.

```env
AIRBNB_ICAL_URL=https://www.airbnb.com/calendar/ical/xxx.ics
BOOKING_ICAL_URL=https://admin.booking.com/hotel/hoteladmin/ical.html?ses=...
VRBO_ICAL_URL=https://www.vrbo.com/icalendar/xxx.ics

# Used by both /api/ical/sync and netlify/functions/ical-sync.mts.
# Generate once with: openssl rand -hex 32
CRON_SECRET=<long-random-string>
```

### c) Apply the DB migration

If migration `006_blocked_dates_ical.sql` hasn't been applied yet:

- **Hosted Supabase**: paste the file into the SQL Editor and run.
- **Local Supabase CLI**: `npx supabase db push`.

This adds `'booking'` to the `source` CHECK and creates the
`(source, source_ref)` unique index required for the upsert pattern.

---

## 2. How the sync runs

- **Netlify Scheduled Function** [`netlify/functions/ical-sync.mts`](../netlify/functions/ical-sync.mts)
  fires every hour (`@hourly`).
- It calls `GET /api/ical/sync` on the deployed site with
  `Authorization: Bearer ${CRON_SECRET}`.
- The route fetches all 3 feeds in parallel, parses them, and:
  1. **Upserts** each VEVENT into `blocked_dates` keyed by
     `(source, source_ref=UID)`.
  2. **Deletes** rows from each source whose UID is no longer in the
     feed → handles cancellations on the host side automatically.
  3. Refreshes the in-memory cache used by
     `/api/booking/availability`.

Rows with `source IN ('direct_booking','owner','maintenance')` are
**never touched** by this sync — they're owned by the payment webhooks
and the manual admin flow.

---

## 3. Manual run / debugging

```bash
# From any machine with curl + the secret:
curl -H "Authorization: Bearer $CRON_SECRET" https://villa-paradise-tahiti-thierry.netlify.app/api/ical/sync
```

Response shape:

```json
{
  "ok": true,
  "mode": "live",
  "mergedCount": 12,
  "sources": { "airbnb": 8, "vrbo": 2, "booking": 3 },
  "persistence": {
    "perSource": {
      "airbnb": { "upserted": 8, "deleted": 0, "skippedNoUid": 0 },
      "vrbo":   { "upserted": 2, "deleted": 1, "skippedNoUid": 0 },
      "booking":{ "upserted": 3, "deleted": 0, "skippedNoUid": 0 }
    },
    "durationMs": 1843
  },
  "syncedAt": "2026-05-31T..."
}
```

Common returns:

- `mode: "mock"` → no `*_ICAL_URL` configured → falls back to fixture data
  in `lib/ical/mock.ts`. Don't deploy with this.
- `skippedNoUid > 0` → some VEVENTs lacked a stable `UID` field. Those
  are not persisted (upserting them safely is impossible) but they do
  appear in the in-memory merged cache served by `/api/booking/availability`.
- `401 Unauthorized` → the bearer token doesn't match `CRON_SECRET`.

---

## 4. What this does **not** do

- It doesn't fetch guest identity. iCal feeds only expose dates + a
  summary like `"Reserved"` or `"CLOSED - Not available"`. To attach a
  CRM client to an external reservation, use the **Link to a client**
  panel inside `/admin/reservations/[id]`.
- It doesn't push back to the platforms. This is a read-only mirror —
  blocking dates on the website does not block them on Airbnb. For a
  bidirectional sync use the Channel Manager features in each host's
  PMS or a paid product like Hostaway / Smoobu.

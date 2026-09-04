/**
 * Newsletter rendering, kept free of any Node import on purpose.
 *
 * The admin preview is a client component and needs the exact same HTML the
 * recipient will get. If these functions lived next to the token helpers in
 * `./index.ts`, importing them in the browser would drag `node:crypto` into
 * the client bundle and fail the build. Import from `@/lib/newsletter/render`
 * on the client, and from `@/lib/newsletter` on the server.
 */

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" style="color:#006994">$1</a>',
    )
}

/**
 * Render the operator's plain text into the body of an email.
 *
 * The admin composes in light Markdown, which is what a non-technical operator
 * will actually type without being taught anything: a line starting with `#` is
 * a heading, `**bold**` is bold, `[text](url)` is a link, a blank line starts a
 * paragraph. Everything is escaped first, so a stray `<` in the text cannot
 * inject markup into the email.
 */
export function renderNewsletterHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const heading = block.match(/^(#{1,3})\s+(.*)$/)
      if (heading) {
        const level = heading[1].length
        const size = [22, 18, 16][level - 1]
        return `<h${level} style="font-size:${size}px;margin:24px 0 8px;color:#1A2A3A">${inline(heading[2])}</h${level}>`
      }
      if (/^[-*]\s+/.test(block)) {
        const items = block
          .split('\n')
          .map((l) => l.replace(/^[-*]\s+/, '').trim())
          .filter(Boolean)
          .map((l) => `<li style="margin-bottom:6px">${inline(l)}</li>`)
          .join('')
        return `<ul style="padding-left:20px;margin:12px 0">${items}</ul>`
      }
      return `<p style="margin:0 0 14px;line-height:1.6">${inline(block.replace(/\n/g, '<br>'))}</p>`
    })
    .join('')
}

/** Plain-text twin of the HTML body, for clients that refuse HTML. */
export function renderNewsletterText(body: string, unsubUrl: string): string {
  const plain = body
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)')
  return `${plain}\n\n---\nSe désinscrire en un clic : ${unsubUrl}`
}

/**
 * The complete email, shell included.
 *
 * One function for both the send and the admin preview, so what the operator
 * approves is byte for byte what leaves. A preview built separately would
 * drift from the real thing on the first change to either.
 */
export function buildNewsletterEmailHtml(
  subject: string,
  body: string,
  unsubUrl: string,
): string {
  return `<!doctype html><html><body style="margin:0;background:#FAFAF8;padding:24px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E3E5E1;border-radius:14px;padding:32px;font-family:Helvetica,Arial,sans-serif;color:#1A2A3A;font-size:15px">
<tr><td>
<p style="margin:0 0 4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#A88B3D">Villa Paradise Tahiti</p>
<h1 style="margin:0 0 22px;font-size:24px;font-weight:600;color:#1A2A3A">${escapeHtml(subject)}</h1>
${renderNewsletterHtml(body)}
<hr style="border:0;border-top:1px solid #E3E5E1;margin:28px 0 14px">
<p style="margin:0;font-size:12px;color:#8A949E">
You are receiving this because you subscribed to The Slow Letter.
<a href="${unsubUrl}" style="color:#8A949E">Unsubscribe in one click</a>.
</p>
</td></tr></table>
</td></tr></table>
</body></html>`
}

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Renders an operator-authored Markdown override for a legal page.
 * Sits inside the `prose` wrapper from the legal layout, so headings,
 * lists and links inherit the same typography as the hardcoded defaults.
 * Raw HTML is not allowed (react-markdown sanitizes by default).
 */
export function LegalMarkdown({ markdown }: { markdown: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
}

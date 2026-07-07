import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownViewProps = {
  content: string
}

function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <article className="markdown-view">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            const isExternal = href?.startsWith('http')
            return (
              <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noreferrer' : undefined}>
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}

export default MarkdownView

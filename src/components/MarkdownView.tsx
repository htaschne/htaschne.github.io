import { isValidElement } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

type MarkdownViewProps = {
  content: string
  className?: string
}

function isCenteredDiagramCode(children: unknown) {
  if (!isValidElement<{ className?: string }>(children)) {
    return false
  }

  return children.props.className?.split(' ').includes('language-centered-diagram') ?? false
}

function MarkdownView({ content, className }: MarkdownViewProps) {
  const isBlogPost = className?.split(' ').includes('markdown-view--blog-post')

  return (
    <article className={`markdown-view${className ? ` ${className}` : ''}`} data-reveal>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a({ href, children }) {
            const isExternal = href?.startsWith('http')
            return (
              <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noreferrer' : undefined}>
                {children}
              </a>
            )
          },
          pre({ children }) {
            const isCenteredDiagram = isBlogPost && isCenteredDiagramCode(children)

            return <pre className={isCenteredDiagram ? 'wide-diagram centered-diagram' : undefined}>{children}</pre>
          },
          table({ children }) {
            if (!isBlogPost) {
              return <table>{children}</table>
            }

            return (
              <div className="markdown-table-scroll">
                <table>{children}</table>
              </div>
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

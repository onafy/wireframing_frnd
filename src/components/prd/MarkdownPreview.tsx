interface MarkdownPreviewProps {
  markdown: string
}

export default function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const blocks = tokenizeMarkdown(markdown)

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === 'h1') {
          return (
            <h1 key={`${block.type}-${index}`} className="text-base font-semibold text-white/90">
              {block.content}
            </h1>
          )
        }

        if (block.type === 'h2') {
          return (
            <h2 key={`${block.type}-${index}`} className="pt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/48">
              {block.content}
            </h2>
          )
        }

        if (block.type === 'list') {
          return (
            <ul key={`${block.type}-${index}`} className="space-y-2">
              {block.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-6 text-white/84">
                  <span className="mt-2 h-1 w-1 rounded-full bg-white/42" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={`${block.type}-${index}`} className="text-sm leading-6 text-white/84">
            {block.content}
          </p>
        )
      })}
    </div>
  )
}

type MarkdownBlock =
  | { type: 'h1' | 'h2' | 'paragraph'; content: string }
  | { type: 'list'; items: string[] }

function tokenizeMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.split(/\r?\n/)
  const blocks: MarkdownBlock[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()

    if (!line) continue

    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', content: line.replace(/^#\s+/, '').trim() })
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', content: line.replace(/^##\s+/, '').trim() })
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []

      for (let listIndex = index; listIndex < lines.length; listIndex += 1) {
        const listLine = lines[listIndex].trim()
        const match = listLine.match(/^[-*]\s+(.*)$/)

        if (!match) break

        items.push(match[1].trim())
        index = listIndex
      }

      blocks.push({ type: 'list', items })
      continue
    }

    const paragraphLines = [line]

    for (let paragraphIndex = index + 1; paragraphIndex < lines.length; paragraphIndex += 1) {
      const nextLine = lines[paragraphIndex].trim()

      if (!nextLine || nextLine.startsWith('#') || /^[-*]\s+/.test(nextLine)) break

      paragraphLines.push(nextLine)
      index = paragraphIndex
    }

    blocks.push({ type: 'paragraph', content: paragraphLines.join(' ') })
  }

  return blocks
}

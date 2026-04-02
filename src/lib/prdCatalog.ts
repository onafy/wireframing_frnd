const prdModules = import.meta.glob('/docs/prds/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

export interface ParsedPrd {
  path: string
  filename: string
  raw: string
  title: string
  summary: string
  requirements: string[]
}

const parsedCache = new Map<string, ParsedPrd>()

export function getPrdRecord(prdPath?: string) {
  if (!prdPath) return null
  const normalizedPath = prdPath.startsWith('/') ? prdPath : `/${prdPath}`
  const raw = prdModules[normalizedPath]

  if (!raw) return null
  const cached = parsedCache.get(normalizedPath)
  if (cached) return cached

  const parsed = parsePrdMarkdown(raw, prdPath)
  parsedCache.set(normalizedPath, parsed)
  return parsed
}

function parsePrdMarkdown(raw: string, prdPath: string): ParsedPrd {
  const lines = raw.split(/\r?\n/)
  const titleMatch = lines.find((line) => /^#\s+/.test(line))
  const summaryLines = extractSection(lines, 'Summary')
  const requirementLines = extractSection(lines, 'Requirements')

  return {
    path: prdPath,
    filename: prdPath.split('/').pop() ?? prdPath,
    raw,
    title: titleMatch?.replace(/^#\s+/, '').trim() || prdPath.split('/').pop() || 'Untitled PRD',
    summary: summaryLines
      .filter((line) => line.trim())
      .join(' ')
      .trim(),
    requirements: requirementLines
      .map((line) => line.match(/^[-*]\s+(.*)$/)?.[1]?.trim())
      .filter((line): line is string => Boolean(line)),
  }
}

function extractSection(lines: string[], heading: string) {
  const headingMatcher = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'i')
  const startIndex = lines.findIndex((line) => headingMatcher.test(line.trim()))

  if (startIndex === -1) return []

  const sectionLines: string[] = []

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]

    if (/^##\s+/.test(line.trim())) break
    sectionLines.push(line)
  }

  return sectionLines
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export interface WireframeGitCommit {
  hash: string
  author: string
  date: string
  subject: string
  links: {
    commit: string
    blob: string
  }
}

export interface WireframeGitHistoryResponse {
  commits: WireframeGitCommit[]
  githubBase?: string | null
  primaryPath?: string
  error?: string
}

export async function fetchWireframeGitHistory(sourcePaths: string[]): Promise<WireframeGitHistoryResponse> {
  const params = new URLSearchParams()
  for (const p of sourcePaths) {
    params.append('path', p)
  }
  const res = await fetch(`/__wireframe-git-history?${params.toString()}`)
  if (!res.ok) {
    return { commits: [], error: `Request failed (${res.status})` }
  }
  return (await res.json()) as WireframeGitHistoryResponse
}

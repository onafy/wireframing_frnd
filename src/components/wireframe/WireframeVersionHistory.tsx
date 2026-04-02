import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, GitBranch, Minimize2 } from 'lucide-react'
import type { WireframeEntry } from '@/data/wireframeRegistry'
import type { WireframeGitCommit } from '@/lib/wireframeGitHistory'
import { fetchWireframeGitHistory } from '@/lib/wireframeGitHistory'

interface WireframeVersionHistoryProps {
  wireframe: WireframeEntry | null
}

export default function WireframeVersionHistory({ wireframe }: WireframeVersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [history, setHistory] = useState<{ commits: WireframeGitCommit[]; error: string | null } | null>(null)

  useEffect(() => {
    if (!import.meta.env.DEV || !wireframe) return

    let cancelled = false

    fetchWireframeGitHistory(wireframe.sourcePaths)
      .then((data) => {
        if (cancelled) return
        setHistory({
          commits: data.commits,
          error: data.error ?? null,
        })
      })
      .catch(() => {
        if (cancelled) return
        setHistory({ commits: [], error: 'Could not load version history' })
      })

    return () => {
      cancelled = true
    }
  }, [wireframe])

  const commits = history?.commits ?? []
  const error = history?.error ?? null
  const loading = history === null

  if (!import.meta.env.DEV || !wireframe) return null

  return (
    <div className="pointer-events-none fixed left-4 top-5 z-40 flex items-start gap-3">
      {isOpen ? (
        <aside className="pointer-events-auto w-[360px] overflow-hidden rounded-3xl border border-[#262626] bg-[#121212]/98 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="border-b border-[#232323] px-5 py-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#7b7b7b]">Version history</p>
                <h2 className="mt-1 text-sm font-semibold text-[#f1f1f1]">Last 3 commits</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-[#2d2d2d] bg-[#191919] p-2 text-[#9e9e9e] transition hover:border-[#3a3a3a] hover:bg-[#1f1f1f] hover:text-[#e9e9e9]"
                aria-label="Collapse version history"
              >
                <ChevronLeft size={14} />
              </button>
            </div>

            <p className="text-[11px] leading-5 text-[#8a8a8a]">
              Tracks <span className="text-[#c4c4c4]">{wireframe.sourcePaths.join(', ')}</span>. Open a commit or file at revision on GitHub.
            </p>
          </div>

          <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-5 py-4">
            {loading ? (
              <p className="text-sm text-[#a0a0a0]">Loading history…</p>
            ) : error && commits.length === 0 ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 text-sm text-amber-100/90">{error}</div>
            ) : commits.length === 0 ? (
              <p className="text-sm leading-6 text-[#a0a0a0]">No commits found for these paths yet.</p>
            ) : (
              <ul className="space-y-3">
                {commits.map((c, idx) => (
                  <li
                    key={c.hash}
                    className="rounded-2xl border border-[#2a2a2a] bg-[#171717] p-4 text-[#ededed]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="shrink-0 rounded-full border border-[#2d2d2d] bg-[#141414] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#9a9a9a]">
                        v{idx + 1}
                      </span>
                      <span className="truncate font-mono text-[10px] text-[#6e6e6e]">{c.hash.slice(0, 7)}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-[#f0f0f0]">{c.subject || '(no subject)'}</p>
                    <p className="mt-1 text-xs text-[#9e9e9e]">
                      {c.author}
                      <span className="text-[#4a4a4a]"> · </span>
                      {formatCommitDate(c.date)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.links.commit ? (
                        <a
                          href={c.links.commit}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#2d2d2d] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-[#d6d6d6] transition hover:border-[#3a3a3a] hover:bg-[#202020] hover:text-[#f0f0f0]"
                        >
                          Commit
                          <ExternalLink size={12} />
                        </a>
                      ) : null}
                      {c.links.blob ? (
                        <a
                          href={c.links.blob}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#2d2d2d] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-[#d6d6d6] transition hover:border-[#3a3a3a] hover:bg-[#202020] hover:text-[#f0f0f0]"
                        >
                          File at revision
                          <ExternalLink size={12} />
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {error && commits.length > 0 ? (
              <p className="mt-3 text-xs text-amber-200/80">{error}</p>
            ) : null}
          </div>
        </aside>
      ) : null}

      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#121212]/96 text-[#c2c2c2] shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-[#383838] hover:bg-[#171717] hover:text-[#f0f0f0]"
          aria-label="Show version history"
        >
          <GitBranch size={16} />
        </button>
      ) : (
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#121212]/96 px-3 py-2.5 text-[#ededed] shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-[#383838] hover:bg-[#171717]">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex min-w-0 items-center gap-3 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b1b1b] text-[#b7b7b7]">
              <GitBranch size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#757575]">Version history</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-medium text-[#f2f2f2]">
                  {loading ? '…' : `${commits.length} commit${commits.length === 1 ? '' : 's'}`}
                </span>
                <span className="text-[#4a4a4a]">·</span>
                <span className="truncate text-xs text-[#a8a8a8]">dev only</span>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[#8e8e8e]" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#181818] text-[#8e8e8e] transition hover:border-[#383838] hover:bg-[#1f1f1f] hover:text-[#ededed]"
            aria-label="Minimize version history"
          >
            <Minimize2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function formatCommitDate(iso: string): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

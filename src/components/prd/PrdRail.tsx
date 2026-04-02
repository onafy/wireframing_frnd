import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, FileText, Minimize2, TriangleAlert, UserRound } from 'lucide-react'
import type { WireframeEntry } from '@/data/wireframeRegistry'
import { getPrdRecord } from '@/lib/prdCatalog'
import MarkdownPreview from './MarkdownPreview'

interface PrdRailProps {
  wireframe: WireframeEntry | null
}

export default function PrdRail({ wireframe }: PrdRailProps) {
  const prd = useMemo(() => getPrdRecord(wireframe?.prdPath), [wireframe?.prdPath])
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [mode, setMode] = useState<'checklist' | 'preview'>('checklist')
  const [checkedRequirements, setCheckedRequirements] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setIsOpen(false)
    setIsMinimized(false)
    setMode('checklist')
    setCheckedRequirements({})
  }, [wireframe?.route])

  if (!wireframe) return null

  const requirements = prd?.requirements ?? []
  const checkedCount = requirements.filter((item) => checkedRequirements[item]).length
  const hasPrd = Boolean(prd)
  const prdTitle = prd?.title ?? 'No PRD linked yet'
  const prdSummary = prd?.summary ?? ''
  const prdMarkdown = prd?.raw ?? ''

  function toggleRequirement(requirement: string) {
    setCheckedRequirements((current) => ({
      ...current,
      [requirement]: !current[requirement],
    }))
  }

  return (
    <div className="pointer-events-none fixed right-4 top-5 z-40 flex items-start gap-3">
      {isOpen ? (
        <aside className="pointer-events-auto w-[360px] overflow-hidden rounded-3xl border border-[#262626] bg-[#121212]/98 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="border-b border-[#232323] px-5 py-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#7b7b7b]">PRD Context</p>
                <h2 className="mt-1 text-sm font-semibold text-[#f1f1f1]">{wireframe.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-[#2d2d2d] bg-[#191919] p-2 text-[#9e9e9e] transition hover:border-[#3a3a3a] hover:bg-[#1f1f1f] hover:text-[#e9e9e9]"
                aria-label="Collapse PRD panel"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#2d2d2d] bg-[#191919] px-2.5 py-1 text-[11px] text-[#c4c4c4]">
                {wireframe.module}
              </span>
              <span className="rounded-full border border-[#2d2d2d] bg-[#191919] px-2.5 py-1 text-[11px] text-[#c4c4c4]">
                Owner: {wireframe.owner}
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] ${hasPrd ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-200'}`}>
                {hasPrd ? 'Linked PRD' : 'Missing PRD'}
              </span>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#181818] px-3.5 py-3 text-[#ededed]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#efefef]">{prdTitle}</p>
                  <p className="mt-1 truncate text-[11px] text-[#8a8a8a]">{wireframe.prdPath ?? 'Attach a markdown PRD in the wireframe registry'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('preview')}
                  className="shrink-0 rounded-full border border-[#2d2d2d] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-[#d6d6d6] transition hover:border-[#3a3a3a] hover:bg-[#202020] hover:text-[#f0f0f0]"
                >
                  Open PRD Preview
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-[#262626] bg-[#0d0d0d] p-1">
              <button
                type="button"
                onClick={() => setMode('checklist')}
                className={`rounded-[14px] border px-3 py-2 text-xs font-medium transition ${mode === 'checklist' ? 'border-[#353535] bg-[#1f1f1f] text-[#f0f0f0]' : 'border-transparent text-[#b5b5b5] hover:bg-[#171717] hover:text-[#ededed]'}`}
              >
                Checklist
              </button>
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={`rounded-[14px] border px-3 py-2 text-xs font-medium transition ${mode === 'preview' ? 'border-[#353535] bg-[#1f1f1f] text-[#f0f0f0]' : 'border-transparent text-[#b5b5b5] hover:bg-[#171717] hover:text-[#ededed]'}`}
              >
                Preview
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-5 py-4">
            {mode === 'checklist' ? (
              hasPrd ? (
                <div className="space-y-4">
                  {prdSummary ? (
                    <section className="rounded-2xl border border-[#2a2a2a] bg-[#171717] p-4 text-[#ededed]">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7b7b7b]">Summary</p>
                      <p className="mt-2 text-sm leading-6 text-[#d6d6d6]">{prdSummary}</p>
                    </section>
                  ) : null}

                  <section className="rounded-2xl border border-[#2a2a2a] bg-[#171717] p-4 text-[#ededed]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[#e5e5e5]">
                        <ClipboardList size={14} />
                        <p className="text-sm font-medium text-[#e5e5e5]">Requirement coverage</p>
                      </div>
                      <span className="rounded-full border border-[#2d2d2d] bg-[#1a1a1a] px-2.5 py-1 text-[11px] text-[#c4c4c4]">
                        {checkedCount}/{requirements.length} checked
                      </span>
                    </div>

                    {requirements.length > 0 ? (
                      <div className="space-y-2">
                        {requirements.map((requirement) => {
                          const isChecked = Boolean(checkedRequirements[requirement])

                          return (
                            <button
                              key={requirement}
                              type="button"
                              onClick={() => toggleRequirement(requirement)}
                              className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${isChecked ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-[#2a2a2a] bg-[#111111] hover:border-[#383838] hover:bg-[#1a1a1a]'}`}
                            >
                              <span className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${isChecked ? 'border-emerald-400 bg-emerald-400' : 'border-[#4b4b4b] bg-transparent'}`} />
                              <span className={`text-sm leading-6 ${isChecked ? 'text-[#f0f0f0]' : 'text-[#cdcdcd]'}`}>{requirement}</span>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-[#a0a0a0]">No parsed requirements yet. Add a `## Requirements` section with bullet points in the linked markdown file.</p>
                    )}
                  </section>
                </div>
              ) : (
                <MissingPrdState />
              )
            ) : hasPrd ? (
              <div className="rounded-2xl border border-[#2a2a2a] bg-[#171717] p-4 text-[#ededed]">
                <MarkdownPreview markdown={prdMarkdown} />
              </div>
            ) : (
              <MissingPrdState />
            )}
          </div>
        </aside>
      ) : null}

      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#121212]/96 text-[#c2c2c2] shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-[#383838] hover:bg-[#171717] hover:text-[#f0f0f0]"
          aria-label="Show wireframe owner details"
        >
          <FileText size={16} />
        </button>
      ) : (
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#121212]/96 px-3 py-2.5 text-[#ededed] shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-[#383838] hover:bg-[#171717]">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex min-w-0 items-center gap-3 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b1b1b] text-[#b7b7b7]">
              <FileText size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#757575]">Wireframe owner</p>
              <div className="mt-1 flex items-center gap-2">
                <UserRound size={12} className="text-[#8e8e8e]" />
                <span className="text-sm font-medium text-[#f2f2f2]">{wireframe.owner}</span>
                <span className="text-[#4a4a4a]">·</span>
                <span className="truncate text-xs text-[#a8a8a8]">{hasPrd ? prdTitle : 'PRD missing'}</span>
              </div>
            </div>
            <ChevronLeft size={16} className="shrink-0 text-[#8e8e8e]" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#181818] text-[#8e8e8e] transition hover:border-[#383838] hover:bg-[#1f1f1f] hover:text-[#ededed]"
            aria-label="Minimize wireframe owner details"
          >
            <Minimize2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function MissingPrdState() {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-amber-500/12 p-2 text-amber-200">
          <TriangleAlert size={15} />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-100">No PRD linked yet</p>
          <p className="mt-1 text-sm leading-6 text-amber-100/70">
            Add a markdown file under `docs/prds/` and connect it through the wireframe registry so this page always has product context attached.
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers, LayoutDashboard, PenTool, Maximize2, ChevronRight,
  Beaker, FileText, Video, Layers2, PresentationIcon,
  Building2, FlaskConical, AlertCircle, ArrowRight, AlertTriangle,
  PlusCircle, Sparkles,
} from 'lucide-react'

// Inline mock — no Zustand store dependency in wireframing repo
const MOCK_PROJECTS = [
  { id: 'p1', name: 'Ramadan Promo 2026', lastEditedBy: 'u1', lastEditedByName: 'Budi Santoso', lastEditedAt: '2026-03-14T10:30:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop' },
  { id: 'p2', name: 'Hari Raya Sale', lastEditedBy: 'u2', lastEditedByName: 'Rina Kusuma', lastEditedAt: '2026-03-25T08:45:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop' },
  { id: 'p3', name: 'Premium Wealth Q2', lastEditedBy: 'u1', lastEditedByName: 'Budi Santoso', lastEditedAt: '2026-03-24T14:20:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop' },
]

// ── Tool Registry ─────────────────────────────────────────────────
type ToolStatus = 'live' | 'coming-soon'
type ToolCategory = 'Visual' | 'Brief & Strategy' | 'Video'

interface Tool {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  to: string
  status: ToolStatus
  category: ToolCategory
}

const TOOL_REGISTRY: Tool[] = [
  { id: 'kv-generator', label: 'KV Generator', description: 'Generate brand-safe key visuals from prompt, manage projects, export multi-format.', icon: <LayoutDashboard size={16} />, to: '/kv-generator', status: 'live', category: 'Visual' },
  { id: 'image-editor', label: 'Image Editor', description: 'Prompt-driven canvas editing with mask tools, text, erase, and asset overlay.', icon: <PenTool size={16} />, to: '/image-editor', status: 'live', category: 'Visual' },
  { id: 'resizer', label: 'Resizer', description: 'Resize approved assets to all standard ad platform dimensions automatically.', icon: <Maximize2 size={16} />, to: '/resizer', status: 'live', category: 'Visual' },
  { id: 'visual-lab', label: 'Visual Lab', description: 'Full-screen AI canvas for image and video creation with in-painting.', icon: <Beaker size={16} />, to: '#', status: 'coming-soon', category: 'Visual' },
  { id: 'brief-generator', label: 'Brief Generator', description: 'Multi-step strategic engine: Client Brief → Business Briefcase → Creative Brief → PPT.', icon: <FileText size={16} />, to: '#', status: 'coming-soon', category: 'Brief & Strategy' },
  { id: 'campaign-creator', label: 'Campaign Creator', description: 'End-to-end campaign asset production across formats and platforms.', icon: <Layers2 size={16} />, to: '#', status: 'coming-soon', category: 'Brief & Strategy' },
  { id: 'video-creator', label: 'Video Creator', description: 'AI-assisted storyboard generation and video asset creation.', icon: <Video size={16} />, to: '#', status: 'coming-soon', category: 'Video' },
  { id: 'deck-creation', label: 'Deck Creation', description: 'Generate presentation decks from brief content and brand templates.', icon: <PresentationIcon size={16} />, to: '#', status: 'coming-soon', category: 'Brief & Strategy' },
]

// ── Mock session ──────────────────────────────────────────────────
const SESSION = {
  firstName: 'Budi',
  initials: 'BS',
  role: 'Designer' as 'Designer' | 'Account Manager' | 'Strategist' | 'Manager',
  workspace: {
    type: 'brand' as 'brand' | 'playground',
    brandName: 'CIMB Niaga',
    brandProfileVersion: 'v3',
  },
}

// ── Mock Brand Identity per brand ────────────────────────────────
interface BrandIdentity {
  primaryColor: string | null
  typographyH1: string | null
  typographyBody: string | null
  visualDos: string[]
  visualDonts: string[]
}

// User's assigned brands with varying readiness states
const MOCK_USER_BRANDS: { name: string; profileVersion: string; identity: BrandIdentity }[] = [
  {
    name: 'CIMB Niaga',
    profileVersion: 'v3',
    identity: {
      primaryColor: '#C8102E',
      typographyH1: 'GT Walsheim',
      typographyBody: 'Inter',
      visualDos: ['Logo on bottom-right', 'Red as dominant color'],
      visualDonts: [],
    },
  },
  {
    name: 'Bank Mandiri',
    profileVersion: 'v1',
    identity: {
      primaryColor: null,
      typographyH1: 'Helvetica',
      typographyBody: null,
      visualDos: [],
      visualDonts: [],
    },
  },
  {
    name: 'Tokopedia',
    profileVersion: 'v2',
    identity: {
      primaryColor: '#42B92B',
      typographyH1: 'Go 3.0',
      typographyBody: 'Inter',
      visualDos: ['Logo on top-left'],
      visualDonts: ['Dark background'],
    },
  },
  {
    name: 'GoPay',
    profileVersion: 'v1',
    identity: {
      primaryColor: null,
      typographyH1: null,
      typographyBody: null,
      visualDos: [],
      visualDonts: [],
    },
  },
  {
    name: 'OVO',
    profileVersion: 'v2',
    identity: {
      primaryColor: '#E7003A',
      typographyH1: 'Poppins',
      typographyBody: null,
      visualDos: [],
      visualDonts: ['Blue color scheme'],
    },
  },
  {
    name: 'BCA',
    profileVersion: 'v1',
    identity: {
      primaryColor: null,
      typographyH1: 'SF Pro',
      typographyBody: 'Inter',
      visualDos: [],
      visualDonts: [],
    },
  },
  {
    name: 'Telkomsel',
    profileVersion: 'v1',
    identity: {
      primaryColor: null,
      typographyH1: 'Montserrat',
      typographyBody: null,
      visualDos: [],
      visualDonts: [],
    },
  },
]

type BrandReadinessStatus = 'ready' | 'incomplete' | 'not-configured'
interface BrandReadiness {
  status: BrandReadinessStatus
  missing: string[]
  // Multi-brand awareness
  brands: { name: string; status: BrandReadinessStatus; missing: string[] }[]
}

function getBrandReadiness(): BrandReadiness {
  if (SESSION.workspace.type === 'playground') return { status: 'ready', missing: [], brands: [] }

  const brands = MOCK_USER_BRANDS.map((brand) => {
    const missing: string[] = []
    if (!brand.identity.primaryColor) missing.push('Primary Color')
    if (!brand.identity.typographyH1 || !brand.identity.typographyBody) missing.push('Typography')
    if (brand.identity.visualDos.length === 0) missing.push("Visual Do's")
    if (brand.identity.visualDonts.length === 0) missing.push("Visual Do Not's")
    const status: BrandReadinessStatus =
      missing.length === 4 ? 'not-configured' : missing.length > 0 ? 'incomplete' : 'ready'
    return { name: brand.name, status, missing }
  })

  const incompleteBrands = brands.filter((b) => b.status !== 'ready')
  const allMissing = incompleteBrands.flatMap((b) => b.missing)

  return {
    status: incompleteBrands.length > 0 ? 'incomplete' : 'ready',
    missing: allMissing,
    brands: incompleteBrands,
  }
}

// ── Helpers ───────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getRoleSubtitle(role: typeof SESSION.role, brandName: string): string {
  switch (role) {
    case 'Designer': return 'What would you like to create today?'
    case 'Account Manager': return 'Which production tool do you need?'
    case 'Strategist': return 'Review in-progress Studio projects below.'
    case 'Manager': return `Studio overview for ${brandName}.`
  }
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

function getToolLabel(projectId: string): string {
  if (projectId.startsWith('p')) return 'KV Generator'
  return 'Image Editor'
}

// ── Brand Readiness — inline dot only in header ───────────────────
function BrandReadinessDot({ readiness }: { readiness: BrandReadiness }) {
  const [showTooltip, setShowTooltip] = useState(false)
  if (SESSION.workspace.type === 'playground' || readiness.status === 'ready') return null

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-1.5 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-colors mt-px"
        aria-label="Brand setup incomplete"
      />
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2.5 px-3 py-2.5 bg-[#111] border border-white/10 rounded-xl text-xs z-20 whitespace-nowrap shadow-2xl">
          <p className="text-white/40 mb-2 text-[11px]">Brand setup incomplete</p>
          <ul className="space-y-1">
            {readiness.missing.map((item) => (
              <li key={item} className="text-white/60 flex items-center gap-2">
                <span className="w-px h-3 bg-white/20 rounded-full shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-white/20 mt-2.5 pt-2 border-t border-white/5 text-[11px]">Open Brand Settings to fix</p>
        </div>
      )}
    </div>
  )
}

// ── Workspace Context ─────────────────────────────────────────────
function WorkspaceContext({ readiness }: { readiness: BrandReadiness }) {
  const { workspace } = SESSION

  if (workspace.type === 'playground') {
    return (
      <div className="flex items-center gap-2 text-xs text-white/30">
        <FlaskConical size={11} />
        <span>Playground</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs text-white/40">
      <Building2 size={11} className="text-white/25" />
      <span className="text-white/60">{workspace.brandName}</span>
      <span className="text-white/15">·</span>
      <span className="text-white/25">Profile {workspace.brandProfileVersion}</span>
      <BrandReadinessDot readiness={readiness} />
    </div>
  )
}

// ── Brand Setup Panel ─────────────────────────────────────────────
// Slide-up overlay triggered by "Set up Brand Identity" button.
// Shows list of incomplete brands; selecting one opens the setup flow.
// Since no dedicated brand settings page exists yet, the "setup" step
// is stubbed as an in-panel placeholder state.
function BrandSetupPanel({
  brands,
  onClose,
}: {
  brands: BrandReadiness['brands']
  onClose: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-[#0f0f0f] border-t border-white/10 rounded-t-2xl max-h-[80vh] overflow-y-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 rounded-full bg-white/10" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-white/80 text-sm font-semibold">Set up Brand Identity</h2>
              <p className="text-white/30 text-[11px] mt-0.5">
                Select a brand to open its guardrail editor.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/25 hover:text-white/50 text-xs transition-colors shrink-0 ml-4"
            >
              ✕
            </button>
          </div>

          <div className="px-5 py-4">
            {/* Brand list */}
            <div className="space-y-2">
              {brands.map((b) => (
                <button
                  key={b.name}
                  onClick={() => setSelected(b.name)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl border transition-all duration-150 text-left ${
                    selected === b.name
                      ? 'border-white/20 bg-white/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      selected === b.name
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/10'
                    }`}
                  >
                    {selected === b.name && (
                      <div className="w-2 h-2 rounded-full bg-white/60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium">{b.name}</p>
                    <p className="text-white/25 text-[11px] mt-0.5">
                      Missing: {b.missing.join(', ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={onClose}
              disabled={!selected}
              className={`mt-4 w-full py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                selected
                  ? 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white/90 cursor-pointer'
                  : 'bg-white/[0.03] text-white/20 cursor-not-allowed'
              }`}
            >
              {selected
                ? `Open guardrails for ${selected}`
                : 'Select a brand to continue'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Brand Readiness Warning Banner ────────────────────────────────
function BrandWarningBanner({ readiness }: { readiness: BrandReadiness }) {
  const [dismissed, setDismissed] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  if (readiness.status === 'ready' || dismissed) return null

  const { brands } = readiness
  const isMultiBrand = brands.length > 1

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-10 px-4 py-3.5 border border-white/10 bg-white/[0.04]">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <AlertTriangle size={14} className="text-amber-400/70 mt-0.5 shrink-0" />

          <div className="flex-1 min-w-0">
            {/* Multi-brand: headline with count badge */}
            {isMultiBrand ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/70 text-xs font-medium">
                    Brand guardrails incomplete
                  </span>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold shrink-0">
                    {brands.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {brands.slice(0, 4).map((brand) => (
                    <div
                      key={brand.name}
                      className="flex items-center gap-1.5 px-2 py-1 border border-white/10 bg-white/[0.03]"
                    >
                      <Building2 size={10} className="text-white/30 shrink-0" />
                      <span className="text-white/60 text-[11px] font-medium">{brand.name}</span>
                      <span className="text-white/20 text-[11px]">
                        — missing {brand.missing.join(', ')}
                      </span>
                    </div>
                  ))}
                  {brands.length > 4 && (
                    <button
                      onClick={() => setPanelOpen(true)}
                      className="flex items-center gap-1 px-2 py-1 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    >
                      <span className="text-amber-400/80 text-[11px] font-medium">
                        +{brands.length - 4} more
                      </span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Single brand: compact line */
              <p className="text-white/40 text-xs leading-relaxed">
                Brand guardrails incomplete for{' '}
                <span className="text-white/60 font-medium">{brands[0].name}</span>
                {' '}— missing {brands[0].missing.join(', ')}.
              </p>
            )}

            <button
              onClick={() => setPanelOpen(true)}
              className="mt-2 text-white/50 hover:text-white/80 text-xs underline underline-offset-2 transition-colors"
            >
              Set up Brand Identity
            </button>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-white/20 hover:text-white/40 text-xs shrink-0 transition-colors ml-2 mt-0.5"
        >
          ✕
        </button>
      </div>

      {panelOpen && (
        <BrandSetupPanel brands={brands} onClose={() => setPanelOpen(false)} />
      )}
    </>
  )
}

// ── Continue Working — Indexed list with thumbnail accent ────────
// Text-first. Each row has: index number, tiny thumbnail, project name.
// Active row expands to reveal meta + CTA inline.
// The index numbers (01 02 03) act as the unique visual character.
// Shows empty state when no projects exist.
function ContinueWorkingCard() {
  const navigate = useNavigate()
  const projects = MOCK_PROJECTS
  const { role } = SESSION
  const currentUserId = 'u1'
  const [activeIndex, setActiveIndex] = useState(0)

  const isWorkspaceWide = role === 'Account Manager' || role === 'Manager'

  const recentProjects = [...(isWorkspaceWide ? projects : projects.filter((p) => p.lastEditedBy === currentUserId))]
    .sort((a, b) => new Date(b.lastEditedAt).getTime() - new Date(a.lastEditedAt).getTime())
    .slice(0, 3)

  return (
    <div className="mb-10">
      <p className="text-white/20 text-[11px] uppercase tracking-widest font-medium mb-3">
        {isWorkspaceWide ? 'Recent in workspace' : 'Continue working'}
      </p>

      {/* Empty state — no recent projects */}
      {recentProjects.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-6 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
              <Sparkles size={12} className="text-white/20" />
            </div>
            <p className="text-white/30 text-xs">
              No recent work yet
            </p>
          </div>
          <p className="text-white/20 text-[11px] leading-relaxed">
            Start your first project and it will appear here for quick access.
          </p>
          <button
            onClick={() => navigate('/kv-generator/new')}
            className="flex items-center gap-1.5 mt-1 text-white/40 hover:text-white/70 text-xs transition-colors group"
          >
            <PlusCircle size={13} className="text-white/30 group-hover:text-white/50 transition-colors" />
            <span>Create a KV project</span>
            <ArrowRight size={10} className="text-white/0 group-hover:text-white/40 transition-colors" />
          </button>
        </div>
      ) : (
        /* Project list */
        recentProjects.map((project, i) => {
          const isActive = i === activeIndex
          const toolLabel = getToolLabel(project.id)
          const toolPath = toolLabel === 'KV Generator' ? `/kv-generator/projects/${project.id}` : `/image-editor`
          const isOwnWork = project.lastEditedBy === currentUserId

          return (
            <button
              key={project.id}
              onClick={() => isActive ? navigate(toolPath) : setActiveIndex(i)}
              className={`group w-full flex items-center gap-4 text-left transition-all duration-200 ${
                i < recentProjects.length - 1 ? 'border-b border-white/[0.04]' : ''
              } ${isActive ? 'py-4' : 'py-3'}`}
            >
              {/* Index number — the character */}
              <span
                className="font-mono shrink-0 transition-all duration-200 select-none"
                style={{
                  fontSize: isActive ? 11 : 10,
                  color: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                  width: 20,
                  textAlign: 'right',
                  letterSpacing: '0.05em',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Thumbnail — square, no border radius on active to feel raw */}
              <div
                className="shrink-0 overflow-hidden bg-white/5 transition-all duration-200"
                style={{
                  width: isActive ? 40 : 28,
                  height: isActive ? 40 : 28,
                  borderRadius: isActive ? 8 : 6,
                  opacity: isActive ? 1 : 0.35,
                }}
              >
                {project.thumbnailUrl && (
                  <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium truncate transition-all duration-200"
                  style={{
                    fontSize: isActive ? 13 : 12,
                    color: isActive ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {project.name}
                </p>

                {/* Meta — only visible on active */}
                <div
                  className="overflow-hidden transition-all duration-200"
                  style={{ maxHeight: isActive ? 24 : 0, opacity: isActive ? 1 : 0 }}
                >
                  <p className="text-white/25 text-[11px] mt-0.5 truncate">
                    {toolLabel} · {isOwnWork
                      ? formatRelativeTime(project.lastEditedAt)
                      : `${project.lastEditedByName} · ${formatRelativeTime(project.lastEditedAt)}`
                    }
                  </p>
                </div>
              </div>

              {/* CTA — only on active, only on hover */}
              <div
                className="shrink-0 flex items-center gap-1 transition-all duration-150"
                style={{ opacity: isActive ? undefined : 0 }}
              >
                <span className="text-[11px] text-white/0 group-hover:text-white/40 transition-colors duration-150">
                  {isOwnWork ? 'Continue' : 'Open'}
                </span>
                <ArrowRight size={10} className="text-white/0 group-hover:text-white/40 transition-colors duration-150" />
              </div>
            </button>
          )
        })
      )}
    </div>
  )
}

// ── Tool Tile ─────────────────────────────────────────────────────
function ToolTile({ tool }: { tool: Tool }) {
  const navigate = useNavigate()
  const [showTooltip, setShowTooltip] = useState(false)
  const isLive = tool.status === 'live'

  return (
    <div className="relative">
      <button
        onClick={() => isLive && navigate(tool.to)}
        onMouseEnter={() => !isLive && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={!isLive}
        className={`group w-full relative border border-white/[0.07] rounded-xl p-4 text-left transition-all duration-200 ${
          isLive
            ? 'bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15 cursor-pointer'
            : 'bg-transparent opacity-30 cursor-not-allowed'
        }`}
      >
        {/* Icon */}
        <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-white/50 mb-3 group-hover:text-white/80 transition-colors">
          {tool.icon}
        </div>

        {/* Label */}
        <p className="text-white/80 text-xs font-semibold mb-1 leading-snug">{tool.label}</p>
        <p className="text-white/25 text-[11px] leading-relaxed line-clamp-2">{tool.description}</p>

        {/* Footer */}
        {isLive && (
          <div className="flex items-center gap-0.5 mt-3 text-[11px] text-white/20 group-hover:text-white/40 transition-colors">
            <span>Open</span>
            <ChevronRight size={10} />
          </div>
        )}
      </button>

      {showTooltip && !isLive && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#111] text-white/50 text-xs rounded-lg whitespace-nowrap z-10 pointer-events-none border border-white/10">
          Coming soon
        </div>
      )}
    </div>
  )
}

// ── Category Filter ───────────────────────────────────────────────
const CATEGORIES: ('All' | ToolCategory)[] = ['All', 'Visual', 'Brief & Strategy', 'Video']

// ── Main Page ─────────────────────────────────────────────────────
export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<'All' | ToolCategory>('All')
  const readiness = getBrandReadiness()

  const filteredTools = activeFilter === 'All'
    ? TOOL_REGISTRY
    : TOOL_REGISTRY.filter((t) => t.category === activeFilter)

  const filteredLive = filteredTools.filter((t) => t.status === 'live')
  const filteredComingSoon = filteredTools.filter((t) => t.status === 'coming-soon')

  return (
    <div className="min-h-screen bg-frnd-dark flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-white/40" />
          <span className="text-white/70 font-semibold text-sm tracking-tight">frndOS</span>
          <span className="text-white/15 mx-1 text-xs">·</span>
          <span className="text-white/30 text-sm">Studio</span>
        </div>
        <div className="flex items-center gap-4">
          <WorkspaceContext readiness={readiness} />
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
            {SESSION.initials}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-12 max-w-4xl mx-auto w-full">

        {/* Greeting */}
        <div className="mb-12">
          <p className="text-white/25 text-sm mb-1">{getGreeting()}, {SESSION.firstName}</p>
          <h1 className="text-white/80 text-2xl font-semibold tracking-tight">
            {getRoleSubtitle(SESSION.role, SESSION.workspace.brandName)}
          </h1>
        </div>

        {/* Brand warning — subtle, dismissible */}
        <BrandWarningBanner readiness={readiness} />

        {/* Continue Working */}
        <ContinueWorkingCard />

        {/* Section label + filter */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-white/25 text-xs uppercase tracking-widest font-medium">Tools</p>
          <div className="flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  activeFilter === cat
                    ? 'bg-white/10 text-white/70'
                    : 'text-white/25 hover:text-white/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Live tools */}
        {filteredLive.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredLive.map((tool) => <ToolTile key={tool.id} tool={tool} />)}
            </div>
          </div>
        )}

        {/* Divider between live / coming soon */}
        {filteredLive.length > 0 && filteredComingSoon.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-white/15 text-[11px] uppercase tracking-widest">Coming soon</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
        )}

        {/* Coming soon */}
        {filteredComingSoon.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredComingSoon.map((tool) => <ToolTile key={tool.id} tool={tool} />)}
          </div>
        )}

        {/* No results */}
        {filteredTools.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={20} className="text-white/10 mb-3" />
            <p className="text-white/20 text-xs">No tools in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

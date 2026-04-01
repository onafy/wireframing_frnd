import { useState, useEffect } from 'react'
import {
  Bell,
  Search,
  TrendingUp,
  Users,
  FileText,
  Image,
  Pin,
  PinOff,
  Calendar,
  ChevronRight,
  ArrowRight,
  Layers,
  BarChart2,
  MessageSquare,
  Sparkles,
  Video,
  CheckCircle2,
  X,
  Maximize2,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────
type SystemState = 'first-login' | 'calendar-synced' | 'active-workspace' | 'cmd-focused'
type VelocityLabel = 'Rising Velocity' | 'Emerging Velocity' | 'Peaking Velocity'

interface Meeting {
  id: string
  time: string
  title: string
  brand: string
  attendees: number
  hasLink: boolean
  status: 'past' | 'active' | 'upcoming' | 'future'
  startsInMin?: number
}

interface RecentItem {
  id: string
  title: string
  tool: string
  toolIcon: React.ReactNode
  timeAgo: string
  pinned: boolean
}

interface TrendingTool {
  rank: number
  name: string
  description: string
  icon: React.ReactNode
  usageCount?: string
  delta?: string
}

interface YourTool {
  id: string
  name: string
  pillar: string
  icon: React.ReactNode
}

interface Signal {
  velocity: VelocityLabel
  velocityColor: string
  title: string
  platforms: string[]
  detectedAt: string
  recommendation: 'Recommended' | 'Not Recommended'
  brandName: string
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_SIGNAL: Signal = {
  velocity: 'Rising Velocity',
  velocityColor: '#22c55e',
  title: 'A new wave of creators is reframing period conversations with humor, honesty, and everyday relatability',
  platforms: ['Instagram', 'TikTok'],
  detectedAt: '2026-03-31',
  recommendation: 'Recommended',
  brandName: 'Ultra Milk',
}

const MOCK_YOUR_TOOLS: YourTool[] = [
  { id: 'trendseeker', name: 'Trendseeker', pillar: 'Studio', icon: <TrendingUp size={16} /> },
  { id: 'visual-labs', name: 'Visual Labs', pillar: 'Studio', icon: <Image size={16} /> },
  { id: 'persona-gen', name: 'Persona Generator', pillar: 'Research', icon: <Users size={16} /> },
]

const MOCK_TRENDING: TrendingTool[] = [
  { rank: 1, name: 'Viral TikTok Trend Analyzer', description: 'Identify and ride trending audio and formats on TikTok', icon: <Video size={14} /> },
  { rank: 2, name: 'Gen-Z Slang Translator', description: 'Translate brand messaging into Gen-Z native language', icon: <MessageSquare size={14} /> },
  { rank: 3, name: 'Pitch Deck Outliner', description: 'Generate strategic deck structures from brief inputs', icon: <FileText size={14} /> },
]

const MOCK_MEETINGS: Meeting[] = [
  { id: 'm1', time: '11:00 AM', title: 'Valentine Campaign Prep', brand: 'Ultra Milk', attendees: 4, hasLink: true, status: 'upcoming', startsInMin: 21 },
  { id: 'm2', time: '02:00 PM', title: 'OCBC Quarterly Review', brand: 'Bank OCBC', attendees: 6, hasLink: true, status: 'future' },
  { id: 'm3', time: '04:00 PM', title: 'Persona Alignment', brand: 'Indofood', attendees: 3, hasLink: true, status: 'future' },
]

const MOCK_MEETINGS_ACTIVE: Meeting[] = [
  { id: 'm0', time: '10:00 AM', title: 'Morning Standup', brand: 'Internal', attendees: 8, hasLink: false, status: 'past' },
  { id: 'm1', time: '11:00 AM', title: 'Valentine Campaign Prep', brand: 'Ultra Milk', attendees: 4, hasLink: true, status: 'active' },
  { id: 'm2', time: '02:00 PM', title: 'OCBC Quarterly Review', brand: 'Bank OCBC', attendees: 6, hasLink: true, status: 'future' },
  { id: 'm3', time: '04:00 PM', title: 'Persona Alignment', brand: 'Indofood', attendees: 3, hasLink: true, status: 'future' },
]

const MOCK_RECENT: RecentItem[] = [
  { id: 'r1', title: 'Ultra Milk Brand Guidelines', tool: 'Visual Labs', toolIcon: <Image size={11} />, timeAgo: '4 hrs ago', pinned: true },
  { id: 'r2', title: 'Q1 OKRs & Tracking', tool: 'KV Generator', toolIcon: <BarChart2 size={11} />, timeAgo: '2 days ago', pinned: true },
  { id: 'r3', title: 'OCBC Campaign Brief v3', tool: 'Creative Brief', toolIcon: <FileText size={11} />, timeAgo: '3 days ago', pinned: false },
  { id: 'r4', title: 'Indofood Gen-Z Personas', tool: 'Research', toolIcon: <Users size={11} />, timeAgo: '5 days ago', pinned: false },
  { id: 'r5', title: 'Valentine KV Draft 02', tool: 'KV Generator', toolIcon: <BarChart2 size={11} />, timeAgo: '1 week ago', pinned: false },
]

// ── Notification data ───────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'collab', title: 'Budi Santoso shared a KV draft', desc: 'Valentine Campaign Prep · Ultra Milk', time: '2h ago', read: false },
  { id: 'n2', type: 'system', title: 'New feature: Trendseeker v2', desc: 'Now supports audio trend analysis for TikTok', time: '1d ago', read: false },
  { id: 'n3', type: 'collab', title: 'Rina commented on your brief', desc: 'OCBC Quarterly Review brief', time: '2d ago', read: true },
]

// ── Interactive Demo Steps ──────────────────────────────────────────
const DEMO_STEPS = [
  { step: 1, title: '1. First Login', desc: 'A completely new user. No calendar connected, no brands assigned, and no recent files. Sections show empty states with prompts to connect services.' },
  { step: 2, title: '2. Calendar Synced', desc: 'Lark is connected. Schedule appears with upcoming meetings.' },
  { step: 3, title: '3. Brand Assigned', desc: 'User is assigned to Ultra Milk. Today\'s Signal card surfaces with brand label — same signal shown agency-wide for all users in MVP. Per-brand personalization is V2.' },
  { step: 4, title: '4. Active Workspace', desc: 'User has history. \'Recent Work\' populates with pinned workspaces and past tasks.' },
  { step: 5, title: '5. Action Bar — Module Navigation', desc: 'User types "stu" — Action Bar filters to matching modules (Studio). Top match is highlighted; Enter navigates. (§ 9.A.2 Feature A)' },
  { step: 6, title: '6. Action Bar — Chat Handoff', desc: 'User types a natural language query. No module matches → Chat row becomes the default. Enter opens Ask FRnD with the query pre-submitted. (§ 9.A.2 Feature B)' },
  { step: 7, title: '7. Full Experience', desc: 'All sections populated. Today\'s Signal, Your Tools, Trending, Schedule, Recent Work, and Notifications.' },
]

// ── Velocity badge color ────────────────────────────────────────────
function velocityBg(label: VelocityLabel) {
  if (label === 'Rising Velocity') return 'bg-[#1a2e1a] text-[#4ade80] border-[#2d4a2d]'
  if (label === 'Emerging Velocity') return 'bg-[#1a1f2e] text-[#60a5fa] border-[#2d3a4a]'
  return 'bg-[#2e2a1a] text-[#facc15] border-[#4a421d]'
}

// ── Notification Drawer ────────────────────────────────────────────
function NotificationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-80 bg-[#111] border-l border-white/10 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="text-white/70 text-sm font-medium">Notifications</span>
          <div className="flex items-center gap-3">
            <button className="text-white/30 text-[11px] hover:text-white/60 transition-colors">Mark all read</button>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_NOTIFICATIONS.map((n) => (
            <div key={n.id} className={`px-5 py-4 border-b border-white/[0.05] cursor-pointer hover:bg-white/[0.03] transition-colors ${!n.read ? 'bg-white/[0.02]' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.type === 'collab' ? 'bg-[#1a1f2e]' : 'bg-[#221a2e]'}`}>
                  {n.type === 'collab' ? <Users size={10} className="text-[#60a5fa]" /> : <Sparkles size={10} className="text-[#c084fc]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-medium leading-snug ${!n.read ? 'text-white/80' : 'text-white/40'}`}>{n.title}</p>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] shrink-0 mt-1" />}
                  </div>
                  <p className="text-[11px] text-white/30 mt-0.5 truncate">{n.desc}</p>
                  <p className="text-[10px] text-white/20 mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-white/[0.05]">
          <button className="text-white/30 text-[11px] hover:text-white/60 transition-colors">View all notifications</button>
        </div>
      </div>
    </>
  )
}

// ── Today's Signal Card ─────────────────────────────────────────────
function TodaySignalCard({ signal }: { signal: Signal }) {
  return (
    <div className="border border-white/[0.08] rounded-2xl p-4 bg-white/[0.02] mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2.5">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${velocityBg(signal.velocity)}`}>
              <span className="w-1 h-1 rounded-full" style={{ background: signal.velocityColor }} />
              {signal.velocity}
            </span>
            <span className="text-[10px] text-white/25 font-medium uppercase tracking-wider">{signal.brandName}</span>
          </div>
          <p className="text-white/80 text-sm font-medium leading-snug line-clamp-2 mb-3">{signal.title}</p>
          <div className="flex items-center gap-3 flex-wrap">
            {signal.platforms.map((p) => (
              <span key={p} className="text-[10px] text-white/35 border border-white/10 rounded px-1.5 py-0.5">{p}</span>
            ))}
            <span className="text-[10px] text-white/20">Detected {signal.detectedAt}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#4ade80]">
              <CheckCircle2 size={9} />
              {signal.recommendation}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Daily Digest</p>
          <button className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white/80 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1.5 whitespace-nowrap">
            View in Insights <ArrowRight size={10} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Your Tools Strip ────────────────────────────────────────────────
function YourToolsStrip({ tools }: { tools: YourTool[] }) {
  return (
    <div className="mb-6">
      <p className="text-white/25 text-[11px] uppercase tracking-widest font-medium mb-3">Your tools</p>
      <div className="flex gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className="group flex-1 border border-white/[0.08] rounded-xl p-3.5 text-left bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-200"
          >
            <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/40 mb-2.5 group-hover:text-white/70 transition-colors">
              {tool.icon}
            </div>
            <p className="text-white/75 text-xs font-semibold leading-snug">{tool.name}</p>
            <p className="text-white/25 text-[10px] mt-0.5">{tool.pillar}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Trending Feed ───────────────────────────────────────────────────
function TrendingFeed({ tools }: { tools: TrendingTool[] }) {
  return (
    <div className="border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-white/70 text-xs font-semibold">Trending in frndOS</span>
        <span className="text-[9px] text-white/20 uppercase tracking-widest font-medium">Agency Wide</span>
      </div>
      {tools.map((tool) => (
        <button
          key={tool.rank}
          className="w-full flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.04] transition-colors text-left"
        >
          <span className="text-[11px] text-white/15 font-mono w-4 shrink-0">{tool.rank}</span>
          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/35 shrink-0">
            {tool.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/75 text-xs font-medium truncate">{tool.name}</p>
            <p className="text-white/25 text-[10px] truncate mt-0.5">{tool.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

// ── Today's Schedule ────────────────────────────────────────────────
type ScheduleState = 'unauthorized' | 'no-meetings' | 'has-meetings'

function TodaySchedule({ state, meetings }: { state: ScheduleState; meetings: Meeting[] }) {
  return (
    <div className="h-full">
      <p className="text-white/25 text-[11px] uppercase tracking-widest font-medium mb-3">Today's Schedule</p>

      {state === 'unauthorized' && (
        <div className="border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <Calendar size={16} className="text-white/30" />
          </div>
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">Connect your calendar</p>
            <p className="text-white/30 text-[11px] leading-relaxed">Sync your Lark calendar to see upcoming meetings, auto-generate prep materials, and join calls directly from frndOS.</p>
          </div>
          <button className="flex items-center gap-1.5 border border-white/20 rounded-xl px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.06] hover:border-white/30 transition-all">
            Authorize Lark <ArrowRight size={11} />
          </button>
        </div>
      )}

      {state === 'no-meetings' && (
        <div className="border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <CheckCircle2 size={16} className="text-white/30" />
          </div>
          <div>
            <p className="text-white/70 text-sm font-medium">No meetings today</p>
            <p className="text-white/25 text-[11px] mt-1">Your schedule is clear.</p>
          </div>
        </div>
      )}

      {state === 'has-meetings' && (
        <div className="space-y-0">
          {meetings.map((meeting) => {
            const isPast = meeting.status === 'past'
            const isActive = meeting.status === 'active'
            const isUpcoming = meeting.status === 'upcoming'
            return (
              <div
                key={meeting.id}
                className={`flex gap-4 py-3 border-b border-white/[0.04] last:border-0 ${isPast ? 'opacity-40' : ''}`}
              >
                <div className="shrink-0 text-right w-16">
                  <p className="text-[11px] text-white/35 font-mono">{meeting.time}</p>
                </div>
                <div className="relative flex items-stretch">
                  <div className={`w-0.5 rounded-full mr-3 ${isActive ? 'bg-[#4ade80]' : isUpcoming ? 'bg-[#facc15]' : 'bg-white/10'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white/75 text-xs font-medium truncate">{meeting.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-white/25 text-[10px]">{meeting.brand}</p>
                        <span className="text-white/10 text-[10px]">·</span>
                        <p className="text-white/20 text-[10px]">{meeting.attendees} attendees</p>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {isUpcoming && meeting.startsInMin && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#2e2a1a] text-[#facc15] border border-[#4a421d]">
                          Starts in {meeting.startsInMin} min
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#1a2e1a] text-[#4ade80] border border-[#2d4a2d]">
                          Live
                        </span>
                      )}
                      {meeting.hasLink && !isPast && (
                        <button className="text-[10px] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded px-2 py-0.5 transition-all">
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Recent Work All Modal ────────────────────────────────────────────
function RecentWorkModal({ items, pinned, onTogglePin, onClose }: {
  items: RecentItem[]
  pinned: Record<string, boolean>
  onTogglePin: (id: string) => void
  onClose: () => void
}) {
  const sorted = [...items].sort((a, b) => {
    if (pinned[a.id] && !pinned[b.id]) return -1
    if (!pinned[a.id] && pinned[b.id]) return 1
    return 0
  })
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
            <span className="text-white/70 text-sm font-medium">All Recent Work</span>
            <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors"><X size={14} /></button>
          </div>
          <div className="overflow-y-auto max-h-[60vh]">
            {sorted.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 shrink-0">{item.toolIcon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/75 text-xs font-medium truncate">{item.title}</p>
                  <p className="text-white/25 text-[10px] mt-0.5">{item.tool} · {item.timeAgo}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePin(item.id) }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-white/25 hover:text-white/60"
                >
                  {pinned[item.id] ? <Pin size={11} className="fill-current" /> : <PinOff size={11} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Recent Work ─────────────────────────────────────────────────────
function RecentWork({ items, empty, onStartTask }: { items: RecentItem[]; empty?: boolean; onStartTask?: () => void }) {
  const [pinned, setPinned] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((i) => [i.id, i.pinned]))
  )
  const [showAll, setShowAll] = useState(false)

  const sorted = [...items].sort((a, b) => {
    if (pinned[a.id] && !pinned[b.id]) return -1
    if (!pinned[a.id] && pinned[b.id]) return 1
    return 0
  })

  const togglePin = (id: string) => setPinned((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div>
      <p className="text-white/25 text-[11px] uppercase tracking-widest font-medium mb-3">Recent Work</p>
      {empty ? (
        <div className="border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <FileText size={16} className="text-white/25" />
          </div>
          <div>
            <p className="text-white/50 text-sm font-medium">No recent work yet</p>
            <p className="text-white/25 text-[11px] mt-1 leading-relaxed">Your pinned workspaces, generated pitches, and drafts will appear here.</p>
          </div>
          <button
            onClick={onStartTask}
            className="flex items-center gap-1.5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
          >
            + Start a new task
          </button>
        </div>
      ) : (
        <>
          {showAll && (
            <RecentWorkModal
              items={items}
              pinned={pinned}
              onTogglePin={togglePin}
              onClose={() => setShowAll(false)}
            />
          )}
          <div className="border border-white/[0.06] rounded-2xl overflow-hidden">
            {sorted.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 shrink-0">
                  {item.toolIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/75 text-xs font-medium truncate">{item.title}</p>
                  <p className="text-white/25 text-[10px] mt-0.5">{item.tool} · {item.timeAgo}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(item.id) }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-white/25 hover:text-white/60"
                >
                  {pinned[item.id] ? <Pin size={11} className="fill-current" /> : <PinOff size={11} />}
                </button>
              </div>
            ))}
            {items.length > 8 && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full text-center text-[11px] text-white/25 hover:text-white/50 py-2.5 transition-colors"
              >
                View all →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Action Bar Modal (9.A.2) ────────────────────────────────────────
const NAV_MODULES = [
  { label: 'Home', icon: <Layers size={13} /> },
  { label: 'Insights', icon: <BarChart2 size={13} /> },
  { label: 'Studio', icon: <Image size={13} /> },
  { label: 'Research', icon: <Users size={13} /> },
  { label: 'Growth', icon: <TrendingUp size={13} /> },
  { label: 'KV Generator', icon: <FileText size={13} /> },
  { label: 'Survey', icon: <CheckCircle2 size={13} /> },
  { label: 'Image Editor', icon: <Image size={13} /> },
  { label: 'Resizer', icon: <Maximize2 size={13} /> },
]

function CmdKOverlay({ open, onClose, initialQuery = '' }: { open: boolean; onClose: () => void; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [activeIndex, setActiveIndex] = useState(0)

  const filtered = query.trim().length === 0
    ? NAV_MODULES
    : NAV_MODULES.filter((m) => m.label.toLowerCase().includes(query.toLowerCase()))

  const isNaturalLanguage = query.trim().split(' ').length >= 3 || (query.length > 0 && filtered.length === 0)
  const showChat = query.length > 0

  useEffect(() => { setActiveIndex(0) }, [query])

  // Sync initialQuery when modal re-opens with a new preset
  useEffect(() => { if (open) setQuery(initialQuery) }, [open, initialQuery])

  useEffect(() => {
    if (!open) { setQuery(''); setActiveIndex(0); return }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { setActiveIndex((i) => Math.min(i + 1, filtered.length + (showChat ? 0 : -1))); e.preventDefault() }
      if (e.key === 'ArrowUp') { setActiveIndex((i) => Math.max(i - 1, 0)); e.preventDefault() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, filtered.length, showChat])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-[72px] px-4" onClick={onClose}>
      <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="border border-white/15 rounded-2xl bg-[#111] shadow-2xl overflow-hidden">

          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Sparkles size={15} className="text-[#60a5fa] shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask frndOS or type a command..."
              className="flex-1 bg-transparent text-white/85 text-sm outline-none placeholder:text-white/25"
            />
            <kbd className="px-2 py-0.5 rounded bg-white/[0.06] text-white/20 text-[10px] font-mono">esc</kbd>
          </div>

          <div className="border-t border-white/[0.07]">
            {/* Navigation section */}
            {filtered.length > 0 && (
              <div>
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium px-4 pt-2.5 pb-1">Navigation</p>
                {filtered.map((mod, i) => (
                  <button
                    key={mod.label}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${activeIndex === i ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'}`}
                  >
                    <span className={`${activeIndex === i ? 'text-white/60' : 'text-white/25'}`}>{mod.icon}</span>
                    <span className={`text-sm ${activeIndex === i ? 'text-white/85' : 'text-white/50'}`}>{mod.label}</span>
                    {activeIndex === i && (
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-white/20">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">↵</kbd>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {filtered.length === 0 && query.trim().split(' ').length < 3 && (
              <p className="px-4 py-3 text-[11px] text-white/25">No results — try a module name or ask a question</p>
            )}

            {/* Chat section — shown when user has typed something */}
            {showChat && (
              <div className="border-t border-white/[0.06]">
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium px-4 pt-2.5 pb-1">Chat</p>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${isNaturalLanguage ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'}`}
                >
                  <span className="text-[#60a5fa]"><Sparkles size={13} /></span>
                  <span className="text-sm text-white/50">
                    Ask FRnD: <span className="text-white/70">&ldquo;{query}&rdquo;</span>
                  </span>
                  {isNaturalLanguage && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-white/20">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">↵</kbd>
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer hints */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.05]">
            {[
              { key: '↑↓', label: 'navigate' },
              { key: '↵', label: 'select' },
              { key: 'esc', label: 'close' },
            ].map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1.5 text-[10px] text-white/20">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] font-mono text-white/25">{key}</kbd>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Interactive Demo Overlay ─────────────────────────────────────────
function DemoOverlay({
  step,
  totalSteps,
  title,
  desc,
  onPrev,
  onNext,
  onClose,
}: {
  step: number
  totalSteps: number
  title: string
  desc: string
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-[#111] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Sparkles size={11} className="text-white/40" />
          <span className="text-[10px] font-medium text-white/35 uppercase tracking-widest">Interactive Demo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20">{step} / {totalSteps}</span>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors">
            <X size={12} />
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="px-4 py-4">
        <p className="text-white/80 text-sm font-medium mb-1.5 leading-snug">{title}</p>
        <p className="text-white/35 text-[11px] leading-relaxed">{desc}</p>
      </div>
      {/* Progress dots */}
      <div className="flex items-center gap-1 px-4 pb-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-white/40' : 'bg-white/10'}`} />
        ))}
      </div>
      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onPrev}
          disabled={step === 1}
          className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={12} className="rotate-180" /> Prev
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-black text-[11px] font-semibold rounded-xl hover:bg-white/90 transition-colors"
        >
          {step === totalSteps ? 'Done' : 'Next'} {step !== totalSteps && <ChevronRight size={11} />}
        </button>
      </div>
    </div>
  )
}

// ── Main Home Page ──────────────────────────────────────────────────
export default function HomePage() {
  const [demoStep, setDemoStep] = useState(1)
  const [showDemo, setShowDemo] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length

  // Derive system state from demo step
  const state: SystemState =
    (demoStep === 5 || demoStep === 6) ? 'cmd-focused' :
    demoStep >= 4 ? 'active-workspace' :
    demoStep >= 2 ? 'calendar-synced' :
    'first-login'

  const showSignal = demoStep >= 3
  const showRecent = demoStep >= 4
  const calendarState: ScheduleState =
    demoStep === 1 ? 'unauthorized' :
    demoStep === 2 ? 'has-meetings' :
    demoStep >= 4 ? 'has-meetings' :
    'no-meetings'

  const meetings = demoStep >= 4 ? MOCK_MEETINGS_ACTIVE : MOCK_MEETINGS
  const isCmdFocused = state === 'cmd-focused' || cmdOpen

  // Pre-fill query per demo step
  const cmdInitialQuery =
    demoStep === 5 ? 'stu' :
    demoStep === 6 ? 'Why is our reach dropping on TikTok?' :
    ''

  useEffect(() => {
    if (demoStep === 5 || demoStep === 6) setCmdOpen(true)
    else setCmdOpen(false)
  }, [demoStep])

  const handleDemoNext = () => {
    if (demoStep === DEMO_STEPS.length) { setShowDemo(false); return }
    setDemoStep((s) => s + 1)
  }
  const handleDemoPrev = () => setDemoStep((s) => Math.max(1, s - 1))

  return (
    <div className="min-h-screen bg-[#161616] relative">
      {/* Cmd+K dim overlay */}
      {isCmdFocused && (
        <div className="fixed inset-0 bg-black/70 z-40 transition-opacity" onClick={() => { setCmdOpen(false); if (demoStep === 5) setDemoStep(6); else if (demoStep === 6) setDemoStep(7) }} />
      )}

      {/* Cmd+K overlay */}
      <CmdKOverlay
        open={isCmdFocused}
        initialQuery={cmdInitialQuery}
        onClose={() => {
          setCmdOpen(false)
          if (demoStep === 5) setDemoStep(6)
          else if (demoStep === 6) setDemoStep(7)
        }}
      />

      {/* Notification drawer */}
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Interactive demo */}
      {showDemo && (
        <DemoOverlay
          step={demoStep}
          totalSteps={DEMO_STEPS.length}
          title={DEMO_STEPS[demoStep - 1].title}
          desc={DEMO_STEPS[demoStep - 1].desc}
          onPrev={handleDemoPrev}
          onNext={handleDemoNext}
          onClose={() => setShowDemo(false)}
        />
      )}

      {/* Page content */}
      <div className={`transition-opacity duration-300 ${isCmdFocused ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-white/50" />
            <span className="text-white/75 font-semibold text-sm tracking-tight">frndOS</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative w-8 h-8 flex items-center justify-center text-white/35 hover:text-white/60 transition-colors"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-blue-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
              AM
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Cmd+K — Hero search bar (center of attention) */}
          <div className="flex flex-col items-center mb-10 pt-4">
            {/* Heading */}
            <p className="text-white/20 text-xs uppercase tracking-widest font-medium mb-5">
              What would you like to do?
            </p>

            {/* Search pill */}
            <button
              onClick={() => setCmdOpen(true)}
              className="group relative flex items-center gap-4 rounded-2xl px-6 py-4 bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.07] hover:border-white/[0.18] transition-all cursor-text w-full max-w-2xl shadow-[0_0_40px_rgba(255,255,255,0.04)] hover:shadow-[0_0_60px_rgba(255,255,255,0.07)]"
            >
              {/* Glow dot */}
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-[#60a5fa]/10 border border-[#60a5fa]/20">
                <Sparkles size={15} className="text-[#60a5fa]" />
              </div>

              <span className="flex-1 text-left text-white/40 text-base group-hover:text-white/50 transition-colors">
                Ask frndOS or type a command...
              </span>

              <div className="shrink-0 flex items-center gap-1.5">
                <kbd className="px-2.5 py-1 rounded-lg bg-white/[0.07] border border-white/[0.10] text-white/30 text-[11px] font-mono group-hover:bg-white/[0.10] group-hover:text-white/40 transition-colors">
                  ⌘
                </kbd>
                <kbd className="px-2.5 py-1 rounded-lg bg-white/[0.07] border border-white/[0.10] text-white/30 text-[11px] font-mono group-hover:bg-white/[0.10] group-hover:text-white/40 transition-colors">
                  K
                </kbd>
              </div>
            </button>

            {/* Quick chips below */}
            <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
              {[
                { label: 'Generate a KV', icon: <FileText size={11} /> },
                { label: 'Analyze trends', icon: <TrendingUp size={11} /> },
                { label: 'Create persona', icon: <Users size={11} /> },
                { label: 'Write a brief', icon: <FileText size={11} /> },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => setCmdOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.07] text-white/30 hover:text-white/60 hover:border-white/[0.14] hover:bg-white/[0.04] text-[11px] transition-all"
                >
                  {chip.icon}
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Today's Signal — conditional */}
          {showSignal && <TodaySignalCard signal={MOCK_SIGNAL} />}

          {/* Your Tools + Trending — two column */}
          <div className="grid grid-cols-5 gap-6 mb-8">
            {/* Your Tools (3 col) */}
            <div className="col-span-3">
              <YourToolsStrip tools={MOCK_YOUR_TOOLS} />
            </div>
            {/* Trending (2 col) */}
            <div className="col-span-2">
              <p className="text-white/25 text-[11px] uppercase tracking-widest font-medium mb-3">Trending in frndOS</p>
              <TrendingFeed tools={MOCK_TRENDING} />
            </div>
          </div>

          {/* Schedule + Recent Work — two column */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <TodaySchedule
                state={calendarState}
                meetings={meetings}
              />
            </div>
            <div>
              <RecentWork
                items={MOCK_RECENT}
                empty={!showRecent}
                onStartTask={() => setCmdOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Bottom dock */}
        <nav className={`fixed bottom-0 left-0 right-0 border-t border-white/[0.06] bg-[#0D0D0D] transition-all duration-300 ${isCmdFocused ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <div className="flex items-center h-12 px-6">
            {/* Left — Home */}
            <button className="text-white/30 text-xs hover:text-white/60 transition-colors shrink-0">
              Home
            </button>

            {/* Center — pillar tabs */}
            <div className="flex-1 flex items-center justify-center gap-8">
              {['Insights', 'Studio', 'Research', 'Growth', 'Wireframes'].map((tab) => (
                <button
                  key={tab}
                  className={`relative text-xs pb-0.5 transition-colors ${
                    tab === 'Wireframes'
                      ? 'text-white/80 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-white/60'
                      : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Right — Cmd+K primary CTA */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 shrink-0 bg-white/[0.08] hover:bg-white/[0.13] border border-white/[0.12] hover:border-white/[0.20] rounded-xl px-3.5 py-1.5 text-white/70 hover:text-white transition-all"
            >
              <Sparkles size={12} className="text-[#60a5fa]" />
              <span className="text-xs font-medium">Ask FRnD</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07] text-white/25 text-[10px] font-mono">⌘K</kbd>
            </button>
          </div>
        </nav>

        {/* Spacer for dock */}
        <div className="h-16" />
      </div>
    </div>
  )
}

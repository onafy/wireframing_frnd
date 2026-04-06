import { useState, useEffect, useRef } from 'react'
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
  ChevronDown,
  ArrowRight,
  Layers,
  BarChart2,
  Sparkles,
  Video,
  CheckCircle2,
  AlertTriangle,
  X,
  Maximize2,
  ExternalLink,
  Construction,
  Brush,
  Terminal,
  FolderOpen,
  LayoutDashboard,
  Megaphone,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────
type VelocityLabel = 'Rising Velocity' | 'Emerging Velocity' | 'Peaking Velocity'
type BrandStatus = 'red' | 'yellow' | 'green'
type HomeTab = 'overview' | 'focus'

interface Meeting {
  id: string
  time: string
  title: string
  brand: string
  attendees: number
  hasLink: boolean
  status: 'past' | 'active' | 'upcoming' | 'future'
  startsInMin?: number
  category?: string
  description?: string
  isExternal?: boolean
  attendeeAvatars?: string[]
}

interface RecentItem {
  id: string
  title: string
  tool: string
  toolIcon: React.ReactNode
  timeAgo: string
  pinned: boolean
  brandName?: string  // undefined = Playground
  imageUrl?: string
  itemType?: 'image' | 'list'
}

// interface TrendingTool {
//   rank: number
//   name: string
//   description: string
//   icon: React.ReactNode
// }

interface YourTool {
  id: string
  name: string
  pillar: string
  icon: React.ReactNode
  description: string
  status: 'live' | 'soon'
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

interface ResearchProgress {
  total: number
  responseRate: number
  completionRate?: number
  avgCtr?: number
  verdict: 'healthy' | 'needs-push' | 'critical'
  trend?: 'up' | 'down' | 'steady'
}

interface InsightEntry {
  name: string
  platform: string
  value: string
  delta?: string
  verdict: 'healthy' | 'warning' | 'attention'
  verdictLabel: string
  statusPill?: 'good' | 'warning' | 'critical'
}

interface PillarSummary {
  status: 'green' | 'yellow' | 'red' | 'inactive'
  label: string
  value: string
  sub?: string
  researchProgress?: ResearchProgress
  insights?: InsightEntry[]
}

interface Brand {
  id: string
  name: string
  status: BrandStatus
  activeCampaigns: number
  signal?: { label: string; count: number }
  teamActivity?: string
  deadline?: string
  weeklyOutput?: string
  hasActivity: boolean
  logoUrl?: string
  category?: string
  reach?: string
  pillars: PillarSummary[]
}

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_BRANDS: Brand[] = [
  // 1. Ultra Milk — red · guardrails 72% · research needs push · insights mixed
  {
    id: 'ultra-milk',
    name: 'Ultra Milk',
    status: 'red',
    activeCampaigns: 2,
    category: 'Consumer Packaged Goods',
    reach: '2.4M',
    signal: { label: 'Rising Velocity', count: 2 },
    teamActivity: 'Budi (PM), Rina (Designer) — active 2h ago',
    deadline: 'Valentine KV due TOMORROW',
    weeklyOutput: '7 assets created · 12 KV generated',
    hasActivity: true,
    pillars: [
      { label: 'Studio', status: 'red', value: '72', sub: 'brand profile progress' },
      {
        label: 'Research', status: 'yellow', value: '14 surveys',
        researchProgress: { total: 14, responseRate: 71, completionRate: 86, avgCtr: 1.4, verdict: 'needs-push', trend: 'up' }
      },
      {
        label: 'Insights', status: 'yellow', value: '',
        insights: [
          { name: 'Summer Campaign Post', platform: 'IG', value: '4.8%', delta: '+0.8%', verdict: 'healthy', verdictLabel: 'above avg', statusPill: 'good' },
          { name: 'TikTok Trending Audio', platform: 'TikTok', value: '7.1%', delta: '+1.2%', verdict: 'warning', verdictLabel: 'peaking', statusPill: 'warning' },
          { name: 'Meta Brand Awareness', platform: 'Meta', value: 'CTR 1.48%', verdict: 'attention', verdictLabel: 'below avg', statusPill: 'critical' },
        ]
      }
    ]
  },
  // 2. Bank OCBC — yellow · guardrails 88% · research healthy · insights below avg
  {
    id: 'bank-ocbc',
    name: 'Bank OCBC',
    status: 'yellow',
    activeCampaigns: 2,
    category: 'Banking & Finance',
    reach: '840K',
    signal: { label: 'Emerging Velocity', count: 1 },
    teamActivity: 'Asep (PM) — active 5h ago',
    weeklyOutput: '3 assets created · 4 KV generated',
    hasActivity: true,
    pillars: [
      { label: 'Studio', status: 'yellow', value: '88', sub: 'brand profile progress' },
      {
        label: 'Research', status: 'green', value: '8 surveys',
        researchProgress: { total: 8, responseRate: 75, completionRate: 91, avgCtr: 2.1, verdict: 'healthy', trend: 'steady' }
      },
      {
        label: 'Insights', status: 'red', value: '',
        insights: [
          { name: 'LinkedIn Thought Leadership', platform: 'LinkedIn', value: '2.9%', verdict: 'attention', verdictLabel: 'below avg', statusPill: 'critical' },
          { name: 'Twitter Brand Awareness', platform: 'Twitter', value: '18K', verdict: 'warning', verdictLabel: 'limited reach', statusPill: 'warning' },
        ]
      }
    ]
  },
  // 3. Indofood — green · guardrails 100% · research complete · insights healthy
  {
    id: 'indofood',
    name: 'Indofood',
    status: 'green',
    activeCampaigns: 1,
    category: 'Food & Beverage',
    reach: '5.1M',
    teamActivity: 'Dian (PM) — active 1d ago',
    weeklyOutput: '5 assets created · 8 KV generated',
    hasActivity: true,
    pillars: [
      { label: 'Studio', status: 'green', value: '100', sub: 'brand profile progress' },
      {
        label: 'Research', status: 'green', value: '5 surveys',
        researchProgress: { total: 5, responseRate: 100, completionRate: 100, avgCtr: 3.8, verdict: 'healthy', trend: 'up' }
      },
      {
        label: 'Insights', status: 'green', value: '',
        insights: [
          { name: 'IG Lifestyle Posts', platform: 'IG', value: '3.9%', verdict: 'healthy', verdictLabel: 'avg', statusPill: 'good' },
          { name: 'TikTok Recipe Series', platform: 'TikTok', value: '5.7%', verdict: 'healthy', verdictLabel: 'healthy', statusPill: 'good' },
        ]
      }
    ]
  },
  // 4. Mie Sedaap — green · dormant · no campaigns · no data
  {
    id: 'mie-sedaap',
    name: 'Mie Sedaap',
    status: 'green',
    activeCampaigns: 0,
    hasActivity: false,
    pillars: [
      { label: 'Studio', status: 'green', value: '100', sub: 'brand profile progress' },
      { label: 'Research', status: 'inactive', value: '0 surveys', researchProgress: { total: 0, responseRate: 0, verdict: 'critical' } },
      { label: 'Insights', status: 'inactive', value: '' },
    ]
  },
  // 5. Grab Indonesia — green · guardrails 100% · research high volume · insights mixed
  {
    id: 'grab-id',
    name: 'Grab Indonesia',
    status: 'green',
    activeCampaigns: 3,
    category: 'Technology & Logistics',
    reach: '5.2M',
    teamActivity: 'Farhan (PM), Siti (Designer), Teguh (Copy) — active 30m ago',
    weeklyOutput: '14 assets created · 22 KV generated',
    hasActivity: true,
    pillars: [
      { label: 'Studio', status: 'green', value: '100', sub: 'brand profile progress' },
      {
        label: 'Research', status: 'yellow', value: '22 surveys',
        researchProgress: { total: 22, responseRate: 68, completionRate: 74, avgCtr: 2.7, verdict: 'needs-push', trend: 'down' }
      },
      {
        label: 'Insights', status: 'yellow', value: '',
        insights: [
          { name: 'IG Brand Posts', platform: 'IG', value: '3.4%', verdict: 'healthy', verdictLabel: 'avg', statusPill: 'good' },
          { name: 'TikTok Promos', platform: 'TikTok', value: '5.2%', verdict: 'warning', verdictLabel: 'peaking', statusPill: 'warning' },
          { name: 'Google Search', platform: 'Google', value: '620K', verdict: 'healthy', verdictLabel: 'strong', statusPill: 'good' },
        ]
      }
    ]
  },
  // 6. Wardah — yellow · guardrails 76% · research needs push · insights mixed
  {
    id: 'wardah',
    name: 'Wardah Cosmetics',
    status: 'yellow',
    activeCampaigns: 0,
    category: 'Beauty & Personal Care',
    reach: '1.8M',
    signal: { label: 'Rising Velocity', count: 1 },
    teamActivity: 'Nadia (PM) — active 3h ago',
    weeklyOutput: '1 assets created · 2 KV generated',
    hasActivity: true,
    pillars: [
      { label: 'Studio', status: 'red', value: '76', sub: 'brand profile progress' },
      {
        label: 'Research', status: 'yellow', value: '3 surveys',
        researchProgress: { total: 3, responseRate: 33, completionRate: 41, avgCtr: 4.2, verdict: 'needs-push', trend: 'down' }
      },
      {
        label: 'Insights', status: 'yellow', value: '',
        insights: [
          { name: 'IG Beauty Tutorial', platform: 'IG', value: '6.8%', verdict: 'healthy', verdictLabel: 'strong', statusPill: 'good' },
          { name: 'TikTok Skincare Trend', platform: 'TikTok', value: '9.3%', verdict: 'warning', verdictLabel: 'peaking', statusPill: 'warning' },
        ]
      }
    ]
  },
  // 7. Aqua Indonesia — red · guardrails 54% · research critical · insights below avg
  {
    id: 'aqua-id',
    name: 'Aqua Indonesia',
    status: 'red',
    activeCampaigns: 1,
    category: 'Beverage Industry',
    reach: '8.3M',
    signal: { label: 'Emerging Velocity', count: 3 },
    teamActivity: 'Last active 4 days ago',
    weeklyOutput: '0 assets created · 1 KV generated',
    hasActivity: true,
    pillars: [
      { label: 'Studio', status: 'red', value: '54', sub: 'brand profile progress' },
      {
        label: 'Research', status: 'red', value: '1 survey',
        researchProgress: { total: 1, responseRate: 0, completionRate: 0, avgCtr: 0.9, verdict: 'critical', trend: 'down' }
      },
      {
        label: 'Insights', status: 'red', value: '',
        insights: [
          { name: 'IG Product Shot', platform: 'IG', value: '1.8%', verdict: 'attention', verdictLabel: 'below avg', statusPill: 'critical' },
          { name: 'TikTok Refresh Campaign', platform: 'TikTok', value: '3.1%', verdict: 'warning', verdictLabel: 'recovery needed', statusPill: 'warning' },
        ]
      }
    ]
  },
  // 8. Bango Kecap — green · guardrails 95% · research complete · insights avg
  {
    id: 'bango',
    name: 'Bango Kecap',
    status: 'green',
    activeCampaigns: 1,
    category: 'Food Seasonings',
    reach: '1.2M',
    teamActivity: 'Rudi (PM) — active 8h ago',
    weeklyOutput: '4 assets created · 6 KV generated',
    hasActivity: true,
    pillars: [
      { label: 'Studio', status: 'green', value: '95', sub: 'brand profile progress' },
      {
        label: 'Research', status: 'green', value: '6 surveys',
        researchProgress: { total: 6, responseRate: 100, completionRate: 100, avgCtr: 2.0, verdict: 'healthy', trend: 'up' }
      },
      {
        label: 'Insights', status: 'green', value: '',
        insights: [
          { name: 'Google Recipe Search', platform: 'Google', value: 'CTR 2.0%', verdict: 'healthy', verdictLabel: 'avg', statusPill: 'good' },
        ]
      }
    ]
  },
  // 9. Mixue Indonesia — yellow · dormant · no campaigns · no data
  {
    id: 'mixue-id',
    name: 'Mixue Indonesia',
    status: 'yellow',
    activeCampaigns: 0,
    category: 'Food & Beverage',
    reach: '—',
    hasActivity: false,
    pillars: [
      { label: 'Studio', status: 'red', value: '61', sub: 'brand profile progress' },
      { label: 'Research', status: 'inactive', value: '0 surveys', researchProgress: { total: 0, responseRate: 0, verdict: 'critical' } },
      { label: 'Insights', status: 'inactive', value: '' },
    ]
  },
  // 10. Tango Indonesia — yellow · guardrails 82% · research healthy · insights strong
  {
    id: 'tango-id',
    name: 'Tango Indonesia',
    status: 'yellow',
    activeCampaigns: 1,
    category: 'Snacks & Confectionery',
    reach: '3.8M',
    signal: { label: 'Rising Velocity', count: 2 },
    teamActivity: 'Putri (PM), Ardi (Designer) — active 45m ago',
    deadline: 'Ramadan Campaign due in 3 days',
    weeklyOutput: '9 assets created · 15 KV generated',
    hasActivity: true,
    pillars: [
      { label: 'Studio', status: 'yellow', value: '82', sub: 'brand profile progress' },
      {
        label: 'Research', status: 'green', value: '9 surveys',
        researchProgress: { total: 9, responseRate: 78, completionRate: 88, avgCtr: 3.1, verdict: 'healthy', trend: 'steady' }
      },
      {
        label: 'Insights', status: 'green', value: '',
        insights: [
          { name: 'IG Ramadan Series', platform: 'IG', value: '4.2%', verdict: 'healthy', verdictLabel: 'above avg', statusPill: 'good' },
          { name: 'TikTok Snack Hacks', platform: 'TikTok', value: '6.1%', verdict: 'healthy', verdictLabel: 'strong', statusPill: 'good' },
          { name: 'Meta Promo Carousel', platform: 'Meta', value: '18K', verdict: 'healthy', verdictLabel: 'avg', statusPill: 'good' },
        ]
      }
    ]
  },
]

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
  { id: 'trendseeker', name: 'Design Suite', pillar: 'Studio', icon: <Brush size={16} />, description: 'Advanced vector tools and layout engines for high-fidelity prototypes.', status: 'live' },
  { id: 'visual-labs', name: 'Motion Studio', pillar: 'Studio', icon: <Video size={16} />, description: 'Dynamic timeline and keyframe animations for immersive experiences.', status: 'live' },
  { id: 'persona-gen', name: 'Code Lab', pillar: 'Research', icon: <Terminal size={16} />, description: 'Direct environment for React and Tailwind prototyping with live preview.', status: 'soon' },
  { id: 'kv-gen', name: 'Generative AI', pillar: 'Growth', icon: <Sparkles size={16} />, description: 'Assisted asset generation and creative prompt engineering workspace.', status: 'soon' },
]

const MOCK_MEETINGS: Meeting[] = [
  { id: 'm1', time: '11:00 AM', title: 'Valentine Campaign Prep', brand: 'Ultra Milk', attendees: 4, hasLink: true, status: 'upcoming', startsInMin: 21 },
  { id: 'm2', time: '02:00 PM', title: 'OCBC Quarterly Review', brand: 'Bank OCBC', attendees: 6, hasLink: true, status: 'future' },
  { id: 'm3', time: '04:00 PM', title: 'Persona Alignment', brand: 'Indofood', attendees: 3, hasLink: true, status: 'future' },
]

const MOCK_MEETINGS_ACTIVE: Meeting[] = [
  { id: 'm0', time: '09:00', title: 'Morning Standup', brand: 'Internal', attendees: 8, hasLink: false, status: 'past', category: 'Editorial' },
  { id: 'm1', time: '11:00', title: 'Client Sync', brand: 'Ultra Milk', attendees: 4, hasLink: true, status: 'active', category: 'Meeting', description: 'Bi-weekly alignment with the Ultra Milk team.', isExternal: true, attendeeAvatars: ['https://lh3.googleusercontent.com/aida-public/AB6AXuA0zrZNrXUMwNJhfY2sVZlYUsDJ4_mQFnSzPUGrHrIktRvDxJ7MJYSLh70hoZBbHABu5RvBEqPFjJfA5sOyH_cmQAIigmHvNeScDLn6S2cC3CtS6P8MEvP7b1i78jHZQANoeg-EMhpCnLoVmBr1oUlj4Za2PlNazWsZzuh12EP3nb0oiD4bbY6ykQ-M8NrL6LWbmCjln1HP7kXFE3ymklz5unk8b9iYmH13-10wIKphfrTfTcW4URhFUESTdvRxiNNeeEx13qOGmFYe', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI2ofuGJd38wsWyQIdjyDgu31nATK8Tz9-22XNQjsdlUD2eej14AmE5hDBNJcEZgU084VUSDS-sUoXxeHAAWDhc_sf_giV1ctZ72JyTqlTJ1WeQ6TXFwHc1S-gbxl89rOONmxIR7PVAYbseHdFn2r8UJYbx8ZD4dCuZsJX3E8Fe4TwOYJBAtqVCu7CuNoZ0YIgSh2mRXnFg8dUSMH_vdO4iwPL6ed_3TQ98yEgDgWggUwL16dj63P444jvwmtJ8-J3Rm1BrWSw-XqK'] },
  { id: 'm2', time: '14:00', title: 'Brand Strategy Review', brand: 'Bank OCBC', attendees: 6, hasLink: true, status: 'future', category: 'FOCUS', description: 'Refining brand guidelines and creative direction for Q3.' },
  { id: 'm3', time: '16:00', title: 'Sprint Wrap-up', brand: 'Internal', attendees: 3, hasLink: true, status: 'future', category: 'Operations' },
]

const MOCK_RECENT: RecentItem[] = [
  { id: 'r1', title: 'Ultra Milk Brand Guidelines', tool: 'Visual Labs', toolIcon: <Image size={11} />, timeAgo: '4 hrs ago', pinned: true, brandName: 'Ultra Milk', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5g6jB7F-Y1CVh7zY8iYyc-dP7JBJZOKkr7vMWD7DykzBiHKQAIK8_q-Ws_dNJvXpCcXtZK6QKN2GttATm3Q62Q0s0uv9SEY0wokbv0yKhGafWkeX04mgpYVrnPwNSGOe_z0vHcvpgoDOOeAvjK4iKwAUSBUkfCDaRTpF68JAcS6JyY3h7PiyHIHeXt_KeLLHIjhQbNfYCgXcP_HepO1sqOO07g8-wSUexn6O-HbJU8soO_lkfwKfzlgdVsbhvndXrRZHMrLZzDlGS', itemType: 'image' },
  { id: 'r2', title: 'Q1 OKRs & Tracking', tool: 'KV Generator', toolIcon: <BarChart2 size={11} />, timeAgo: '2 days ago', pinned: true, brandName: 'Ultra Milk', itemType: 'list' },
  { id: 'r3', title: 'OCBC Campaign Brief v3', tool: 'Creative Brief', toolIcon: <FileText size={11} />, timeAgo: '3 days ago', pinned: false, brandName: 'Bank OCBC', itemType: 'list' },
  { id: 'r4', title: 'Indofood Gen-Z Personas', tool: 'Research', toolIcon: <Users size={11} />, timeAgo: '5 days ago', pinned: false, brandName: 'Indofood', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiEEM_AoSFHE--y3pKAfvPW1rSm1gCq0T0ZD9NcWO02sPdX8ztvhh_nyPw_ZdRmfRLtqIsU8a6-lJKeEBTyNuVx_XxnZA0MJ9AmJxfg1cMHSAwo7iVR_YlWUWIVWH_T-64nYXAG8IJ1YpOvY27A-MzX2Lw175y37IZ9m7PGkyu5fJzNTBYL72foAlFQ91aWFwRSNdSzHGp8g3LmHgcqfvpVybyQEk1Y5DuHdYzgHpWXc1WDc-sKALPM-pSBKkBU6S-n8iROVPSRjKF', itemType: 'image' },
  { id: 'r5', title: 'Valentine KV Draft 02', tool: 'KV Generator', toolIcon: <BarChart2 size={11} />, timeAgo: '1 week ago', pinned: false, brandName: 'Ultra Milk', itemType: 'list' },
]

// Playground recent work (State A2)
const MOCK_RECENT_PLAYGROUND: RecentItem[] = [
  { id: 'pg1', title: 'Brand Naming Shortlist Q1', tool: 'Research', toolIcon: <Users size={11} />, timeAgo: '1 day ago', pinned: true },
  { id: 'pg2', title: 'Competitor Landscape Deck', tool: 'KV Generator', toolIcon: <BarChart2 size={11} />, timeAgo: '3 days ago', pinned: true },
  { id: 'pg3', title: 'Packaging Concept 03', tool: 'Visual Labs', toolIcon: <Image size={11} />, timeAgo: '5 days ago', pinned: false },
]

// interface Announcement {
//   id: string
//   badge?: string  // e.g. "New", "Update", "Breaking"
//   title: string
//   description: string
//   date: string
//   readTime?: string
// }

// interface ForYouData {
//   dailyFocus: {
//     message: string
//     type: 'urgent' | 'normal' | 'caught-up'
//   }
//   announcements: Announcement[]
//   weeklySummary: {
//     assetsCreated: number
//     brands: number
//   }
// }

// ── For You Section Mock Data ──────────────────────────────────────
// const MOCK_FOR_YOU: ForYouData = {
//   dailyFocus: {
//     message: "Ultra Milk guardrails at 72% — review flagged assets before the Valentine campaign deadline.",
//     type: 'urgent',
//   },
//   announcements: [
//     {
//       id: 'ann1',
//       badge: 'New',
//       title: 'Trendseeker now supports audio trend analysis for TikTok',
//       description: 'Detect trending sounds and music clips directly from your dashboard.',
//       date: '2026-04-05',
//       readTime: '2 min read',
//     },
//     {
//       id: 'ann2',
//       badge: 'Update',
//       title: 'Brand Guardrails v2 — 40% faster scanning',
//       description: 'New incremental scan mode reduces re-check time from 3 minutes to under 90 seconds.',
//       date: '2026-04-03',
//     },
//     {
//       id: 'ann3',
//       badge: 'Update',
//       title: 'Canvas export now supports 8K resolution',
//       description: 'Export creatives at up to 7680 × 4320 for high-res campaign materials.',
//       date: '2026-04-01',
//     },
//   ],
//   weeklySummary: {
//     assetsCreated: 19,
//     brands: 6,
//   },
// }

// Brand-assigned recent work (State B2 — Fresh Brand, zero data)
const MOCK_RECENT_B: RecentItem[] = [
  { id: 'fb1', title: 'Brand Kickoff Brief', tool: 'Creative Brief', toolIcon: <FileText size={11} />, timeAgo: '1 day ago', pinned: true, brandName: 'Fresh Brand' },
  { id: 'fb2', title: 'Competitor Audit Notes', tool: 'Research', toolIcon: <Users size={11} />, timeAgo: '2 days ago', pinned: false, brandName: 'Fresh Brand' },
]

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'collab', title: 'Budi Santoso shared a KV draft', desc: 'Valentine Campaign Prep · Ultra Milk', time: '2h ago', read: false },
  { id: 'n2', type: 'system', title: 'New feature: Trendseeker v2', desc: 'Now supports audio trend analysis for TikTok', time: '1d ago', read: false },
  { id: 'n3', type: 'collab', title: 'Rina commented on your brief', desc: 'OCBC Quarterly Review brief', time: '2d ago', read: true },
]

// ── Brand for State B (assigned brand, zero data) ─────────────────
const MOCK_BRAND_ZERO_DATA: Brand = {
  id: 'fresh-brand',
  name: 'Fresh Brand',
  status: 'green',
  activeCampaigns: 0,
  hasActivity: false,
  pillars: [
    { label: 'Studio', status: 'green', value: '0', sub: 'brand profile progress' },
    { label: 'Research', status: 'inactive', value: '0 surveys', researchProgress: { total: 0, responseRate: 0, verdict: 'critical' } },
    { label: 'Insights', status: 'inactive', value: '' },
  ],
}

// ── Demo State Config ────────────────────────────────────────────────
// Structure: STATE + SUB-STEP
//  A1 → pure playground, no recent work
//  A2 → playground, recent work populated
//  B1 → overview: brand grid includes zero-data brand card
//  B2 → focus: brand selected, zero-data signal
//  C1 → focus: full experience
//  C2–C5 → focus: brand signal variations
//  C6 → Cmd+K overlay

type DemoStep = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6'

const DEMO_STEPS_CONFIG: Record<DemoStep, {
  state: 'A' | 'B' | 'C'
  tabHint: string
  title: string
  desc: string
  group?: string
}> = {
  A1: {
    state: 'A', tabHint: 'No tabs — For You visible',
    title: 'Pure Playground — Nothing Yet',
    desc: 'User enters frndOS for the first time. No brand assigned, no work history, calendar not connected. For You section shows Daily Focus + What\'s New announcements + This Week stats. Your Tools and Recent Work show empty states.',
  },
  A2: {
    state: 'A', tabHint: 'No tabs — For You + Recent Work populated',
    title: 'Playground — First Work Generated',
    desc: 'User has used frndOS in Playground mode — generated a brief or created a KV, but still not assigned to any brand. For You section is live (Daily Focus + What\'s New announcements + This Week stats). Recent Work section is now populated.',
  },
  B1: {
    state: 'B', tabHint: 'Overview tab',
    title: 'Brand Assigned — Zero Data (Overview)',
    desc: 'User is assigned to a brand (Fresh Brand) but has not generated anything yet. Brand card appears in Overview grid. For You section shows What\'s New announcements and This Week stats.',
  },
  B2: {
    state: 'B', tabHint: 'Focus tab',
    title: 'Brand Assigned — Zero Data (Focus)',
    desc: 'Same brand. Focus tab selected. BrandSignalCard shows "No active campaigns." For You section visible with announcements. Recent Work minimal.',
  },
  C1: {
    state: 'C', tabHint: 'Focus tab',
    title: 'Active Brand — Full Experience',
    desc: 'Brand with real data. All sections live: Today\'s Signal, BrandSignalCard, For You (Daily Focus + What\'s New + This Week), Your Tools, Recent Work, and Schedule.',
  },
  C2: {
    state: 'C', tabHint: 'Focus: Brand Signal — Serious',
    title: 'Brand Signal: Serious Issues',
    desc: 'Guardrails failing below 70%, research completely stalled (0% response), and insights below benchmark across all platforms. Needs immediate PM attention.',
  },
  C3: {
    state: 'C', tabHint: 'Focus: Brand Signal — Needs Attention',
    title: 'Brand Signal: Needs Attention',
    desc: 'One or more warning signals — guardrail misses or research below 60% response rate. Not blocking, but should be fixed before next campaign.',
  },
  C4: {
    state: 'C', tabHint: 'Focus: Brand Signal — Healthy',
    title: 'Brand Signal: Healthy',
    desc: 'All pillars passing. Studio 100%, research fully responded, platform engagement above benchmark. No action needed.',
  },
  C5: {
    state: 'C', tabHint: 'Focus: Brand Signal — No Data',
    title: 'Brand Signal: No Data Yet',
    desc: 'Brand has no active campaigns or uploaded assets. Health signals cannot be generated — prompt team to start a campaign.',
  },
  C6: {
    state: 'C', tabHint: 'Cmd+K — Action Bar',
    title: 'Cmd+K — Action Bar Navigation',
    desc: 'Press ⌘K to open Action Bar. Type "stu" to filter to Studio module, or type a natural-language query to hand off to Ask FRnD.',
  },
}

const DEMO_STEP_ORDER: DemoStep[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6']

// ── Velocity badge color ────────────────────────────────────────────
function velocityBg(label: VelocityLabel) {
  if (label === 'Rising Velocity') return 'bg-[#1a2e1a] text-[#4ade80] border-[#2d4a2d]'
  if (label === 'Emerging Velocity') return 'bg-[#1a1f2e] text-[#60a5fa] border-[#2d3a4a]'
  return 'bg-[#2e2a1a] text-[#facc15] border-[#4a421d]'
}

function statusColor(status: BrandStatus) {
  if (status === 'red') return { dot: 'bg-red-500', text: 'text-red-400', label: 'Needs Attention' }
  if (status === 'yellow') return { dot: 'bg-yellow-500', text: 'text-yellow-400', label: 'In Progress' }
  return { dot: 'bg-green-500', text: 'text-green-400', label: 'On Track' }
}

// ── Brand Selector ──────────────────────────────────────────────────
function BrandSelector({
  brands,
  selected,
  onSelect,
}: {
  brands: Brand[]
  selected: Brand | null
  onSelect: (b: Brand | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeBrands = brands.filter((b) => b.hasActivity)
  const zeroBrands = brands.filter((b) => !b.hasActivity)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-medium text-white/50 hover:bg-white/[0.05] px-3 py-2 rounded-xl transition-colors"
      >
        <span>{selected?.name ?? 'Select brand'}</span>
        <ChevronDown size={13} className={`text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Active brands */}
          {activeBrands.map((brand) => {
            const sc = statusColor(brand.status)
            return (
              <button
                key={brand.id}
                onClick={() => { onSelect(brand); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors ${selected?.id === brand.id ? 'bg-white/[0.04]' : ''}`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                <span className="text-white/60 text-xs">{brand.name}</span>
              </button>
            )
          })}
          {/* Zero-data brands */}
          {zeroBrands.length > 0 && (
            <>
              <div className="border-t border-white/[0.06]" />
              {zeroBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => { onSelect(brand); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors ${selected?.id === brand.id ? 'bg-white/[0.04]' : ''}`}
                >
                  <div className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
                  <span className="text-white/40 text-xs">{brand.name}</span>
                </button>
              ))}
            </>
          )}
          {/* Divider */}
          <div className="border-t border-white/[0.06]" />
          {/* Playground */}
          <button
            onClick={() => { onSelect(null); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-white/10 shrink-0" />
            <span className="text-white/30 text-xs">Playground</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Tab Toggle ──────────────────────────────────────────────────────
function TabToggle({
  activeTab,
  onTabChange,
  selectedBrand,
  onBrandSelect,
  brands,
}: {
  activeTab: HomeTab
  onTabChange: (tab: HomeTab) => void
  selectedBrand: Brand | null
  onBrandSelect: (b: Brand | null) => void
  brands: Brand[]
}) {
  const [brandDropOpen, setBrandDropOpen] = useState(false)
  const brandDropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (brandDropRef.current && !brandDropRef.current.contains(e.target as Node)) setBrandDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onTabChange('overview')}
        className={`text-xs pb-0.5 px-3 py-1.5 rounded-lg transition-colors ${
          activeTab === 'overview'
            ? 'text-white/80 font-medium bg-white/[0.06]'
            : 'text-white/35 hover:text-white/60'
        }`}
      >
        Overview
      </button>

      <div className="relative" ref={brandDropRef}>
        <button
          onClick={() => {
            if (activeTab !== 'focus') onTabChange('focus')
            setBrandDropOpen((o) => !o)
          }}
          className={`flex items-center gap-1.5 text-xs pb-0.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'focus'
              ? 'text-white/80 font-medium bg-white/[0.06]'
              : 'text-white/35 hover:text-white/60'
          }`}
        >
          Focus: {selectedBrand?.name ?? 'Select brand'}
          <ChevronDown size={10} className={`text-white/30 transition-transform ${brandDropOpen ? 'rotate-180' : ''}`} />
        </button>

        {brandDropOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
            {brands.map((brand) => {
              const sc = statusColor(brand.status)
              const isZero = !brand.hasActivity
              return (
                <button
                  key={brand.id}
                  onClick={() => { onBrandSelect(brand); setBrandDropOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors ${selectedBrand?.id === brand.id ? 'bg-white/[0.04]' : ''}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isZero ? 'bg-white/20' : sc.dot}`} />
                  <span className={`text-xs ${isZero ? 'text-white/40' : 'text-white/60'}`}>{brand.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Brand Logo Helper ───────────────────────────────────────────────
const BRAND_COLORS: Record<string, string> = {
  'ultra-milk':  '2a2a2a',
  'bank-ocbc':   '1e1e1e',
  'indofood':    '232323',
  'grab-id':     '252525',
  'wardah':      '2d2d2d',
  'aqua-id':     '202020',
  'bango':       '282828',
  'mixue-id':    '1c1c1c',
  'mie-sedaap':  '303030',
  'tango-id':    '181818',
}

function BrandLogoImg({ brand, size = 48 }: { brand: Brand; size?: number }) {
  const words = brand.name.split(' ')
  const initials = words.length >= 2
    ? words[0].charAt(0) + words[1].charAt(0)
    : words[0].substring(0, 2)
  const color = BRAND_COLORS[brand.id] ?? '555555'
  const fontSize = Math.round(size * 0.36)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-full"
    >
      <rect width={size} height={size} fill={`#${color}`} rx={size / 2} />
      <text
        x={size / 2}
        y={size / 2}
        dominantBaseline="central"
        textAnchor="middle"
        fill="white"
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.5"
      >
        {initials.toUpperCase()}
      </text>
    </svg>
  )
}

// ── Overview Tab — Brand Cards Grid ─────────────────────────────────
function OverviewTab({
  brands,
  zeroDataBrands,
  overviewMode,
  onSelectBrand,
}: {
  brands: Brand[]
  zeroDataBrands?: Brand[]
  overviewMode?: 'compact' | 'detailed'
  onSelectBrand: (b: Brand | null) => void
}) {
  const activeBrands = brands.filter((b) => b.hasActivity)

  // Group by status, then sort activeCampaigns descending
  const sorted = [...activeBrands].sort((a, b) => {
    if (a.status === 'red' && b.status !== 'red') return -1
    if (b.status === 'red' && a.status !== 'red') return 1
    if (a.status === 'yellow' && b.status === 'green') return -1
    if (b.status === 'yellow' && a.status === 'green') return 1
    return b.activeCampaigns - a.activeCampaigns
  })

  // Zero-data brand cards render separately at the bottom
  const zeroBrands = zeroDataBrands ?? []

  if (activeBrands.length === 0 && zeroBrands.length === 0) {
    return (
      <div className="border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <Layers size={16} className="text-white/25" />
        </div>
        <div>
          <p className="text-white/50 text-sm font-medium">No active brands in the last 3 months.</p>
          <p className="text-white/25 text-[11px] mt-1">Connect a brand or create a new one to get started.</p>
        </div>
      </div>
    )
  }

  const BrandCard = ({ brand }: { brand: Brand }) => {
    return (
      <button
        onClick={() => onSelectBrand(brand)}
        className="group relative flex flex-col items-center border border-white/[0.06] rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-200 text-center px-5 pt-16 pb-5"
      >
        {/* Floating badge — overflows above card */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden`}>
            <BrandLogoImg brand={brand} size={44} />
          </div>
        </div>

        {/* Signal badge — top right */}
        {brand.signal && (
          <div className="absolute top-3 right-3">
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${velocityBg(brand.signal.label as VelocityLabel)}`}>
              {brand.signal.label}
            </span>
          </div>
        )}

        {/* Title */}
        <p className="text-white/80 text-xs font-semibold leading-tight">{brand.name}</p>

        {/* Subtitle */}
        <p className="text-white/25 text-[10px] mt-1">
          {brand.activeCampaigns > 0 ? `${brand.activeCampaigns} active campaign${brand.activeCampaigns !== 1 ? 's' : ''}` : 'No active campaigns'}
        </p>

        {/* Info strip — Studio guardrails from pillars */}
        <div className="w-full mt-4 bg-white/[0.04] rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
            <BrandLogoImg brand={brand} size={36} />
          </div>
          <span className="text-white/20 text-sm">→</span>
          <div className="flex-1 text-left">
            {(() => {
              const studio = brand.pillars?.find(p => p.label === 'Studio')
              if (!studio) return null
              return studio.status === 'green' ? (
                <>
                  <p className="text-[14px] font-semibold leading-none text-white/70">✓</p>
                  <p className="text-white/25 text-[9px] uppercase tracking-widest mt-0.5">Studio</p>
                </>
              ) : (
                <>
                  <p className={`text-[14px] font-semibold leading-none ${studio.status === 'red' ? 'text-red-400/80' : 'text-yellow-400/80'}`}>
                    {studio.value}%
                  </p>
                  <p className="text-white/25 text-[9px] uppercase tracking-widest mt-0.5">Studio</p>
                </>
              )
            })()}
          </div>
        </div>

        {/* Body copy */}
        <p className="text-white/20 text-[10px] mt-3 leading-relaxed px-1">
          {brand.teamActivity ?? 'No recent activity'}
        </p>
      </button>
    )
  }

  return (
    <div>

      {/* Active brand grid — sorted red → yellow → green */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {sorted.map((brand) => (
            overviewMode === 'detailed' ? (
              <BrandOverviewCard key={brand.id} brand={brand} onClick={() => onSelectBrand(brand)} />
            ) : (
              <BrandCard key={brand.id} brand={brand} />
            )
          ))}
        </div>
      )}

      {/* Zero-data brand cards */}
      {zeroBrands.length > 0 && (
        <>
          {sorted.length > 0 && (
            <div className="flex items-center gap-3 mt-10 mb-6">
              <div className="flex-1 border-t border-white/[0.06]" />
              <span className="text-white/15 text-[9px] uppercase tracking-widest">Pending Setup</span>
              <div className="flex-1 border-t border-white/[0.06]" />
            </div>
          )}
          <div className="grid grid-cols-4 gap-x-4 gap-y-16 pt-4">
            {zeroBrands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => onSelectBrand(brand)}
                className="group relative flex flex-col items-center border border-white/[0.06] rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/[0.10] transition-all duration-200 text-center px-5 pt-16 pb-5 opacity-60 hover:opacity-80"
              >
                {/* Floating logo badge */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/[0.08] ring-offset-2 ring-offset-[#161616]">
                    <BrandLogoImg brand={brand} size={44} />
                  </div>
                </div>

                {/* Title */}
                <p className="text-white/60 text-xs font-semibold leading-tight">{brand.name}</p>

                {/* Subtitle */}
                <p className="text-white/20 text-[10px] mt-1">No active campaigns</p>

                {/* Info strip — empty studio placeholder */}
                <div className="w-full mt-4 bg-white/[0.03] rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                    <BrandLogoImg brand={brand} size={36} />
                  </div>
                  <span className="text-white/20 text-sm">→</span>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-semibold leading-none text-white/30">—</p>
                    <p className="text-white/20 text-[9px] uppercase tracking-widest mt-0.5">Studio</p>
                  </div>
                </div>

                {/* Body */}
                <p className="text-white/15 text-[10px] mt-3 leading-relaxed px-1">No recent activity</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Focus Tab helpers ──────────────────────────────────────────────

type SignalType = 'critical' | 'warning' | 'watchout' | 'success' | 'empty'

interface BrandSignal {
  type: SignalType
  title: string
  desc?: string
  cta?: string
}

// ── Brand Overview Card (Overview tab — cinematic glass layout) ─────────
function BrandOverviewCard({ brand, onClick }: { brand: Brand; onClick: () => void }) {
  const signals = deriveBrandSignals(brand)

  // Status config
  const statusConfig = (() => {
    if (brand.status === 'red') return { dot: 'bg-red-400', shadow: 'shadow-[0_0_8px_rgba(238,125,119,0.4)]', label: 'Needs Attention' }
    if (brand.status === 'yellow') return { dot: 'bg-yellow-400', shadow: 'shadow-[0_0_8px_rgba(253,192,3,0.4)]', label: 'Monitoring' }
    return { dot: 'bg-green-400', shadow: 'shadow-[0_0_8px_rgba(187,255,179,0.4)]', label: 'Healthy' }
  })()

  // Alert pills: only critical + warning signals
  const alertPills = signals.filter(s => s.type === 'critical' || s.type === 'warning').slice(0, 2)
  const isHealthy = alertPills.length === 0

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl flex flex-col justify-between min-h-[360px] p-8 bg-[#1f2020]/40 backdrop-blur-md border border-[#484848]/20 hover:bg-[#252626]/60 transition-all duration-300 relative overflow-hidden"
    >
      {/* Status badge — top right */}
      <div className="absolute top-8 right-8">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusConfig.dot} ${statusConfig.shadow}`} />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#acabaa]">
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand identity */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-white/5 p-3 flex items-center justify-center">
            <BrandLogoImg brand={brand} size={48} />
          </div>
          {/* Name + category */}
          <div>
            <h3 className="text-[#e7e5e5] text-xl font-bold leading-tight">{brand.name}</h3>
            <p className="text-[#acabaa] text-sm mt-0.5">{brand.category ?? 'Brand'}</p>
          </div>
        </div>

        {/* Alert pills — critical + warning only */}
        {isHealthy ? (
          <div className="text-[11px] text-green-400/70 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-400/5 border border-green-400/10 mb-6">
            <CheckCircle2 size={11} />
            All pillars healthy — no alerts.
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {alertPills.map((s, i) => {
              const pillClass = s.type === 'critical'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              return (
                <div key={i} className={`text-[11px] leading-relaxed px-3 py-2 rounded-lg border flex items-start gap-2 ${pillClass}`}>
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <p>{s.title}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Metrics row — always at same position (pushed to bottom of body) */}
        <div className="mt-auto flex gap-8">
          <div>
            <p className="text-[10px] text-[#acabaa] uppercase tracking-widest mb-1">Campaigns</p>
            <p className="text-[#e7e5e5] text-lg font-bold leading-none">
              {brand.activeCampaigns > 0 ? brand.activeCampaigns : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#acabaa] uppercase tracking-widest mb-1">Ad Reach</p>
            <p className="text-[#e7e5e5] text-lg font-bold leading-none">
              {brand.reach ?? '—'}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        className="mt-6 flex items-center justify-between group/btn bg-[#c6c6c7] text-[#3f4041] px-6 py-3 rounded-full font-bold text-sm w-full transition-all duration-300 hover:opacity-90"
        onClick={(e) => { e.stopPropagation(); onClick() }}
      >
        {signals[0]?.cta ?? (isHealthy ? 'View Brand' : 'Review Brand')}
        <span className="text-lg leading-none group-hover/btn:translate-x-1 transition-transform">→</span>
      </button>
    </button>
  )
}

function deriveBrandSignals(brand: Brand): BrandSignal[] {
  if (!brand.hasActivity && brand.activeCampaigns === 0) {
    return [{
      type: 'empty',
      title: 'No active campaigns',
      desc: 'Start a campaign or upload assets to see brand health here.',
    }]
  }
  const out: BrandSignal[] = []

  const studio = brand.pillars?.find(p => p.label === 'Studio')
  if (studio) {
    const pct = parseInt(studio.value) || 0
    const failPct = 100 - pct
    if (studio.status === 'inactive') {
      out.push({
        type: 'critical',
        title: 'Brand profile not set up',
        desc: 'Guardrails, tone of voice, and brand assets are missing. Upload your brand kit to enable Studio guardrails before launching any campaign.',
        cta: 'Start setup',
      })
    } else if (pct < 70) {
      out.push({
        type: 'critical',
        title: `Brand setup progress: ${pct}%`,
        desc: `${failPct}% still being finalized. The team is working to get all assets aligned before the next campaign goes live.`,
        cta: 'View progress',
      })
    } else if (pct < 95) {
      out.push({
        type: 'warning',
        title: `Brand setup progress: ${pct}%`,
        desc: `${failPct}% to go — just a few tweaks away from a complete brand setup. One review session will bring everything to standard.`,
        cta: 'Finish setup',
      })
    }
    // 100% = all good, no Studio signal needed
  }

  const research = brand.pillars?.find(p => p.label === 'Research')
  if (research) {
    const rp = research.researchProgress
    if (research.status === 'inactive') {
      out.push({
        type: 'warning',
        title: 'Research not started — 0 survey in field',
        desc: 'No consumer insights are feeding into brand strategy. Launch at least one research survey to build data-driven briefs and track campaign effectiveness.',
        cta: 'Start research',
      })
    } else if (rp && rp.total > 0) {
      const responded = Math.round((rp.responseRate / 100) * rp.total)
      const remaining = rp.total - responded
      if (rp.responseRate === 0) {
        out.push({
          type: 'critical',
          title: `${rp.total} survey sent — 0 responses after 12 days`,
          desc: 'Research is stalled. No actionable data is being collected. Consider resending, adjusting incentive, or following up with respondents.',
          cta: 'Check survey status',
        })
      } else if (rp.responseRate < 60) {
        out.push({
          type: 'warning',
          title: `Research at ${rp.responseRate}% response rate — ${remaining} surveys pending`,
          desc: 'Response rate is below target. Consider sending a gentle reminder to boost completion before the survey window closes.',
          cta: 'Check survey status',
        })
      }
      // 60%+ = on track, no signal needed
    } else if (rp && rp.total === 0) {
      out.push({
        type: 'warning',
        title: 'Research not started — 0 survey in field',
        desc: 'No consumer insights are feeding into brand strategy. Launch at least one research survey to build data-driven briefs.',
        cta: 'Start research',
      })
    }
  }

  const insights = brand.pillars?.find(p => p.label === 'Insights')
  if (insights && insights.status !== 'inactive' && insights.insights && insights.insights.length > 0) {
    const criticalPlatforms = insights.insights.filter(i => i.statusPill === 'critical')
    const warningPlatforms = insights.insights.filter(i => i.statusPill === 'warning')
    if (criticalPlatforms.length > 0) {
      const worst = criticalPlatforms[0]
      out.push({
        type: 'warning',
        title: `${worst.platform} engagement below benchmark`,
        desc: `${worst.platform} at ${worst.value} is ${criticalPlatforms.length > 1 ? `${criticalPlatforms.length} platforms below` : 'below'} industry benchmark. Review content strategy and distribution approach for this channel.`,
        cta: 'Review insights',
      })
    } else if (warningPlatforms.length > 0) {
      const worst = warningPlatforms[0]
      out.push({
        type: 'warning',
        title: `${worst.platform} at ${worst.value} — borderline performance`,
        desc: `This channel is trending toward below-benchmark if not addressed. Consider adjusting posting frequency or refreshing content format.`,
        cta: 'Review insights',
      })
    }
    // all good = no Insights signal needed
  }

  if (out.length === 0) {
    const rp = research?.researchProgress
    const surveyNote = rp && rp.total > 0 ? `, ${rp.total} surveys all responded` : ''
    out.push({
      type: 'success',
      title: 'All pillars healthy',
      desc: `Studio at 100%,${surveyNote} all platform engagement above benchmark. No action needed.`,
    })
  }

  return out
}

function classifyBrandFocus(brand: Brand): 'serious' | 'attention' | 'healthy' | 'no-data' {
  if (!brand.hasActivity && brand.activeCampaigns === 0) return 'no-data'
  const signals = deriveBrandSignals(brand)
  const criticals = signals.filter(s => s.type === 'critical').length
  const warnings = signals.filter(s => s.type === 'warning' || s.type === 'watchout').length
  if (criticals >= 2) return 'serious'
  if (criticals >= 1 || warnings >= 1) return 'attention'
  return 'healthy'
}

const FOCUS_GROUP_ORDER = ['serious', 'attention', 'healthy', 'no-data'] as const
type FocusGroup = typeof FOCUS_GROUP_ORDER[number]

function BrandSignalCard({ brand }: { brand: Brand }) {
  const signals = deriveBrandSignals(brand)

  function signalIcon(type: SignalType) {
    if (type === 'critical') return (
      <div className="w-[18px] h-[18px] rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-red-400 text-[9px] font-black leading-none">!</span>
      </div>
    )
    if (type === 'warning') return (
      <div className="w-[18px] h-[18px] rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-yellow-400 text-[9px] font-black leading-none">!</span>
      </div>
    )
    if (type === 'watchout') return (
      <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-yellow-500/50 text-base leading-none font-medium">×</span>
      </div>
    )
    if (type === 'success') return (
      <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0 mt-0.5">
        <CheckCircle2 size={14} className="text-green-400/60" />
      </div>
    )
    return (
      <div className="w-[18px] h-[18px] rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white/20 text-[11px] leading-none">—</span>
      </div>
    )
  }

  function signalWrap(type: SignalType) {
    if (type === 'critical') return 'bg-red-500/[0.07] border border-red-500/[0.20] rounded-xl p-4'
    if (type === 'warning') return 'bg-yellow-500/[0.08] border border-yellow-500/[0.18] rounded-xl p-4'
    return 'bg-white/[0.02] border border-white/[0.06] rounded-xl p-4'
  }

  function ctaColor(type: SignalType) {
    if (type === 'critical') return 'text-red-400/80 hover:text-red-400'
    if (type === 'warning') return 'text-yellow-400/80 hover:text-yellow-400'
    return 'text-white/30 hover:text-white/50'
  }

  function titleColor(type: SignalType) {
    return type === 'success' || type === 'empty' || type === 'watchout' ? 'text-white/60' : 'text-white/80'
  }

  const weeklyText = (() => {
    if (!brand.weeklyOutput) return null
    const m = brand.weeklyOutput.match(/(\d+)\s*assets? created/)
    const k = brand.weeklyOutput.match(/(\d+)\s*KV generated/)
    const n = (m ? parseInt(m[1]) : 0) + (k ? parseInt(k[1]) : 0)
    return n > 0 ? `${n} assets generated this week` : null
  })()

  return (
    <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
      {/* Brand header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.07] border border-white/[0.08] flex items-center justify-center shrink-0">
            <span className="text-white/50 text-[11px] font-semibold">{brand.name.charAt(0)}</span>
          </div>
          <span className="text-white/80 text-sm font-semibold">{brand.name}</span>
        </div>
        <button className="text-white/25 text-[11px] hover:text-white/50 transition-colors flex items-center gap-1">
          Edit brand <ExternalLink size={10} />
        </button>
      </div>

      {/* Signal items */}
      <div className="px-4 pb-4 space-y-2">
        {signals.map((s, i) => (
          <div key={i} className={signalWrap(s.type)}>
            <div className="flex items-start gap-3">
              {signalIcon(s.type)}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold leading-snug mb-0.5 ${titleColor(s.type)}`}>{s.title}</p>
                <p className="text-[11px] text-white/35 leading-relaxed">{s.desc}</p>
                {s.cta && (
                  <button className={`mt-2 text-[11px] font-medium transition-colors ${ctaColor(s.type)}`}>
                    {s.cta} →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {weeklyText && (
        <div className="px-5 py-3 border-t border-white/[0.05]">
          <span className="text-white/25 text-[11px]">{weeklyText}</span>
        </div>
      )}
    </div>
  )
}

// ── Focus Tab ──────────────────────────────────────────────────────
function FocusTab({
  brands,
  selectedBrand,
  highlightGroup,
}: {
  brands: Brand[]
  selectedBrand: Brand | null
  onOpenCmdK: () => void
  highlightGroup?: string | null
}) {
  // Demo preview mode: show 1 representative brand for that group
  if (highlightGroup != null) {
    const grouped = FOCUS_GROUP_ORDER.reduce<Record<FocusGroup, Brand[]>>(
      (acc, key) => { acc[key] = brands.filter(b => classifyBrandFocus(b) === key); return acc },
      { serious: [], attention: [], healthy: [], 'no-data': [] }
    )
    const previewBrand = grouped[highlightGroup as FocusGroup]?.[0]
    if (!previewBrand) return null
    return <BrandSignalCard brand={previewBrand} />
  }

  // Normal mode: show only the selected brand
  if (!selectedBrand) {
    return (
      <div className="border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <Layers size={16} className="text-white/25" />
        </div>
        <p className="text-white/50 text-sm font-medium">No brand selected.</p>
        <p className="text-white/25 text-[11px] mt-1">Select a brand to see its overview.</p>
      </div>
    )
  }

  return <BrandSignalCard brand={selectedBrand} />
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

// ── Home Accordion ─────────────────────────────────────────────────
function HomeAccordion({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

function AccordionItem({
  title,
  icon,
  badge,
  dateLabel,
  action,
  defaultOpen = false,
  variant = 'primary',
  children,
}: {
  title: string
  icon: React.ReactNode
  badge?: string
  dateLabel?: string
  action?: React.ReactNode
  defaultOpen?: boolean
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  const isPrimary = variant === 'primary'
  const headerPy = isPrimary ? 'py-4 px-6' : 'py-3 px-6'
  const titleSize = isPrimary ? 'text-lg' : 'text-base'
  const titleColor = isPrimary ? 'text-white' : 'text-white/75'

  return (
    <div className={`border border-white/5 ${isPrimary ? 'rounded-xl bg-[#1c1c1c]' : 'rounded-lg bg-[#1c1c1c]/30'}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between ${headerPy} rounded-xl ${isPrimary ? '' : 'hover:bg-white/[0.03]'} transition-colors`}
      >
        <div className="flex items-center gap-4">
          <span className={isPrimary ? 'text-white/40' : 'text-white/50'}>{icon}</span>
          <h2 className={`font-headline font-bold ${titleSize} ${titleColor} tracking-tight`}>{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          {action && (
            <div onClick={(e) => e.stopPropagation()}>
              {action}
            </div>
          )}
          {dateLabel && (
            <span className="text-[10px] text-white/35 uppercase tracking-widest font-label">{dateLabel}</span>
          )}
          {badge && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-tighter font-medium ${
              badge === 'LIVE'
                ? 'border border-white/20 text-white/60'
                : 'bg-white/10 text-white/30'
            }`}>{badge}</span>
          )}
          <ChevronDown
            size={18}
            className={`text-white/30 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {open && (
        <div className={`p-6 border-t border-white/5 rounded-b-xl ${isPrimary ? 'bg-[#1c1c1c]/50' : 'bg-[#1c1c1c]/20'}`}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── Your Tools Strip ────────────────────────────────────────────────
function YourToolsStrip({ tools }: { tools: YourTool[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {tools.map((tool) => {
        const isLive = tool.status === 'live'
        return (
          <button
            key={tool.id}
            className={`group text-left p-6 rounded-lg border border-transparent transition-all duration-300 cursor-pointer shadow-sm ${
              isLive
                ? 'bg-[#1c1c1c] hover:border-white/20'
                : 'bg-[#1c1c1c]/40 opacity-70 hover:opacity-100 hover:border-white/10'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${
              isLive
                ? 'bg-[#2a2a2a] text-white group-hover:bg-white group-hover:text-black transition-colors'
                : 'bg-[#2a2a2a]/50 text-white/40'
            }`}>
              {tool.icon}
            </div>
            <h3 className={`font-bold text-white text-sm mb-2 leading-tight`}>
              {tool.name}
            </h3>
            <p className={`text-xs leading-relaxed ${isLive ? 'text-neutral-500' : 'text-neutral-600'}`}>
              {tool.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}



// ── For You Section (9.K) ───────────────────────────────────────
// function ForYouSection({ data }: { data: ForYouData }) {
//   return (
//     <div className="mb-6">
//       {/* Section label */}
//       <div className="flex items-center justify-between mb-4">
//         <span className="text-white/25 text-[11px] uppercase tracking-widest font-medium">For You</span>
//       </div>

//       <div className="space-y-4">
//         {/* Daily Focus */}
//         <div className={`border rounded-2xl p-4 flex items-start gap-4 ${
//           data.dailyFocus.type === 'urgent'
//             ? 'border-red-500/20 bg-red-500/5'
//             : data.dailyFocus.type === 'caught-up'
//             ? 'border-green-500/20 bg-green-500/5'
//             : 'border-white/[0.08] bg-white/[0.02]'
//         }`}>
//           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
//             data.dailyFocus.type === 'urgent'
//               ? 'bg-red-500/20'
//               : data.dailyFocus.type === 'caught-up'
//               ? 'bg-green-500/20'
//               : 'bg-white/5'
//           }`}>
//             {data.dailyFocus.type === 'urgent' ? (
//               <AlertTriangle size={13} className="text-red-400" />
//             ) : data.dailyFocus.type === 'caught-up' ? (
//               <CheckCircle2 size={13} className="text-green-400" />
//             ) : (
//               <Sparkles size={13} className="text-white/40" />
//             )}
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-white/80 text-xs font-medium leading-relaxed">{data.dailyFocus.message}</p>
//             <div className="flex items-center gap-2 mt-1.5">
//               {data.dailyFocus.type === 'urgent' && (
//                 <span className="text-[10px] text-red-400/70 font-medium">Needs attention</span>
//               )}
//               {data.dailyFocus.type === 'caught-up' && (
//                 <span className="text-[10px] text-green-400/70 font-medium">All caught up</span>
//               )}
//               {data.dailyFocus.type === 'normal' && (
//                 <span className="text-[10px] text-white/30 font-medium">Daily focus</span>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Announcements — blog-card style */}
//         {data.announcements.length > 0 && (
//           <div className="border border-white/[0.06] rounded-2xl overflow-hidden">
//             <div className="px-4 py-3 border-b border-white/[0.06]">
//               <span className="text-white/70 text-xs font-semibold">What's New</span>
//             </div>
//             {data.announcements.map((ann, i) => (
//               <div
//                 key={ann.id}
//                 className={`px-4 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors group ${
//                   i < data.announcements.length - 1 ? 'border-b border-white/[0.04]' : ''
//                 }`}
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex-1 min-w-0">
//                     {ann.badge && (
//                       <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded mb-1.5 ${
//                         ann.badge === 'New'
//                           ? 'bg-blue-500/20 text-blue-400'
//                           : ann.badge === 'Breaking'
//                           ? 'bg-red-500/20 text-red-400'
//                           : 'bg-white/10 text-white/40'
//                       }`}>
//                         {ann.badge}
//                       </span>
//                     )}
//                     <p className="text-white/75 text-xs font-medium leading-snug group-hover:text-white/90 transition-colors">
//                       {ann.title}
//                     </p>
//                     <p className="text-white/30 text-[10px] mt-1 leading-relaxed line-clamp-2">
//                       {ann.description}
//                     </p>
//                     <div className="flex items-center gap-2 mt-2">
//                       <span className="text-[10px] text-white/20">{ann.date}</span>
//                       {ann.readTime && (
//                         <>
//                           <span className="text-white/10 text-[10px]">·</span>
//                           <span className="text-[10px] text-white/20">{ann.readTime}</span>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                   <ChevronRight size={12} className="text-white/20 shrink-0 mt-1 group-hover:text-white/50 transition-colors" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* This Week at a Glance */}
//         <div className="border border-white/[0.06] rounded-2xl p-4">
//           <p className="text-white/25 text-[11px] uppercase tracking-widest font-medium mb-3">This Week at a Glance</p>
//           <div className="flex items-center gap-6">
//             <div className="flex items-center gap-2">
//               <span className="text-white/80 text-xl font-bold">{data.weeklySummary.assetsCreated}</span>
//               <span className="text-white/30 text-xs">assets created</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-white/80 text-xl font-bold">{data.weeklySummary.brands}</span>
//               <span className="text-white/30 text-xs">brands</span>
//             </div>
//           </div>
//           <p className="text-white/20 text-[10px] mt-3">Across your workspace this week</p>
//         </div>
//       </div>
//     </div>
//   )
// }

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
                className={`flex gap-2 py-2 border-b border-white/[0.04] last:border-0 ${isPast ? 'opacity-40' : ''}`}
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
function RecentWorkModal({ items, pinned, onTogglePin, onClose, showBrand }: {
  items: RecentItem[]
  pinned: Record<string, boolean>
  onTogglePin: (id: string) => void
  onClose: () => void
  showBrand?: boolean
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
                  <p className="text-white/25 text-[10px] mt-0.5">
                    {showBrand && item.brandName ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-white/40">{item.brandName}</span>
                        <span className="text-white/15">·</span>
                        <span>{item.tool}</span>
                        <span className="text-white/15">·</span>
                        <span>{item.timeAgo}</span>
                      </span>
                    ) : (
                      <span>{item.tool} · {item.timeAgo}</span>
                    )}
                  </p>
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

// ── Daily Overview (Focus tab) ─────────────────────────────────────
function DailyOverview({ meetings, calendarAuthorized = true }: { meetings: Meeting[]; calendarAuthorized?: boolean }) {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()

  const announcements = [
    {
      title: 'Brand Kit 3.0 is live',
      desc: 'New templates, icons & color palettes available now.',
      time: '2d ago',
    },
    {
      title: 'Survey feature beta',
      desc: 'Try the new AI-powered survey builder in Studio.',
      time: '4d ago',
    },
    {
      title: 'Onboarding guide',
      desc: 'New 5-step workflow for first-time users.',
      time: '1w ago',
    },
  ]

  return (
    <div>

      {/* 12-col grid: 8-col timeline + 4-col announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left: Schedule Timeline ── */}
         {/* Date label */}
        <div className="lg:col-span-7 relative">
          <div className="flex items-center justify-end mb-6 pr-4">
        <span className="text-[15px] text-white/35 uppercase tracking-widest font-label">{today}</span>
      </div>
          {!calendarAuthorized ? (
            /* Unauthorized state */
            <div className="border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center text-center gap-3">
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
          ) : (
            /* Meetings timeline */
            <div className="relative pl-12 md:pl-24">
              {/* Vertical line */}
              <div className="absolute left-[4.5rem] md:left-[8.6rem] top-0 bottom-0 w-[1px] border border-white/10" />
              {meetings.map((meeting) => {
                const isPast = meeting.status === 'past'
                const isActive = meeting.status === 'active'
                const isExternal = meeting.isExternal
                const isFocus = meeting.category === 'FOCUS'

                const dotColor = isActive
                  ? 'bg-white ring-2 ring-[#1c1c1c]'
                  : isPast
                  ? 'bg-neutral-600 ring-2 ring-[#1c1c1c]'
                  : 'bg-neutral-500 ring-2 ring-[#1c1c1c]'

                const cardBg = isActive ? 'bg-[#1c1c1c]' : 'bg-[#1c1c1c]/60'

                return (
                  <div key={meeting.id} className="relative mb-8">
                    {/* Time label */}
                    <div className="absolute -left-12 md:-left-24 w-12 md:w-20 pt-1 text-right">
                      <span className="text-xs font-bold text-white">{meeting.time}</span>
                    </div>

                    {/* Dot */}
                    <div className={`absolute left-[4.1rem] md:left-[2.4rem] top-2 w-2 h-2 rounded-full ${dotColor}`} />

                    {/* Card */}
                    <div className={`ml-12 md:ml-20 p-4 rounded-lg border border-white/5 ${cardBg} hover:bg-[#2a2a2a] transition-all cursor-pointer group relative overflow-hidden`}>
                      {/* Focus glow */}
                      {isFocus && (
                        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                      )}

                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2">
                          {meeting.category && (
                            <span className={`text-[9px] uppercase tracking-widest font-bold ${isFocus ? 'bg-white text-black px-2 py-0.5 rounded-full' : 'text-white/35'}`}>
                              {meeting.category}
                            </span>
                          )}
                          {isExternal && (
                            <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase tracking-widest font-bold">
                              External
                            </span>
                          )}
                        </div>
                        {meeting.status === 'active' && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black uppercase tracking-widest">
                            Live
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white">{meeting.title}</h3>

                      {meeting.description && (
                        <p className="text-[11px] text-white/40 mt-1 leading-relaxed max-w-md">{meeting.description}</p>
                      )}

                      {/* Attendees avatars */}
                      {meeting.attendeeAvatars && meeting.attendeeAvatars.length > 0 && (
                        <div className="flex -space-x-2 mt-3">
                          {meeting.attendeeAvatars.map((avatar, i) => (
                            <img key={i} src={avatar} alt="" className="w-6 h-6 rounded-full border-2 border-[#1c1c1c]" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Right: Announcements ── */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <p className="text-[16px] text-white/50 uppercase tracking-widest font-medium mb-1">Updates &amp; Announcements</p>
          {announcements.map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-[#1c1c1c]/60 border border-white/5 hover:bg-[#1c1c1c] transition-colors cursor-pointer group">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
                <span className="shrink-0 text-[9px] text-white/25 mt-0.5">{item.time}</span>
              </div>
              <p className="text-[10px] text-white/35 leading-relaxed">{item.desc}</p>
            </div>
          ))}
          <button className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors mt-1 group">
            <Megaphone size={12} />
            <span>View Archive</span>
            <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Schedule Chips (compact, State A) ────────────────────────────
function ScheduleChips({ meetings }: { meetings: Meeting[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {meetings.map((meeting) => {
        const isPast = meeting.status === 'past'
        const isActive = meeting.status === 'active'
        return (
          <div
            key={meeting.id}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg border text-xs ${
              isActive
                ? 'bg-[#2a2a2a] border-white/20 text-white'
                : isPast
                ? 'bg-[#1c1c1c] border-white/5 text-white/30'
                : 'bg-[#1c1c1c] border-white/5 text-white/60'
            }`}
          >
            <span className={`font-bold ${isPast ? 'text-white/30' : 'text-white'}`}>{meeting.time}</span>
            {isPast ? (
              <span className="italic text-white/30">{meeting.title}</span>
            ) : (
              <span className="font-medium">{meeting.title}</span>
            )}
            {isActive && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[8px] font-bold uppercase tracking-widest">Live</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Recent Work Gallery (Focus tab) ───────────────────────────────
function RecentWorkGallery() {
  const cards = [
    {
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5g6jB7F-Y1CVh7zY8iYyc-dP7JBJZOKkr7vMWD7DykzBiHKQAIK8_q-Ws_dNJvXpCcXtZK6QKN2GttATm3Q62Q0s0uv9SEY0wokbv0yKhGafWkeX04mgpYVrnPwNSGOe_z0vHcvpgoDOOeAvjK4iKwAUSBUkfCDaRTpF68JAcS6JyY3h7PiyHIHeXt_KeLLHIjhQbNfYCgXcP_HepO1sqOO07g8-wSUexn6O-HbJU8soO_lkfwKfzlgdVsbhvndXrRZHMrLZzDlGS',
      status: 'In Progress',
      statusColor: 'text-white border-white/20 bg-black/70',
      title: 'Lumina Landing Page',
      toolLabel: 'Creative Brief',
      timeAgo: '2h ago',
    },
    {
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiEEM_AoSFHE--y3pKAfvPW1rSm1gCq0T0ZD9NcWO02sPdX8ztvhh_nyPw_ZdRmfRLtqIsU8a6-lJKeEBTyNuVx_XxnZA0MJ9AmJxfg1cMHSAwo7iVR_YlWUWIVWH_T-64nYXAG8IJ1YpOvY27A-MzX2Lw175y37IZ9m7PGkyu5fJzNTBYL72foAlFQ91aWFwRSNdSzHGp8g3LmHgcqfvpVybyQEk1Y5DuHdYzgHpWXc1WDc-sKALPM-pSBKkBU6S-n8iROVPSRjKF',
      status: 'Draft',
      statusColor: 'text-neutral-300 border-white/20 bg-black/70',
      title: 'Monolith Brand Book',
      toolLabel: 'KV Generator',
      timeAgo: '1d ago',
    },
    {
      imageUrl: null,
      status: 'Ready',
      statusColor: 'text-emerald-400 border-emerald-500/20 bg-black/70',
      title: 'Aetherial Form Study 01',
      toolLabel: 'Image Editor',
      timeAgo: '3d ago',
    },
    {
      imageUrl: null,
      status: 'Review',
      statusColor: 'text-amber-400 border-amber-500/20 bg-black/70',
      title: 'Glass UI Component',
      toolLabel: 'Survey',
      timeAgo: '1w ago',
    },
  ]

  const [primary, ...secondary] = cards

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Large primary card — col-span-8 */}
      {primary && (
        <div className="col-span-12 lg:col-span-8 group relative rounded-xl overflow-hidden cursor-pointer">
          {/* Full-bleed image */}
          {primary.imageUrl ? (
            <img
              src={primary.imageUrl}
              alt={primary.title}
              className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-64 bg-neutral-900 flex items-center justify-center">
              <span className="text-neutral-700 text-8xl group-hover:text-white/20 transition-colors">◐</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          {/* Status badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded backdrop-blur-md text-[9px] font-bold uppercase tracking-widest border ${primary.statusColor}`}>
              {primary.status}
            </span>
          </div>
          {/* Title + subtitle */}
          <div className="absolute bottom-4 left-4 right-4">
            <h4 className="text-lg font-bold text-white mb-0.5">{primary.title}</h4>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-white/50 uppercase tracking-widest">{primary.toolLabel}</p>
              <span className="text-white/30 text-[9px]">·</span>
              <p className="text-[10px] text-white/40">{primary.timeAgo}</p>
            </div>
          </div>
        </div>
      )}

      {/* Secondary cards — col-span-4, stacked */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        {secondary.map((card, i) => (
          <div key={i} className="group relative rounded-xl overflow-hidden cursor-pointer flex-1">
            {/* Full-bleed image */}
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-28 object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
            ) : (
              <div className="w-full h-28 bg-neutral-900 flex items-center justify-center">
                <span className="text-neutral-700 text-5xl group-hover:text-white/20 transition-colors">{i === 0 ? '◐' : '⊞'}</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            {/* Status badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-0.5 rounded backdrop-blur-md text-[8px] font-bold uppercase tracking-widest border ${card.statusColor}`}>
                {card.status}
              </span>
            </div>
            {/* Title + subtitle */}
            <div className="absolute bottom-3 left-3 right-3">
              <h4 className="text-sm font-bold text-white mb-0.5 leading-tight">{card.title}</h4>
              <div className="flex items-center gap-1.5">
                <p className="text-[9px] text-white/50 uppercase tracking-widest">{card.toolLabel}</p>
                <span className="text-white/30 text-[8px]">·</span>
                <p className="text-[9px] text-white/40">{card.timeAgo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Recent Work ─────────────────────────────────────────────────────
function RecentWork({ items, empty, onStartTask, showBrand }: { items: RecentItem[]; empty?: boolean; onStartTask?: () => void; showBrand?: boolean }) {
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
              showBrand={showBrand}
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
                  <p className="text-white/25 text-[10px] mt-0.5">
                    {showBrand && item.brandName ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-white/40">{item.brandName}</span>
                        <span className="text-white/15">·</span>
                        <span>{item.tool}</span>
                        <span className="text-white/15">·</span>
                        <span>{item.timeAgo}</span>
                      </span>
                    ) : (
                      <span>{item.tool} · {item.timeAgo}</span>
                    )}
                  </p>
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

            {filtered.length === 0 && query.trim().split(' ').length < 3 && (
              <p className="px-4 py-3 text-[11px] text-white/25">No results — try a module name or ask a question</p>
            )}

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
  stepKey,
  stepIndex,
  totalSteps,
  title,
  desc,
  tabHint,
  onPrev,
  onNext,
  onClose,
}: {
  stepKey: DemoStep
  stepIndex: number
  totalSteps: number
  title: string
  desc: string
  tabHint: string
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}) {
  const stateLetter = stepKey.charAt(0) as 'A' | 'B' | 'C'
  const stateColor: Record<'A' | 'B' | 'C', string> = {
    A: 'bg-white/10 text-white/60',
    B: 'bg-yellow-500/15 text-yellow-400/80',
    C: 'bg-green-500/15 text-green-400/80',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-[#111] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Sparkles size={11} className="text-white/40" />
          <span className="text-[10px] font-medium text-white/35 uppercase tracking-widest">Interactive Demo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20 font-mono">{stepIndex + 1}/{totalSteps}</span>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Step badge row */}
      <div className="px-4 pt-3 pb-0">
        <div className="flex items-center gap-1.5 mb-3">
          {(['A', 'B', 'C'] as const).map((s) => (
            <div
              key={s}
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-colors ${stateLetter === s ? stateColor[s] : 'bg-white/5 text-white/20'}`}
            >
              {s}
            </div>
          ))}
          <span className="text-white/15 text-[9px] ml-1">· {tabHint}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-white/80 text-sm font-semibold mb-2 leading-snug">{title}</p>
        <p className="text-white/40 text-[11px] leading-relaxed">{desc}</p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1 px-4 pb-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors ${i <= stepIndex ? 'bg-white/40' : 'bg-white/10'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onPrev}
          disabled={stepIndex === 0}
          className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={12} className="rotate-180" /> Prev
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-black text-[11px] font-semibold rounded-xl hover:bg-white/90 transition-colors"
        >
          {stepIndex === totalSteps - 1 ? 'Done' : 'Next'} <ChevronRight size={11} />
        </button>
      </div>
    </div>
  )
}

// ── Main Home Page ──────────────────────────────────────────────────
export default function HomePage() {
  const [demoStep, setDemoStep] = useState<DemoStep>('A1')
  const [showDemo, setShowDemo] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length

  const allBrands = [...MOCK_BRANDS, MOCK_BRAND_ZERO_DATA]

  // ── Flat step flags ───────────────────────────────────────────────
  const isA1 = demoStep === 'A1'
  const isA2 = demoStep === 'A2'
  const isB1 = demoStep === 'B1'
  const isB2 = demoStep === 'B2'
  const isC  = demoStep.startsWith('C')
  const isC6 = demoStep === 'C6'

  // ── Effective tab ─────────────────────────────────────────────────
  // State A: no tabs — brand sections hidden, show pure playground layout
  // State B/C: tabs visible, tab selection controlled by effectiveTab
  const [effectiveTab, setEffectiveTab] = useState<HomeTab>('overview')
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)

  useEffect(() => {
    if (isB1) setEffectiveTab('overview')
    else setEffectiveTab('focus')
    setSelectedBrand(null)
  }, [demoStep])

  // ── Brand + section visibility per step ───────────────────────────
  // focusBrand: user selection takes priority; fallback to demo brand for that step
  const demoDefaultBrand: Brand | null =
    isA1 || isA2 ? null :
    isB1 || isB2 ? MOCK_BRAND_ZERO_DATA :
    MOCK_BRANDS[0]

  const focusBrand: Brand | null = selectedBrand ?? demoDefaultBrand

  // overviewBrands: brands shown in Overview grid
  // A1/A2: empty grid (no tabs in playground)
  // B1: only zero-data brand card via OverviewTab zeroDataBrands prop
  // B2/C: all active brands
  const overviewBrands: Brand[] =
    isA1 || isA2 ? [] :
    isB1 ? [] :
    MOCK_BRANDS


  // Calendar
  const calendarState: ScheduleState =
    (isA1 || isA2) ? 'unauthorized' :
    isB1 ? 'unauthorized' :
    isB2 ? 'has-meetings' :
    'has-meetings'

  const meetings = isB2 || isC ? MOCK_MEETINGS_ACTIVE : MOCK_MEETINGS

  // Section visibility
  // Signal: only when brand has real data (C steps)
  const showSignal = isC
  // Trending + Your Tools: always shown — Trending is a blog feature, not brand-bound
  const showTools = true
  // Schedule: always shown — Lark calendar is a global feature, not brand-bound
  const showSchedule = true

  // RecentWork items per step
  const recentWorkItems = isA1 ? [] : isA2 ? MOCK_RECENT_PLAYGROUND : isB2 ? MOCK_RECENT_B : MOCK_RECENT

  // Cmd+K
  const isCmdFocused = cmdOpen || isC6
  const cmdInitialQuery = isC6 ? 'stu' : ''

  useEffect(() => {
    if (isC6) setCmdOpen(true)
    else setCmdOpen(false)
  }, [isC6])

  // Brand signal variation (C steps only)
  const brandSignalMap: Record<DemoStep, string | null> = {
    A1: null, A2: null,
    B1: null, B2: null,
    C1: null,
    C2: 'serious',
    C3: 'attention',
    C4: 'healthy',
    C5: 'no-data',
    C6: null,
  }
  const demoGroup = showDemo ? brandSignalMap[demoStep] : null

  // ── Navigation ────────────────────────────────────────────────────
  const TOTAL_STEPS = DEMO_STEP_ORDER.length
  const currentStepIndex = DEMO_STEP_ORDER.indexOf(demoStep)
  const currentConfig = DEMO_STEPS_CONFIG[demoStep]

  const handleDemoNext = () => {
    const idx = DEMO_STEP_ORDER.indexOf(demoStep)
    if (idx < DEMO_STEP_ORDER.length - 1) setDemoStep(DEMO_STEP_ORDER[idx + 1])
    else setShowDemo(false)
  }

  const handleDemoPrev = () => {
    const idx = DEMO_STEP_ORDER.indexOf(demoStep)
    if (idx > 0) setDemoStep(DEMO_STEP_ORDER[idx - 1])
  }

  const handleBrandSelect = (brand: Brand | null) => {
    setSelectedBrand(brand)
    if (brand !== null) setEffectiveTab('focus')
  }

  const showTabs = !isA1 && !isA2 // State A has no Overview/Focus tabs

  return (
    <div className="min-h-screen bg-[#161616] relative">
      {/* Cmd+K dim overlay */}
      {isCmdFocused && (
        <div className="fixed inset-0 bg-black/70 z-40 transition-opacity" onClick={() => { setCmdOpen(false); if (isC6) setDemoStep('C1') }} />
      )}

      {/* Cmd+K overlay */}
      <CmdKOverlay
        open={isCmdFocused}
        initialQuery={cmdInitialQuery}
        onClose={() => { setCmdOpen(false); if (isC6) setDemoStep('C1') }}
      />

      {/* Notification drawer */}
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Interactive demo */}
      {showDemo && (
        <DemoOverlay
          stepKey={demoStep}
          stepIndex={currentStepIndex}
          totalSteps={TOTAL_STEPS}
          title={currentConfig.title}
          desc={currentConfig.desc}
          tabHint={currentConfig.tabHint}
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
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
              AM
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-8 py-6">

          {/* Brand Selector — always visible */}
          <div className="mb-4">
            <BrandSelector
              brands={allBrands}
              selected={focusBrand}
              onSelect={handleBrandSelect}
            />
          </div>

          {/* Cmd+K search bar */}
          <button
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center gap-3 border border-white/[0.09] rounded-2xl px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all mb-5 cursor-text group"
          >
            <Search size={15} className="text-white/25 shrink-0" />
            <span className="flex-1 text-left text-white/25 text-sm">Ask frndOS or type a command...</span>
            <kbd className="px-2 py-0.5 rounded bg-white/[0.06] text-white/20 text-[11px] font-mono group-hover:bg-white/[0.09] transition-colors">
              ⌘ K
            </kbd>
          </button>

          {/* Tab Toggle — hidden in State A */}
          {showTabs && (
            <div className="mb-5">
              <TabToggle
                activeTab={effectiveTab}
                onTabChange={setEffectiveTab}
                selectedBrand={focusBrand}
                onBrandSelect={handleBrandSelect}
                brands={allBrands}
              />
            </div>
          )}

          {/* ── STATE A: Playground (no tabs) ── */}
          {(isA1 || isA2) && (
            <HomeAccordion>
              {/* Your Tools — primary, expanded */}
              {showTools && (
                <AccordionItem
                  title="Your Tools"
                  icon={<Construction size={20} />}
                  variant="primary"
                  defaultOpen={true}
                  action={
                    <span className="flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors cursor-pointer">
                      <span>View Library</span>
                      <ArrowRight size={14} />
                    </span>
                  }
                >
                  <YourToolsStrip tools={MOCK_YOUR_TOOLS} />
                </AccordionItem>
              )}
              {/* Daily Overview */}
              {showSchedule && (
                <AccordionItem
                  title="Daily Overview"
                  icon={<LayoutDashboard size={18} />}
                  variant="primary"
                  defaultOpen={true}
                >
                  <DailyOverview meetings={meetings} calendarAuthorized={!(isA1 || isA2)} />
                </AccordionItem>
              )}
              {/* Recent Work */}
              <AccordionItem
                title="Recent Work"
                icon={<FolderOpen size={18} />}
                variant="primary"
                defaultOpen={false}
              >
                <RecentWork
                  items={recentWorkItems}
                  empty={isA1}
                  showBrand={!isA1}
                  onStartTask={() => setCmdOpen(true)}
                />
              </AccordionItem>
            </HomeAccordion>
          )}

          {/* ── STATE B / C: Brand Tabs ── */}
          {(isB1 || isB2 || isC) && (
            <>
              {/* Overview tab */}
              {effectiveTab === 'overview' && (
                <div className="mb-8">
                  <OverviewTab
                    brands={overviewBrands}
                    zeroDataBrands={isB1 ? [MOCK_BRAND_ZERO_DATA] : undefined}
                    overviewMode={isC ? 'detailed' : 'compact'}
                    onSelectBrand={handleBrandSelect}
                  />
                </div>
              )}

              {/* Focus tab */}
              {effectiveTab === 'focus' && (
                <>
                  {/* Focus Card */}
                  <div className="mb-5">
                    <FocusTab
                      brands={allBrands}
                      selectedBrand={focusBrand}
                      onOpenCmdK={() => setCmdOpen(true)}
                      highlightGroup={demoGroup}
                    />
                  </div>

                  {/* Today's Signal */}
                  {showSignal && <TodaySignalCard signal={MOCK_SIGNAL} />}

                  <HomeAccordion>
                    {/* Your Tools — primary, collapsed by default */}
                    {showTools && (
                      <AccordionItem
                        title="Your Tools"
                        icon={<Construction size={20} />}
                        variant="primary"
                        defaultOpen={false}
                        action={
                          <span className="flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors cursor-pointer">
                            <span>View Library</span>
                            <ArrowRight size={14} />
                          </span>
                        }
                      >
                        <YourToolsStrip tools={MOCK_YOUR_TOOLS} />
                      </AccordionItem>
                    )}

                    {/* Daily Overview — primary, expanded */}
                    <AccordionItem
                      title="Daily Overview"
                      icon={<LayoutDashboard size={18} />}
                      variant="primary"
                      defaultOpen={true}
                    >
                      <DailyOverview meetings={meetings} />
                    </AccordionItem>

                    {/* Recent Work — primary, collapsed */}
                    <AccordionItem
                      title="Recent Work"
                      icon={<FolderOpen size={18} />}
                      variant="primary"
                      defaultOpen={false}
                    >
                      <RecentWorkGallery />
                    </AccordionItem>
                  </HomeAccordion>
                </>
              )}
            </>
          )}

          {/* Bottom nav */}
          <nav className={`fixed bottom-0 left-0 right-0 border-t border-white/[0.06] bg-[#0D0D0D] transition-all duration-300 ${isCmdFocused ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center h-12 px-6">
              <button className="text-white/30 text-xs hover:text-white/60 transition-colors shrink-0">
                Home
              </button>
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
              <button
                onClick={() => setCmdOpen(true)}
                className="flex items-center gap-2 shrink-0 text-white/60 hover:text-white/90 transition-colors"
              >
                <Sparkles size={13} className="text-[#60a5fa]" />
                <span className="text-xs font-medium">Chat</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07] text-white/20 text-[10px] font-mono">⌘ K</kbd>
              </button>
            </div>
          </nav>

          <div className="h-16" />
        </div>{/* end transition-opacity */}
      </div>
    </div>
  )
}

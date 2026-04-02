import { Link } from 'react-router-dom'
import { Home, Layers } from 'lucide-react'
import { wireframeRegistry, type WireframeEntry, type WireframeIconKey } from '@/data/wireframeRegistry'
import { getPrdRecord } from '@/lib/prdCatalog'

const ICON_MAP: Record<WireframeIconKey, typeof Home> = {
  home: Home,
  layers: Layers,
}

export default function DashboardPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#161616', color: '#fff', padding: '48px 40px' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>frndOS Wireframes</h1>
          <p style={{ color: '#666', margin: 0, fontSize: 14 }}>
            {wireframeRegistry.length} pages linked to repo-based PRDs and ownership metadata
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {wireframeRegistry.map((wireframe) => (
            <WireframeCard key={wireframe.id} wireframe={wireframe} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WireframeCard({ wireframe }: { wireframe: WireframeEntry }) {
  const Icon = ICON_MAP[wireframe.icon]
  const prd = getPrdRecord(wireframe.prdPath)
  const requirementCount = prd?.requirements.length ?? 0

  return (
    <Link to={wireframe.route} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: '#1e1e1e',
          border: '1px solid #2a2a2a',
          borderRadius: 16,
          padding: '24px',
          cursor: 'pointer',
          transition: 'border-color 0.15s, transform 0.15s',
          minHeight: 278,
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.borderColor = '#444'
          event.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.borderColor = '#2a2a2a'
          event.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ background: '#2a2a2a', borderRadius: 10, padding: 10, display: 'flex' }}>
            <Icon size={20} color="#888" />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: wireframe.status === 'done' ? '#22c55e' : '#facc15',
              background: wireframe.status === 'done' ? 'rgba(34,197,94,0.1)' : 'rgba(250,204,21,0.1)',
              padding: '4px 9px',
              borderRadius: 20,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {wireframe.status}
          </span>
        </div>

        <div style={{ fontSize: 11, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {wireframe.module}
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{wireframe.title}</div>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.55, marginBottom: 16 }}>{wireframe.description}</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <Pill label={`Owner: ${wireframe.owner}`} />
          <Pill label={prd ? 'Linked PRD' : 'Missing PRD'} tone={prd ? 'green' : 'amber'} />
          <Pill label={`${requirementCount} requirements`} />
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Product source
          </div>
          <div style={{ fontSize: 13, color: '#ddd', marginBottom: 6 }}>
            {prd?.title ?? 'Attach a markdown PRD to this wireframe'}
          </div>
          <div style={{ fontSize: 12, color: '#5f5f5f', lineHeight: 1.5 }}>
            {wireframe.prdPath ?? 'No file linked yet'}
          </div>
        </div>
      </div>
    </Link>
  )
}

function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'green' | 'amber' }) {
  const colorMap = {
    neutral: { color: '#A3A3A3', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' },
    green: { color: '#86efac', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.16)' },
    amber: { color: '#fde68a', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.16)' },
  } as const

  const style = colorMap[tone]

  return (
    <span
      style={{
        fontSize: 11,
        color: style.color,
        background: style.background,
        border: style.border,
        padding: '5px 9px',
        borderRadius: 999,
      }}
    >
      {label}
    </span>
  )
}

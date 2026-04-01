import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const wireframes = [
  {
    slug: 'home',
    title: 'Home',
    description: 'frndOS main home page with tools, signals, and recent activity',
    icon: Home,
    module: 'Core',
    status: 'done',
  },
]

export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', background: '#161616', color: '#fff', padding: '48px 40px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>frndOS Wireframes</h1>
          <p style={{ color: '#888', margin: 0, fontSize: 15 }}>
            {wireframes.length} wireframe{wireframes.length !== 1 ? 's' : ''} · Click to preview
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {wireframes.map((wf) => {
            const Icon = wf.icon
            return (
              <Link
                key={wf.slug}
                to={`/home/${wf.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: '#1e1e1e',
                    border: '1px solid #2a2a2a',
                    borderRadius: 12,
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#444')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ background: '#2a2a2a', borderRadius: 8, padding: 10, display: 'flex' }}>
                      <Icon size={20} color="#888" />
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: wf.status === 'done' ? '#22c55e' : '#f59e0b',
                      background: wf.status === 'done' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                      padding: '3px 8px',
                      borderRadius: 20,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {wf.status === 'done' ? 'Done' : 'WIP'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {wf.module}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{wf.title}</div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{wf.description}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

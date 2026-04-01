import { useParams } from 'react-router-dom'
import HomePage from './home/HomePage'

// Registry: slug → component
const WIREFRAME_MAP: Record<string, React.ComponentType> = {
  home: HomePage,
}

const NOT_FOUND_TEXT: Record<string, string> = {
  home: 'Home wireframe',
}

export default function WireframePage() {
  const { slug } = useParams<{ slug: string }>()
  const Component = slug ? WIREFRAME_MAP[slug] : null

  if (!Component) {
    return (
      <div className="min-h-screen bg-[#161616] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-sm mb-1">Wireframe not found</p>
          <p className="text-white/20 text-xs">No wireframe registered for <code className="text-white/30">/{slug}</code></p>
        </div>
      </div>
    )
  }

  return <Component />
}

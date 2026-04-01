import { BrowserRouter, Routes, Route, Outlet, Link, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import WireframePage from './pages/wireframes'

// Shared layout for all wireframe pages — includes back-to-dashboard link
function WireframeLayout() {
  return (
    <div>
      {/* Back to Dashboard */}
      <Link
        to="/home"
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white/40 hover:text-white/70 hover:bg-white/[0.10] transition-all text-xs font-medium"
      >
        ← Dashboard
      </Link>
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        {/* Dashboard — no back link */}
        <Route path="/home" element={<Dashboard />} />
        {/* Wireframe pages — with back-to-dashboard link */}
        <Route element={<WireframeLayout />}>
          <Route path="/home/:slug" element={<WireframePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

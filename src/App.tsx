import { BrowserRouter, Routes, Route, Outlet, Link, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import WireframePage from './pages/wireframes'
import HomePage from './pages/home/HomePage'

// Shared layout for wireframe sub-pages — includes back-to-wireframes link
function WireframeLayout() {
  return (
    <div>
      {/* Back to Dashboard */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white/40 hover:text-white/70 hover:bg-white/[0.10] transition-all text-xs font-medium"
      >
        ← Wireframes
      </Link>
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wireframe index */}
        <Route path="/" element={<Dashboard />} />
        {/* Home / frndOS Studio — renders HomePage directly */}
        <Route path="/home" element={<HomePage />} />
        {/* Future wireframe sub-pages */}
        <Route element={<WireframeLayout />}>
          <Route path="/home/:slug" element={<WireframePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

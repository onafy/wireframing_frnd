import { Agentation } from 'agentation'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import PrdRail from '@/components/prd/PrdRail'
import WireframeVersionHistory from '@/components/wireframe/WireframeVersionHistory'
import { getWireframeByRoute } from '@/data/wireframeRegistry'
import DashboardPage from './pages/dashboard/DashboardPage'
import HomePage from './pages/home/HomePage'
import StudioPage from './pages/studio/StudioPage'
import AskFrndPage from './pages/Askfrnd/askfrnd2'
import BrandKnowledgePage from './pages/Brand Knowledge/BrandKnowkedge'
import BrandAssetsPage from './pages/Brand Knowledge/BrandAssets'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/askfrnd" element={<AskFrndPage />} />
        <Route path="/brand-knowledge" element={<BrandKnowledgePage />} />
        <Route path="/brand-assets" element={<BrandAssetsPage />} />
      </Routes>
      <RouteOverlays />
      {import.meta.env.DEV ? <Agentation endpoint="http://localhost:4747" /> : null}
    </BrowserRouter>
  )
}

function RouteOverlays() {
  const location = useLocation()

  const wf = getWireframeByRoute(location.pathname)
  return (
    <>
      <WireframeVersionHistory key={location.pathname} wireframe={wf} />
      <PrdRail wireframe={wf} />
    </>
  )
}

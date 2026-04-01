import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/dashboard/DashboardPage'
import HomePage from './pages/home/HomePage'
import StudioPage from './pages/studio/StudioPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/studio" element={<StudioPage />} />
      </Routes>
    </BrowserRouter>
  )
}

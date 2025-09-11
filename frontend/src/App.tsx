import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { RoleSelector } from '@components/RoleSelector'
import Dashboard from '@pages/Dashboard'
import MapPage from '@pages/MapPage'
import DataUpload from '@pages/DataUpload'
import Reports from '@pages/Reports'
import Profile from '@pages/Profile'
import Education from '@pages/Education'
import SimpleTestDemo from '@components/SimpleTestDemo'
import { useAppStore } from '@state/store'
import { FiMap, FiHome, FiUpload, FiUser, FiBookOpen, FiBarChart2, FiTool } from 'react-icons/fi'
import ChatbotWidget from '@components/ChatbotWidget'

export default function App() {
  console.log('MetalSense: App component rendering...')
  const { theme, highContrast, setTheme, setHighContrast, initRealtimeMock, tryConnectBackend, backendConnected } = useAppStore()
  const location = useLocation()

  useEffect(() => {
    console.log('MetalSense: Setting theme:', theme, 'highContrast:', highContrast)
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-high-contrast', String(highContrast))
  }, [theme, highContrast])

  useEffect(() => {
    console.log('MetalSense: Connecting to backend and starting mock...')
    tryConnectBackend()
    initRealtimeMock()
  }, [tryConnectBackend, initRealtimeMock])

  return (
    <div className="app-shell" aria-live="polite">
      <nav className="navbar" role="navigation" aria-label="Main Navigation">
        <span className="brand">MetalSense</span>
        <Link className="button" to="/"><FiHome /> <span className="sr-only">Dashboard</span><span aria-hidden>Dashboard</span></Link>
        <Link className="button" to="/map"><FiMap /> <span aria-hidden>Map</span></Link>
        <Link className="button" to="/upload"><FiUpload /> <span aria-hidden>Upload</span></Link>
        <Link className="button" to="/reports"><FiBarChart2 /> <span aria-hidden>Reports</span></Link>
        <Link className="button" to="/education"><FiBookOpen /> <span aria-hidden>Education</span></Link>
        <Link className="button" to="/demo"><FiTool /> <span aria-hidden>Demo</span></Link>
        <div className="spacer" />
        <RoleSelector />
        <button className="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-pressed={theme !== 'light'}>
          {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        <button className="button" onClick={() => setHighContrast(!highContrast)} aria-pressed={highContrast}>
          High Contrast
        </button>
        <Link className="button" to="/profile"><FiUser /> <span aria-hidden>Profile</span></Link>
      </nav>
      <div className="container">
        <main className="main" role="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/upload" element={<DataUpload />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/education" element={<Education />} />
            <Route path="/demo" element={<SimpleTestDemo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <span className="sr-only" aria-live="assertive">{location.pathname}</span>
      {/* Floating components */}
      <ChatbotWidget />
    </div>
  )
}


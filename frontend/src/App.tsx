import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { RoleSelector } from '@components/RoleSelector'
import Dashboard from '@pages/Dashboard'
import MapPage from '@pages/MapPage'
import DataUpload from '@pages/DataUpload'
import Reports from '@pages/Reports'
import Alerts from '@pages/Alerts'
import Profile from '@pages/Profile'
import Education from '@pages/Education'
import { useAppStore } from '@state/store'
import { FiMap, FiHome, FiUpload, FiAlertTriangle, FiUser, FiBookOpen, FiBarChart2 } from 'react-icons/fi'
import ChatbotWidget from '@components/ChatbotWidget'
import ToastNotification from '@components/ToastNotification'

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
        <Link className="button" to="/alerts"><FiAlertTriangle /> <span aria-hidden>Alerts</span></Link>
        <Link className="button" to="/education"><FiBookOpen /> <span aria-hidden>Education</span></Link>
        <div className="spacer" />
        <span className={`badge ${backendConnected ? 'safe' : 'moderate'}`} title={backendConnected ? 'Connected to backend' : 'Using offline data'}>
          {backendConnected ? '🟢 Live' : '🟡 Demo'}
        </span>
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
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/education" element={<Education />} />
          </Routes>
        </main>
      </div>
      <span className="sr-only" aria-live="assertive">{location.pathname}</span>
      {/* Floating components */}
      <ChatbotWidget />
      <ToastNotification />
    </div>
  )
}


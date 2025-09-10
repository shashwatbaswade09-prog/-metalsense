import { useMemo } from 'react'
import { useAppStore } from '@state/store'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { metals } from '@utils/mockData'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { role, alerts, indicesSeries, hotspots } = useAppStore()
  const stats = useMemo(() => {
    const total = hotspots.length
    const high = hotspots.filter(h => h.risk === 'high').length
    const moderate = hotspots.filter(h => h.risk === 'moderate').length
    const safe = hotspots.filter(h => h.risk === 'safe').length
    return { total, high, moderate, safe }
  }, [hotspots])

  return (
    <div className="grid cols-2" aria-label="Dashboard">
      <div className="card">
        <h2>Local Pollution Status</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span className="badge high" aria-label={`${stats.high} high risk hotspots`}>High: {stats.high}</span>
          <span className="badge moderate" aria-label={`${stats.moderate} moderate risk hotspots`}>Moderate: {stats.moderate}</span>
          <span className="badge safe" aria-label={`${stats.safe} safe hotspots`}>Safe: {stats.safe}</span>
          <span className="badge" aria-label={`${stats.total} total points`}>Total: {stats.total}</span>
        </div>
        <p style={{ marginTop: 8 }}>Track heavy metal hotspots and stay informed with real-time updates.</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link className="button primary" to="/map">Open Hotspot Map</Link>
          <button className="button" onClick={() => {
            const lat = 12.972 + (Math.random() - 0.5) * 0.02
            const lng = 77.594 + (Math.random() - 0.5) * 0.02
            const report = { lat, lng, description: 'Citizen-reported pollution incident', createdAt: new Date().toISOString() }
            // In a real app, this would open a form or call the API
            console.log('Incident report:', report)
            alert('📢 Incident reported! (Demo mode)')
          }}>Report Incident</button>
        </div>
      </div>

      <div className="card" aria-label="Health Indices Over Time">
        <h2>HPI/HEI/MI over time</h2>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={indicesSeries}>
              <CartesianGrid stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted)" hide={false} />
              <YAxis stroke="var(--muted)" />
              <Tooltip labelStyle={{ color: 'var(--text)' }} contentStyle={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }} />
              <Legend />
              <Line type="monotone" dataKey="HPI" stroke="#f97316" dot={false} />
              <Line type="monotone" dataKey="HEI" stroke="#22c55e" dot={false} />
              <Line type="monotone" dataKey="MI" stroke="#3b82f6" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2>Health Advisory</h2>
        <p>Personalized guidance varies by role and location.</p>
        <ul>
          <li>Adults: Avoid sustained exposure in high-risk zones.</li>
          <li>Children: Prefer routes around moderate/high hotspots.</li>
          <li>Pregnant women: Follow low-exposure routes only.</li>
        </ul>
      </div>

      <div className="card">
        <h2>Recent Alerts</h2>
        <ul>
          {alerts.slice(0, 5).map(a => (
            <li key={a.id}>{new Date(a.ts).toLocaleString()}: {a.message}</li>
          ))}
          {alerts.length === 0 && <li>No alerts yet.</li>}
        </ul>
      </div>
    </div>
  )
}


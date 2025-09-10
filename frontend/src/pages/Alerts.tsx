import { useAppStore } from '@state/store'

export default function Alerts() {
  const alerts = useAppStore(s => s.alerts)

  return (
    <div className="card">
      <h2>Alerts</h2>
      {alerts.length === 0 && <p>No alerts yet.</p>}
      <ul>
        {alerts.map(a => (
          <li key={a.id}>
            <span className={`badge ${a.level === 'danger' ? 'high' : a.level === 'warning' ? 'moderate' : ''}`}>{a.level}</span>
            &nbsp;{new Date(a.ts).toLocaleString()} – {a.message}
          </li>
        ))}
      </ul>
    </div>
  )
}


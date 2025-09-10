export default function Profile() {
  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>Profile & Settings</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <label><input type="checkbox" defaultChecked /> Enable notifications</label>
          <label><input type="checkbox" /> Voice alerts when approaching dangerous zones</label>
          <label><input type="checkbox" /> Share anonymized sensor data</label>
        </div>
      </div>
      <div className="card">
        <h2>Location Permissions</h2>
        <p>Grant location access to receive proximity alerts and route recommendations.</p>
        <button className="button primary" onClick={() => alert('Location permission requested (demo)')}>Enable Location (demo)</button>
      </div>
    </div>
  )
}


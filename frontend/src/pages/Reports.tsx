import { useEffect, useState } from 'react'
import { api } from '@utils/api'

export default function Reports() {
  const [rows, setRows] = useState<any[]>([])
  useEffect(() => {
    api.getCompliance().then((data) => setRows(data)).catch(() => setRows([]))
  }, [])
  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>Compliance Dashboard</h2>
        <table className="table" aria-label="Industry compliance table">
          <thead>
            <tr>
              <th>Industry</th>
              <th>Metal</th>
              <th>Contribution (%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.metal}</td>
                <td>{r.contribution}</td>
                <td><span className={`badge ${r.status === 'Violation' ? 'high' : 'safe'}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Automated Report Generator</h2>
        <p>Generate policy compliance summaries and time-bound analysis for regulators.</p>
        <button className="button primary" onClick={() => alert('Report generated (demo)')}>Generate Report (demo)</button>
      </div>
    </div>
  )
}


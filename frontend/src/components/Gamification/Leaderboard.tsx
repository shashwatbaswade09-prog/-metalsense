import { useMemo } from 'react'

const demo = [
  { user: 'Aditi', reports: 42 },
  { user: 'Rahul', reports: 31 },
  { user: 'Nisha', reports: 27 },
  { user: 'Arjun', reports: 20 },
  { user: 'Sara', reports: 18 },
]

export default function Leaderboard() {
  const list = useMemo(() => demo.sort((a, b) => b.reports - a.reports), [])
  return (
    <div className="card">
      <h3>Community Leaderboard</h3>
      <table className="table" aria-label="Leaderboard">
        <thead>
          <tr>
            <th>User</th>
            <th>Reports</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r, i) => (
            <tr key={r.user}>
              <td>#{i+1} {r.user}</td>
              <td>{r.reports}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


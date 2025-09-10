import { useState } from 'react'

export default function TestApp() {
  console.log('TestApp: Rendering...')
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: 'white', color: 'black', minHeight: '100vh' }}>
      <h1 style={{ color: 'blue' }}>MetalSense Test App</h1>
      <p>If you can see this, React is working!</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
      >
        Count: {count}
      </button>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <p>Browser info:</p>
        <ul>
          <li>User Agent: {navigator.userAgent.slice(0, 50)}...</li>
          <li>URL: {window.location.href}</li>
          <li>Time: {new Date().toISOString()}</li>
        </ul>
      </div>
    </div>
  )
}

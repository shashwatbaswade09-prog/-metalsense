import { useState } from 'react'

const canned = [
  { q: 'What are heavy metals?', a: 'Heavy metals are elements like Lead (Pb), Arsenic (As), Mercury (Hg), Cadmium (Cd), and others that can be toxic even at low concentrations. They persist in the environment and bioaccumulate.' },
  { q: 'How does MetalSense compute risk?', a: 'Risk is calculated using scientific indices like HPI (Heavy Metal Pollution Index), HEI (Heavy Metal Evaluation Index), and MI (Metal Index), then mapped to safe/moderate/high categories based on WHO guidelines.' },
  { q: 'How can I reduce exposure?', a: 'Avoid high-risk zones shown on the map, use water filtration, choose routes with lower exposure, limit time in polluted areas, and follow health advisories for vulnerable groups.' },
  { q: 'What do the colors mean?', a: 'Green = Safe levels, Yellow = Moderate risk (caution advised), Red = High risk (avoid if possible). The heatmap shows pollution intensity across the area.' },
  { q: 'How often is data updated?', a: 'Sensor data updates every 10 seconds when connected to live backend. The app shows real-time pollution levels and sends alerts for significant changes.' },
  { q: 'Can I report pollution?', a: 'Yes! Click "Report Incident" on the dashboard to submit pollution reports with photos and location. Your contributions help improve community safety.' },
  { q: 'What is the route planner?', a: 'The route planner suggests paths that avoid high-pollution zones. It considers real-time data and your risk tolerance to recommend safer routes.' },
]

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user'|'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! Ask me about heavy metal safety.' }
  ])
  const [input, setInput] = useState('')

  function send() {
    if (!input.trim()) return
    const query = input.toLowerCase()
    
    // Better pattern matching
    let match = canned.find(c => {
      const keywords = c.q.toLowerCase().split(' ')
      return keywords.some(keyword => query.includes(keyword) && keyword.length > 2)
    })
    
    // Keyword-based fallbacks
    if (!match) {
      if (query.includes('metal') || query.includes('lead') || query.includes('mercury')) match = canned[0]
      else if (query.includes('risk') || query.includes('danger') || query.includes('safe')) match = canned[1]
      else if (query.includes('avoid') || query.includes('protect') || query.includes('reduce')) match = canned[2]
      else if (query.includes('color') || query.includes('map') || query.includes('green') || query.includes('red')) match = canned[3]
      else if (query.includes('update') || query.includes('data') || query.includes('real')) match = canned[4]
      else if (query.includes('report') || query.includes('incident')) match = canned[5]
      else if (query.includes('route') || query.includes('path') || query.includes('travel')) match = canned[6]
    }
    
    const reply = match?.a || 'I can help with questions about heavy metals, risk assessment, safety measures, map colors, data updates, incident reporting, and route planning. Try asking about any of these topics!'
    setMessages(m => [...m, { role: 'user', text: input }, { role: 'bot', text: reply }])
    setInput('')
  }

  return (
    <div className="chatbot" aria-live="polite">
      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="MetalSense Assistant">
          <div style={{ display: 'grid', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'end' : 'start' }}>
                <div className="card" style={{ background: m.role === 'user' ? 'var(--secondary)' : 'var(--bg-elev)', color: m.role === 'user' ? '#000' : 'var(--text)' }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask a question" 
                aria-label="Ask a question" 
                style={{ flex: 1 }}
              />
              <button className="button primary" onClick={send} disabled={!input.trim()}>Send</button>
            </div>
          </div>
        </div>
      )}
      <button className="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="chatbot-panel">
        {open ? 'Close Help' : 'Help / FAQ'}
      </button>
    </div>
  )
}


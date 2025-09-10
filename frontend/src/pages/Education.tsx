export default function Education() {
  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>Educational Infographics</h2>
        <ul>
          <li>Lead (Pb): Affects nervous system and development.</li>
          <li>Arsenic (As): Carcinogenic; long-term exposure risks.</li>
          <li>Mercury (Hg): Impacts brain, kidneys; avoid fish from polluted waters.</li>
          <li>Cadmium (Cd): Kidney damage; smoking increases exposure.</li>
        </ul>
      </div>
      <div className="card">
        <h2>Awareness Videos</h2>
        <p>Embed educational videos or use a carousel here. (Demo placeholder)</p>
        <div style={{ display: 'grid', gap: 8 }}>
          <div className="card">Animated: Safe water practices</div>
          <div className="card">How to read risk maps</div>
          <div className="card">Protective measures for workers</div>
        </div>
      </div>
    </div>
  )
}


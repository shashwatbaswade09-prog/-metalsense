import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { api } from '@utils/api'

export default function DataUpload() {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [status, setStatus] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  async function handleFile(file: File) {
    // Basic validation
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setStatus('❌ Please upload a CSV file')
      return
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setStatus('❌ File too large (max 10MB)')
      return
    }

    try {
      setIsUploading(true)
      setStatus('📤 Uploading...')
      const ds = await api.postDataset(file)
      setStatus(`✅ Uploaded: ${ds.filename} (status: ${ds.status})`)
    } catch (e: any) {
      setStatus(`❌ Upload failed: ${e.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>Upload Data (CSV)</h2>
        <p>Upload heavy metal concentration data. Expected headers (for backend processing): <code>lat, lng, metal, value</code></p>
        <div style={{ margin: '16px 0' }}>
          <input 
            type="file" 
            accept='.csv' 
            ref={fileRef} 
            disabled={isUploading}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }} 
            style={{ marginBottom: '8px' }}
          />
          {isUploading && <div style={{ color: 'var(--secondary)' }}>Processing...</div>}
        </div>
        {status && (
          <div style={{ 
            marginTop: 8, 
            padding: '8px 12px', 
            borderRadius: '6px',
            backgroundColor: status.includes('✅') ? 'var(--safe)' : status.includes('❌') ? 'var(--danger)' : 'var(--warning)',
            color: status.includes('📤') ? 'var(--text)' : '#000'
          }}>
            {status}
          </div>
        )}
      </div>
      <div className="card">
        <h2>Validation Report</h2>
        <p>After upload, automatic checks will flag anomalies and calculation errors.</p>
        <ul>
          <li>Missing or invalid lat/lng values</li>
          <li>Values out of realistic range</li>
          <li>Unexpected metal codes</li>
        </ul>
      </div>
    </div>
  )
}


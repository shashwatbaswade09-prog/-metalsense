import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 4000
const apiPrefix = '/api/v1'

app.use(cors({ origin: true }))
app.use(express.json({ limit: '5mb' }))

// In-memory stores (demo)
interface Hotspot { id: string, lat: number, lng: number, metal: string, value: number, risk: 'safe'|'moderate'|'high', source?: 'sensor'|'crowd'|'model', updatedAt: string }
interface Incident { id: string, lat: number, lng: number, description?: string, photoUrl?: string, status: 'submitted'|'reviewing'|'validated'|'dismissed', createdAt: string, createdBy?: string }
interface Alert { id: string, level: 'info'|'warning'|'danger', message: string, ts: string }
interface Dataset { id: string, filename: string, status: 'processing'|'validated'|'failed', createdAt: string }
interface PhotoUpload { id: string, filename: string, uploadUrl: string, status: 'pending'|'uploaded'|'processing'|'completed'|'failed', metadata?: { size: number, type: string }, createdAt: string, expiresAt: string }

const hotspots: Hotspot[] = [
  { id: 'h1', lat: 12.972, lng: 77.594, metal: 'Pb', value: 35, risk: 'safe', updatedAt: new Date(Date.now()-60000).toISOString() },
  { id: 'h2', lat: 12.973, lng: 77.6, metal: 'As', value: 65, risk: 'moderate', updatedAt: new Date(Date.now()-30000).toISOString() },
  { id: 'h3', lat: 12.97, lng: 77.59, metal: 'Hg', value: 90, risk: 'high', updatedAt: new Date(Date.now()-10000).toISOString() },
  { id: 'h4', lat: 12.965, lng: 77.6, metal: 'Cd', value: 50, risk: 'moderate', updatedAt: new Date(Date.now()-5000).toISOString() },
]

const incidents: Incident[] = []
const alerts: Alert[] = []
const datasets: Dataset[] = []
const photoUploads: PhotoUpload[] = []

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
const indices: { date: string, HPI: number, HEI: number, MI: number }[] = Array.from({ length: 12 }).map((_, i) => {
  const base = 50 + Math.sin(i/2)*15
  return { date: `2025-${String(i+1).padStart(2,'0')}-01`, HPI: Math.round(base), HEI: Math.round(base*0.8), MI: Math.round(base*1.1) }
})

// SSE clients
type SSEClient = { id: string, res: express.Response }
const clients: SSEClient[] = []

function sseBroadcast(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  clients.forEach(c => c.res.write(payload))
}

// Auth stubs
app.post(`${apiPrefix}/auth/login`, (req, res) => {
  res.json({ accessToken: 'demo_access', refreshToken: 'demo_refresh' })
})
app.post(`${apiPrefix}/auth/refresh`, (req, res) => {
  res.json({ accessToken: 'demo_access' })
})
app.get(`${apiPrefix}/me`, (req, res) => {
  res.json({ id: 'user_demo', role: 'citizen', preferences: { notifications: true, voiceAlerts: false } })
})

// Hotspots
app.get(`${apiPrefix}/hotspots`, (req, res) => {
  const metals = (req.query.metals as string | undefined)?.split(',')
  const riskThreshold = req.query.riskThreshold as undefined | 'safe'|'moderate'|'high'
  let result = hotspots
  if (metals && metals.length) result = result.filter(h => metals.includes(h.metal))
  if (riskThreshold === 'moderate') result = result.filter(h => h.risk !== 'safe')
  if (riskThreshold === 'high') result = result.filter(h => h.risk === 'high')
  res.json(result)
})
app.get(`${apiPrefix}/hotspots/:id`, (req, res) => {
  const h = hotspots.find(x => x.id === req.params.id)
  if (!h) return res.status(404).end()
  res.json(h)
})

// Incidents
app.post(`${apiPrefix}/incidents`, (req, res) => {
  const { lat, lng, description, photoUrl } = req.body || {}
  if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ error: 'lat,lng required' })
  const inc: Incident = { id: nanoid(), lat, lng, description, photoUrl, status: 'submitted', createdAt: new Date().toISOString() }
  incidents.unshift(inc)
  const alert: Alert = { id: nanoid(), level: 'warning', message: 'New incident submitted', ts: new Date().toISOString() }
  alerts.unshift(alert)
  sseBroadcast('alert', alert)
  res.status(201).json(inc)
})
app.get(`${apiPrefix}/incidents`, (req, res) => {
  res.json(incidents)
})

// Indices
app.get(`${apiPrefix}/indices/timeseries`, (req, res) => {
  res.json(indices)
})

// Datasets upload (multipart)
const upload = multer({ storage: multer.memoryStorage() })
app.post(`${apiPrefix}/datasets`, upload.single('file'), (req, res) => {
  const ds: Dataset = { id: nanoid(), filename: req.file?.originalname || 'upload.csv', status: 'processing', createdAt: new Date().toISOString() }
  datasets.unshift(ds)
  res.status(202).json(ds)
  // Simulate async validation result via SSE
  setTimeout(() => {
    ds.status = 'validated'
    sseBroadcast('dataset_status', { id: ds.id, status: ds.status })
  }, 2000)
})
app.get(`${apiPrefix}/datasets`, (req, res) => res.json(datasets))
app.get(`${apiPrefix}/datasets/:id`, (req, res) => {
  const ds = datasets.find(d => d.id === req.params.id)
  if (!ds) return res.status(404).end()
  res.json(ds)
})
app.get(`${apiPrefix}/datasets/:id/validation`, (req, res) => {
  const ds = datasets.find(d => d.id === req.params.id)
  if (!ds) return res.status(404).end()
  
  // Simulate comprehensive validation results
  const errors = []
  const warnings = []
  
  // Add validation results based on filename patterns (demo)
  if (ds.filename.includes('invalid')) {
    errors.push({
      row: 5,
      column: 'metal_concentration',
      message: 'Invalid concentration value: must be numeric and positive',
      value: 'N/A'
    })
    errors.push({
      row: 12,
      column: 'latitude',
      message: 'Coordinate out of bounds: latitude must be between -90 and 90',
      value: '95.123'
    })
  }
  
  if (ds.filename.includes('warning') || Math.random() < 0.3) {
    warnings.push({
      row: 3,
      column: 'timestamp',
      message: 'Timestamp format inconsistent: recommend ISO 8601 format',
      value: '2023-12-01 10:30'
    })
    warnings.push({
      row: 8,
      column: 'metal_type',
      message: 'Unknown metal abbreviation: suggest using standard symbols',
      value: 'Pb2+'
    })
  }
  
  res.json({ 
    errors, 
    warnings,
    summary: {
      totalRows: 150,
      validRows: 150 - errors.length,
      errorRows: errors.length,
      warningRows: warnings.length,
      requiredColumns: ['latitude', 'longitude', 'metal_type', 'concentration', 'timestamp'],
      detectedColumns: ['lat', 'lng', 'metal', 'value', 'date', 'source'],
      columnMapping: {
        'lat': 'latitude',
        'lng': 'longitude', 
        'metal': 'metal_type',
        'value': 'concentration',
        'date': 'timestamp'
      }
    }
  })
})

// Photo upload endpoints
app.post(`${apiPrefix}/photos/signed-url`, (req, res) => {
  const { filename, contentType } = req.body || {}
  
  if (!filename || !contentType) {
    return res.status(400).json({ error: 'filename and contentType required' })
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Unsupported file type. Only JPEG, PNG, and WebP are allowed.' })
  }
  
  const uploadId = nanoid()
  const fileExtension = path.extname(filename) || '.jpg'
  const storedFilename = `${uploadId}${fileExtension}`
  const uploadUrl = `${req.protocol}://${req.get('host')}${apiPrefix}/photos/upload/${uploadId}`
  
  const upload: PhotoUpload = {
    id: uploadId,
    filename: storedFilename,
    uploadUrl,
    status: 'pending',
    metadata: { size: 0, type: contentType },
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
  }
  
  photoUploads.push(upload)
  
  res.json({
    uploadId,
    uploadUrl,
    expiresAt: upload.expiresAt
  })
})

app.put(`${apiPrefix}/photos/upload/:uploadId`, upload.single('photo'), (req, res) => {
  const { uploadId } = req.params
  const photoUpload = photoUploads.find(p => p.id === uploadId)
  
  if (!photoUpload) {
    return res.status(404).json({ error: 'Upload not found' })
  }
  
  if (photoUpload.status !== 'pending') {
    return res.status(400).json({ error: 'Upload already processed' })
  }
  
  if (new Date() > new Date(photoUpload.expiresAt)) {
    photoUpload.status = 'failed'
    return res.status(410).json({ error: 'Upload URL expired' })
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' })
  }
  
  try {
    // Save file to uploads directory
    const filePath = path.join(uploadsDir, photoUpload.filename)
    fs.writeFileSync(filePath, req.file.buffer)
    
    // Update upload status
    photoUpload.status = 'uploaded'
    photoUpload.metadata = {
      size: req.file.size,
      type: req.file.mimetype
    }
    
    // Simulate processing
    setTimeout(() => {
      photoUpload.status = 'completed'
      sseBroadcast('photo_processed', { uploadId, status: 'completed', url: `/api/v1/photos/${uploadId}` })
    }, 1000)
    
    res.json({
      uploadId,
      status: photoUpload.status,
      url: `${apiPrefix}/photos/${uploadId}`
    })
  } catch (error) {
    photoUpload.status = 'failed'
    res.status(500).json({ error: 'Failed to save file' })
  }
})

app.get(`${apiPrefix}/photos/:uploadId`, (req, res) => {
  const { uploadId } = req.params
  const photoUpload = photoUploads.find(p => p.id === uploadId)
  
  if (!photoUpload || photoUpload.status !== 'completed') {
    return res.status(404).json({ error: 'Photo not found' })
  }
  
  const filePath = path.join(uploadsDir, photoUpload.filename)
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on disk' })
  }
  
  res.sendFile(path.resolve(filePath))
})

app.get(`${apiPrefix}/photos/:uploadId/metadata`, (req, res) => {
  const { uploadId } = req.params
  const photoUpload = photoUploads.find(p => p.id === uploadId)
  
  if (!photoUpload) {
    return res.status(404).json({ error: 'Photo not found' })
  }
  
  res.json({
    id: photoUpload.id,
    filename: photoUpload.filename,
    status: photoUpload.status,
    metadata: photoUpload.metadata,
    createdAt: photoUpload.createdAt,
    url: photoUpload.status === 'completed' ? `${apiPrefix}/photos/${uploadId}` : null
  })
})

// Compliance
app.get(`${apiPrefix}/compliance/industries`, (req, res) => {
  res.json([
    { id: 'plant-a', name: 'Plant A', metal: 'Pb', contribution: 22, status: 'Compliant' },
    { id: 'plant-b', name: 'Plant B', metal: 'Hg', contribution: 35, status: 'Violation' },
    { id: 'plant-c', name: 'Plant C', metal: 'As', contribution: 12, status: 'Compliant' },
  ])
})

// Alerts
app.get(`${apiPrefix}/alerts`, (req, res) => {
  const since = req.query.since ? new Date(String(req.query.since)) : null
  const result = since ? alerts.filter(a => new Date(a.ts) > since) : alerts
  res.json(result)
})

// Routing (demo avoidance like frontend)
app.post(`${apiPrefix}/routes/plan`, (req, res) => {
  const { origin, destination } = req.body || {}
  if (!origin || !destination) return res.status(400).json({ error: 'origin and destination required' })
  const A = origin as [number, number]
  const B = destination as [number, number]
  const danger = hotspots.filter(h => h.risk === 'high')
  const crosses = (pt: [number, number]) => danger.some(h => {
    const dLat = (pt[0] - h.lat) * 111000
    const dLng = (pt[1] - h.lng) * 111000 * Math.cos((pt[0] * Math.PI)/180)
    const d = Math.hypot(dLat, dLng)
    return d < 200
  })
  const route: [number, number][] = [A]
  const mid: [number, number] = [(A[0]+B[0])/2, (A[1]+B[1])/2]
  if (crosses(mid)) {
    const detour: [number, number] = [mid[0] + (A[1]-B[1])*0.01, mid[1] + (B[0]-A[0])*0.01]
    route.push(detour)
  }
  route.push(B)
  const dist = 1000 // demo
  res.json({ geometry: route, distanceMeters: dist, durationSeconds: Math.round(dist/1.4), riskScore: 10, warnings: [] })
})

// SSE
app.get(`${apiPrefix}/events/sse`, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()
  const id = nanoid()
  clients.push({ id, res })
  res.write(`event: ping\ndata: {"ts":"${new Date().toISOString()}"}\n\n`)
  req.on('close', () => {
    const idx = clients.findIndex(c => c.id === id)
    if (idx >= 0) clients.splice(idx, 1)
  })
})

// Periodic hotspot variation
setInterval(() => {
  hotspots.forEach(h => {
    const delta = (Math.random() - 0.5) * 2
    h.value = Math.max(0, h.value + delta)
    h.risk = h.value > 80 ? 'high' : h.value > 40 ? 'moderate' : 'safe'
    h.updatedAt = new Date().toISOString()
    if (Math.random() < 0.05) {
      alerts.unshift({ id: nanoid(), level: 'warning', message: `Spike near ${h.metal} point`, ts: new Date().toISOString() })
      sseBroadcast('alert', alerts[0])
    }
    sseBroadcast('hotspot_update', h)
  })
}, 10000)

app.listen(port, () => {
  console.log(`MetalSense API listening on http://localhost:${port}${apiPrefix}`)
})


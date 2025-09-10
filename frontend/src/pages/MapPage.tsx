import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { useMemo, useState, useEffect, useRef } from 'react'
import { useAppStore } from '@state/store'
import { metals } from '@utils/mockData'
import { api } from '@utils/api'
import PhotoUpload from '@components/PhotoUpload'
import { MapPin, Camera, X } from 'lucide-react'
import L from 'leaflet'

// Fix Leaflet default markers for Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Safe HeatLayer component that loads leaflet.heat dynamically
function HeatLayer({ points }: { points: Array<[number, number, number]> }) {
  const map = useMap()
  const layerRef = useRef<any>(null)
  const [heatLayerLoaded, setHeatLayerLoaded] = useState(false)

  useEffect(() => {
    // Dynamically import leaflet.heat to avoid initialization issues
    import('leaflet.heat').then(() => {
      setHeatLayerLoaded(true)
    }).catch(err => {
      console.warn('Failed to load leaflet.heat:', err)
    })
  }, [])

  useEffect(() => {
    if (!map || !heatLayerLoaded || points.length === 0) return

    if (!layerRef.current) {
      // @ts-ignore - leaflet.heat adds heatLayer to L
      layerRef.current = (L as any).heatLayer(points, { 
        radius: 25, 
        blur: 15, 
        maxZoom: 17,
        gradient: { 0.2: 'blue', 0.5: 'yellow', 0.8: 'orange', 1.0: 'red' }
      })
      layerRef.current.addTo(map)
    } else {
      // @ts-ignore
      layerRef.current.setLatLngs(points)
    }

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [map, heatLayerLoaded, points])

  return null
}

function MetalFilters() {
  const { filters, toggleMetal, setRiskThreshold } = useAppStore()
  return (
    <div className="card" style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, width: 280 }}>
      <strong>Filters</strong>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
        {metals.map(m => (
          <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={filters.metals[m]} onChange={() => toggleMetal(m)} /> {m}
          </label>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Risk threshold
          <select style={{ marginLeft: 8 }} onChange={e => setRiskThreshold(e.target.value as any)}>
            <option value="safe">Safe+</option>
            <option value="moderate">Moderate+</option>
            <option value="high">High only</option>
          </select>
        </label>
      </div>
    </div>
  )
}

function RoutePlanner({ onRoute }: { onRoute: (route: [number, number][]) => void }) {
  const [start, setStart] = useState('12.972,77.594')
  const [end, setEnd] = useState('12.978,77.602')
  const hotspots = useAppStore(s => s.hotspots)

  function parse(s: string): [number, number] | null {
    const [a, b] = s.split(',').map(n => parseFloat(n.trim()))
    return isFinite(a) && isFinite(b) ? [a, b] : null
  }

  // Call backend route planner API
  async function plan() {
    const A = parse(start)
    const B = parse(end)
    if (!A || !B) {
      alert('Please enter valid coordinates (lat,lng format)')
      return
    }
    
    try {
      const response = await api.planRoute({
        origin: A,
        destination: B,
        riskThreshold: 'moderate', // avoid moderate+ zones
        avoidZones: true
      })
      onRoute(response.geometry)
      if (response.warnings && response.warnings.length > 0) {
        alert(`Route planned! Warnings: ${response.warnings.join(', ')}`)
      }
    } catch (error) {
      console.error('Route planning failed:', error)
      alert('Route planning failed. Using direct path.')
      // Fallback to direct route
      onRoute([A, B])
    }
  }

  return (
    <div className="card" style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1000, width: 320 }}>
      <strong>Route Planner (demo)</strong>
      <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
        <label>Start <input value={start} onChange={e => setStart(e.target.value)} aria-label="Start coordinate" /></label>
        <label>End <input value={end} onChange={e => setEnd(e.target.value)} aria-label="End coordinate" /></label>
        <button className="button primary" onClick={plan}>Plan Route</button>
      </div>
      <small>Suggests a path avoiding high-risk zones (demo).</small>
    </div>
  )
}

function IncidentReporter() {
  const [isOpen, setIsOpen] = useState(false)
  const [location, setLocation] = useState('12.972,77.594')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePhotoUpload = (uploadId: string, url: string) => {
    setPhotoUrl(url)
  }

  const handleSubmit = async () => {
    const coords = location.split(',').map(n => parseFloat(n.trim()))
    if (coords.length !== 2 || coords.some(isNaN)) {
      alert('Please enter valid coordinates (lat,lng format)')
      return
    }

    setIsSubmitting(true)
    try {
      await api.postIncident({
        lat: coords[0],
        lng: coords[1],
        description,
        photoUrl
      })
      alert('Incident reported successfully!')
      setIsOpen(false)
      setDescription('')
      setPhotoUrl('')
    } catch (error) {
      console.error('Failed to report incident:', error)
      alert('Failed to report incident. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        className="fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg z-1000 transition-colors"
        onClick={() => setIsOpen(true)}
        title="Report Incident"
      >
        <Camera className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto z-1000">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Report Incident</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location (lat,lng)
          </label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="12.972,77.594"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            placeholder="Describe what you observed..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo (optional)
          </label>
          <PhotoUpload
            onUploadComplete={handlePhotoUpload}
            onUploadError={(error) => console.error('Photo upload error:', error)}
            maxSizeMB={3}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !description.trim()}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Report Incident'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  const { hotspots, filters } = useAppStore()
  const filtered = useMemo(() => hotspots.filter(h => filters.metals[h.metal] && (
    filters.riskThreshold === 'safe' ||
    (filters.riskThreshold === 'moderate' && (h.risk === 'moderate' || h.risk === 'high')) ||
    (filters.riskThreshold === 'high' && h.risk === 'high')
  )), [hotspots, filters])

  const heatPoints = useMemo(() => filtered.map(h => [h.lat, h.lng, Math.min(1, h.value / 100)] as [number, number, number]), [filtered])
  const [route, setRoute] = useState<[number, number][]>([])

  return (
    <div className="card" style={{ padding: 0, height: 'calc(100vh - 88px)', position: 'relative' }}>
      <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer points={heatPoints} />
        {filtered.map(h => (
          <Marker key={h.id} position={[h.lat, h.lng]}>
            <Popup>
              <strong>{h.metal}</strong><br/>
              Value: {h.value.toFixed(1)}<br/>
              Risk: <span className={`badge ${h.risk}`}>{h.risk}</span><br/>
              Updated: {new Date(h.updatedAt).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}
        {route.length > 1 && (
          <Polyline positions={route as any} pathOptions={{ color: '#22c55e', weight: 6 }} />
        )}
      </MapContainer>
      <MetalFilters />
      <RoutePlanner onRoute={setRoute} />
      <IncidentReporter />
    </div>
  )
}


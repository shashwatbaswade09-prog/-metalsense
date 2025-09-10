import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { useMemo, useState, useEffect, useRef } from 'react'
import { useAppStore } from '@state/store'
import { metals } from '@utils/mockData'
import { api } from '@utils/api'
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
    </div>
  )
}


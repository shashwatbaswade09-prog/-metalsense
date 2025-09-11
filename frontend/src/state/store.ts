import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { mockHotspots, mockIndices, metals } from '@utils/mockData'
import { api } from '@utils/api'
import { API_BASE } from '@src/config'

export type Role = 'citizen' | 'researcher' | 'industry'
export type Theme = 'light' | 'dark'
export type Metal = typeof metals[number]

export interface Hotspot {
  id: string
  lat: number
  lng: number
  metal: Metal
  value: number // concentration
  risk: 'safe' | 'moderate' | 'high'
  updatedAt: number
  source?: 'upload' | 'sensor' | 'manual' | 'crowd'
  locationName?: string
  notes?: string
}

export interface AlertItem {
  id: string
  message: string
  level: 'info' | 'warning' | 'danger'
  ts: number
}

interface Filters {
  metals: Record<Metal, boolean>
  riskThreshold: 'safe' | 'moderate' | 'high'
}

export interface UploadedEntry {
  lat: number
  lng: number
  metal: Metal
  value: number
  locationName?: string
  notes?: string
}

interface AppState {
  role: Role
  theme: Theme
  highContrast: boolean
  hotspots: Hotspot[]
  alerts: AlertItem[]
  backendConnected: boolean
  filters: Filters
  indicesSeries: { date: string; HPI: number; HEI: number; MI: number }[]
  userLocation?: { lat: number; lng: number }
  uploadedLocations: Set<string> // Track uploaded location coordinates
  setRole: (r: Role) => void
  setTheme: (t: Theme) => void
  setHighContrast: (hc: boolean) => void
  toggleMetal: (m: Metal) => void
  setRiskThreshold: (r: Filters['riskThreshold']) => void
  addAlert: (a: AlertItem) => void
  setUserLocation: (lat: number, lng: number) => void
  addUploadedData: (entries: UploadedEntry[]) => void
  calculateRiskLevel: (metal: Metal, value: number) => 'safe' | 'moderate' | 'high'
  addHotspotFromUpload: (entry: UploadedEntry) => void
  initRealtimeMock: () => void
  tryConnectBackend: () => void
}

// Metal risk thresholds (mg/L) based on WHO/EPA standards
const METAL_THRESHOLDS = {
  'As': { moderate: 0.01, high: 0.05 },    // Arsenic
  'Cd': { moderate: 0.003, high: 0.005 },  // Cadmium
  'Cr': { moderate: 0.05, high: 0.1 },     // Chromium
  'Cu': { moderate: 1.0, high: 2.0 },      // Copper
  'Fe': { moderate: 0.3, high: 1.0 },      // Iron
  'Hg': { moderate: 0.001, high: 0.006 },  // Mercury
  'Mn': { moderate: 0.05, high: 0.4 },     // Manganese
  'Ni': { moderate: 0.02, high: 0.07 },    // Nickel
  'Pb': { moderate: 0.01, high: 0.015 },   // Lead
  'Zn': { moderate: 3.0, high: 5.0 }       // Zinc
} as const

export const useAppStore = create<AppState>()(devtools((set, get) => ({
  role: 'citizen',
  theme: 'dark',
  highContrast: false,
  hotspots: mockHotspots,
  alerts: [],
  backendConnected: false,
  filters: {
    metals: metals.reduce((acc, m) => { acc[m] = true; return acc }, {} as Record<Metal, boolean>),
    riskThreshold: 'safe',
  },
  indicesSeries: mockIndices,
  uploadedLocations: new Set<string>(),
  setRole: (role) => set({ role }),
  setTheme: (theme) => set({ theme }),
  setHighContrast: (highContrast) => set({ highContrast }),
  toggleMetal: (m) => set(state => ({
    filters: { ...state.filters, metals: { ...state.filters.metals, [m]: !state.filters.metals[m] } }
  })),
  setRiskThreshold: (r) => set(state => ({ filters: { ...state.filters, riskThreshold: r } })),
  addAlert: (a) => set(state => ({ alerts: [a, ...state.alerts].slice(0, 50) })),
  setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
  
  // Calculate risk level based on metal type and concentration
  calculateRiskLevel: (metal: Metal, value: number) => {
    const thresholds = METAL_THRESHOLDS[metal]
    if (!thresholds) return 'safe'
    if (value >= thresholds.high) return 'high'
    if (value >= thresholds.moderate) return 'moderate'
    return 'safe'
  },
  
  // Add a single hotspot from uploaded data
  addHotspotFromUpload: (entry: UploadedEntry) => {
    const risk = get().calculateRiskLevel(entry.metal, entry.value)
    const locationKey = `${entry.lat.toFixed(6)},${entry.lng.toFixed(6)}`
    
    const newHotspot: Hotspot = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lat: entry.lat,
      lng: entry.lng,
      metal: entry.metal,
      value: entry.value,
      risk,
      updatedAt: Date.now(),
      source: 'upload',
      locationName: entry.locationName,
      notes: entry.notes
    }
    
    set(state => ({
      hotspots: [...state.hotspots, newHotspot],
      uploadedLocations: new Set([...state.uploadedLocations, locationKey])
    }))
    
    // Add alert for new upload
    const riskEmoji = risk === 'high' ? '🚨' : risk === 'moderate' ? '⚠️' : '✅'
    const alertLevel = risk === 'high' ? 'danger' : risk === 'moderate' ? 'warning' : 'info'
    
    get().addAlert({
      id: `upload_alert_${Date.now()}`,
      message: `${riskEmoji} New ${entry.metal} data uploaded at ${entry.locationName || 'uploaded location'} (${risk.toUpperCase()} risk)`,
      level: alertLevel as any,
      ts: Date.now()
    })
  },
  
  // Add multiple entries from uploaded data
  addUploadedData: (entries: UploadedEntry[]) => {
    entries.forEach(entry => {
      get().addHotspotFromUpload(entry)
    })
    
    // Summary alert
    const highRiskCount = entries.filter(e => get().calculateRiskLevel(e.metal, e.value) === 'high').length
    const moderateRiskCount = entries.filter(e => get().calculateRiskLevel(e.metal, e.value) === 'moderate').length
    
    let summaryMessage = `📊 Processed ${entries.length} measurements`
    if (highRiskCount > 0) summaryMessage += ` (${highRiskCount} high risk)`
    if (moderateRiskCount > 0) summaryMessage += ` (${moderateRiskCount} moderate risk)`
    
    get().addAlert({
      id: `upload_summary_${Date.now()}`,
      message: summaryMessage,
      level: highRiskCount > 0 ? 'danger' : moderateRiskCount > 0 ? 'warning' : 'info',
      ts: Date.now()
    })
  },
  initRealtimeMock: () => {
    if (get().backendConnected) return
    if ((window as any).__metalsense_mock_started) return
    ;(window as any).__metalsense_mock_started = true
    // Simulate hotspot updates and occasional alerts
    setInterval(() => {
      if (get().backendConnected) return
      const hs = get().hotspots.map(h => {
        const delta = (Math.random() - 0.5) * 2
        const value = Math.max(0, h.value + delta)
        const risk: 'safe' | 'moderate' | 'high' = value > 80 ? 'high' : value > 40 ? 'moderate' : 'safe'
        return { ...h, value, risk, updatedAt: Date.now() }
      })
      set({ hotspots: hs })
      if (Math.random() < 0.1) {
        set(state => ({ alerts: [{ id: String(Date.now()), message: 'New pollution spike detected nearby', level: 'warning', ts: Date.now() }, ...state.alerts] }))
      }
    }, 5000)
  },
  tryConnectBackend: async () => {
    try {
      // Fetch initial data
      const [hs, idx, alerts] = await Promise.all([
        api.getHotspots(),
        api.getIndices(),
        api.getAlerts()
      ])
      set({ hotspots: hs as any, indicesSeries: idx as any, alerts: (alerts as any[]).map(a => ({ ...a, ts: new Date(a.ts).getTime() })) as any, backendConnected: true })
      // Connect SSE
      const ev = new EventSource(`${API_BASE}/events/sse`)
      ev.addEventListener('alert', (e: any) => {
        try {
          const payload = JSON.parse((e as MessageEvent).data)
          set(state => ({ alerts: [{ id: payload.id, level: payload.level, message: payload.message, ts: new Date(payload.ts).getTime() }, ...state.alerts].slice(0,50) }))
        } catch {}
      })
      ev.addEventListener('hotspot_update', (e: any) => {
        try {
          const h = JSON.parse((e as MessageEvent).data)
          set(state => ({ hotspots: state.hotspots.map(x => x.id === h.id ? { ...x, ...h, updatedAt: new Date(h.updatedAt).getTime() } : x) }))
        } catch {}
      })
      ev.onerror = () => {
        console.warn('SSE connection error')
      }
    } catch (e) {
      console.warn('Backend not available, staying on mock:', e)
    }
  },
})))


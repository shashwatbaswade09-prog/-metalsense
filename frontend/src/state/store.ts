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
  setRole: (r: Role) => void
  setTheme: (t: Theme) => void
  setHighContrast: (hc: boolean) => void
  toggleMetal: (m: Metal) => void
  setRiskThreshold: (r: Filters['riskThreshold']) => void
  addAlert: (a: AlertItem) => void
  setUserLocation: (lat: number, lng: number) => void
  initRealtimeMock: () => void
  tryConnectBackend: () => void
}

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
  setRole: (role) => set({ role }),
  setTheme: (theme) => set({ theme }),
  setHighContrast: (highContrast) => set({ highContrast }),
  toggleMetal: (m) => set(state => ({
    filters: { ...state.filters, metals: { ...state.filters.metals, [m]: !state.filters.metals[m] } }
  })),
  setRiskThreshold: (r) => set(state => ({ filters: { ...state.filters, riskThreshold: r } })),
  addAlert: (a) => set(state => ({ alerts: [a, ...state.alerts].slice(0, 50) })),
  setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
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


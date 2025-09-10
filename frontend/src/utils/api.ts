import { API_BASE } from '@src/config'

export type RoutePlanRequest = {
  origin: [number, number]
  destination: [number, number]
  metals?: string[]
  riskThreshold?: 'safe' | 'moderate' | 'high'
  avoidZones?: boolean
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  getHotspots: (params?: { metals?: string[]; riskThreshold?: 'safe'|'moderate'|'high' }) => {
    const qs = new URLSearchParams()
    if (params?.metals?.length) qs.set('metals', params.metals.join(','))
    if (params?.riskThreshold) qs.set('riskThreshold', params.riskThreshold)
    return http<any[]>(`/hotspots?${qs.toString()}`)
  },
  getIndices: () => http<any[]>('/indices/timeseries'),
  getAlerts: (since?: string) => http<any[]>(`/alerts${since ? `?since=${encodeURIComponent(since)}` : ''}`),
  postIncident: (body: any) => http<any>('/incidents', { method: 'POST', body: JSON.stringify(body) }),
  postDataset: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_BASE}/datasets`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  },
  getCompliance: (): Promise<any[]> => http<any[]>('/compliance/industries'),
  planRoute: (body: RoutePlanRequest) => http<any>('/routes/plan', { method: 'POST', body: JSON.stringify(body) }),
}


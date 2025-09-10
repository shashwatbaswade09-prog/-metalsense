export const metals = ["Pb", "As", "Hg", "Cd", "Cr", "Ni", "Cu", "Zn"] as const

export type Metal = typeof metals[number]

export const mockHotspots = [
  { id: 'h1', lat: 12.972, lng: 77.594, metal: 'Pb' as const, value: 35, risk: 'safe' as const, updatedAt: Date.now() - 60000 },
  { id: 'h2', lat: 12.973, lng: 77.6, metal: 'As' as const, value: 65, risk: 'moderate' as const, updatedAt: Date.now() - 30000 },
  { id: 'h3', lat: 12.97, lng: 77.59, metal: 'Hg' as const, value: 90, risk: 'high' as const, updatedAt: Date.now() - 10000 },
  { id: 'h4', lat: 12.965, lng: 77.6, metal: 'Cd' as const, value: 50, risk: 'moderate' as const, updatedAt: Date.now() - 5000 },
  { id: 'h5', lat: 12.969, lng: 77.596, metal: 'Cr' as const, value: 20, risk: 'safe' as const, updatedAt: Date.now() - 2000 },
  { id: 'h6', lat: 12.978, lng: 77.602, metal: 'Ni' as const, value: 75, risk: 'moderate' as const, updatedAt: Date.now() - 8000 },
  { id: 'h7', lat: 12.975, lng: 77.593, metal: 'Cu' as const, value: 15, risk: 'safe' as const, updatedAt: Date.now() - 15000 },
  { id: 'h8', lat: 12.968, lng: 77.588, metal: 'Zn' as const, value: 82, risk: 'high' as const, updatedAt: Date.now() - 120000 }
]

export const mockIndices = Array.from({ length: 12 }).map((_, i) => {
  const base = 50 + Math.sin(i / 2) * 15
  return {
    date: `2025-${String(i + 1).padStart(2, '0')}-01`,
    HPI: Math.round(base + (Math.random() * 6 - 3)),
    HEI: Math.round(base * 0.8 + (Math.random() * 6 - 3)),
    MI: Math.round(base * 1.1 + (Math.random() * 6 - 3)),
  }
})

export const sampleReports = [
  { id: 'r1', industry: 'Plant A', metal: 'Pb', contribution: 22, status: 'Compliant' },
  { id: 'r2', industry: 'Plant B', metal: 'Hg', contribution: 35, status: 'Violation' },
  { id: 'r3', industry: 'Plant C', metal: 'As', contribution: 12, status: 'Compliant' },
]


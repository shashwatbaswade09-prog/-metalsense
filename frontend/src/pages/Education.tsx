import React, { useState } from 'react'
import { ChevronRight, ChevronDown, Beaker, Microscope, AlertTriangle, Heart, Shield, Zap, Clock, ArrowRight, Play, BookOpen, Eye, Atom } from 'lucide-react'

// Comprehensive metal data for encyclopedia
const METAL_ENCYCLOPEDIA = {
  'Pb': {
    name: 'Lead',
    symbol: 'Pb',
    atomicNumber: 82,
    color: '#4A5568',
    commonSources: [
      'Old paint and pipes',
      'Industrial emissions',
      'Lead-acid batteries',
      'Contaminated soil',
      'Some imported goods'
    ],
    healthEffects: {
      immediate: ['Headaches', 'Nausea', 'Abdominal pain', 'Fatigue', 'Memory problems'],
      longTerm: ['Brain damage', 'Kidney disease', 'Reproductive problems', 'Developmental delays', 'High blood pressure'],
      mostVulnerable: ['Children under 6', 'Pregnant women', 'Developing fetuses']
    },
    detectionMethods: ['X-ray fluorescence', 'Atomic absorption spectroscopy', 'ICP-MS'],
    safeLimits: { WHO: 0.01, EPA: 0.015, unit: 'mg/L' },
    treatment: ['Reverse osmosis', 'Distillation', 'Activated carbon with KDF media'],
    historicalCases: ['Flint Water Crisis (2014-2019)', 'Roman Empire lead poisoning', 'Paint ban implementation']
  },
  'Hg': {
    name: 'Mercury',
    symbol: 'Hg',
    atomicNumber: 80,
    color: '#E53E3E',
    commonSources: [
      'Coal-fired power plants',
      'Mining operations', 
      'Dental amalgams',
      'Thermometers and switches',
      'Contaminated fish'
    ],
    healthEffects: {
      immediate: ['Skin irritation', 'Cough', 'Chest tightness', 'Breathing difficulties', 'Eye irritation'],
      longTerm: ['Brain damage', 'Kidney damage', 'Vision problems', 'Motor skill impairment', 'Memory loss'],
      mostVulnerable: ['Pregnant women', 'Young children', 'People with respiratory conditions']
    },
    detectionMethods: ['Cold vapor atomic absorption', 'ICP-MS', 'Direct mercury analyzer'],
    safeLimits: { WHO: 0.006, EPA: 0.002, unit: 'mg/L' },
    treatment: ['Activated carbon', 'KMnO4 oxidation', 'Specialized mercury removal filters'],
    historicalCases: ['Minamata Disease (Japan)', 'Mad Hatter syndrome', 'Almadén mining legacy']
  },
  'As': {
    name: 'Arsenic',
    symbol: 'As',
    atomicNumber: 33,
    color: '#38A169',
    commonSources: [
      'Natural geological deposits',
      'Mining and smelting',
      'Wood preservatives',
      'Pesticides (historical)',
      'Groundwater contamination'
    ],
    healthEffects: {
      immediate: ['Stomach pain', 'Vomiting', 'Diarrhea', 'Skin changes', 'Muscle cramping'],
      longTerm: ['Cancer (skin, lung, bladder)', 'Cardiovascular disease', 'Diabetes', 'Neurological effects', 'Skin lesions'],
      mostVulnerable: ['Children', 'Pregnant women', 'Immunocompromised individuals']
    },
    detectionMethods: ['Hydride generation AAS', 'ICP-MS', 'Colorimetric field tests'],
    safeLimits: { WHO: 0.01, EPA: 0.01, unit: 'mg/L' },
    treatment: ['Reverse osmosis', 'Ion exchange', 'Activated alumina', 'Coagulation/filtration'],
    historicalCases: ['Bangladesh groundwater crisis', 'West Bengal arsenic poisoning', 'Copper smelter contamination']
  },
  'Cd': {
    name: 'Cadmium',
    symbol: 'Cd',
    atomicNumber: 48,
    color: '#D69E2E',
    commonSources: [
      'Industrial processes',
      'Battery manufacturing',
      'Tobacco smoke',
      'Fertilizers',
      'Galvanized pipes'
    ],
    healthEffects: {
      immediate: ['Cough', 'Chest pain', 'Flu-like symptoms', 'Metallic taste', 'Throat irritation'],
      longTerm: ['Lung damage', 'Kidney disease', 'Bone weakness', 'Cancer risk', 'Osteoporosis'],
      mostVulnerable: ['Smokers', 'Industrial workers', 'Elderly population']
    },
    detectionMethods: ['Graphite furnace AAS', 'ICP-MS', 'Anodic stripping voltammetry'],
    safeLimits: { WHO: 0.003, EPA: 0.005, unit: 'mg/L' },
    treatment: ['Ion exchange', 'Reverse osmosis', 'Lime softening', 'Activated alumina'],
    historicalCases: ['Itai-itai disease (Japan)', 'Shipham village contamination', 'Industrial discharge incidents']
  },
  'Cr': {
    name: 'Chromium',
    symbol: 'Cr',
    atomicNumber: 24,
    color: '#805AD5',
    commonSources: [
      'Stainless steel production',
      'Chrome plating',
      'Leather tanning',
      'Wood preservation',
      'Natural rock weathering'
    ],
    healthEffects: {
      immediate: ['Skin rash', 'Eye irritation', 'Nose bleeding', 'Cough', 'Shortness of breath'],
      longTerm: ['Lung cancer', 'Liver damage', 'Kidney damage', 'Stomach ulcers', 'Allergic reactions'],
      mostVulnerable: ['Chrome plating workers', 'Children', 'People with skin conditions']
    },
    detectionMethods: ['Colorimetric methods', 'AAS', 'ICP-MS', 'Ion chromatography'],
    safeLimits: { WHO: 0.05, EPA: 0.1, unit: 'mg/L' },
    treatment: ['Reduction and precipitation', 'Ion exchange', 'Reverse osmosis'],
    historicalCases: ['Hinkley groundwater contamination', 'Industrial chromium spills', 'Occupational exposure studies']
  }
} as const

// Virtual Lab Simulations Data
const LAB_SIMULATIONS = {
  phTesting: {
    title: 'Interactive pH Testing',
    description: 'Understand how water acidity affects metal mobility'
  },
  contaminationPathway: {
    title: 'Contamination Pathway Simulator',
    description: 'Trace metals from industrial source to your tap',
    steps: [
      'Industrial discharge',
      'Groundwater infiltration', 
      'Distribution system',
      'Household delivery'
    ]
  },
  riskCalculator: {
    title: 'Personal Risk Calculator',
    description: 'Calculate your exposure risk based on consumption and contamination levels'
  },
  treatmentDemo: {
    title: 'Treatment Methods Comparison',
    description: 'Compare effectiveness of different water treatment approaches',
    methods: ['Reverse Osmosis', 'Activated Carbon', 'Ion Exchange', 'Distillation']
  }
}

export default function Education() {
  const [selectedMetal, setSelectedMetal] = useState<string | null>(null)
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['sources']))
  const [simulationStep, setSimulationStep] = useState(0)
  const [personalRisk, setPersonalRisk] = useState({ weight: '', intake: '', level: '', duration: '' })

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const calculatePersonalRisk = () => {
    const { weight, intake, level, duration } = personalRisk
    if (!weight || !intake || !level || !duration) return null
    
    const dailyDose = (parseFloat(level) * parseFloat(intake)) / parseFloat(weight)
    const totalExposure = dailyDose * parseFloat(duration) * 365
    
    return {
      dailyDose: dailyDose.toFixed(4),
      totalExposure: totalExposure.toFixed(2),
      riskLevel: totalExposure > 100 ? 'High' : totalExposure > 50 ? 'Moderate' : 'Low'
    }
  }

  return (
    <div className="main page-container animate-fadeIn">
      {/* Modern Header */}
      <div className="page-header">
        <h1 style={{color: 'var(--text-on-bg)'}}>
          🎓 MetalSense Education Center
        </h1>
        <p style={{color: 'var(--text-on-bg-secondary)'}}>Master the science of heavy metals through interactive learning experiences and virtual laboratory simulations</p>
      </div>

      <div className="grid cols-2">
        {/* Interactive Metal Encyclopedia */}
        <div className="card animate-slideIn">
          <h2 className="flex items-center">
            <Atom className="w-8 h-8 mr-3 text-gradient" />
            🧪 Heavy Metal Encyclopedia
          </h2>
          
          {/* Metal Selection Grid */}
          <div className="grid cols-3" style={{gap: '20px', marginBottom: '32px'}}>
            {Object.entries(METAL_ENCYCLOPEDIA).map(([symbol, data]) => (
              <button
                key={symbol}
                onClick={() => setSelectedMetal(symbol)}
                className={`glass-effect p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 ${
                  selectedMetal === symbol 
                    ? 'shadow-glow border-2 border-blue-400' 
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ 
                      backgroundColor: data.color,
                      boxShadow: `0 8px 32px ${data.color}33`
                    }}
                  >
                    {symbol}
                  </div>
                  <div className="font-bold text-lg" style={{color: 'var(--text-on-glass)'}}>{data.name}</div>
                  <div className="text-sm" style={{color: 'var(--text-muted)'}}>Atomic #{data.atomicNumber}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Metal Information */}
          {selectedMetal && METAL_ENCYCLOPEDIA[selectedMetal as keyof typeof METAL_ENCYCLOPEDIA] && (
            <div className="space-y-4">
              {(() => {
                const metal = METAL_ENCYCLOPEDIA[selectedMetal as keyof typeof METAL_ENCYCLOPEDIA]
                return (
                  <>
                    <div className="glass-effect p-6 rounded-xl mb-6 shadow-lg">
                      <h3 className="text-2xl font-bold mb-3 flex items-center text-gradient">
                        <div 
                          className="w-8 h-8 rounded-full mr-3 shadow-lg"
                          style={{ 
                            backgroundColor: metal.color,
                            boxShadow: `0 4px 16px ${metal.color}44`
                          }}
                        ></div>
                        {metal.name} ({metal.symbol})
                      </h3>
                      <p className="font-medium" style={{color: 'var(--text-on-glass-secondary)'}}>Atomic Number: {metal.atomicNumber}</p>
                    </div>

                    {/* Expandable Sections */}
                    {[
                      { 
                        key: 'sources', 
                        title: 'Common Sources', 
                        icon: <Zap className="w-4 h-4" />,
                        content: (
                          <ul className="space-y-2">
                            {metal.commonSources.map((source, idx) => (
                              <li key={idx} className="flex items-start">
                                <ArrowRight className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{source}</span>
                              </li>
                            ))}
                          </ul>
                        )
                      },
                      {
                        key: 'health',
                        title: 'Health Effects',
                        icon: <Heart className="w-4 h-4" />,
                        content: (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <h5 className="font-semibold text-orange-800 mb-2">Immediate Effects</h5>
                                <ul className="text-sm space-y-1">
                                  {metal.healthEffects.immediate.map((effect, idx) => (
                                    <li key={idx} className="text-orange-700">• {effect}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                <h5 className="font-semibold text-red-800 mb-2">Long-term Risks</h5>
                                <ul className="text-sm space-y-1">
                                  {metal.healthEffects.longTerm.map((effect, idx) => (
                                    <li key={idx} className="text-red-700">• {effect}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                              <h5 className="font-semibold text-purple-800 mb-2">Most Vulnerable Populations</h5>
                              <div className="flex flex-wrap gap-2">
                                {metal.healthEffects.mostVulnerable.map((group, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                    {group}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        key: 'detection',
                        title: 'Detection & Limits',
                        icon: <Microscope className="w-4 h-4" />,
                        content: (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-semibold text-gray-800 mb-2">Detection Methods</h5>
                                <ul className="text-sm space-y-1">
                                  {metal.detectionMethods.map((method, idx) => (
                                    <li key={idx} className="text-gray-700 flex items-center">
                                      <Eye className="w-3 h-3 mr-2 text-blue-500" />
                                      {method}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <h5 className="font-semibold text-green-800 mb-2">Safe Limits</h5>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-green-700">WHO Standard:</span>
                                    <span className="font-semibold">{metal.safeLimits.WHO} {metal.safeLimits.unit}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-green-700">EPA Standard:</span>
                                    <span className="font-semibold">{metal.safeLimits.EPA} {metal.safeLimits.unit}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        key: 'treatment',
                        title: 'Treatment & Prevention',
                        icon: <Shield className="w-4 h-4" />,
                        content: (
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-2">Effective Treatment Methods</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {metal.treatment.map((method, idx) => (
                                  <div key={idx} className="bg-blue-50 p-2 rounded text-center text-sm border border-blue-200">
                                    <Shield className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                                    <span className="text-blue-800">{method}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        key: 'cases',
                        title: 'Historical Cases',
                        icon: <Clock className="w-4 h-4" />,
                        content: (
                          <div className="space-y-2">
                            {metal.historicalCases.map((caseStudy, idx) => (
                              <div key={idx} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <div className="flex items-start">
                                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-yellow-800 text-sm font-medium">{caseStudy}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      }
                    ].map(section => (
                      <div key={section.key} className="glass-effect rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <button
                          onClick={() => toggleSection(section.key)}
                          className="w-full flex items-center justify-between p-6 hover:backdrop-brightness-110 transition-all duration-300 group"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                              {section.icon}
                            </div>
                            <span className="font-bold text-lg" style={{color: 'var(--text-on-glass)'}}>{section.title}</span>
                          </div>
                          <div className="w-8 h-8 rounded-lg glass-effect flex items-center justify-center">
                            {expandedSections.has(section.key) ? 
                              <ChevronDown className="w-5 h-5" /> : 
                              <ChevronRight className="w-5 h-5" />
                            }
                          </div>
                        </button>
                        {expandedSections.has(section.key) && (
                          <div className="px-6 pb-6 animate-fadeIn">
                            <div className="pt-4 border-t border-white/20">
                              {section.content}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )
              })()}
            </div>
          )}

          {!selectedMetal && (
            <div className="text-center py-16 animate-pulse">
              <div className="w-24 h-24 mx-auto mb-6 glass-effect rounded-full flex items-center justify-center">
                <Atom className="w-12 h-12 text-gradient" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'var(--text-on-glass)'}}>Choose Your Element</h3>
              <p className="text-lg" style={{color: 'var(--text-on-glass-secondary)'}}>Select any metal above to unlock comprehensive scientific insights</p>
              <p className="text-sm mt-2" style={{color: 'var(--text-muted)'}}>Discover sources, health impacts, detection methods, and treatment solutions</p>
            </div>
          )}
        </div>

        {/* Virtual Lab Simulations */}
        <div className="card animate-slideInRight">
          <h2 className="flex items-center">
            <Beaker className="w-8 h-8 mr-3 text-gradient" />
            🧪 Virtual Lab Simulations
          </h2>

          {/* Simulation Selection */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px'}}>
            {Object.entries(LAB_SIMULATIONS).map(([key, sim]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveSimulation(key)
                  setSimulationStep(0)
                }}
                className={`glass-effect p-6 rounded-xl transition-all duration-300 text-left hover:scale-[1.02] hover:-translate-y-1 ${
                  activeSimulation === key
                    ? 'shadow-glow border-2 border-green-400'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl mb-2" style={{color: 'var(--text-on-glass)'}}>{sim.title}</h3>
                    <p style={{color: 'var(--text-on-glass-secondary)'}}>{sim.description}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl glass-effect flex items-center justify-center">
                    <Play className="w-6 h-6 text-gradient" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Simulation */}
          {activeSimulation && (
            <div className="glass-effect p-8 rounded-2xl shadow-xl animate-fadeIn">
              <h3 className="font-bold text-2xl mb-6 text-gradient flex items-center">
                🔬 {LAB_SIMULATIONS[activeSimulation as keyof typeof LAB_SIMULATIONS].title}
              </h3>
              
              {/* pH Testing Simulation */}
              {activeSimulation === 'phTesting' && (
                <div>
                  <div className="glass-effect p-6 rounded-xl shadow-lg">
                    <h4 className="font-bold text-xl mb-4 text-gradient">🌡️ pH Testing Simulator</h4>
                    <div className="grid cols-2">
                      <div>
                        <label className="block text-sm font-bold mb-3" style={{color: 'var(--text-on-glass)'}}>Water pH Level:</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="14" 
                          step="0.1" 
                          defaultValue="7"
                          className="w-full h-3 bg-gradient-to-r from-red-500 via-green-500 to-purple-500 rounded-lg appearance-none cursor-pointer"
                          onChange={(e) => {
                            const ph = parseFloat(e.target.value)
                            const indicator = document.getElementById('ph-indicator')
                            if (indicator) {
                              indicator.style.backgroundColor = 
                                ph < 4 ? '#EF4444' : ph < 6 ? '#F97316' : ph < 8 ? '#22C55E' : ph < 10 ? '#3B82F6' : '#8B5CF6'
                              indicator.textContent = ph.toFixed(1)
                            }
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Acidic (0)</span>
                          <span>Neutral (7)</span>
                          <span>Basic (14)</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div 
                          id="ph-indicator" 
                          className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl shadow-xl" 
                          style={{ backgroundColor: '#22C55E', boxShadow: '0 8px 32px #22C55E44' }}
                        >
                          7.0
                        </div>
                        <p className="text-sm font-medium" style={{color: 'var(--text-on-glass-secondary)'}}>Current pH Level</p>
                      </div>
                    </div>
                    <div className="mt-6 p-4 glass-effect rounded-xl border border-blue-400/30">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-white font-bold text-sm">💡</span>
                        </div>
                        <div>
                          <h5 className="font-bold mb-1" style={{color: 'var(--text-on-glass)'}}>Key Learning Point</h5>
                          <p className="text-sm" style={{color: 'var(--text-on-glass-secondary)'}}>
                            Lower pH (acidic water) increases metal mobility, 
                            making heavy metals more bioavailable and dangerous.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Risk Calculator */}
              {activeSimulation === 'riskCalculator' && (
                <div>
                  <div className="glass-effect p-6 rounded-xl shadow-lg">
                    <h4 className="font-bold text-xl mb-4 text-gradient">🧮 Personal Exposure Risk Calculator</h4>
                    <div className="grid cols-2">
                      <div>
                        <label className="block text-sm font-bold mb-2" style={{color: 'var(--text-on-glass)'}}>Body Weight (kg):</label>
                        <input 
                          type="number" 
                          placeholder="70"
                          value={personalRisk.weight}
                          onChange={(e) => setPersonalRisk(prev => ({ ...prev, weight: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2" style={{color: 'var(--text-on-glass)'}}>Daily Water Intake (L):</label>
                        <input 
                          type="number" 
                          placeholder="2.5"
                          value={personalRisk.intake}
                          onChange={(e) => setPersonalRisk(prev => ({ ...prev, intake: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2" style={{color: 'var(--text-on-glass)'}}>Contamination Level (mg/L):</label>
                        <input 
                          type="number" 
                          placeholder="0.02"
                          step="0.001"
                          value={personalRisk.level}
                          onChange={(e) => setPersonalRisk(prev => ({ ...prev, level: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2" style={{color: 'var(--text-on-glass)'}}>Exposure Duration (years):</label>
                        <input 
                          type="number" 
                          placeholder="5"
                          value={personalRisk.duration}
                          onChange={(e) => setPersonalRisk(prev => ({ ...prev, duration: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    {(() => {
                      const result = calculatePersonalRisk()
                      if (result) {
                        return (
                          <div className="mt-6 p-6 glass-effect rounded-xl shadow-lg border border-yellow-400/30">
                            <h5 className="font-bold text-xl mb-4 flex items-center" style={{color: 'var(--text-on-glass)'}}>
                              📈 Risk Assessment Results
                            </h5>
                            <div className="grid cols-3">
                              <div className="glass-effect p-4 rounded-lg text-center">
                                <div className="text-sm mb-1" style={{color: 'var(--text-muted)'}}>Daily Dose</div>
                                <div className="font-bold text-lg" style={{color: 'var(--text-on-glass)'}}>{result.dailyDose}</div>
                                <div className="text-xs" style={{color: 'var(--text-muted)'}}>mg/kg/day</div>
                              </div>
                              <div className="glass-effect p-4 rounded-lg text-center">
                                <div className="text-sm mb-1" style={{color: 'var(--text-muted)'}}>Total Exposure</div>
                                <div className="font-bold text-lg" style={{color: 'var(--text-on-glass)'}}>{result.totalExposure}</div>
                                <div className="text-xs" style={{color: 'var(--text-muted)'}}>mg</div>
                              </div>
                              <div className="glass-effect p-4 rounded-lg text-center">
                                <div className="text-sm mb-1" style={{color: 'var(--text-muted)'}}>Risk Level</div>
                                <div className={`badge text-sm font-bold mt-2 ${
                                  result.riskLevel === 'High' ? 'high' :
                                  result.riskLevel === 'Moderate' ? 'moderate' :
                                  'safe'
                                }`}>
                                  {result.riskLevel}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>
              )}

              {/* Contamination Pathway Simulation */}
              {activeSimulation === 'contaminationPathway' && (
                <div>
                  <div className="glass-effect p-6 rounded-xl shadow-lg">
                    <h4 className="font-bold text-xl mb-4 text-gradient">🌊 Contamination Pathway Tracer</h4>
                    <div className="space-y-3">
                      {LAB_SIMULATIONS.contaminationPathway.steps.map((step, idx) => (
                        <div key={idx} className={`glass-effect p-4 rounded-xl transition-all duration-500 hover:scale-[1.02] ${
                          simulationStep >= idx ? 'shadow-glow border-2 border-blue-400 animate-fadeIn' : 'opacity-60'
                        }`}>
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 font-bold text-lg transition-all duration-500 ${
                              simulationStep >= idx 
                                ? 'bg-gradient-to-br from-blue-400 to-purple-500 text-white shadow-lg' 
                                : 'glass-effect opacity-50'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <span className={`text-lg transition-all duration-300 ${
                                simulationStep >= idx ? 'font-bold' : ''
                              }`} style={{
                                color: simulationStep >= idx ? 'var(--text-on-glass)' : 'var(--text-muted)'
                              }}>
                                {step}
                              </span>
                              {simulationStep >= idx && (
                                <div className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                                  Step {idx + 1} of {LAB_SIMULATIONS.contaminationPathway.steps.length}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => {
                          if (simulationStep < LAB_SIMULATIONS.contaminationPathway.steps.length - 1) {
                            setSimulationStep(prev => prev + 1)
                          } else {
                            setSimulationStep(0)
                          }
                        }}
                        className="button button-primary animate-bounce"
                      >
                        {simulationStep < LAB_SIMULATIONS.contaminationPathway.steps.length - 1 ? '▶️ Next Step' : '🔄 Reset Simulation'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Treatment Methods Demo */}
              {activeSimulation === 'treatmentDemo' && (
                <div>
                  <div className="glass-effect p-6 rounded-xl shadow-lg">
                    <h4 className="font-bold text-xl mb-4 text-gradient">🔌 Treatment Method Effectiveness</h4>
                    <div className="space-y-3">
                      {LAB_SIMULATIONS.treatmentDemo.methods.map((method, idx) => {
                        const effectiveness = [95, 80, 85, 99][idx] // Mock effectiveness percentages
                        const icons = ['🌊', '⚫', '🧪', '💨'][idx]
                        return (
                          <div key={idx} className="glass-effect p-5 rounded-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-3">
                                  <span className="text-white text-lg">{icons}</span>
                                </div>
                                <span className="font-bold text-lg" style={{color: 'var(--text-on-glass)'}}>{method}</span>
                              </div>
                              <div className={`badge ${
                                effectiveness >= 90 ? 'safe' :
                                effectiveness >= 70 ? 'moderate' : 'high'
                              }`}>
                                {effectiveness}% effective
                              </div>
                            </div>
                            <div className="relative w-full h-3 bg-gray-200/50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  effectiveness >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                  effectiveness >= 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                                  'bg-gradient-to-r from-red-400 to-red-600'
                                }`}
                                style={{ width: `${effectiveness}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!activeSimulation && (
            <div className="text-center py-16 animate-pulse">
              <div className="w-24 h-24 mx-auto mb-6 glass-effect rounded-full flex items-center justify-center">
                <Beaker className="w-12 h-12 text-gradient" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'var(--text-on-glass)'}}>Begin Your Virtual Experiment</h3>
              <p className="text-lg" style={{color: 'var(--text-on-glass-secondary)'}}>Choose any simulation above to start interactive learning</p>
              <p className="text-sm mt-2" style={{color: 'var(--text-muted)'}}>Experience hands-on water quality science through virtual laboratory tools</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

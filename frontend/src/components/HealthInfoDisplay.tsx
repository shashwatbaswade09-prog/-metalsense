import React, { useState, useEffect } from 'react'
import { AlertTriangle, Heart, Shield, Clock, TrendingUp, Users, Phone, Info, X, Zap, Activity } from 'lucide-react'
import { Hotspot } from '@state/store'

// CSS animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
  .animate-slideIn { animation: slideIn 0.3s ease-out; }
  .animate-pulse-custom { animation: pulse 2s infinite; }
`

interface HealthInfoDisplayProps {
  hotspot: Hotspot
  onClose?: () => void
  isPopup?: boolean
}

// Health impact data for different metals
const METAL_HEALTH_DATA = {
  'Pb': {
    name: 'Lead',
    shortTerm: ['Headaches', 'Nausea', 'Fatigue', 'Stomach pain'],
    longTerm: ['Neurological damage', 'Kidney problems', 'Reproductive issues', 'Developmental delays'],
    vulnerable: ['Children under 6', 'Pregnant women', 'Elderly'],
    symptoms: ['Memory problems', 'Muscle weakness', 'Joint pain', 'High blood pressure'],
    safetyTips: ['Use bottled water', 'Wash hands frequently', 'Avoid contact with soil'],
    emergencyLevel: 'high'
  },
  'Hg': {
    name: 'Mercury',
    shortTerm: ['Skin irritation', 'Cough', 'Chest tightness', 'Breathing difficulty'],
    longTerm: ['Brain damage', 'Kidney damage', 'Vision problems', 'Motor skill impairment'],
    vulnerable: ['Pregnant women', 'Children', 'People with respiratory conditions'],
    symptoms: ['Tremors', 'Memory loss', 'Insomnia', 'Mood changes'],
    safetyTips: ['Evacuate if possible', 'Seek immediate medical attention', 'Do not touch contaminated areas'],
    emergencyLevel: 'critical'
  },
  'As': {
    name: 'Arsenic',
    shortTerm: ['Stomach pain', 'Vomiting', 'Diarrhea', 'Skin changes'],
    longTerm: ['Cancer risk', 'Cardiovascular disease', 'Diabetes', 'Neurological effects'],
    vulnerable: ['Children', 'Pregnant women', 'Immunocompromised individuals'],
    symptoms: ['Dark spots on skin', 'White lines on nails', 'Persistent cough'],
    safetyTips: ['Do not consume local water', 'Avoid eating local produce', 'Wear protective clothing'],
    emergencyLevel: 'high'
  },
  'Cd': {
    name: 'Cadmium',
    shortTerm: ['Cough', 'Chest pain', 'Flu-like symptoms', 'Metallic taste'],
    longTerm: ['Lung damage', 'Kidney disease', 'Bone weakness', 'Cancer risk'],
    vulnerable: ['Smokers', 'Workers in metal industries', 'Elderly'],
    symptoms: ['Shortness of breath', 'Joint pain', 'Loss of smell', 'Yellow teeth staining'],
    safetyTips: ['Avoid inhalation', 'Use respiratory protection', 'Limit exposure time'],
    emergencyLevel: 'moderate'
  },
  'Cr': {
    name: 'Chromium',
    shortTerm: ['Skin rash', 'Eye irritation', 'Nose bleeding', 'Cough'],
    longTerm: ['Lung cancer', 'Liver damage', 'Kidney damage', 'Stomach ulcers'],
    vulnerable: ['Workers in chrome plating', 'Children', 'People with skin conditions'],
    symptoms: ['Skin ulcers', 'Respiratory problems', 'Allergic reactions'],
    safetyTips: ['Wear gloves', 'Use face mask', 'Avoid skin contact'],
    emergencyLevel: 'moderate'
  },
  'Cu': {
    name: 'Copper',
    shortTerm: ['Nausea', 'Vomiting', 'Stomach cramps', 'Diarrhea'],
    longTerm: ['Liver damage', 'Wilson disease symptoms', 'Brain damage'],
    vulnerable: ['People with Wilson disease', 'Children', 'Pregnant women'],
    symptoms: ['Metallic taste', 'Blue-green discoloration of skin', 'Jaundice'],
    safetyTips: ['Use alternative water source', 'Monitor symptoms closely', 'Seek medical advice'],
    emergencyLevel: 'low'
  },
  'Fe': {
    name: 'Iron',
    shortTerm: ['Stomach upset', 'Constipation', 'Nausea', 'Dark stools'],
    longTerm: ['Organ damage', 'Heart problems', 'Diabetes', 'Joint pain'],
    vulnerable: ['Children', 'People with hemochromatosis', 'Elderly'],
    symptoms: ['Fatigue', 'Joint pain', 'Bronze skin coloration'],
    safetyTips: ['Monitor intake levels', 'Regular health checkups', 'Balanced diet'],
    emergencyLevel: 'low'
  },
  'Mn': {
    name: 'Manganese',
    shortTerm: ['Cough', 'Bronchitis', 'Pneumonia', 'Tremors'],
    longTerm: ['Parkinson-like symptoms', 'Learning difficulties', 'Memory problems'],
    vulnerable: ['Welders', 'Miners', 'Children', 'Elderly'],
    symptoms: ['Tremors', 'Difficulty walking', 'Facial muscle spasms'],
    safetyTips: ['Avoid inhalation', 'Use protective equipment', 'Limit exposure time'],
    emergencyLevel: 'moderate'
  },
  'Ni': {
    name: 'Nickel',
    shortTerm: ['Skin rash', 'Allergic reactions', 'Asthma attacks', 'Dermatitis'],
    longTerm: ['Lung cancer', 'Nasal cancer', 'Chronic lung disease'],
    vulnerable: ['People with nickel allergies', 'Jewelry wearers', 'Industrial workers'],
    symptoms: ['Skin discoloration', 'Itching', 'Respiratory problems'],
    safetyTips: ['Avoid skin contact', 'Use hypoallergenic products', 'Seek allergy testing'],
    emergencyLevel: 'moderate'
  },
  'Zn': {
    name: 'Zinc',
    shortTerm: ['Nausea', 'Vomiting', 'Loss of appetite', 'Stomach cramps'],
    longTerm: ['Copper deficiency', 'Reduced immune function', 'HDL cholesterol reduction'],
    vulnerable: ['People taking zinc supplements', 'Children', 'Elderly'],
    symptoms: ['Metallic taste', 'Reduced sense of taste and smell'],
    safetyTips: ['Monitor supplement intake', 'Balanced nutrition', 'Medical consultation'],
    emergencyLevel: 'low'
  }
} as const

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200'
    case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    default: return 'text-green-600 bg-green-50 border-green-200'
  }
}

const getEmergencyColor = (level: string) => {
  switch (level) {
    case 'critical': return 'text-red-700 bg-red-100'
    case 'high': return 'text-red-600 bg-red-50'
    case 'moderate': return 'text-yellow-600 bg-yellow-50'
    default: return 'text-green-600 bg-green-50'
  }
}

const getTrendIcon = (value: number) => {
  if (value > 70) return { icon: TrendingUp, color: 'text-red-500', label: 'Increasing ⬆️' }
  if (value > 40) return { icon: TrendingUp, color: 'text-yellow-500', label: 'Stable ➡️' }
  return { icon: TrendingUp, color: 'text-green-500', label: 'Decreasing ⬇️' }
}

export default function HealthInfoDisplay({ hotspot, onClose, isPopup = false }: HealthInfoDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'safety'>('overview')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showQuickInfo, setShowQuickInfo] = useState(true)
  
  const healthData = METAL_HEALTH_DATA[hotspot.metal] || {
    name: hotspot.metal,
    shortTerm: ['Contact local health department'],
    longTerm: ['Unknown long-term effects'],
    vulnerable: ['General population'],
    symptoms: ['Monitor for unusual symptoms'],
    safetyTips: ['Exercise caution', 'Seek medical advice'],
    emergencyLevel: 'moderate' as const
  }

  const trend = getTrendIcon(hotspot.value)
  const daysAgo = Math.floor((Date.now() - hotspot.updatedAt) / (1000 * 60 * 60 * 24))

  const handleTabChange = (tab: 'overview' | 'health' | 'safety') => {
    setIsAnimating(true)
    setTimeout(() => {
      setActiveTab(tab)
      setIsAnimating(false)
    }, 150)
  }

  useEffect(() => {
    // Inject styles
    const styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)
    
    const timer = setTimeout(() => setShowQuickInfo(false), 3000)
    return () => {
      clearTimeout(timer)
      document.head.removeChild(styleSheet)
    }
  }, [])

  const getRiskGradient = (risk: string) => {
    switch (risk) {
      case 'high': return 'from-red-500 to-red-600'
      case 'moderate': return 'from-yellow-500 to-orange-500'
      default: return 'from-green-500 to-green-600'
    }
  }

  const containerClass = isPopup 
    ? "bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden z-50 transform transition-all duration-300 hover:scale-[1.02]"
    : "bg-white"

  if (showQuickInfo) {
    return (
      <div className={containerClass} onClick={() => setShowQuickInfo(false)}>
        {/* Quick Info Card */}
        <div className={`relative bg-gradient-to-br ${getRiskGradient(hotspot.risk)} p-6 text-white cursor-pointer group`}>
          <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{healthData.name}</h3>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-lg font-semibold">{hotspot.value.toFixed(1)} mg/L</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  {hotspot.risk.toUpperCase()}
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>{trend.label}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <AlertTriangle className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs opacity-90">{healthData.emergencyLevel.toUpperCase()}</div>
              </div>
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs opacity-90">
                  {hotspot.risk === 'high' ? '12 affected' : hotspot.risk === 'moderate' ? '3 affected' : 'Safe'}
                </div>
              </div>
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs opacity-90">
                  {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Tap for detailed health information</p>
              <div className="animate-bounce">
                <div className="w-2 h-2 bg-white rounded-full mx-auto"></div>
              </div>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="absolute top-4 right-4 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      {/* Modern Header */}
      <div className={`relative bg-gradient-to-br ${getRiskGradient(hotspot.risk)} p-4 text-white`}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">{healthData.name} Contamination</h3>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4" />
                <span className="text-xl font-bold">{hotspot.value.toFixed(1)} mg/L</span>
              </div>
              <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
                {hotspot.risk.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-sm mb-1">
              <trend.icon className="w-4 h-4" />
              <span>{trend.label}</span>
            </div>
            <div className="text-xs opacity-90">
              Updated {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-2 right-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex bg-gray-50">
        {[
          { id: 'overview', label: 'Quick View', icon: Info, color: 'blue' },
          { id: 'health', label: 'Health', icon: Heart, color: 'red' },
          { id: 'safety', label: 'Safety', icon: Shield, color: 'green' }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex-1 px-3 py-4 text-sm font-medium transition-all duration-300 relative group ${
                activeTab === tab.id
                  ? `text-${tab.color}-600 bg-white shadow-sm transform scale-105`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icon className={`w-5 h-5 transition-all duration-300 ${
                  activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                <span>{tab.label}</span>
              </div>
              {activeTab === tab.id && (
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-${tab.color}-500 rounded-t-full`}></div>
              )}
            </button>
          )
        })}
      </div>

      {/* Animated Content */}
      <div className="bg-white">
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
          <div className="p-4 max-h-80 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:scale-105 ${
                    healthData.emergencyLevel === 'critical' ? 'border-red-300 bg-red-50' :
                    healthData.emergencyLevel === 'high' ? 'border-orange-300 bg-orange-50' :
                    healthData.emergencyLevel === 'moderate' ? 'border-yellow-300 bg-yellow-50' :
                    'border-green-300 bg-green-50'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${
                        healthData.emergencyLevel === 'critical' ? 'text-red-500' :
                        healthData.emergencyLevel === 'high' ? 'text-orange-500' :
                        healthData.emergencyLevel === 'moderate' ? 'text-yellow-500' :
                        'text-green-500'
                      }`} />
                      <span className="text-sm font-medium">Risk Level</span>
                    </div>
                    <p className={`text-lg font-bold ${
                      healthData.emergencyLevel === 'critical' ? 'text-red-700' :
                      healthData.emergencyLevel === 'high' ? 'text-orange-700' :
                      healthData.emergencyLevel === 'moderate' ? 'text-yellow-700' :
                      'text-green-700'
                    }`}>
                      {healthData.emergencyLevel.toUpperCase()}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium">Community</span>
                    </div>
                    <p className="text-lg font-bold text-purple-700">
                      {hotspot.risk === 'high' ? '12 Affected' :
                       hotspot.risk === 'moderate' ? '3 Affected' : 'Safe'}
                    </p>
                  </div>
                </div>

                {/* Key Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Suspected Source</span>
                    <span className="text-sm font-bold text-gray-900">
                      {hotspot.value > 70 ? '🏭 Industrial discharge' :
                       hotspot.value > 40 ? '🌧️ Urban runoff' : '🌿 Natural occurrence'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Health Advisory</span>
                    <span className="text-sm font-bold text-gray-900">
                      {hotspot.risk === 'high' ? '🚨 High Alert' :
                       hotspot.risk === 'moderate' ? '⚠️ Monitor' : '✅ Routine'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'health' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Health Effects */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                    <h5 className="font-bold text-orange-800 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Immediate Effects
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {healthData.shortTerm.slice(0, 4).map((effect, idx) => (
                        <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full border border-orange-200 hover:bg-orange-200 transition-colors cursor-default">
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                    <h5 className="font-bold text-red-800 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Long-term Risks
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {healthData.longTerm.slice(0, 4).map((risk, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full border border-red-200 hover:bg-red-200 transition-colors cursor-default">
                          {risk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vulnerable Groups */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-bold text-blue-800 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Most at Risk
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {healthData.vulnerable.map((group, idx) => (
                      <span key={idx} className="px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200 hover:bg-blue-200 transition-colors cursor-default">
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Safety Steps */}
                <div className="space-y-3">
                  {healthData.safetyTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all duration-300 hover:scale-[1.02] cursor-default">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="text-sm text-green-800 font-medium">{tip}</div>
                    </div>
                  ))}
                </div>

                {/* Emergency Section */}
                {hotspot.risk === 'high' && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center space-x-2 mb-3">
                      <Phone className="w-5 h-5 text-red-600" />
                      <h4 className="font-bold text-red-800">Emergency Contacts</h4>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Health Dept', number: '(555) 123-4567', href: 'tel:+15551234567' },
                        { label: 'Poison Control', number: '1-800-222-1222', href: 'tel:+18002221222' },
                        { label: 'Emergency', number: '911', href: 'tel:911' }
                      ].map((contact, idx) => (
                        <a key={idx} href={contact.href} className="flex justify-between items-center p-2 bg-white rounded-lg hover:bg-red-50 transition-colors group">
                          <span className="text-red-700 font-medium">{contact.label}</span>
                          <span className="text-red-800 font-bold group-hover:underline">{contact.number}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react';
import { Play, FileText, Calculator, AlertTriangle } from 'lucide-react';

// Simplified test data analysis that works without external services
const SimpleTestDemo: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const testScenarios = [
    {
      name: "Clean Water - Mumbai Marine Drive",
      location: "Mumbai Marine Drive Beach",
      metals: [
        { symbol: "As", name: "Arsenic", concentration: 0.002, whoLimit: 0.01 },
        { symbol: "Cd", name: "Cadmium", concentration: 0.001, whoLimit: 0.003 },
        { symbol: "Cr", name: "Chromium", concentration: 0.01, whoLimit: 0.05 },
        { symbol: "Pb", name: "Lead", concentration: 0.005, whoLimit: 0.01 }
      ],
      expectedRisk: "Low Risk"
    },
    {
      name: "Moderate Contamination - Delhi Industrial",
      location: "Industrial Area, New Delhi", 
      metals: [
        { symbol: "As", name: "Arsenic", concentration: 0.015, whoLimit: 0.01 },
        { symbol: "Cd", name: "Cadmium", concentration: 0.005, whoLimit: 0.003 },
        { symbol: "Cr", name: "Chromium", concentration: 0.08, whoLimit: 0.05 },
        { symbol: "Pb", name: "Lead", concentration: 0.025, whoLimit: 0.01 }
      ],
      expectedRisk: "Medium to High Risk"
    },
    {
      name: "Severe Contamination - Jharkhand Mining",
      location: "Mining Site, Ranchi, Jharkhand",
      metals: [
        { symbol: "As", name: "Arsenic", concentration: 0.05, whoLimit: 0.01 },
        { symbol: "Cd", name: "Cadmium", concentration: 0.015, whoLimit: 0.003 },
        { symbol: "Cr", name: "Chromium", concentration: 0.2, whoLimit: 0.05 },
        { symbol: "Pb", name: "Lead", concentration: 0.08, whoLimit: 0.01 },
        { symbol: "Hg", name: "Mercury", concentration: 0.008, whoLimit: 0.006 },
        { symbol: "Zn", name: "Zinc", concentration: 8.0, whoLimit: 3.0 }
      ],
      expectedRisk: "Critical Risk"
    }
  ];

  const calculateHPI = (metals: any[]) => {
    let sumWeightedQuality = 0;
    let sumWeights = 0;

    metals.forEach(metal => {
      const weight = 1 / metal.whoLimit; // Wi = k/Si where k=1
      const quality = 100 * (metal.concentration - 0) / (metal.whoLimit - 0); // Qi calculation
      sumWeightedQuality += weight * Math.max(0, quality);
      sumWeights += weight;
    });

    return sumWeights > 0 ? sumWeightedQuality / sumWeights : 0;
  };

  const calculateMEI = (metals: any[]) => {
    const totalCF = metals.reduce((sum, metal) => sum + (metal.concentration / metal.whoLimit), 0);
    return totalCF / metals.length;
  };

  const calculateHazardIndex = (metals: any[]) => {
    // Simplified HI calculation using reference doses
    const referenceDoses: Record<string, number> = {
      'As': 0.0003, 'Cd': 0.001, 'Cr': 0.003, 'Pb': 0.0036, 'Hg': 0.0003, 'Zn': 0.3
    };
    
    return metals.reduce((sum, metal) => {
      const rfd = referenceDoses[metal.symbol] || 0.001;
      const cdi = (metal.concentration * 2.0 * 365 * 30) / (70 * 365 * 30); // Simplified CDI
      return sum + (cdi / rfd);
    }, 0);
  };

  // NEW: Calculate Carcinogenic Risk
  const calculateCarcinogenicRisk = (metals: any[]) => {
    const slopeFactors: Record<string, number> = {
      'As': 1.5, 'Cd': 6.3, 'Cr': 42.0, 'Ni': 1.7, 'Pb': 0.0085
    };
    
    return metals.reduce((totalRisk, metal) => {
      const sf = slopeFactors[metal.symbol];
      if (sf) {
        const cdi = (metal.concentration * 2.0 * 365 * 30) / (70 * 365 * 30);
        return totalRisk + (cdi * sf);
      }
      return totalRisk;
    }, 0);
  };

  // NEW: Human Health Risk Assessment
  const assessHumanHealthRisk = (hpi: number, hi: number, carcinogenicRisk: number) => {
    let safetyLevel: string;
    let recommendation: string;
    let color: string;
    
    if (hpi > 100 || hi > 10 || carcinogenicRisk > 0.001) {
      safetyLevel = "UNSAFE FOR LIVING";
      recommendation = "Immediate evacuation recommended. Long-term residence poses severe health risks.";
      color = "text-red-700 bg-red-100";
    } else if (hpi > 75 || hi > 1.0 || carcinogenicRisk > 0.0001) {
      safetyLevel = "HIGH RISK - NOT RECOMMENDED";
      recommendation = "Area unsuitable for permanent residence. Short-term exposure should be minimized.";
      color = "text-red-600 bg-red-50";
    } else if (hpi > 50 || hi > 0.5 || carcinogenicRisk > 0.00001) {
      safetyLevel = "MODERATE RISK - CAUTION ADVISED";
      recommendation = "Suitable for residence with water treatment. Regular health monitoring recommended.";
      color = "text-yellow-600 bg-yellow-50";
    } else {
      safetyLevel = "SAFE FOR LIVING";
      recommendation = "Area is safe for permanent residence. Water quality meets safety standards.";
      color = "text-green-600 bg-green-50";
    }
    
    return { safetyLevel, recommendation, color };
  };

  // NEW: Predict Probable Diseases
  const predictDiseases = (metals: any[], carcinogenicRisk: number, hi: number) => {
    const diseases: string[] = [];
    const diseaseRisk: Record<string, string[]> = {
      'As': ['Skin cancer', 'Lung cancer', 'Bladder cancer', 'Peripheral neuropathy', 'Skin lesions'],
      'Cd': ['Kidney disease', 'Lung cancer', 'Prostate cancer', 'Bone disease', 'Emphysema'],
      'Cr': ['Lung cancer', 'Nasal cancer', 'Skin ulcers', 'Respiratory problems', 'Kidney damage'],
      'Pb': ['Neurological disorders', 'Developmental delays', 'Hypertension', 'Kidney disease', 'Anemia'],
      'Hg': ['Neurological damage', 'Kidney damage', 'Developmental disorders', 'Memory loss', 'Tremors'],
      'Zn': ['Gastrointestinal issues', 'Immune dysfunction', 'Copper deficiency', 'Nausea']
    };

    // Add diseases based on metal concentrations exceeding WHO limits
    metals.forEach(metal => {
      if (metal.concentration > metal.whoLimit * 2) { // 2x WHO limit threshold
        const metalDiseases = diseaseRisk[metal.symbol] || [];
        metalDiseases.forEach(disease => {
          if (!diseases.includes(disease)) {
            diseases.push(disease);
          }
        });
      }
    });

    // Add general risk categories
    if (carcinogenicRisk > 0.0001) {
      diseases.push('Increased cancer risk (multiple types)');
    }
    if (hi > 1.0) {
      diseases.push('Chronic toxicity effects');
      diseases.push('Immune system dysfunction');
    }
    if (hi > 5.0) {
      diseases.push('Acute poisoning symptoms');
      diseases.push('Organ failure risk');
    }

    return diseases.length > 0 ? diseases : ['No significant health risks identified'];
  };

  const runAnalysis = () => {
    setShowResults(true);
  };

  const currentScenario = testScenarios[selectedScenario];
  const hpi = calculateHPI(currentScenario.metals);
  const mei = calculateMEI(currentScenario.metals);  
  const hazardIndex = calculateHazardIndex(currentScenario.metals);
  const carcinogenicRisk = calculateCarcinogenicRisk(currentScenario.metals);
  const healthRisk = assessHumanHealthRisk(hpi, hazardIndex, carcinogenicRisk);
  const predictedDiseases = predictDiseases(currentScenario.metals, carcinogenicRisk, hazardIndex);

  const getHPIClassification = (value: number) => {
    if (value < 25) return { class: "Excellent", color: "text-green-600", bg: "bg-green-50" };
    if (value < 50) return { class: "Good", color: "text-green-600", bg: "bg-green-50" };
    if (value < 75) return { class: "Poor", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (value < 100) return { class: "Very Poor", color: "text-red-600", bg: "bg-red-50" };
    return { class: "Unsuitable", color: "text-red-700", bg: "bg-red-100" };
  };

  const getMEIClassification = (value: number) => {
    if (value < 0.5) return { class: "Low contamination", color: "text-green-600", bg: "bg-green-50" };
    if (value < 1.0) return { class: "Moderate contamination", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (value < 2.0) return { class: "Considerable contamination", color: "text-red-600", bg: "bg-red-50" };
    return { class: "Very high contamination", color: "text-red-700", bg: "bg-red-100" };
  };

  const getHIClassification = (value: number) => {
    if (value < 0.1) return { class: "No significant risk", color: "text-green-600", bg: "bg-green-50" };
    if (value < 1.0) return { class: "Low risk", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { class: "High risk - Action required", color: "text-red-700", bg: "bg-red-100" };
  };

  const hpiClass = getHPIClassification(hpi);
  const meiClass = getMEIClassification(mei);
  const hiClass = getHIClassification(hazardIndex);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🧪 Test Data Analysis Demo</h1>
        <p>Live demonstration of environmental risk calculations with your sample data</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-6">Select Test Scenario</h2>
        
        <div className="mb-6">
          <select 
            value={selectedScenario} 
            onChange={(e) => setSelectedScenario(Number(e.target.value))}
            className="input w-full max-w-md"
          >
            {testScenarios.map((scenario, index) => (
              <option key={index} value={index}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">{currentScenario.name}</h3>
          <p className="text-sm text-gray-600 mb-3">📍 {currentScenario.location}</p>
          <p className="text-sm mb-3"><strong>Expected Result:</strong> {currentScenario.expectedRisk}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentScenario.metals.map((metal, idx) => {
              const exceedsLimit = metal.concentration > metal.whoLimit;
              const ratio = metal.concentration / metal.whoLimit;
              
              return (
                <div key={idx} className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{metal.symbol}</span>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        ratio >= 2 ? 'bg-red-500' :
                        exceedsLimit ? 'bg-orange-500' : 
                        'bg-green-500'
                      }`}></div>
                      <span className={`ml-2 text-xs font-medium ${
                        ratio >= 2 ? 'text-red-600' :
                        exceedsLimit ? 'text-orange-600' : 
                        'text-green-600'
                      }`}>
                        {ratio >= 2 ? 'CRITICAL' :
                         exceedsLimit ? 'HIGH' : 
                         'SAFE'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="font-medium">{metal.concentration} mg/L</div>
                    <div className={metal.concentration > metal.whoLimit ? 'text-red-600' : 'text-green-600'}>
                      {(metal.concentration / metal.whoLimit * 100).toFixed(0)}% of WHO limit
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={runAnalysis}
          className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          <Play className="w-5 h-5 mr-2" />
          Run Environmental Analysis
        </button>
      </div>

      {showResults && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">📊 Analysis Results</h2>
          
          {/* Key Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-lg ${hpiClass.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Heavy Metal Pollution Index</h3>
                <Calculator className={`w-4 h-4 ${hpiClass.color}`} />
              </div>
              <p className={`text-2xl font-bold ${hpiClass.color}`}>
                {hpi.toFixed(1)}
              </p>
              <p className={`text-xs ${hpiClass.color}`}>{hpiClass.class}</p>
            </div>

            <div className={`p-4 rounded-lg ${meiClass.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Metal Evaluation Index</h3>
                <Calculator className={`w-4 h-4 ${meiClass.color}`} />
              </div>
              <p className={`text-2xl font-bold ${meiClass.color}`}>
                {mei.toFixed(2)}
              </p>
              <p className={`text-xs ${meiClass.color}`}>{meiClass.class}</p>
            </div>

            <div className={`p-4 rounded-lg ${hiClass.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Hazard Index (Non-Carcinogenic)</h3>
                <AlertTriangle className={`w-4 h-4 ${hiClass.color}`} />
              </div>
              <p className={`text-2xl font-bold ${hiClass.color}`}>
                {hazardIndex.toFixed(2)}
              </p>
              <p className={`text-xs ${hiClass.color}`}>{hiClass.class}</p>
            </div>

            <div className={`p-4 rounded-lg ${carcinogenicRisk > 0.001 ? 'bg-red-100' : carcinogenicRisk > 0.0001 ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Carcinogenic Risk</h3>
                <AlertTriangle className={`w-4 h-4 ${carcinogenicRisk > 0.001 ? 'text-red-600' : carcinogenicRisk > 0.0001 ? 'text-yellow-600' : 'text-green-600'}`} />
              </div>
              <p className={`text-xl font-bold ${carcinogenicRisk > 0.001 ? 'text-red-600' : carcinogenicRisk > 0.0001 ? 'text-yellow-600' : 'text-green-600'}`}>
                {carcinogenicRisk.toExponential(2)}
              </p>
              <p className={`text-xs ${carcinogenicRisk > 0.001 ? 'text-red-600' : carcinogenicRisk > 0.0001 ? 'text-yellow-600' : 'text-green-600'}`}>
                {carcinogenicRisk > 0.001 ? 'High Risk' : carcinogenicRisk > 0.0001 ? 'Moderate Risk' : 'Low Risk'}
              </p>
            </div>
          </div>

          {/* 1. HUMAN HEALTH RISK ASSESSMENT */}
          <div className={`p-6 rounded-lg border-2 mb-6 ${healthRisk.color} border-current`}>
            <h3 className="text-xl font-bold mb-4">🏠 Human Health Risk Assessment for Living</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Safety Status:</h4>
                <p className="text-2xl font-bold mb-3">{healthRisk.safetyLevel}</p>
                <p className="text-sm">{healthRisk.recommendation}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Risk Factors:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Pollution Index: {hpi.toFixed(1)} ({hpiClass.class})</li>
                  <li>• Non-carcinogenic Risk: {hazardIndex.toFixed(2)} ({hiClass.class})</li>
                  <li>• Carcinogenic Risk: {carcinogenicRisk.toExponential(2)}</li>
                  <li>• Metal Contamination: {meiClass.class}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. NON-CARCINOGENIC RISK ASSESSMENT */}
          <div className={`p-6 rounded-lg mb-6 ${hiClass.bg}`}>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <AlertTriangle className={`w-6 h-6 mr-2 ${hiClass.color}`} />
              Non-Carcinogenic Risk Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Hazard Index (HI):</h4>
                <p className={`text-3xl font-bold ${hiClass.color}`}>{hazardIndex.toFixed(3)}</p>
                <p className={`text-sm ${hiClass.color}`}>
                  {hazardIndex < 1 ? 'No significant risk' : hazardIndex < 5 ? 'Moderate to high risk' : 'Severe risk - immediate action required'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Risk Level:</h4>
                <p className={`font-medium ${hiClass.color}`}>{hiClass.class}</p>
                <div className="mt-2 text-xs bg-white p-2 rounded">
                  <strong>Formula:</strong> HI = Σ(CDI/RfD)
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Health Effects:</h4>
                <ul className="text-sm space-y-1">
                  {hazardIndex > 10 && <li>• Acute toxicity symptoms</li>}
                  {hazardIndex > 5 && <li>• Organ system damage</li>}
                  {hazardIndex > 1 && <li>• Chronic health effects</li>}
                  {hazardIndex <= 1 && <li>• No adverse effects expected</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* 3. CARCINOGENIC RISK ASSESSMENT */}
          <div className={`p-6 rounded-lg mb-6 ${carcinogenicRisk > 0.001 ? 'bg-red-50' : carcinogenicRisk > 0.0001 ? 'bg-yellow-50' : 'bg-green-50'}`}>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <AlertTriangle className={`w-6 h-6 mr-2 ${carcinogenicRisk > 0.001 ? 'text-red-600' : carcinogenicRisk > 0.0001 ? 'text-yellow-600' : 'text-green-600'}`} />
              Carcinogenic Risk Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Cancer Risk:</h4>
                <p className={`text-2xl font-bold ${carcinogenicRisk > 0.001 ? 'text-red-600' : carcinogenicRisk > 0.0001 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {carcinogenicRisk.toExponential(2)}
                </p>
                <p className="text-sm text-gray-600">Lifetime cancer risk</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Risk Interpretation:</h4>
                <p className={`font-medium ${carcinogenicRisk > 0.001 ? 'text-red-600' : carcinogenicRisk > 0.0001 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {carcinogenicRisk > 0.001 ? 'Unacceptable Risk' : 
                   carcinogenicRisk > 0.0001 ? 'Moderate Risk' : 
                   carcinogenicRisk > 0.000001 ? 'Low Risk' : 'Negligible Risk'}
                </p>
                <div className="mt-2 text-xs bg-white p-2 rounded">
                  <strong>Formula:</strong> CR = CDI × SF
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cancer Types:</h4>
                <ul className="text-sm space-y-1">
                  {currentScenario.metals.some(m => m.symbol === 'As' && m.concentration > m.whoLimit) && 
                    <li>• Skin, lung, bladder cancer</li>}
                  {currentScenario.metals.some(m => m.symbol === 'Cd' && m.concentration > m.whoLimit) && 
                    <li>• Lung, prostate cancer</li>}
                  {currentScenario.metals.some(m => m.symbol === 'Cr' && m.concentration > m.whoLimit) && 
                    <li>• Lung, nasal cancer</li>}
                  {carcinogenicRisk <= 0.000001 && <li>• No significant cancer risk</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* 4. DISEASE PREDICTION */}
          <div className="p-6 rounded-lg mb-6 bg-purple-50 border border-purple-200">
            <h3 className="text-xl font-bold mb-4 text-purple-800">🩺 Predicted Health Issues & Diseases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-purple-700">Probable Diseases:</h4>
                <div className="space-y-2">
                  {predictedDiseases.map((disease, idx) => (
                    <div key={idx} className={`p-2 rounded text-sm ${
                      disease.includes('cancer') || disease.includes('failure') || disease.includes('poisoning') ? 
                      'bg-red-100 text-red-800' : 
                      disease.includes('No significant') ? 
                      'bg-green-100 text-green-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      • {disease}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-purple-700">Risk Timeline:</h4>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-yellow-400 pl-3">
                    <strong>Short-term (1-6 months):</strong><br/>
                    {hazardIndex > 5 ? 'Acute symptoms, nausea, skin irritation' : 'No immediate symptoms expected'}
                  </div>
                  <div className="border-l-4 border-orange-400 pl-3">
                    <strong>Medium-term (6 months - 5 years):</strong><br/>
                    {hazardIndex > 1 ? 'Chronic fatigue, organ stress, immune dysfunction' : 'Minimal health impact'}
                  </div>
                  <div className="border-l-4 border-red-400 pl-3">
                    <strong>Long-term (5+ years):</strong><br/>
                    {carcinogenicRisk > 0.0001 ? 'Increased cancer risk, organ damage, neurological effects' : 'No long-term health risks'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Metal Analysis */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Individual Metal Risk Assessment</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Metal</th>
                    <th>Concentration</th>
                    <th>WHO Standard</th>
                    <th>Ratio (C/S)</th>
                    <th>Quality Rating</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentScenario.metals.map((metal, idx) => {
                    const ratio = metal.concentration / metal.whoLimit;
                    const qualityRating = Math.max(0, 100 * (metal.concentration - 0) / (metal.whoLimit - 0));
                    const exceeds = metal.concentration > metal.whoLimit;
                    
                    return (
                      <tr key={idx}>
                        <td className="font-medium">{metal.name} ({metal.symbol})</td>
                        <td>{metal.concentration} mg/L</td>
                        <td>{metal.whoLimit} mg/L</td>
                        <td className={ratio > 1 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                          {ratio.toFixed(2)}
                        </td>
                        <td>{qualityRating.toFixed(1)}%</td>
                        <td>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            exceeds ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {exceeds ? `${ratio.toFixed(1)}x Limit` : 'Within Limit'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formula Documentation */}
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">📐 Applied Environmental & Health Risk Formulas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <strong>Heavy Metal Pollution Index (HPI):</strong>
                <code className="block bg-white p-2 rounded mt-1">
                  HPI = Σ(Wi × Qi) / Σ(Wi) = {hpi.toFixed(2)}
                </code>
                <p className="text-xs text-gray-600 mt-1">
                  Where Wi = relative weight (1/standard), Qi = quality rating
                </p>
              </div>
              
              <div>
                <strong>Metal Evaluation Index (MEI):</strong>
                <code className="block bg-white p-2 rounded mt-1">
                  MEI = Σ(Ci/Si) / n = {mei.toFixed(3)}
                </code>
                <p className="text-xs text-gray-600 mt-1">
                  Average contamination factor across all metals
                </p>
              </div>
              
              <div>
                <strong>Non-Carcinogenic Hazard Index (HI):</strong>
                <code className="block bg-white p-2 rounded mt-1">
                  HI = Σ(CDI/RfD) = {hazardIndex.toFixed(3)}
                </code>
                <p className="text-xs text-gray-600 mt-1">
                  CDI = (C × IR × EF × ED) / (BW × AT)
                </p>
              </div>
              
              <div>
                <strong>Carcinogenic Risk (CR):</strong>
                <code className="block bg-white p-2 rounded mt-1">
                  CR = CDI × SF = {carcinogenicRisk.toExponential(2)}
                </code>
                <p className="text-xs text-gray-600 mt-1">
                  Where SF = slope factor (cancer potency)
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded border">
              <h4 className="font-semibold mb-2">Health Risk Assessment Parameters:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div><strong>IR:</strong> 2.0 L/day (intake rate)</div>
                <div><strong>EF:</strong> 365 days/year (exposure frequency)</div>
                <div><strong>ED:</strong> 30 years (exposure duration)</div>
                <div><strong>BW:</strong> 70 kg (body weight)</div>
              </div>
            </div>
          </div>

          {/* Generate Report Button */}
          <div className="mt-6 text-center">
            <button className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium mx-auto">
              <FileText className="w-5 h-5 mr-2" />
              Generate Complete Research Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTestDemo;

// Environmental calculations service that connects to Python microservice
export interface HeavyMetalData {
  name: string;
  concentration: number;
  standard: number;
  ideal?: number;
  weight?: number;
  reference_dose?: number;  // RfD for non-carcinogenic risk
  slope_factor?: number;    // SF for carcinogenic risk
  exposure_duration?: number;  // years
  body_weight?: number;    // kg (default adult)
  intake_rate?: number;     // L/day (default water intake)
}

export interface EnvironmentalDataPoint {
  latitude: number;
  longitude: number;
  metals: HeavyMetalData[];
  sample_date?: string;
  sample_id?: string;
}

export interface HPIResult {
  hpi_value: number;
  classification: string;
  individual_ratings: Record<string, number>;
  risk_level: string;
}

export interface MEIResult {
  mei_value: number;
  classification: string;
  contamination_factors: Record<string, number>;
}

export interface MetalIndexResult {
  mi_value: number;
  classification: string;
  individual_indices: Record<string, number>;
}

export interface RiskIndexResult {
  ri_value: number;
  classification: string;
  individual_risks: Record<string, number>;
}

export interface HazardQuotientResult {
  individual_hq: Record<string, number>;
  total_hq: number;
  classification: string;
}

export interface HazardIndexResult {
  hi_value: number;
  classification: string;
  individual_hq: Record<string, number>;
}

export interface CarcinogenicRiskResult {
  individual_cr: Record<string, number>;
  total_cr: number;
  classification: string;
  risk_level: string;
}

export interface NonCarcinogenicRiskResult {
  individual_hq: Record<string, number>;
  hazard_index: number;
  classification: string;
  risk_level: string;
}

export interface ComprehensiveRiskResult {
  hpi: HPIResult;
  mei: MEIResult;
  metal_index: MetalIndexResult;
  risk_index: RiskIndexResult;
  hazard_quotient: HazardQuotientResult;
  hazard_index: HazardIndexResult;
  carcinogenic_risk: CarcinogenicRiskResult;
  non_carcinogenic_risk: NonCarcinogenicRiskResult;
}

export interface BatchResult {
  results: Array<{
    sample_id?: string;
    latitude: number;
    longitude: number;
    hpi: HPIResult;
    mei: MEIResult;
  }>;
  count: number;
}

export interface HeavyMetalStandards {
  [metalName: string]: {
    standard: number;
    unit: string;
    source: string;
    reference_dose?: number;
    slope_factor?: number;
  };
}

class EnvironmentalCalculationsService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://127.0.0.1:8001') {
    this.baseUrl = baseUrl;
  }

  // Check if Python service is available
  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.warn('Python calculation service not available:', error);
      return false;
    }
  }

  // Calculate Heavy Metal Pollution Index
  async calculateHPI(data: EnvironmentalDataPoint): Promise<HPIResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate/hpi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Fallback to client-side calculation if Python service is unavailable
      console.warn('Python service unavailable, using client-side HPI calculation');
      return this.calculateHPIClientSide(data.metals);
    }
  }

  // Calculate Metal Evaluation Index
  async calculateMEI(data: EnvironmentalDataPoint): Promise<MEIResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate/mei`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Fallback to client-side calculation
      console.warn('Python service unavailable, using client-side MEI calculation');
      return this.calculateMEIClientSide(data.metals);
    }
  }

  // Batch calculations for multiple data points
  async calculateBatch(dataPoints: EnvironmentalDataPoint[]): Promise<BatchResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataPoints),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Fallback to client-side calculations
      console.warn('Python service unavailable, using client-side batch calculations');
      const results = await Promise.all(
        dataPoints.map(async (point) => ({
          sample_id: point.sample_id,
          latitude: point.latitude,
          longitude: point.longitude,
          hpi: this.calculateHPIClientSide(point.metals),
          mei: this.calculateMEIClientSide(point.metals),
        }))
      );

      return { results, count: results.length };
    }
  }

  // Get heavy metal standards
  async getHeavyMetalStandards(): Promise<HeavyMetalStandards> {
    try {
      const response = await fetch(`${this.baseUrl}/standards/heavy-metals`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Fallback to hardcoded standards
      console.warn('Python service unavailable, using hardcoded standards');
      return this.getHardcodedStandards();
    }
  }

  // Calculate Metal Index
  async calculateMetalIndex(data: EnvironmentalDataPoint): Promise<MetalIndexResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate/metal-index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Python service unavailable, using client-side Metal Index calculation');
      return this.calculateMetalIndexClientSide(data.metals);
    }
  }

  // Calculate Risk Index
  async calculateRiskIndex(data: EnvironmentalDataPoint): Promise<RiskIndexResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate/risk-index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Python service unavailable, using client-side Risk Index calculation');
      return this.calculateRiskIndexClientSide(data.metals);
    }
  }

  // Calculate Hazard Quotient
  async calculateHazardQuotient(data: EnvironmentalDataPoint): Promise<HazardQuotientResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate/hazard-quotient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Python service unavailable, using client-side Hazard Quotient calculation');
      return this.calculateHazardQuotientClientSide(data.metals);
    }
  }

  // Calculate Hazard Index
  async calculateHazardIndex(data: EnvironmentalDataPoint): Promise<HazardIndexResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate/hazard-index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Python service unavailable, using client-side Hazard Index calculation');
      return this.calculateHazardIndexClientSide(data.metals);
    }
  }

  // Calculate Carcinogenic Risk
  async calculateCarcinogenicRisk(data: EnvironmentalDataPoint): Promise<CarcinogenicRiskResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate/carcinogenic-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Python service unavailable, using client-side Carcinogenic Risk calculation');
      return this.calculateCarcinogenicRiskClientSide(data.metals);
    }
  }

  // Calculate Non-Carcinogenic Risk
  async calculateNonCarcinogenicRisk(data: EnvironmentalDataPoint): Promise<NonCarcinogenicRiskResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate/non-carcinogenic-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Python service unavailable, using client-side Non-Carcinogenic Risk calculation');
      return this.calculateNonCarcinogenicRiskClientSide(data.metals);
    }
  }

  // Calculate Comprehensive Risk Assessment
  async calculateComprehensiveRisk(data: EnvironmentalDataPoint): Promise<ComprehensiveRiskResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate/comprehensive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Python service unavailable, using client-side comprehensive calculations');
      // Fallback to individual calculations
      const [hpi, mei, metalIndex, riskIndex, hazardQuotient, hazardIndex, carcinogenicRisk, nonCarcinogenicRisk] = await Promise.all([
        this.calculateHPIClientSide(data.metals),
        this.calculateMEIClientSide(data.metals),
        this.calculateMetalIndexClientSide(data.metals),
        this.calculateRiskIndexClientSide(data.metals),
        this.calculateHazardQuotientClientSide(data.metals),
        this.calculateHazardIndexClientSide(data.metals),
        this.calculateCarcinogenicRiskClientSide(data.metals),
        this.calculateNonCarcinogenicRiskClientSide(data.metals),
      ]);

      return {
        hpi,
        mei,
        metal_index: metalIndex,
        risk_index: riskIndex,
        hazard_quotient: hazardQuotient,
        hazard_index: hazardIndex,
        carcinogenic_risk: carcinogenicRisk,
        non_carcinogenic_risk: nonCarcinogenicRisk,
      };
    }
  }

  // Client-side HPI calculation fallback
  private calculateHPIClientSide(metals: HeavyMetalData[]): HPIResult {
    if (!metals || metals.length === 0) {
      throw new Error('No metal data provided');
    }

    let sumWeightedQuality = 0;
    let sumWeights = 0;
    const individualRatings: Record<string, number> = {};

    metals.forEach((metal) => {
      // Calculate relative weight (Wi = k/Si, where k=1)
      const weight = metal.weight ?? (1 / metal.standard);
      
      // Calculate quality rating (Qi = 100 × (Mi - Ii) / (Si - Ii))
      const ideal = metal.ideal ?? 0;
      let quality = 0;
      
      if (metal.standard === ideal) {
        quality = metal.concentration > ideal ? 100 : 0;
      } else {
        quality = 100 * (metal.concentration - ideal) / (metal.standard - ideal);
      }
      
      // Ensure quality doesn't go below 0
      quality = Math.max(0, quality);
      
      sumWeightedQuality += weight * quality;
      sumWeights += weight;
      individualRatings[metal.name] = Math.round(quality * 100) / 100;
    });

    const hpiValue = sumWeights > 0 ? sumWeightedQuality / sumWeights : 0;

    // Classification
    let classification: string;
    let riskLevel: string;

    if (hpiValue < 25) {
      classification = "Excellent";
      riskLevel = "Low";
    } else if (hpiValue < 50) {
      classification = "Good";
      riskLevel = "Low";
    } else if (hpiValue < 75) {
      classification = "Poor";
      riskLevel = "Medium";
    } else if (hpiValue < 100) {
      classification = "Very Poor";
      riskLevel = "High";
    } else {
      classification = "Unsuitable";
      riskLevel = "Critical";
    }

    return {
      hpi_value: Math.round(hpiValue * 100) / 100,
      classification,
      individual_ratings: individualRatings,
      risk_level: riskLevel,
    };
  }

  // Client-side MEI calculation fallback
  private calculateMEIClientSide(metals: HeavyMetalData[]): MEIResult {
    if (!metals || metals.length === 0) {
      throw new Error('No metal data provided');
    }

    const contaminationFactors: Record<string, number> = {};
    let totalCF = 0;

    metals.forEach((metal) => {
      // Contamination Factor (CF = Ci/Si)
      const cf = metal.standard > 0 ? metal.concentration / metal.standard : 0;
      contaminationFactors[metal.name] = Math.round(cf * 1000) / 1000;
      totalCF += cf;
    });

    const meiValue = totalCF / metals.length;

    // Classification
    let classification: string;
    if (meiValue < 0.5) {
      classification = "Low contamination";
    } else if (meiValue < 1.0) {
      classification = "Moderate contamination";
    } else if (meiValue < 2.0) {
      classification = "Considerable contamination";
    } else {
      classification = "Very high contamination";
    }

    return {
      mei_value: Math.round(meiValue * 1000) / 1000,
      classification,
      contamination_factors: contaminationFactors,
    };
  }

  // Hardcoded standards fallback
  private getHardcodedStandards(): HeavyMetalStandards {
    return {
      "Lead (Pb)": { standard: 0.01, unit: "mg/L", source: "WHO", reference_dose: 0.0036, slope_factor: 0.0085 },
      "Cadmium (Cd)": { standard: 0.003, unit: "mg/L", source: "WHO", reference_dose: 0.001, slope_factor: 6.3 },
      "Chromium (Cr)": { standard: 0.05, unit: "mg/L", source: "WHO", reference_dose: 0.003, slope_factor: 42.0 },
      "Copper (Cu)": { standard: 2.0, unit: "mg/L", source: "WHO", reference_dose: 0.04 },
      "Iron (Fe)": { standard: 0.3, unit: "mg/L", source: "WHO", reference_dose: 0.7 },
      "Manganese (Mn)": { standard: 0.4, unit: "mg/L", source: "WHO", reference_dose: 0.14 },
      "Zinc (Zn)": { standard: 3.0, unit: "mg/L", source: "WHO", reference_dose: 0.3 },
      "Nickel (Ni)": { standard: 0.07, unit: "mg/L", source: "WHO", reference_dose: 0.02, slope_factor: 1.7 },
      "Arsenic (As)": { standard: 0.01, unit: "mg/L", source: "WHO", reference_dose: 0.0003, slope_factor: 1.5 },
      "Mercury (Hg)": { standard: 0.006, unit: "mg/L", source: "WHO", reference_dose: 0.0003 },
    };
  }

  // Client-side Metal Index calculation
  private calculateMetalIndexClientSide(metals: HeavyMetalData[]): MetalIndexResult {
    if (!metals || metals.length === 0) {
      throw new Error('No metal data provided');
    }

    const individualIndices: Record<string, number> = {};
    let totalMI = 0;

    metals.forEach((metal) => {
      const mi = metal.standard > 0 ? metal.concentration / metal.standard : 0;
      individualIndices[metal.name] = Math.round(mi * 1000) / 1000;
      totalMI += mi;
    });

    // Classification
    let classification: string;
    if (totalMI < 0.3) {
      classification = "Uncontaminated";
    } else if (totalMI < 1.0) {
      classification = "Slightly contaminated";
    } else if (totalMI < 2.0) {
      classification = "Moderately contaminated";
    } else if (totalMI < 4.0) {
      classification = "Highly contaminated";
    } else {
      classification = "Extremely contaminated";
    }

    return {
      mi_value: Math.round(totalMI * 1000) / 1000,
      classification,
      individual_indices: individualIndices,
    };
  }

  // Client-side Risk Index calculation
  private calculateRiskIndexClientSide(metals: HeavyMetalData[]): RiskIndexResult {
    if (!metals || metals.length === 0) {
      throw new Error('No metal data provided');
    }

    const toxicityFactors: Record<string, number> = {
      "Lead (Pb)": 5.0,
      "Cadmium (Cd)": 30.0,
      "Mercury (Hg)": 40.0,
      "Arsenic (As)": 10.0,
      "Chromium (Cr)": 2.0,
      "Copper (Cu)": 5.0,
      "Zinc (Zn)": 1.0,
      "Nickel (Ni)": 5.0,
      "Iron (Fe)": 1.0,
      "Manganese (Mn)": 1.0
    };

    const individualRisks: Record<string, number> = {};
    let totalRI = 0;

    metals.forEach((metal) => {
      const toxicityFactor = toxicityFactors[metal.name] || 1.0;
      const risk = metal.concentration * toxicityFactor;
      individualRisks[metal.name] = Math.round(risk * 1000) / 1000;
      totalRI += risk;
    });

    // Classification
    let classification: string;
    if (totalRI < 150) {
      classification = "Low risk";
    } else if (totalRI < 300) {
      classification = "Moderate risk";
    } else if (totalRI < 600) {
      classification = "High risk";
    } else {
      classification = "Very high risk";
    }

    return {
      ri_value: Math.round(totalRI * 1000) / 1000,
      classification,
      individual_risks: individualRisks,
    };
  }

  // Client-side Hazard Quotient calculation
  private calculateHazardQuotientClientSide(metals: HeavyMetalData[]): HazardQuotientResult {
    if (!metals || metals.length === 0) {
      throw new Error('No metal data provided');
    }

    const referenceDoses: Record<string, number> = {
      "Lead (Pb)": 0.0036,
      "Cadmium (Cd)": 0.001,
      "Mercury (Hg)": 0.0003,
      "Arsenic (As)": 0.0003,
      "Chromium (Cr)": 0.003,
      "Copper (Cu)": 0.04,
      "Zinc (Zn)": 0.3,
      "Nickel (Ni)": 0.02,
      "Iron (Fe)": 0.7,
      "Manganese (Mn)": 0.14
    };

    const individualHQ: Record<string, number> = {};
    let totalHQ = 0;

    metals.forEach((metal) => {
      const concentration = metal.concentration;
      const intakeRate = metal.intake_rate || 2.0;
      const exposureFrequency = 365;
      const exposureDuration = metal.exposure_duration || 30;
      const bodyWeight = metal.body_weight || 70;
      const averagingTime = 365 * exposureDuration;

      const cdi = (concentration * intakeRate * exposureFrequency * exposureDuration) / (bodyWeight * averagingTime);
      const rfd = metal.reference_dose || referenceDoses[metal.name] || 0.001;
      const hq = rfd > 0 ? cdi / rfd : 0;

      individualHQ[metal.name] = Math.round(hq * 10000) / 10000;
      totalHQ += hq;
    });

    // Classification
    let classification: string;
    if (totalHQ <= 1.0) {
      classification = "Acceptable risk";
    } else if (totalHQ <= 4.0) {
      classification = "Low risk";
    } else if (totalHQ <= 10.0) {
      classification = "Moderate risk";
    } else {
      classification = "High risk";
    }

    return {
      individual_hq: individualHQ,
      total_hq: Math.round(totalHQ * 10000) / 10000,
      classification,
    };
  }

  // Client-side Hazard Index calculation
  private calculateHazardIndexClientSide(metals: HeavyMetalData[]): HazardIndexResult {
    const hqResult = this.calculateHazardQuotientClientSide(metals);

    let classification: string;
    if (hqResult.total_hq <= 1.0) {
      classification = "No significant risk";
    } else if (hqResult.total_hq <= 4.0) {
      classification = "Low risk";
    } else if (hqResult.total_hq <= 10.0) {
      classification = "Moderate risk";
    } else {
      classification = "High risk";
    }

    return {
      hi_value: hqResult.total_hq,
      classification,
      individual_hq: hqResult.individual_hq,
    };
  }

  // Client-side Carcinogenic Risk calculation
  private calculateCarcinogenicRiskClientSide(metals: HeavyMetalData[]): CarcinogenicRiskResult {
    if (!metals || metals.length === 0) {
      throw new Error('No metal data provided');
    }

    const slopeFactors: Record<string, number> = {
      "Arsenic (As)": 1.5,
      "Cadmium (Cd)": 6.3,
      "Chromium (Cr)": 42.0,
      "Lead (Pb)": 0.0085,
      "Nickel (Ni)": 1.7
    };

    const individualCR: Record<string, number> = {};
    let totalCR = 0;

    metals.forEach((metal) => {
      const sf = metal.slope_factor || slopeFactors[metal.name];
      
      if (sf !== undefined) {
        const concentration = metal.concentration;
        const intakeRate = metal.intake_rate || 2.0;
        const exposureFrequency = 365;
        const exposureDuration = metal.exposure_duration || 30;
        const bodyWeight = metal.body_weight || 70;
        const lifetime = 70 * 365;

        const cdi = (concentration * intakeRate * exposureFrequency * exposureDuration) / (bodyWeight * lifetime);
        const cr = cdi * sf;

        individualCR[metal.name] = cr;
        totalCR += cr;
      } else {
        individualCR[metal.name] = 0;
      }
    });

    // Classification
    let classification: string;
    let riskLevel: string;
    if (totalCR <= 1e-6) {
      classification = "Negligible risk";
      riskLevel = "Acceptable";
    } else if (totalCR <= 1e-4) {
      classification = "Low risk";
      riskLevel = "Acceptable";
    } else if (totalCR <= 1e-3) {
      classification = "Moderate risk";
      riskLevel = "Caution";
    } else {
      classification = "High risk";
      riskLevel = "Unacceptable";
    }

    return {
      individual_cr: Object.fromEntries(
        Object.entries(individualCR).map(([k, v]) => [k, Math.round(v * 100000000) / 100000000])
      ),
      total_cr: Math.round(totalCR * 100000000) / 100000000,
      classification,
      risk_level: riskLevel,
    };
  }

  // Client-side Non-Carcinogenic Risk calculation
  private calculateNonCarcinogenicRiskClientSide(metals: HeavyMetalData[]): NonCarcinogenicRiskResult {
    const hqResult = this.calculateHazardQuotientClientSide(metals);

    let classification: string;
    let riskLevel: string;
    if (hqResult.total_hq <= 0.1) {
      classification = "No risk";
      riskLevel = "Safe";
    } else if (hqResult.total_hq <= 1.0) {
      classification = "Acceptable risk";
      riskLevel = "Low";
    } else if (hqResult.total_hq <= 4.0) {
      classification = "Low risk";
      riskLevel = "Moderate";
    } else if (hqResult.total_hq <= 10.0) {
      classification = "Moderate risk";
      riskLevel = "High";
    } else {
      classification = "High risk";
      riskLevel = "Very High";
    }

    return {
      individual_hq: hqResult.individual_hq,
      hazard_index: hqResult.total_hq,
      classification,
      risk_level: riskLevel,
    };
  }
}

// Export singleton instance
export const environmentalCalcService = new EnvironmentalCalculationsService();
export default EnvironmentalCalculationsService;

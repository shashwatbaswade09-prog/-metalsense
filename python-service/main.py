from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import pandas as pd
from scipy import stats
import uvicorn
import math

app = FastAPI(
    title="MetalSense Environmental Calculations API",
    description="Scientific calculations for heavy metal pollution assessment",
    version="1.0.0"
)

# CORS configuration to allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Your frontend ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class HeavyMetalData(BaseModel):
    name: str
    concentration: float
    standard: float
    ideal: float = 0.0
    weight: Optional[float] = None
    reference_dose: Optional[float] = None  # RfD for non-carcinogenic risk
    slope_factor: Optional[float] = None    # SF for carcinogenic risk
    exposure_duration: Optional[float] = None  # years
    body_weight: Optional[float] = 70.0    # kg (default adult)
    intake_rate: Optional[float] = 2.0     # L/day (default water intake)

class EnvironmentalDataPoint(BaseModel):
    latitude: float
    longitude: float
    metals: List[HeavyMetalData]
    sample_date: Optional[str] = None
    sample_id: Optional[str] = None

class HPIResult(BaseModel):
    hpi_value: float
    classification: str
    individual_ratings: Dict[str, float]
    risk_level: str

class MEIResult(BaseModel):
    mei_value: float
    classification: str
    contamination_factors: Dict[str, float]

class MetalIndexResult(BaseModel):
    mi_value: float
    classification: str
    individual_indices: Dict[str, float]

class RiskIndexResult(BaseModel):
    ri_value: float
    classification: str
    individual_risks: Dict[str, float]

class HazardQuotientResult(BaseModel):
    individual_hq: Dict[str, float]
    total_hq: float
    classification: str

class HazardIndexResult(BaseModel):
    hi_value: float
    classification: str
    individual_hq: Dict[str, float]

class CarcinogenicRiskResult(BaseModel):
    individual_cr: Dict[str, float]
    total_cr: float
    classification: str
    risk_level: str

class NonCarcinogenicRiskResult(BaseModel):
    individual_hq: Dict[str, float]
    hazard_index: float
    classification: str
    risk_level: str

class ComprehensiveRiskResult(BaseModel):
    hpi: HPIResult
    mei: MEIResult
    metal_index: MetalIndexResult
    risk_index: RiskIndexResult
    hazard_quotient: HazardQuotientResult
    hazard_index: HazardIndexResult
    carcinogenic_risk: CarcinogenicRiskResult
    non_carcinogenic_risk: NonCarcinogenicRiskResult

# Heavy Metal Pollution Index Calculator
class HPICalculator:
    @staticmethod
    def calculate_hpi(metals: List[HeavyMetalData]) -> HPIResult:
        """
        Calculate Heavy Metal Pollution Index (HPI) using Prasad & Bascaran method
        HPI = Σ(Wi × Qi) / Σ(Wi)
        """
        if not metals:
            raise ValueError("No metal data provided")
        
        sum_weighted_quality = 0.0
        sum_weights = 0.0
        individual_ratings = {}
        
        for metal in metals:
            # Calculate relative weight (Wi = k/Si, where k=1)
            weight = metal.weight if metal.weight is not None else (1 / metal.standard)
            
            # Calculate quality rating (Qi = 100 × (Mi - Ii) / (Si - Ii))
            if metal.standard == metal.ideal:
                quality = 100.0 if metal.concentration > metal.ideal else 0.0
            else:
                quality = 100 * (metal.concentration - metal.ideal) / (metal.standard - metal.ideal)
            
            # Ensure quality doesn't go below 0
            quality = max(0, quality)
            
            sum_weighted_quality += weight * quality
            sum_weights += weight
            individual_ratings[metal.name] = quality
        
        hpi_value = sum_weighted_quality / sum_weights if sum_weights > 0 else 0
        
        # Classification based on HPI value
        if hpi_value < 25:
            classification = "Excellent"
            risk_level = "Low"
        elif hpi_value < 50:
            classification = "Good"
            risk_level = "Low"
        elif hpi_value < 75:
            classification = "Poor"
            risk_level = "Medium"
        elif hpi_value < 100:
            classification = "Very Poor"
            risk_level = "High"
        else:
            classification = "Unsuitable"
            risk_level = "Critical"
        
        return HPIResult(
            hpi_value=round(hpi_value, 2),
            classification=classification,
            individual_ratings=individual_ratings,
            risk_level=risk_level
        )

# Metal Index Calculator
class MetalIndexCalculator:
    @staticmethod
    def calculate_metal_index(metals: List[HeavyMetalData]) -> MetalIndexResult:
        """
        Calculate Metal Index (MI)
        MI = Σ(Ci/Si) where Ci = concentration, Si = standard
        """
        if not metals:
            raise ValueError("No metal data provided")
        
        individual_indices = {}
        total_mi = 0.0
        
        for metal in metals:
            # Metal Index for individual metal (MI = Ci/Si)
            mi = metal.concentration / metal.standard if metal.standard > 0 else 0
            individual_indices[metal.name] = round(mi, 3)
            total_mi += mi
        
        # Classification based on MI value
        if total_mi < 0.3:
            classification = "Uncontaminated"
        elif total_mi < 1.0:
            classification = "Slightly contaminated"
        elif total_mi < 2.0:
            classification = "Moderately contaminated"
        elif total_mi < 4.0:
            classification = "Highly contaminated"
        else:
            classification = "Extremely contaminated"
        
        return MetalIndexResult(
            mi_value=round(total_mi, 3),
            classification=classification,
            individual_indices=individual_indices
        )

# Risk Index Calculator
class RiskIndexCalculator:
    @staticmethod
    def calculate_risk_index(metals: List[HeavyMetalData]) -> RiskIndexResult:
        """
        Calculate Risk Index (RI)
        RI = Σ(Ci × Ti) where Ti is toxicity factor
        """
        if not metals:
            raise ValueError("No metal data provided")
        
        # Toxicity factors for common heavy metals (based on literature)
        toxicity_factors = {
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
        }
        
        individual_risks = {}
        total_ri = 0.0
        
        for metal in metals:
            toxicity_factor = toxicity_factors.get(metal.name, 1.0)
            risk = metal.concentration * toxicity_factor
            individual_risks[metal.name] = round(risk, 3)
            total_ri += risk
        
        # Classification based on RI value
        if total_ri < 150:
            classification = "Low risk"
        elif total_ri < 300:
            classification = "Moderate risk"
        elif total_ri < 600:
            classification = "High risk"
        else:
            classification = "Very high risk"
        
        return RiskIndexResult(
            ri_value=round(total_ri, 3),
            classification=classification,
            individual_risks=individual_risks
        )

# Hazard Quotient Calculator
class HazardQuotientCalculator:
    @staticmethod
    def calculate_hazard_quotient(metals: List[HeavyMetalData]) -> HazardQuotientResult:
        """
        Calculate Hazard Quotient (HQ)
        HQ = CDI / RfD
        CDI = (C × IR × EF × ED) / (BW × AT)
        """
        if not metals:
            raise ValueError("No metal data provided")
        
        # Default reference doses (mg/kg/day) - EPA values
        reference_doses = {
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
        }
        
        individual_hq = {}
        total_hq = 0.0
        
        for metal in metals:
            # Default exposure parameters
            concentration = metal.concentration  # mg/L
            intake_rate = metal.intake_rate or 2.0  # L/day
            exposure_frequency = 365  # days/year
            exposure_duration = metal.exposure_duration or 30  # years
            body_weight = metal.body_weight or 70  # kg
            averaging_time = 365 * exposure_duration  # days
            
            # Calculate Chronic Daily Intake (CDI)
            cdi = (concentration * intake_rate * exposure_frequency * exposure_duration) / (body_weight * averaging_time)
            
            # Get reference dose
            rfd = metal.reference_dose or reference_doses.get(metal.name, 0.001)
            
            # Calculate HQ
            hq = cdi / rfd if rfd > 0 else 0
            individual_hq[metal.name] = round(hq, 4)
            total_hq += hq
        
        # Classification based on total HQ
        if total_hq <= 1.0:
            classification = "Acceptable risk"
        elif total_hq <= 4.0:
            classification = "Low risk"
        elif total_hq <= 10.0:
            classification = "Moderate risk"
        else:
            classification = "High risk"
        
        return HazardQuotientResult(
            individual_hq=individual_hq,
            total_hq=round(total_hq, 4),
            classification=classification
        )

# Hazard Index Calculator
class HazardIndexCalculator:
    @staticmethod
    def calculate_hazard_index(metals: List[HeavyMetalData]) -> HazardIndexResult:
        """
        Calculate Hazard Index (HI)
        HI = Σ(HQi) - sum of individual hazard quotients
        """
        hq_result = HazardQuotientCalculator.calculate_hazard_quotient(metals)
        
        # Classification based on HI value
        if hq_result.total_hq <= 1.0:
            classification = "No significant risk"
        elif hq_result.total_hq <= 4.0:
            classification = "Low risk"
        elif hq_result.total_hq <= 10.0:
            classification = "Moderate risk"
        else:
            classification = "High risk"
        
        return HazardIndexResult(
            hi_value=hq_result.total_hq,
            classification=classification,
            individual_hq=hq_result.individual_hq
        )

# Carcinogenic Risk Calculator
class CarcinogenicRiskCalculator:
    @staticmethod
    def calculate_carcinogenic_risk(metals: List[HeavyMetalData]) -> CarcinogenicRiskResult:
        """
        Calculate Carcinogenic Risk (CR)
        CR = CDI × SF
        """
        if not metals:
            raise ValueError("No metal data provided")
        
        # Cancer slope factors (mg/kg/day)^-1 - EPA values
        slope_factors = {
            "Arsenic (As)": 1.5,
            "Cadmium (Cd)": 6.3,
            "Chromium (Cr)": 42.0,
            "Lead (Pb)": 0.0085,  # Lower bound estimate
            "Nickel (Ni)": 1.7
        }
        
        individual_cr = {}
        total_cr = 0.0
        
        for metal in metals:
            sf = metal.slope_factor or slope_factors.get(metal.name)
            
            if sf is not None:
                # Default exposure parameters
                concentration = metal.concentration  # mg/L
                intake_rate = metal.intake_rate or 2.0  # L/day
                exposure_frequency = 365  # days/year
                exposure_duration = metal.exposure_duration or 30  # years
                body_weight = metal.body_weight or 70  # kg
                lifetime = 70 * 365  # days
                
                # Calculate Chronic Daily Intake (CDI)
                cdi = (concentration * intake_rate * exposure_frequency * exposure_duration) / (body_weight * lifetime)
                
                # Calculate Carcinogenic Risk
                cr = cdi * sf
                individual_cr[metal.name] = cr
                total_cr += cr
            else:
                individual_cr[metal.name] = 0.0
        
        # Classification based on total CR
        if total_cr <= 1e-6:
            classification = "Negligible risk"
            risk_level = "Acceptable"
        elif total_cr <= 1e-4:
            classification = "Low risk"
            risk_level = "Acceptable"
        elif total_cr <= 1e-3:
            classification = "Moderate risk"
            risk_level = "Caution"
        else:
            classification = "High risk"
            risk_level = "Unacceptable"
        
        return CarcinogenicRiskResult(
            individual_cr={k: round(v, 8) for k, v in individual_cr.items()},
            total_cr=round(total_cr, 8),
            classification=classification,
            risk_level=risk_level
        )

# Non-Carcinogenic Risk Calculator
class NonCarcinogenicRiskCalculator:
    @staticmethod
    def calculate_non_carcinogenic_risk(metals: List[HeavyMetalData]) -> NonCarcinogenicRiskResult:
        """
        Calculate Non-Carcinogenic Risk using Hazard Index approach
        """
        hq_result = HazardQuotientCalculator.calculate_hazard_quotient(metals)
        
        # Classification based on Hazard Index
        if hq_result.total_hq <= 0.1:
            classification = "No risk"
            risk_level = "Safe"
        elif hq_result.total_hq <= 1.0:
            classification = "Acceptable risk"
            risk_level = "Low"
        elif hq_result.total_hq <= 4.0:
            classification = "Low risk"
            risk_level = "Moderate"
        elif hq_result.total_hq <= 10.0:
            classification = "Moderate risk"
            risk_level = "High"
        else:
            classification = "High risk"
            risk_level = "Very High"
        
        return NonCarcinogenicRiskResult(
            individual_hq=hq_result.individual_hq,
            hazard_index=hq_result.total_hq,
            classification=classification,
            risk_level=risk_level
        )
class MEICalculator:
    @staticmethod
    def calculate_mei(metals: List[HeavyMetalData]) -> MEIResult:
        """
        Calculate Metal Evaluation Index (MEI)
        MEI = Σ(Ci/Si) / n
        """
        if not metals:
            raise ValueError("No metal data provided")
        
        contamination_factors = {}
        total_cf = 0.0
        
        for metal in metals:
            # Contamination Factor (CF = Ci/Si)
            cf = metal.concentration / metal.standard if metal.standard > 0 else 0
            contamination_factors[metal.name] = round(cf, 3)
            total_cf += cf
        
        mei_value = total_cf / len(metals)
        
        # Classification based on MEI value
        if mei_value < 0.5:
            classification = "Low contamination"
        elif mei_value < 1.0:
            classification = "Moderate contamination"
        elif mei_value < 2.0:
            classification = "Considerable contamination"
        else:
            classification = "Very high contamination"
        
        return MEIResult(
            mei_value=round(mei_value, 3),
            classification=classification,
            contamination_factors=contamination_factors
        )

# API endpoints
@app.get("/")
async def root():
    return {
        "message": "MetalSense Environmental Calculations API",
        "version": "1.0.0",
        "endpoints": [
            "/calculate/hpi",
            "/calculate/mei",
            "/calculate/metal-index",
            "/calculate/risk-index", 
            "/calculate/hazard-quotient",
            "/calculate/hazard-index",
            "/calculate/carcinogenic-risk",
            "/calculate/non-carcinogenic-risk",
            "/calculate/comprehensive",
            "/calculate/batch",
            "/health"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "environmental-calculations"}

@app.post("/calculate/hpi", response_model=HPIResult)
async def calculate_hpi(data: EnvironmentalDataPoint):
    """Calculate Heavy Metal Pollution Index for a single data point"""
    try:
        result = HPICalculator.calculate_hpi(data.metals)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/mei", response_model=MEIResult)
async def calculate_mei(data: EnvironmentalDataPoint):
    """Calculate Metal Evaluation Index for a single data point"""
    try:
        result = MEICalculator.calculate_mei(data.metals)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/batch")
async def calculate_batch(data_points: List[EnvironmentalDataPoint]):
    """Calculate both HPI and MEI for multiple data points"""
    try:
        results = []
        for point in data_points:
            hpi_result = HPICalculator.calculate_hpi(point.metals)
            mei_result = MEICalculator.calculate_mei(point.metals)
            
            results.append({
                "sample_id": point.sample_id,
                "latitude": point.latitude,
                "longitude": point.longitude,
                "hpi": hpi_result.dict(),
                "mei": mei_result.dict()
            })
        
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/metal-index", response_model=MetalIndexResult)
async def calculate_metal_index(data: EnvironmentalDataPoint):
    """Calculate Metal Index for a single data point"""
    try:
        result = MetalIndexCalculator.calculate_metal_index(data.metals)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/risk-index", response_model=RiskIndexResult)
async def calculate_risk_index(data: EnvironmentalDataPoint):
    """Calculate Risk Index for a single data point"""
    try:
        result = RiskIndexCalculator.calculate_risk_index(data.metals)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/hazard-quotient", response_model=HazardQuotientResult)
async def calculate_hazard_quotient(data: EnvironmentalDataPoint):
    """Calculate Hazard Quotient for a single data point"""
    try:
        result = HazardQuotientCalculator.calculate_hazard_quotient(data.metals)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/hazard-index", response_model=HazardIndexResult)
async def calculate_hazard_index(data: EnvironmentalDataPoint):
    """Calculate Hazard Index for a single data point"""
    try:
        result = HazardIndexCalculator.calculate_hazard_index(data.metals)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/carcinogenic-risk", response_model=CarcinogenicRiskResult)
async def calculate_carcinogenic_risk(data: EnvironmentalDataPoint):
    """Calculate Carcinogenic Risk for a single data point"""
    try:
        result = CarcinogenicRiskCalculator.calculate_carcinogenic_risk(data.metals)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/non-carcinogenic-risk", response_model=NonCarcinogenicRiskResult)
async def calculate_non_carcinogenic_risk(data: EnvironmentalDataPoint):
    """Calculate Non-Carcinogenic Risk for a single data point"""
    try:
        result = NonCarcinogenicRiskCalculator.calculate_non_carcinogenic_risk(data.metals)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate/comprehensive", response_model=ComprehensiveRiskResult)
async def calculate_comprehensive_risk(data: EnvironmentalDataPoint):
    """Calculate all environmental indices and risk assessments for a single data point"""
    try:
        hpi_result = HPICalculator.calculate_hpi(data.metals)
        mei_result = MEICalculator.calculate_mei(data.metals)
        mi_result = MetalIndexCalculator.calculate_metal_index(data.metals)
        ri_result = RiskIndexCalculator.calculate_risk_index(data.metals)
        hq_result = HazardQuotientCalculator.calculate_hazard_quotient(data.metals)
        hi_result = HazardIndexCalculator.calculate_hazard_index(data.metals)
        cr_result = CarcinogenicRiskCalculator.calculate_carcinogenic_risk(data.metals)
        ncr_result = NonCarcinogenicRiskCalculator.calculate_non_carcinogenic_risk(data.metals)
        
        return ComprehensiveRiskResult(
            hpi=hpi_result,
            mei=mei_result,
            metal_index=mi_result,
            risk_index=ri_result,
            hazard_quotient=hq_result,
            hazard_index=hi_result,
            carcinogenic_risk=cr_result,
            non_carcinogenic_risk=ncr_result
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/standards/heavy-metals")
async def get_heavy_metal_standards():
    """Get standard permissible values for common heavy metals (WHO/EPA standards)"""
    standards = {
        "Lead (Pb)": {
            "standard": 0.01, 
            "unit": "mg/L", 
            "source": "WHO",
            "reference_dose": 0.0036,
            "slope_factor": 0.0085
        },
        "Cadmium (Cd)": {
            "standard": 0.003, 
            "unit": "mg/L", 
            "source": "WHO",
            "reference_dose": 0.001,
            "slope_factor": 6.3
        },
        "Chromium (Cr)": {
            "standard": 0.05, 
            "unit": "mg/L", 
            "source": "WHO",
            "reference_dose": 0.003,
            "slope_factor": 42.0
        },
        "Copper (Cu)": {
            "standard": 2.0, 
            "unit": "mg/L", 
            "source": "WHO",
            "reference_dose": 0.04
        },
        "Iron (Fe)": {
            "standard": 0.3, 
            "unit": "mg/L", 
            "source": "WHO",
            "reference_dose": 0.7
        },
        "Manganese (Mn)": {
            "standard": 0.4, 
            "unit": "mg/L", 
            "source": "WHO",
            "reference_dose": 0.14
        },
        "Zinc (Zn)": {
            "standard": 3.0, 
            "unit": "mg/L", 
            "source": "WHO",
            "reference_dose": 0.3
        },
        "Nickel (Ni)": {
            "standard": 0.07, 
            "unit": "mg/L", 
            "source": "WHO",
            "reference_dose": 0.02,
            "slope_factor": 1.7
        },
        "Arsenic (As)": {
            "standard": 0.01, 
            "unit": "mg/L", 
            "source": "WHO",
            "reference_dose": 0.0003,
            "slope_factor": 1.5
        },
        "Mercury (Hg)": {
            "standard": 0.006, 
            "unit": "mg/L", 
            "source": "WHO",
            "reference_dose": 0.0003
        }
    }
    return standards

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)

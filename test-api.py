#!/usr/bin/env python3
"""
Test script for MetalSense Environmental Calculations API
Run this script after starting the Python service to verify all endpoints work correctly.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8001"

# Test data - High contamination scenario
test_data = {
    "latitude": 12.972,
    "longitude": 77.594,
    "sample_id": "TEST-001",
    "metals": [
        {
            "name": "Lead (Pb)",
            "concentration": 0.08,
            "standard": 0.01,
            "ideal": 0.0,
            "reference_dose": 0.0036,
            "slope_factor": 0.0085,
            "exposure_duration": 30,
            "body_weight": 70,
            "intake_rate": 2.0
        },
        {
            "name": "Cadmium (Cd)",
            "concentration": 0.015,
            "standard": 0.003,
            "ideal": 0.0,
            "reference_dose": 0.001,
            "slope_factor": 6.3,
            "exposure_duration": 30,
            "body_weight": 70,
            "intake_rate": 2.0
        },
        {
            "name": "Arsenic (As)",
            "concentration": 0.045,
            "standard": 0.01,
            "ideal": 0.0,
            "reference_dose": 0.0003,
            "slope_factor": 1.5,
            "exposure_duration": 30,
            "body_weight": 70,
            "intake_rate": 2.0
        }
    ]
}

def test_endpoint(endpoint, data=None):
    """Test a specific API endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        if data:
            response = requests.post(url, json=data, headers={"Content-Type": "application/json"})
        else:
            response = requests.get(url)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {endpoint}: SUCCESS")
            if endpoint == "/":
                print(f"   Available endpoints: {len(result.get('endpoints', []))}")
            elif endpoint == "/calculate/comprehensive":
                print(f"   HPI: {result['hpi']['hpi_value']} ({result['hpi']['classification']})")
                print(f"   MEI: {result['mei']['mei_value']} ({result['mei']['classification']})")
                print(f"   Metal Index: {result['metal_index']['mi_value']} ({result['metal_index']['classification']})")
                print(f"   Risk Index: {result['risk_index']['ri_value']} ({result['risk_index']['classification']})")
                print(f"   Hazard Index: {result['hazard_index']['hi_value']:.4f} ({result['hazard_index']['classification']})")
                print(f"   Carcinogenic Risk: {result['carcinogenic_risk']['total_cr']:.2e} ({result['carcinogenic_risk']['classification']})")
                print(f"   Non-Carcinogenic Risk: {result['non_carcinogenic_risk']['classification']} ({result['non_carcinogenic_risk']['risk_level']})")
            return True
        else:
            print(f"❌ {endpoint}: HTTP {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ {endpoint}: CONNECTION FAILED - Is the Python service running?")
        return False
    except Exception as e:
        print(f"❌ {endpoint}: ERROR - {str(e)}")
        return False

def main():
    print("🧪 Testing MetalSense Environmental Calculations API")
    print("=" * 60)
    
    # Test basic endpoints
    endpoints_to_test = [
        ("/", None),
        ("/health", None),
        ("/standards/heavy-metals", None),
        ("/calculate/hpi", test_data),
        ("/calculate/mei", test_data),
        ("/calculate/metal-index", test_data),
        ("/calculate/risk-index", test_data),
        ("/calculate/hazard-quotient", test_data),
        ("/calculate/hazard-index", test_data),
        ("/calculate/carcinogenic-risk", test_data),
        ("/calculate/non-carcinogenic-risk", test_data),
        ("/calculate/comprehensive", test_data)
    ]
    
    success_count = 0
    total_count = len(endpoints_to_test)
    
    for endpoint, data in endpoints_to_test:
        if test_endpoint(endpoint, data):
            success_count += 1
        print()
    
    print("=" * 60)
    print(f"📊 Test Results: {success_count}/{total_count} endpoints successful")
    
    if success_count == total_count:
        print("🎉 All tests passed! Your environmental calculations service is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the Python service logs for details.")
    
    print("\n📝 Next Steps:")
    print("1. Start your frontend: npm run dev:frontend")
    print("2. Navigate to the Data Upload page")
    print("3. Add sample data and test the risk assessment calculations")

if __name__ == "__main__":
    main()

# MetalSense Test Data Guide

## 🧪 How to Test the Application

### Step 1: Open the Application
- Navigate to: http://localhost:5173
- Click on **"Upload"** in the navigation bar

### Step 2: Test Location-First Workflow

#### Test Scenario 1: Clean Water Sample (Low Risk)
```
Location: Mumbai Marine Drive Beach
Latitude: 18.9220
Longitude: 72.8235
Location Name: Mumbai Marine Drive Beach

1. Lock the location
2. Add these metals one by one:
   - As: 0.002 mg/L (Below WHO limit)
   - Cd: 0.001 mg/L (Below WHO limit) 
   - Cr: 0.01 mg/L (Below WHO limit)
   - Pb: 0.005 mg/L (Below WHO limit)

Expected Result: LOW RISK - All parameters safe
```

#### Test Scenario 2: Moderate Contamination (Medium-High Risk)
```
Location: Industrial Area, New Delhi
Latitude: 28.6139
Longitude: 77.2090
Location Name: Industrial Area, New Delhi

1. Unlock location (if locked)
2. Enter new coordinates and lock
3. Add these metals:
   - As: 0.015 mg/L (Above WHO limit!)
   - Cd: 0.005 mg/L (Above WHO limit!)
   - Cr: 0.08 mg/L (Above WHO limit!)
   - Cu: 1.5 mg/L (Safe level)
   - Pb: 0.025 mg/L (Above WHO limit!)

Expected Result: MEDIUM-HIGH RISK - Multiple exceedances
```

#### Test Scenario 3: Severe Contamination (Critical Risk)
```
Location: Mining Site, Ranchi, Jharkhand  
Latitude: 23.6102
Longitude: 85.2799
Location Name: Mining Site, Ranchi, Jharkhand

1. Change location and lock
2. Add these critical levels:
   - As: 0.05 mg/L (5x WHO limit!)
   - Cd: 0.015 mg/L (5x WHO limit!)
   - Cr: 0.2 mg/L (4x WHO limit!)
   - Hg: 0.008 mg/L (Above WHO limit!)
   - Pb: 0.08 mg/L (8x WHO limit!)
   - Zn: 8.0 mg/L (High level)

Expected Result: CRITICAL RISK - Immediate action required
```

### Step 3: Test Environmental Risk Assessment
After adding metals for any scenario:

1. Click **"🧮 Calculate Risk Assessment"** button
2. Wait for calculation to complete
3. Review the results:
   - **HPI Value**: Heavy Metal Pollution Index
   - **Risk Level**: Color-coded risk classification
   - **Standard Compliance**: WHO guideline comparison
   - **Risk Summary**: Overall assessment

### Step 4: Test Data Management
1. **Remove Entries**: Use the 🗑️ button to remove specific metals
2. **Unlock Location**: Change coordinates for new sampling site
3. **Submit to Database**: Click submit button (will show API call)

## 🎯 Testing Checklist

### ✅ Location-First Workflow
- [ ] Enter latitude/longitude coordinates
- [ ] Lock location successfully  
- [ ] Add multiple metals without re-entering coordinates
- [ ] Unlock and change location
- [ ] Location validation (required fields)

### ✅ Metal Entry System
- [ ] Select from dropdown (As, Cd, Cr, Cu, Fe, Hg, Mn, Ni, Pb, Zn)
- [ ] Enter concentration values (supports decimals)
- [ ] Add optional notes
- [ ] View entries in table format
- [ ] Remove individual entries

### ✅ Environmental Calculations
- [ ] Calculate HPI (Heavy Metal Pollution Index)
- [ ] View risk level classification
- [ ] See color-coded results (Green=Safe, Yellow=Medium, Red=High)
- [ ] Review individual metal assessments
- [ ] Check WHO standard compliance

### ✅ User Interface
- [ ] Responsive design on different screen sizes
- [ ] Clear step-by-step workflow
- [ ] Status messages and feedback
- [ ] Error handling for invalid inputs
- [ ] Professional data visualization

## 📊 Expected Risk Levels

| Scenario | Location | HPI Range | Risk Level |
|----------|----------|-----------|------------|
| Clean Water | Mumbai Beach | < 50 | **LOW** ✅ |
| Moderate Pollution | Delhi Industrial | 50-100 | **MEDIUM** ⚠️ |
| High Pollution | River Ganga | 100-200 | **HIGH** ⚠️ |
| Critical Pollution | Mining Site | > 200 | **CRITICAL** 🚨 |

## 🔬 WHO Standards Reference

| Metal | WHO Limit (mg/L) | Health Impact |
|-------|------------------|---------------|
| **As** (Arsenic) | 0.01 | Carcinogenic, skin lesions |
| **Cd** (Cadmium) | 0.003 | Kidney damage, bone disease |
| **Cr** (Chromium) | 0.05 | Liver, kidney damage |
| **Cu** (Copper) | 2.0 | Gastrointestinal distress |
| **Fe** (Iron) | 0.3* | Taste, color issues |
| **Hg** (Mercury) | 0.006 | Neurological damage |
| **Mn** (Manganese) | 0.4* | Neurological effects |
| **Ni** (Nickel) | 0.02 | Allergic reactions |
| **Pb** (Lead) | 0.01 | Developmental, neurological |
| **Zn** (Zinc) | 3.0* | Taste, gastrointestinal |

*Guideline values (aesthetic/taste), not health-based

## 🚀 Quick Test Commands

For rapid testing, copy-paste these values:

**Clean Sample**: 18.9220, 72.8235
**Polluted Sample**: 28.6139, 77.2090  
**Critical Sample**: 23.6102, 85.2799

Have fun testing the environmental monitoring system! 🌊🧪

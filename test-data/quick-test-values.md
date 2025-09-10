# Quick Copy-Paste Test Values

## 🎯 Scenario 1: Clean Water (LOW RISK)
**Location:** Mumbai Marine Drive Beach
- Latitude: `18.9220`
- Longitude: `72.8235`
- Name: `Mumbai Marine Drive Beach`

**Metals to add:**
1. Metal: `As`, Value: `0.002`, Notes: `Below WHO limit`
2. Metal: `Cd`, Value: `0.001`, Notes: `Below WHO limit`
3. Metal: `Cr`, Value: `0.01`, Notes: `Below WHO limit`
4. Metal: `Pb`, Value: `0.005`, Notes: `Below WHO limit`

---

## ⚠️ Scenario 2: Industrial Pollution (MEDIUM-HIGH RISK)
**Location:** Industrial Area New Delhi
- Latitude: `28.6139`
- Longitude: `77.2090`
- Name: `Industrial Area, New Delhi`

**Metals to add:**
1. Metal: `As`, Value: `0.015`, Notes: `Above WHO limit!`
2. Metal: `Cd`, Value: `0.005`, Notes: `Above WHO limit!`
3. Metal: `Cr`, Value: `0.08`, Notes: `Above WHO limit!`
4. Metal: `Cu`, Value: `1.5`, Notes: `Safe level`
5. Metal: `Pb`, Value: `0.025`, Notes: `Above WHO limit!`

---

## 🚨 Scenario 3: Mining Contamination (CRITICAL RISK)
**Location:** Mining Site Jharkhand
- Latitude: `23.6102`
- Longitude: `85.2799`
- Name: `Mining Site, Ranchi, Jharkhand`

**Metals to add:**
1. Metal: `As`, Value: `0.05`, Notes: `5x WHO limit - Critical!`
2. Metal: `Cd`, Value: `0.015`, Notes: `5x WHO limit - Critical!`
3. Metal: `Cr`, Value: `0.2`, Notes: `4x WHO limit - Critical!`
4. Metal: `Hg`, Value: `0.008`, Notes: `Above WHO limit`
5. Metal: `Pb`, Value: `0.08`, Notes: `8x WHO limit - Critical!`
6. Metal: `Zn`, Value: `8.0`, Notes: `High concentration`

---

## 🌊 Scenario 4: River Water (HIGH RISK)
**Location:** River Ganga Varanasi
- Latitude: `25.3176`
- Longitude: `82.9739`
- Name: `River Ganga, Varanasi Ghat`

**Metals to add:**
1. Metal: `As`, Value: `0.012`, Notes: `Above WHO limit`
2. Metal: `Cd`, Value: `0.004`, Notes: `Above WHO limit`
3. Metal: `Cr`, Value: `0.06`, Notes: `Above WHO limit`
4. Metal: `Cu`, Value: `0.8`, Notes: `Safe level`
5. Metal: `Fe`, Value: `1.2`, Notes: `Above guideline`
6. Metal: `Mn`, Value: `0.8`, Notes: `Above guideline`
7. Metal: `Ni`, Value: `0.03`, Notes: `Above WHO limit`

---

## 🌱 Scenario 5: Agricultural Area (LOW RISK)
**Location:** Agricultural Punjab
- Latitude: `31.3260`
- Longitude: `75.5762`
- Name: `Agricultural Area, Jalandhar, Punjab`

**Metals to add:**
1. Metal: `As`, Value: `0.008`, Notes: `Below WHO limit`
2. Metal: `Cd`, Value: `0.002`, Notes: `Below WHO limit`
3. Metal: `Cr`, Value: `0.04`, Notes: `Below WHO limit`
4. Metal: `Cu`, Value: `0.5`, Notes: `Safe level`
5. Metal: `Pb`, Value: `0.008`, Notes: `Below WHO limit`
6. Metal: `Zn`, Value: `2.5`, Notes: `Safe level`

---

## 🎮 Testing Instructions:
1. Go to http://localhost:5173/upload
2. Copy-paste coordinates → Lock location
3. Add metals one by one using dropdown and values
4. Click "🧮 Calculate Risk Assessment"
5. Review the environmental risk results!

## 🔍 What to Look For:
- **HPI Values**: < 50 (Low), 50-100 (Medium), 100-200 (High), > 200 (Critical)
- **Color Coding**: Green (Safe), Yellow (Medium), Red (High/Critical)  
- **Risk Level Text**: Should match expected scenario outcomes
- **WHO Compliance**: Check which metals exceed standards

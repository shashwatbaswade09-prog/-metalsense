import React, { useState } from 'react'
import PhotoUpload from '../components/PhotoUpload'
import { environmentalCalcService } from '../utils/environmentalCalculations'

interface ManualEntry {
  lat: number
  lng: number
  metal: string
  value: number
  location?: string
  notes?: string
}

interface CurrentLocation {
  lat: string
  lng: string
  locationName: string
  isLocked: boolean
}

interface MetalEntry {
  metal: string
  value: string
  notes: string
}

export default function DataUpload() {
  // File upload state
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState('')

  // Location-first workflow state
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation>({
    lat: '',
    lng: '',
    locationName: '',
    isLocked: false
  })

  const [metalEntry, setMetalEntry] = useState<MetalEntry>({
    metal: '',
    value: '',
    notes: ''
  })

  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([])
  const [manualStatus, setManualStatus] = useState('')
  const [isSubmittingManual, setIsSubmittingManual] = useState(false)

  // Environmental calculation results
  const [calculationResults, setCalculationResults] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Available metals for selection
  const availableMetals = [
    'As', 'Cd', 'Cr', 'Cu', 'Fe', 'Hg', 'Mn', 'Ni', 'Pb', 'Zn'
  ]

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setStatus('')
    }
  }

  const handleFileSubmit = async () => {
    if (!file) {
      setStatus('❌ Please select a file first')
      return
    }

    setIsSubmitting(true)
    setStatus('📤 Uploading file...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Replace with your actual API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setStatus('✅ File uploaded successfully!')
        setFile(null)
        // Reset the file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setStatus('❌ Upload failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Location management functions
  const lockLocation = () => {
    if (!currentLocation.lat || !currentLocation.lng) {
      setManualStatus('❌ Please enter valid latitude and longitude first')
      return
    }

    setCurrentLocation(prev => ({ ...prev, isLocked: true }))
    setManualStatus(`🔒 Location locked at (${currentLocation.lat}, ${currentLocation.lng})`)
  }

  const unlockLocation = () => {
    setCurrentLocation(prev => ({ ...prev, isLocked: false }))
    setManualStatus('🔓 Location unlocked - you can modify coordinates')
  }

  // Add metal entry for current location
  const addMetalEntry = () => {
    if (!currentLocation.isLocked) {
      setManualStatus('❌ Please lock location first')
      return
    }

    if (!metalEntry.metal || !metalEntry.value) {
      setManualStatus('❌ Please select metal and enter value')
      return
    }

    const newEntry: ManualEntry = {
      lat: parseFloat(currentLocation.lat),
      lng: parseFloat(currentLocation.lng),
      metal: metalEntry.metal,
      value: parseFloat(metalEntry.value),
      location: currentLocation.locationName || undefined,
      notes: metalEntry.notes || undefined
    }

    setManualEntries(prev => [...prev, newEntry])
    setMetalEntry({ metal: '', value: '', notes: '' }) // Reset form
    setManualStatus(`✅ Added ${metalEntry.metal} entry for current location`)
  }

  const removeEntry = (index: number) => {
    const removedEntry = manualEntries[index]
    setManualEntries(prev => prev.filter((_, i) => i !== index))
    setManualStatus(`🗑️ Removed ${removedEntry.metal} entry`)
  }

  const calculateEnvironmentalIndices = async () => {
    if (manualEntries.length === 0) {
      setManualStatus('❌ No entries to calculate')
      return
    }

    setIsCalculating(true)
    setManualStatus('🔄 Calculating environmental indices...')

    try {
      // Convert manual entries to the format expected by the service
      const dataPoint = {
        latitude: manualEntries[0].lat,
        longitude: manualEntries[0].lng,
        metals: manualEntries.map(entry => ({
          name: entry.metal,
          concentration: entry.value,
          standard: 0.05 // Default WHO standard, will be overridden by service
        })),
        sample_date: new Date().toISOString()
      }

      const results = await environmentalCalcService.calculateComprehensiveRisk(dataPoint)
      setCalculationResults(results)
      setManualStatus('✅ Environmental risk assessment completed')
    } catch (error) {
      console.error('Calculation error:', error)
      setManualStatus('❌ Calculation failed')
      setCalculationResults({ error: 'Failed to calculate environmental indices' })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSubmitManualData = async () => {
    if (manualEntries.length === 0) {
      setManualStatus('❌ No entries to submit')
      return
    }

    setIsSubmittingManual(true)
    setManualStatus('📤 Submitting data to database...')

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/manual-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries: manualEntries }),
      })

      if (response.ok) {
        setManualStatus(`✅ Successfully submitted ${manualEntries.length} entries to database`)
        // Optionally clear entries after successful submission
        // setManualEntries([])
      } else {
        throw new Error('Submission failed')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setManualStatus('❌ Submission failed. Please try again.')
    } finally {
      setIsSubmittingManual(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Data Upload</h1>
        <p>Upload your water quality data through file upload, photo analysis, or manual entry.</p>
      </div>

      {/* File Upload Section */}
      <div className="card">
        <h2>📁 File Upload</h2>
        <p>Upload CSV or Excel files with water quality measurements.</p>
        
        <div className="upload-area">
          <input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{ marginBottom: '16px' }}
          />
          
          {file && (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--background-secondary)', borderRadius: '4px' }}>
              <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
          
          <button
            onClick={handleFileSubmit}
            disabled={!file || isSubmitting}
            className="button"
          >
            {isSubmitting ? '📤 Uploading...' : '📤 Upload File'}
          </button>
          
          {status && (
            <div style={{ 
              marginTop: '12px', 
              padding: '12px', 
              borderRadius: '4px',
              backgroundColor: status.includes('❌') ? 'rgba(255, 107, 107, 0.1)' : 
                             status.includes('✅') ? 'rgba(76, 175, 80, 0.1)' : 
                             'rgba(33, 150, 243, 0.1)',
              border: `1px solid ${status.includes('❌') ? 'var(--danger)' : 
                                  status.includes('✅') ? 'var(--safe)' : 
                                  'var(--primary)'}`
            }}>
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Photo Upload Section */}
      <PhotoUpload />

      {/* Manual Entry Section with Location-First Workflow */}
      <div className="card">
        <h2>📝 Manual Entry - Location First Workflow</h2>
        <p>Set your location first, then add multiple metal measurements for that location without re-entering coordinates.</p>
        
        {/* Step 1: Location Setup */}
        <div style={{ 
          border: `2px solid ${currentLocation.isLocked ? 'var(--safe)' : 'var(--border)'}`,
          borderRadius: '8px', 
          padding: '16px', 
          margin: '16px 0',
          backgroundColor: currentLocation.isLocked ? 'rgba(76, 175, 80, 0.05)' : 'transparent'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: currentLocation.isLocked ? 'var(--safe)' : 'var(--primary)'
          }}>
            {currentLocation.isLocked ? '🔒' : '📍'} Step 1: Set Location
            {currentLocation.isLocked && <span style={{ fontSize: '14px', fontWeight: 'normal' }}>(Locked)</span>}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label htmlFor="location-lat" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Latitude *
              </label>
              <input
                id="location-lat"
                type="number"
                step="0.000001"
                placeholder="e.g., 40.7128"
                value={currentLocation.lat}
                onChange={e => setCurrentLocation(prev => ({ ...prev, lat: e.target.value }))}
                disabled={currentLocation.isLocked}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '4px',
                  backgroundColor: currentLocation.isLocked ? 'var(--background-secondary)' : 'var(--bg-elev)',
                  color: 'var(--text)'
                }}
              />
            </div>
            
            <div>
              <label htmlFor="location-lng" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Longitude *
              </label>
              <input
                id="location-lng"
                type="number"
                step="0.000001"
                placeholder="e.g., -74.0060"
                value={currentLocation.lng}
                onChange={e => setCurrentLocation(prev => ({ ...prev, lng: e.target.value }))}
                disabled={currentLocation.isLocked}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '4px',
                  backgroundColor: currentLocation.isLocked ? 'var(--background-secondary)' : 'var(--bg-elev)',
                  color: 'var(--text)'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="location-name" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Location Name (Optional)
            </label>
            <input
              id="location-name"
              type="text"
              placeholder="e.g., Central Park Lake, Sample Site A"
              value={currentLocation.locationName}
              onChange={e => setCurrentLocation(prev => ({ ...prev, locationName: e.target.value }))}
              disabled={currentLocation.isLocked}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid var(--border)', 
                borderRadius: '4px',
                backgroundColor: currentLocation.isLocked ? 'var(--background-secondary)' : 'var(--bg-elev)',
                color: 'var(--text)'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {!currentLocation.isLocked ? (
              <button
                onClick={lockLocation}
                disabled={!currentLocation.lat || !currentLocation.lng}
                className="button"
                style={{ backgroundColor: 'var(--safe)' }}
              >
                🔒 Lock Location
              </button>
            ) : (
              <button
                onClick={unlockLocation}
                className="button"
                style={{ backgroundColor: 'var(--warning)' }}
              >
                🔓 Unlock Location
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Add Metal Entries (only show if location is locked) */}
        {currentLocation.isLocked && (
          <div style={{ 
            border: '2px solid var(--primary)', 
            borderRadius: '8px', 
            padding: '16px', 
            margin: '16px 0',
            backgroundColor: 'rgba(33, 150, 243, 0.05)'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: 'var(--primary)'
            }}>
              🧪 Step 2: Add Metal Measurements
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label htmlFor="metal-select" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Heavy Metal *
                </label>
                <select
                  id="metal-select"
                  value={metalEntry.metal}
                  onChange={e => setMetalEntry(prev => ({ ...prev, metal: e.target.value }))}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid var(--border)', 
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-elev)',
                    color: 'var(--text)'
                  }}
                >
                  <option value="">Select a metal...</option>
                  {availableMetals.map(metal => (
                    <option key={metal} value={metal}>{metal}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="metal-value" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Concentration (mg/L) *
                </label>
                <input
                  id="metal-value"
                  type="number"
                  step="0.001"
                  placeholder="e.g., 0.05"
                  value={metalEntry.value}
                  onChange={e => setMetalEntry(prev => ({ ...prev, value: e.target.value }))}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid var(--border)', 
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-elev)',
                    color: 'var(--text)'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="metal-notes" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Notes (Optional)
              </label>
              <input
                id="metal-notes"
                type="text"
                placeholder="e.g., Sample ID: WS-001, Morning collection"
                value={metalEntry.notes}
                onChange={e => setMetalEntry(prev => ({ ...prev, notes: e.target.value }))}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-elev)',
                  color: 'var(--text)'
                }}
              />
            </div>

            <button
              onClick={addMetalEntry}
              disabled={!metalEntry.metal || !metalEntry.value}
              className="button"
            >
              ➕ Add Metal Entry
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={calculateEnvironmentalIndices}
            disabled={manualEntries.length === 0 || isCalculating}
            className="button"
            style={{ backgroundColor: 'var(--warning)' }}
          >
            {isCalculating ? '🔄 Calculating...' : '🧮 Calculate Risk Assessment'}
          </button>
          
          <button
            onClick={handleSubmitManualData}
            disabled={manualEntries.length === 0 || isSubmittingManual}
            className="button"
          >
            {isSubmittingManual ? '📤 Submitting...' : '📤 Submit to Database'}
          </button>
        </div>

        {/* Status Display */}
        {manualStatus && (
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            borderRadius: '4px',
            backgroundColor: manualStatus.includes('❌') ? 'rgba(255, 107, 107, 0.1)' : 
                           manualStatus.includes('✅') ? 'rgba(76, 175, 80, 0.1)' : 
                           'rgba(33, 150, 243, 0.1)',
            border: `1px solid ${manualStatus.includes('❌') ? 'var(--danger)' : 
                                manualStatus.includes('✅') ? 'var(--safe)' : 
                                'var(--primary)'}`
          }}>
            {manualStatus}
          </div>
        )}
        
        {/* Current Entries Table */}
        {manualEntries.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>📋 Current Entries for this Location ({manualEntries.length})</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--background-secondary)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>Metal</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>Value (mg/L)</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>Notes</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manualEntries.map((entry, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px', fontSize: '12px', fontWeight: '500' }}>{entry.metal}</td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>{entry.value}</td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>{entry.notes || '-'}</td>
                      <td style={{ padding: '8px' }}>
                        <button
                          onClick={() => removeEntry(index)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                        >
                          🗑️ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Environmental Indices Results */}
      {calculationResults && (
        <div className="card">
          <h2>📊 Environmental Risk Assessment Results</h2>
          
          {calculationResults.error && (
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <strong>❌ Calculation Error:</strong> {calculationResults.error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* HPI Results */}
            {calculationResults.hpi && (
              <div style={{
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '16px',
                backgroundColor: calculationResults.hpi.risk_level === 'Critical' ? 'rgba(255, 107, 107, 0.1)' :
                                 calculationResults.hpi.risk_level === 'High' ? 'rgba(255, 193, 7, 0.1)' :
                                 calculationResults.hpi.risk_level === 'Medium' ? 'rgba(255, 235, 59, 0.1)' : 
                                 'rgba(76, 175, 80, 0.1)'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--primary)' }}>
                  Heavy Metal Pollution Index (HPI)
                </h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {calculationResults.hpi.hpi_value}
                </div>
                <div style={{ 
                  color: calculationResults.hpi.risk_level === 'Critical' ? 'var(--danger)' :
                         calculationResults.hpi.risk_level === 'High' ? 'var(--warning)' :
                         calculationResults.hpi.risk_level === 'Medium' ? 'var(--warning)' : 
                         'var(--safe)',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  {calculationResults.hpi.risk_level} Risk
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Standard Limit: {calculationResults.hpi.standard_limit}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Method: {calculationResults.hpi.method}
                </div>
              </div>
            )}

            {/* Add other environmental indices here as needed */}
          </div>

          {/* Summary Section */}
          <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: 'var(--background-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary)' }}>
              📋 Risk Assessment Summary
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {calculationResults.hpi && (
                <div style={{ fontSize: '14px' }}>
                  <strong>HPI:</strong> {calculationResults.hpi.risk_level} ({calculationResults.hpi.hpi_value})
                </div>
              )}
              {/* Add other summary items as needed */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

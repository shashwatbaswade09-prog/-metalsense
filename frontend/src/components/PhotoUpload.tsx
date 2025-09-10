import React, { useState, useCallback } from 'react'
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface PhotoUploadProps {
  onUploadComplete?: (uploadId: string, photoUrl: string) => void
  onUploadError?: (error: string) => void
  maxSizeMB?: number
  className?: string
}

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  uploadId?: string
  photoUrl?: string
  error?: string
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxSizeMB = 5,
  className = ''
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0
  })
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file'
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are supported'
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }

  const uploadPhoto = async (file: File) => {
    try {
      setUploadState({ status: 'uploading', progress: 10 })

      // Step 1: Get signed URL
      const signedUrlResponse = await fetch('/api/v1/photos/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type
        })
      })

      if (!signedUrlResponse.ok) {
        const error = await signedUrlResponse.json()
        throw new Error(error.error || 'Failed to get upload URL')
      }

      const { uploadId, uploadUrl } = await signedUrlResponse.json()
      setUploadState(prev => ({ ...prev, progress: 30, uploadId }))

      // Step 2: Upload file
      const formData = new FormData()
      formData.append('photo', file)

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: formData
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Failed to upload photo')
      }

      const uploadResult = await uploadResponse.json()
      setUploadState(prev => ({ 
        ...prev, 
        status: 'processing', 
        progress: 70,
        photoUrl: uploadResult.url 
      }))

      // Step 3: Wait for processing (via SSE or polling)
      // For now, simulate processing completion
      setTimeout(() => {
        const finalUrl = `/api/v1/photos/${uploadId}`
        setUploadState({
          status: 'completed',
          progress: 100,
          uploadId,
          photoUrl: finalUrl
        })
        onUploadComplete?.(uploadId, finalUrl)
      }, 2000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadState({
        status: 'error',
        progress: 0,
        error: errorMessage
      })
      onUploadError?.(errorMessage)
    }
  }

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: validationError
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    uploadPhoto(file)
  }, [maxSizeMB])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const resetUpload = () => {
    setUploadState({ status: 'idle', progress: 0 })
    setPreviewUrl('')
  }

  const getStatusIcon = () => {
    switch (uploadState.status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />
      case 'uploading':
      case 'processing':
        return (
          <div className="relative">
            <div className="w-8 h-8 border-2 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
          </div>
        )
      default:
        return <Camera className="w-8 h-8 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (uploadState.status) {
      case 'uploading':
        return `Uploading... ${uploadState.progress}%`
      case 'processing':
        return 'Processing image...'
      case 'completed':
        return 'Upload completed!'
      case 'error':
        return uploadState.error || 'Upload failed'
      default:
        return 'Drop an image here or click to select'
    }
  }

  return (
    <div className={`photo-upload-container ${className}`}>
      {previewUrl && (
        <div className="mb-4 relative">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-w-full h-48 object-cover rounded-lg shadow-sm"
          />
          {uploadState.status === 'idle' && (
            <button
              onClick={resetUpload}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${uploadState.status === 'completed' ? 'border-green-400 bg-green-50' : ''}
          ${uploadState.status === 'error' ? 'border-red-400 bg-red-50' : ''}
          ${uploadState.status === 'idle' ? 'hover:border-gray-400 hover:bg-gray-50 cursor-pointer' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-3">
          {getStatusIcon()}
          
          <div className="text-sm font-medium text-gray-900">
            {getStatusText()}
          </div>

          {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
            <div className="w-full max-w-xs">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {uploadState.status === 'idle' && (
            <>
              <label htmlFor="photo-input" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo</span>
                </div>
              </label>
              <input
                id="photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500">
                JPEG, PNG, or WebP up to {maxSizeMB}MB
              </p>
            </>
          )}

          {uploadState.status === 'completed' && uploadState.photoUrl && (
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Upload Another
            </button>
          )}

          {uploadState.status === 'error' && (
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PhotoUpload

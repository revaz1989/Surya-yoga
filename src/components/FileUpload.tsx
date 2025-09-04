'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Film, Loader } from 'lucide-react'

interface FileUploadProps {
  onUpload: (url: string) => void
  onRemove?: (url: string) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  existingFiles?: string[]
  label?: string
  id?: string // Add unique identifier for each FileUpload instance
}

interface UploadedFile {
  url: string
  name: string
  type: string
  size: number
}

export default function FileUpload({
  onUpload,
  onRemove,
  accept = "image/*,video/*",
  multiple = false,
  maxSize = 50 * 1024 * 1024, // 50MB
  existingFiles = [],
  label = "Upload files",
  id = `fileupload-${Math.random().toString(36).substr(2, 9)}` // Generate unique ID
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Check file size
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`)
          continue
        }

        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        const result = await response.json()

        if (result.success) {
          const newFile: UploadedFile = {
            url: result.url,
            name: result.filename,
            type: result.type,
            size: result.size
          }
          
          setUploadedFiles(prev => [...prev, newFile])
          onUpload(result.url)
        } else {
          alert(`Upload failed for ${file.name}: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (url: string) => {
    setUploadedFiles(prev => prev.filter(f => f.url !== url))
    if (onRemove) {
      onRemove(url)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const isVideo = (type: string) => type.startsWith('video/')
  const isImage = (type: string) => type.startsWith('image/')

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-orange-500 bg-orange-50'
            : uploading
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={`${id}-input`}
          name={`${id}-input`}
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          autoComplete="off"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">{label}</p>
              <p className="text-sm text-gray-500">
                Drag and drop files here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Max file size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Current files:</h4>
          <div className="grid grid-cols-1 gap-2">
            {existingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {file.includes('video') || file.includes('.mp4') || file.includes('.avi') ? (
                    <Film className="w-5 h-5 text-blue-500" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-green-500" />
                  )}
                  <span className="text-sm text-gray-700 truncate">
                    {file.split('/').pop()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(file)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Uploaded files:</h4>
          <div className="grid grid-cols-1 gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {isVideo(file.type) ? (
                    <Film className="w-5 h-5 text-blue-500" />
                  ) : isImage(file.type) ? (
                    <ImageIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <Upload className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(file.url)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, Video, Upload, X } from 'lucide-react'

interface MediaUploadProps {
  allowImage: boolean
  allowVideo: boolean
  maxVideoLength: number
  onUpload: (url: string, type: 'image' | 'video') => void
  primaryColor: string
  borderRadius: string
}

export function MediaUpload({
  allowImage,
  allowVideo,
  maxVideoLength,
  onUpload,
  primaryColor,
  borderRadius,
}: MediaUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    type: 'image' | 'video'
    name: string
  } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      alert('Please select an image or video file')
      return
    }

    if (isImage && !allowImage) {
      alert('Image uploads are not allowed')
      return
    }

    if (isVideo && !allowVideo) {
      alert('Video uploads are not allowed')
      return
    }

    // Validate file size
    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024 // 5MB for images, 50MB for videos
    if (file.size > maxSize) {
      alert(`File size exceeds ${isImage ? '5MB' : '50MB'} limit`)
      return
    }

    setIsUploading(true)

    try {
      // In a real implementation, you would upload to a service like Uploadthing or Vercel Blob
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file)
      
      setUploadedFile({
        url,
        type: isImage ? 'image' : 'video',
        name: file.name,
      })
      
      onUpload(url, isImage ? 'image' : 'video')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    if (uploadedFile?.url) {
      URL.revokeObjectURL(uploadedFile.url)
    }
    setUploadedFile(null)
    onUpload('', 'image')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">
        Add Media (Optional)
      </label>

      {!uploadedFile ? (
        <Card 
          className="border-2 border-dashed p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={`${allowImage ? 'image/*' : ''}${allowImage && allowVideo ? ',' : ''}${allowVideo ? 'video/*' : ''}`}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex justify-center gap-4 mb-4">
            {allowImage && (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Camera className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            )}
            {allowVideo && (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Video className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>
          
          <p className="text-sm font-medium mb-1">
            {allowImage && allowVideo ? 'Upload a photo or video' : 
             allowImage ? 'Upload a photo' : 'Upload a video'}
          </p>
          <p className="text-xs text-gray-500">
            {allowImage && `Images up to 5MB`}
            {allowImage && allowVideo && ' • '}
            {allowVideo && `Videos up to 50MB (${maxVideoLength}s max)`}
          </p>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Choose File'}
          </Button>
        </Card>
      ) : (
        <Card 
          className="p-4"
          style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                {uploadedFile.type === 'image' ? (
                  <Camera className="w-5 h-5" style={{ color: primaryColor }} />
                ) : (
                  <Video className="w-5 h-5" style={{ color: primaryColor }} />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {uploadedFile.type === 'image' ? 'Image' : 'Video'} uploaded
                </p>
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Preview */}
          {uploadedFile.type === 'image' && (
            <img
              src={uploadedFile.url}
              alt="Preview"
              className="mt-3 w-full h-32 object-cover rounded"
              style={{ borderRadius: `${parseInt(borderRadius) / 4}px` }}
            />
          )}
          
          {uploadedFile.type === 'video' && (
            <video
              src={uploadedFile.url}
              controls
              className="mt-3 w-full h-32 object-cover rounded"
              style={{ borderRadius: `${parseInt(borderRadius) / 4}px` }}
            />
          )}
        </Card>
      )}
    </div>
  )
}
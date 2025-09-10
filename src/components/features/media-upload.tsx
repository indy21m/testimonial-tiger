'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, Video, Upload, X } from 'lucide-react'
import { VideoRecorder } from '@/components/features/video-recorder'
import { uploadImage, uploadVideoBlob } from '@/lib/upload'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      // Upload to storage service
      const url = await uploadImage(file)

      setUploadedFile({
        url,
        type: isImage ? 'image' : 'video',
        name: file.name,
      })

      onUpload(url, isImage ? 'image' : 'video')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload file'
      )
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

  const handleVideoRecordingComplete = async (blob: Blob, _url: string) => {
    setIsUploading(true)
    try {
      // Upload video blob to storage
      const uploadedUrl = await uploadVideoBlob(blob)

      setUploadedFile({
        url: uploadedUrl,
        type: 'video',
        name: `video-${Date.now()}.webm`,
      })
      onUpload(uploadedUrl, 'video')
      setShowVideoRecorder(false)
    } catch (error) {
      console.error('Video upload failed:', error)
      toast.error('Failed to upload video. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="mb-2 block text-sm font-medium">
        Add Media (Optional)
      </label>

      {!uploadedFile ? (
        <Card
          className="cursor-pointer border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50"
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

          <div className="mb-4 flex justify-center gap-4">
            {allowImage && (
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <Camera className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            )}
            {allowVideo && (
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <Video className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>

          <p className="mb-1 text-sm font-medium">
            {allowImage && allowVideo
              ? 'Upload a photo or video'
              : allowImage
                ? 'Upload a photo'
                : 'Upload a video'}
          </p>
          <p className="text-xs text-gray-500">
            {allowImage && `Images up to 5MB`}
            {allowImage && allowVideo && ' • '}
            {allowVideo && `Videos up to 50MB (${maxVideoLength}s max)`}
          </p>

          <div className="mt-4 flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
            {allowVideo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowVideoRecorder(true)}
              >
                <Video className="mr-2 h-4 w-4" />
                Record Video
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card
          className="p-4"
          style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="rounded-full p-2"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                {uploadedFile.type === 'image' ? (
                  <Camera className="h-5 w-5" style={{ color: primaryColor }} />
                ) : (
                  <Video className="h-5 w-5" style={{ color: primaryColor }} />
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
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview */}
          {uploadedFile.type === 'image' && (
            <img
              src={uploadedFile.url}
              alt="Preview"
              className="mt-3 h-32 w-full rounded object-cover"
              style={{ borderRadius: `${parseInt(borderRadius) / 4}px` }}
            />
          )}

          {uploadedFile.type === 'video' && (
            <video
              src={uploadedFile.url}
              controls
              className="mt-3 h-32 w-full rounded object-cover"
              style={{ borderRadius: `${parseInt(borderRadius) / 4}px` }}
            />
          )}
        </Card>
      )}

      {/* Video Recorder Dialog */}
      <Dialog open={showVideoRecorder} onOpenChange={setShowVideoRecorder}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Record Video Testimonial</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            <VideoRecorder
              maxLength={maxVideoLength}
              onRecordingComplete={handleVideoRecordingComplete}
              onCancel={() => setShowVideoRecorder(false)}
              primaryColor={primaryColor}
              borderRadius={borderRadius}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

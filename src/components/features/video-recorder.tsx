'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Video,
  Circle,
  Square,
  RotateCcw,
  Check,
  Loader2,
  Camera,
  AlertCircle,
} from 'lucide-react'

interface VideoRecorderProps {
  maxLength: number // in seconds
  onRecordingComplete: (blob: Blob, url: string) => void
  onCancel: () => void
  primaryColor: string
  borderRadius: string
}

export function VideoRecorder({
  maxLength,
  onRecordingComplete,
  onCancel,
  primaryColor,
  borderRadius,
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedUrl, setRecordedUrl] = useState<string>()
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Request camera permission and setup stream
  const setupCamera = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(undefined)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: true,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setHasPermission(true)
    } catch (err) {
      console.error('Camera access error:', err)
      setHasPermission(false)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError(
            'Camera access denied. Please allow camera access to record a video testimonial.'
          )
        } else if (err.name === 'NotFoundError') {
          setError(
            'No camera found. Please connect a camera to record a video testimonial.'
          )
        } else {
          setError('Failed to access camera. Please try again.')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize camera on mount
  useEffect(() => {
    setupCamera()

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl)
      }
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!streamRef.current) return

    chunksRef.current = []

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9,opus',
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecordedUrl(url)

      // Stop the camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start(100) // Collect data every 100ms

    setIsRecording(true)
    setRecordingTime(0)

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const newTime = prev + 1
        if (newTime >= maxLength) {
          stopRecording()
        }
        return newTime
      })
    }, 1000)
  }, [maxLength])

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop()
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setIsRecording(false)
    setIsPaused(false)
  }, [])

  const pauseRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'paused'
    ) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)

      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          if (newTime >= maxLength) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)
    }
  }, [maxLength, stopRecording])

  const retakeVideo = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
      setRecordedUrl(undefined)
    }
    setRecordingTime(0)
    setupCamera()
  }, [recordedUrl, setupCamera])

  const acceptVideo = useCallback(() => {
    if (recordedUrl && chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      onRecordingComplete(blob, recordedUrl)
    }
  }, [recordedUrl, onRecordingComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <Card className="p-8" style={{ borderRadius }}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Setting up camera...</p>
        </div>
      </Card>
    )
  }

  if (hasPermission === false || error) {
    return (
      <Card className="p-6" style={{ borderRadius }}>
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Camera Access Required</strong>
            <p className="mt-2">
              {error ||
                'Please allow camera access to record a video testimonial.'}
            </p>
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex gap-3">
          <Button onClick={setupCamera} variant="outline">
            <Camera className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden" style={{ borderRadius }}>
      {/* Video Display */}
      <div className="relative aspect-video bg-black">
        {recordedUrl ? (
          <video
            src={recordedUrl}
            controls
            className="h-full w-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="mirror h-full w-full object-contain"
            style={{ transform: 'scaleX(-1)' }}
          />
        )}

        {/* Recording indicator */}
        {isRecording && !recordedUrl && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-white">
            <Circle className="h-3 w-3 animate-pulse fill-current" />
            <span className="text-sm font-medium">REC</span>
          </div>
        )}

        {/* Timer */}
        {(isRecording || isPaused) && !recordedUrl && (
          <div className="absolute right-4 top-4 rounded-lg bg-black/50 px-3 py-1.5 text-white">
            <span className="font-mono text-sm">
              {formatTime(recordingTime)} / {formatTime(maxLength)}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {(isRecording || isPaused) && !recordedUrl && (
        <Progress
          value={(recordingTime / maxLength) * 100}
          className="h-1 rounded-none"
        />
      )}

      {/* Controls */}
      <div className="bg-gray-50 p-4 dark:bg-gray-800">
        {!recordedUrl ? (
          <div className="flex items-center justify-center gap-3">
            {!isRecording ? (
              <>
                <Button
                  onClick={startRecording}
                  size="lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Circle className="mr-2 h-5 w-5 fill-current" />
                  Start Recording
                </Button>
                <Button onClick={onCancel} variant="outline" size="lg">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {isPaused ? (
                  <Button onClick={resumeRecording} size="lg" variant="outline">
                    <Video className="mr-2 h-5 w-5" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseRecording} size="lg" variant="outline">
                    <Square className="mr-2 h-5 w-5" />
                    Pause
                  </Button>
                )}
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Square className="mr-2 h-5 w-5 fill-current" />
                  Stop Recording
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Review your video testimonial
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={retakeVideo} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-5 w-5" />
                Retake
              </Button>
              <Button
                onClick={acceptVideo}
                size="lg"
                style={{ backgroundColor: primaryColor }}
              >
                <Check className="mr-2 h-5 w-5" />
                Use This Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

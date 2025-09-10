// Upload service for media files
// Using base64 data URLs for MVP, can switch to Vercel Blob or Uploadthing later

export async function uploadFile(
  file: File | Blob,
  _type: 'image' | 'video'
): Promise<string> {
  // For MVP, we'll use data URLs
  // In production, replace with Vercel Blob Storage or Uploadthing

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result)
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

export async function uploadVideoBlob(blob: Blob): Promise<string> {
  // Convert blob to data URL for MVP
  // In production, upload to cloud storage
  return uploadFile(blob, 'video')
}

export async function uploadImage(file: File): Promise<string> {
  // Validate image
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please upload an image.')
  }

  // Check file size (5MB max for images)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size exceeds 5MB limit')
  }

  return uploadFile(file, 'image')
}

// Helper to extract file type from data URL
export function getFileTypeFromDataUrl(
  dataUrl: string
): 'image' | 'video' | null {
  if (dataUrl.startsWith('data:image/')) return 'image'
  if (dataUrl.startsWith('data:video/')) return 'video'
  return null
}

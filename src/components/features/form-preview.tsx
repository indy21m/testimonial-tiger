'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface FormPreviewProps {
  form: {
    id: string
    name: string
    slug: string
    config: {
      title: string
      description: string
      questions: Array<{
        id: string
        type: 'text' | 'textarea' | 'rating' | 'select'
        label: string
        placeholder?: string
        required: boolean
        options?: string[]
      }>
      styling: {
        theme: 'minimal' | 'modern' | 'bold' | 'custom'
        primaryColor: string
        backgroundColor: string
        fontFamily: string
        borderRadius: 'none' | 'small' | 'medium' | 'large'
        showLogo: boolean
        logoUrl?: string
      }
      settings: {
        requireEmail: boolean
        requireName: boolean
        allowVideo: boolean
        allowImage: boolean
        maxVideoLength: number
        autoApprove: boolean
        sendEmailNotification: boolean
        redirectUrl?: string
        successMessage: string
      }
    }
  }
}

const radiusMap = {
  none: '0px',
  small: '4px',
  medium: '8px',
  large: '16px',
}

export function FormPreview({ form }: FormPreviewProps) {
  const { styling, settings } = form.config
  const borderRadius = radiusMap[styling.borderRadius]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="overflow-hidden"
        style={{
          borderRadius,
          backgroundColor: styling.backgroundColor,
          fontFamily: styling.fontFamily,
        }}
      >
        {/* Header */}
        <div
          className="p-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${styling.primaryColor} 0%, ${styling.primaryColor}dd 100%)`,
          }}
        >
          {styling.showLogo && styling.logoUrl && (
            <img src={styling.logoUrl} alt="Logo" className="mb-4 h-8" />
          )}
          <h2 className="mb-2 text-2xl font-bold">{form.config.title}</h2>
          <p className="opacity-90">{form.config.description}</p>
        </div>

        {/* Form Content */}
        <div className="space-y-4 p-6">
          {/* Default Fields */}
          {settings.requireName && (
            <div>
              <Label className="mb-1 block text-sm font-medium">
                Your Name{' '}
                {settings.requireName && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Input
                placeholder="John Doe"
                style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
              />
            </div>
          )}

          {settings.requireEmail && (
            <div>
              <Label className="mb-1 block text-sm font-medium">
                Email Address{' '}
                {settings.requireEmail && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Input
                type="email"
                placeholder="john@example.com"
                style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
              />
            </div>
          )}

          {/* Main Testimonial Field */}
          <div>
            <Label className="mb-1 block text-sm font-medium">
              Your Testimonial <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Share your experience..."
              rows={4}
              style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
            />
          </div>

          {/* Custom Questions */}
          {form.config.questions.map((question) => (
            <div key={question.id}>
              <Label className="mb-1 block text-sm font-medium">
                {question.label}{' '}
                {question.required && <span className="text-red-500">*</span>}
              </Label>

              {question.type === 'text' && (
                <Input
                  placeholder={question.placeholder || ''}
                  style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
                />
              )}

              {question.type === 'textarea' && (
                <Textarea
                  placeholder={question.placeholder || ''}
                  rows={3}
                  style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
                />
              )}

              {question.type === 'rating' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="text-2xl transition-transform hover:scale-110"
                      style={{ color: styling.primaryColor }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'select' && (
                <select
                  className="w-full rounded-md border p-2"
                  style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
                >
                  <option value="">Choose an option</option>
                  {question.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* Media Upload Options */}
          {(settings.allowImage || settings.allowVideo) && (
            <div className="border-t pt-4">
              <Label className="mb-2 block text-sm font-medium">
                Add Media (Optional)
              </Label>
              <div className="flex gap-2">
                {settings.allowImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
                  >
                    📷 Add Photo
                  </Button>
                )}
                {settings.allowVideo && (
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
                  >
                    🎥 Record Video ({settings.maxVideoLength}s max)
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full"
            style={{
              backgroundColor: styling.primaryColor,
              borderRadius: `${parseInt(borderRadius) / 2}px`,
            }}
          >
            Submit Testimonial
          </Button>

          {/* Privacy Note */}
          <p className="text-center text-xs text-gray-500">
            By submitting, you agree to our terms and privacy policy.
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

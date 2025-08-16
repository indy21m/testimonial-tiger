'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/trpc/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MediaUpload } from '@/components/features/media-upload'
import { SuccessMessage } from '@/components/features/success-message'
import { Loader2, Star } from 'lucide-react'

interface TestimonialFormProps {
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
      styling: {
        theme: 'minimal' | 'modern' | 'bold' | 'custom'
        primaryColor: string
        backgroundColor: string
        fontFamily: string
        borderRadius: 'none' | 'small' | 'medium' | 'large'
        showLogo: boolean
        logoUrl?: string
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

export function TestimonialForm({ form }: TestimonialFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [rating, setRating] = useState(5)
  const [mediaUrl, setMediaUrl] = useState<string>()
  const [mediaType, setMediaType] = useState<'image' | 'video'>()
  
  const { styling, settings } = form.config
  const borderRadius = radiusMap[styling.borderRadius]

  // Base schema that always exists
  const baseSchema = z.object({
    content: z.string().min(10, 'Please write at least 10 characters'),
    customerName: settings.requireName 
      ? z.string().min(2, 'Name is required')
      : z.string().optional(),
    customerEmail: settings.requireEmail
      ? z.string().email('Valid email is required')
      : z.string().optional(),
  })

  // Use a simple type that matches what we actually use
  type FormData = {
    content: string
    customerName?: string
    customerEmail?: string
    [key: string]: unknown
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(baseSchema.passthrough()) as any,
    defaultValues: {
      content: '',
      customerName: '',
      customerEmail: '',
    }
  })

  const submitTestimonial = api.testimonial.submit.useMutation({
    onSuccess: () => {
      setIsSubmitted(true)
      const redirectUrl = settings.redirectUrl
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 2000)
      }
    },
  })

  const onSubmit = async (data: FormData) => {
    const customAnswers: Record<string, unknown> = {}
    
    form.config.questions.forEach((question) => {
      const value = data[question.id]
      if (value !== undefined && value !== '') {
        customAnswers[question.id] = value
      }
    })

    await submitTestimonial.mutateAsync({
      formId: form.id,
      content: data.content,
      rating,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhoto: mediaType === 'image' ? mediaUrl : undefined,
      videoUrl: mediaType === 'video' ? mediaUrl : undefined,
      customAnswers,
    })
  }

  if (isSubmitted) {
    return <SuccessMessage message={settings.successMessage} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className="overflow-hidden shadow-xl"
        style={{
          borderRadius,
          backgroundColor: styling.backgroundColor,
          fontFamily: styling.fontFamily,
        }}
      >
        {/* Header */}
        <div
          className="p-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${styling.primaryColor} 0%, ${styling.primaryColor}dd 100%)`,
          }}
        >
          {styling.showLogo && styling.logoUrl && (
            <img
              src={styling.logoUrl}
              alt="Logo"
              className="h-10 mb-6"
            />
          )}
          <h1 className="text-3xl font-bold mb-3">{form.config.title}</h1>
          <p className="text-lg opacity-95">{form.config.description}</p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Name Field */}
          {settings.requireName && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register('customerName')}
                placeholder="John Doe"
                style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
                className={errors.customerName ? 'border-red-500' : ''}
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
              )}
            </div>
          )}

          {/* Email Field */}
          {settings.requireEmail && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                {...register('customerEmail')}
                placeholder="john@example.com"
                style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
                className={errors.customerEmail ? 'border-red-500' : ''}
              />
              {errors.customerEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>
              )}
            </div>
          )}

          {/* Rating */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              How would you rate your experience? <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl transition-all hover:scale-110"
                  style={{ 
                    color: star <= rating ? styling.primaryColor : '#D1D5DB'
                  }}
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Main Testimonial */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Your Testimonial <span className="text-red-500">*</span>
            </Label>
            <Textarea
              {...register('content')}
              placeholder="Share your experience with us..."
              rows={5}
              style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* Custom Questions */}
          {form.config.questions.map((question) => (
            <div key={question.id}>
              <Label className="text-sm font-medium mb-2 block">
                {question.label} {question.required && <span className="text-red-500">*</span>}
              </Label>
              
              {question.type === 'text' && (
                <Input
                  {...register(question.id)}
                  placeholder={question.placeholder || ''}
                  style={{ borderRadius: `${parseInt(borderRadius) / 2}px` }}
                />
              )}
              
              {question.type === 'textarea' && (
                <Textarea
                  {...register(question.id)}
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
                      type="button"
                      onClick={() => setValue(question.id, star)}
                      className="text-2xl transition-all hover:scale-110"
                      style={{ 
                        color: star <= (watch(question.id) as number || 0) ? styling.primaryColor : '#D1D5DB'
                      }}
                    >
                      <Star className={`w-6 h-6 ${star <= (watch(question.id) as number || 0) ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              )}
              
              {question.type === 'select' && (
                <select
                  {...register(question.id)}
                  className="w-full p-2 border rounded-md"
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

              {errors[question.id] && (
                <p className="text-red-500 text-sm mt-1">
                  {(errors[question.id] as any)?.message}
                </p>
              )}
            </div>
          ))}

          {/* Media Upload */}
          {(settings.allowImage || settings.allowVideo) && (
            <MediaUpload
              allowImage={settings.allowImage}
              allowVideo={settings.allowVideo}
              maxVideoLength={settings.maxVideoLength}
              onUpload={(url, type) => {
                setMediaUrl(url)
                setMediaType(type)
              }}
              primaryColor={styling.primaryColor}
              borderRadius={borderRadius}
            />
          )}

          {/* Honeypot field for spam protection */}
          <input
            type="text"
            name="website"
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 text-lg font-semibold"
            style={{
              backgroundColor: styling.primaryColor,
              borderRadius: `${parseInt(borderRadius) / 2}px`,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Testimonial'
            )}
          </Button>

          {/* Privacy Note */}
          <p className="text-xs text-center text-gray-500">
            By submitting, you agree to our terms and privacy policy.
            Your testimonial may be displayed publicly.
          </p>
        </form>
      </Card>
    </motion.div>
  )
}
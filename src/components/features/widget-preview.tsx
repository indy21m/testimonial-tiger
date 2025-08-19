'use client'

import { useState, useEffect } from 'react'
import { Widget, Testimonial } from '@/server/db/schema'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface WidgetPreviewProps {
  widget: Widget
  testimonials: (Testimonial & { form?: { name: string } })[]
}

export function WidgetPreview({ widget, testimonials }: WidgetPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { config } = widget

  // Auto-play carousel
  useEffect(() => {
    if (widget.type === 'carousel' && testimonials.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length)
      }, 5000)
      return () => clearInterval(timer)
    }
    return undefined
  }, [widget.type, testimonials.length])

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  }

  const layoutPadding = {
    compact: 'p-3',
    comfortable: 'p-4',
    spacious: 'p-6',
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length === 1) {
      return parts[0]?.substring(0, 2).toUpperCase() || ''
    }
    const firstInitial = parts[0]?.[0] || ''
    const lastInitial = parts[parts.length - 1]?.[0] || ''
    return (firstInitial + lastInitial).toUpperCase()
  }

  const renderAvatar = (testimonial: Testimonial) => {
    if (testimonial.customerPhoto) {
      return (
        <img
          src={testimonial.customerPhoto}
          alt={testimonial.customerName}
          className="w-10 h-10 rounded-full object-cover"
        />
      )
    }

    // Use fallback avatar configuration
    const fallbackConfig = config.styling.fallbackAvatar || {
      type: 'initials',
      backgroundColor: '#3b82f6',
      textColor: '#FFFFFF',
    }

    if (fallbackConfig.type === 'placeholder' && fallbackConfig.placeholderUrl) {
      return (
        <img
          src={fallbackConfig.placeholderUrl}
          alt={testimonial.customerName}
          className="w-10 h-10 rounded-full object-cover"
        />
      )
    }

    // Default to initials
    return (
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
        style={{
          backgroundColor: fallbackConfig.backgroundColor || '#3b82f6',
          color: fallbackConfig.textColor || '#FFFFFF',
        }}
      >
        {getInitials(testimonial.customerName)}
      </div>
    )
  }

  const renderTestimonialCard = (testimonial: Testimonial, index?: number) => {
    const isActive = widget.type === 'carousel' ? index === currentSlide : true
    
    return (
      <div
        key={testimonial.id}
        className={cn(
          'transition-all duration-300',
          widget.type === 'carousel' && !isActive && 'hidden',
          shadowClasses[config.styling.shadow],
          layoutPadding[config.styling.layout],
          'bg-white dark:bg-gray-800 rounded-lg'
        )}
        style={{
          backgroundColor: config.styling.theme === 'custom' ? config.styling.backgroundColor : undefined,
          borderRadius: config.styling.borderRadius,
          color: config.styling.theme === 'custom' ? config.styling.textColor : undefined,
        }}
      >
        {/* Rating */}
        {config.display.showRating && testimonial.rating && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < testimonial.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                )}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <p className="text-sm leading-relaxed mb-4">
          {config.display.maxLength && testimonial.content.length > config.display.maxLength
            ? `${testimonial.content.slice(0, config.display.maxLength)}...`
            : testimonial.content}
        </p>

        {/* Customer Info */}
        <div className="flex items-center gap-3">
          {config.display.showPhoto && (
            <div className="flex-shrink-0">
              {renderAvatar(testimonial)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{testimonial.customerName}</p>
            {config.display.showCompany && testimonial.customerCompany && (
              <p className="text-xs text-gray-500 truncate">{testimonial.customerCompany}</p>
            )}
            {config.display.showDate && testimonial.submittedAt && (
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(testimonial.submittedAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No testimonials match your filter criteria</p>
        <p className="text-sm mt-2">Try adjusting your filters to see testimonials</p>
      </div>
    )
  }

  switch (widget.type) {
    case 'wall':
      return (
        <div className="grid gap-4" style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}>
          {testimonials.slice(0, config.display.itemsPerPage || 9).map((testimonial) =>
            renderTestimonialCard(testimonial)
          )}
        </div>
      )

    case 'carousel':
      return (
        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-300">
              {testimonials.map((testimonial, index) =>
                renderTestimonialCard(testimonial, index)
              )}
            </div>
          </div>
          {testimonials.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                style={{
                  backgroundColor: config.styling.theme === 'custom' ? config.styling.backgroundColor : undefined,
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % testimonials.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                style={{
                  backgroundColor: config.styling.theme === 'custom' ? config.styling.backgroundColor : undefined,
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === currentSlide
                        ? 'w-6 bg-primary'
                        : 'bg-gray-300 dark:bg-gray-600'
                    )}
                    style={{
                      backgroundColor: index === currentSlide && config.styling.theme === 'custom'
                        ? config.styling.primaryColor
                        : undefined,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )

    case 'grid':
      return (
        <div className="grid grid-cols-3 gap-4">
          {testimonials.slice(0, config.display.itemsPerPage || 9).map((testimonial) =>
            renderTestimonialCard(testimonial)
          )}
        </div>
      )

    case 'single':
      return testimonials[0] ? renderTestimonialCard(testimonials[0]) : null

    case 'badge':
      const averageRating = testimonials.reduce((acc, t) => acc + (t.rating || 0), 0) / testimonials.length
      return (
        <div
          className={cn(
            'inline-flex items-center gap-3',
            shadowClasses[config.styling.shadow],
            layoutPadding[config.styling.layout],
            'bg-white dark:bg-gray-800 rounded-full'
          )}
          style={{
            backgroundColor: config.styling.theme === 'custom' ? config.styling.backgroundColor : undefined,
            color: config.styling.theme === 'custom' ? config.styling.textColor : undefined,
          }}
        >
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <div className="text-sm font-medium">
            {averageRating.toFixed(1)} ({testimonials.length} reviews)
          </div>
        </div>
      )

    default:
      return null
  }
}
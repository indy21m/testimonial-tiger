'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Star, User, Mail, Building, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TestimonialCardProps {
  testimonial: {
    id: string
    customerName: string
    customerEmail?: string | null
    customerCompany?: string | null
    customerPhoto?: string | null
    content: string
    rating?: number | null
    status: 'pending' | 'approved' | 'rejected' | null
    featured: boolean | null
    submittedAt: Date | null
    videoUrl?: string | null
  }
  isSelected: boolean
  onSelect: () => void
  onApprove: () => void
  onReject: () => void
  onToggleFeatured: () => void
}

export function TestimonialCard({
  testimonial,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onToggleFeatured,
}: TestimonialCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  }
  
  const status = testimonial.status || 'pending'

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="mt-1 rounded"
            />
            
            {/* Customer Photo or Avatar */}
            {testimonial.customerPhoto ? (
              <img
                src={testimonial.customerPhoto}
                alt={testimonial.customerName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{testimonial.customerName}</h3>
                <Badge className={statusColors[status]} variant="secondary">
                  {status}
                </Badge>
                {testimonial.featured && (
                  <Badge variant="default" className="bg-purple-600">
                    Featured
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {testimonial.customerEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {testimonial.customerEmail}
                  </div>
                )}
                {testimonial.customerCompany && (
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {testimonial.customerCompany}
                  </div>
                )}
                {testimonial.submittedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(testimonial.submittedAt), { addSuffix: true })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating */}
          {testimonial.rating && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < testimonial.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
          {testimonial.content}
        </p>

        {testimonial.videoUrl && (
          <Badge variant="outline" className="mb-4">
            📹 Has video
          </Badge>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {status === 'pending' && (
            <>
              <Button size="sm" onClick={onApprove}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={onReject}>
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          {status === 'approved' && (
            <Button
              size="sm"
              variant={testimonial.featured ? 'default' : 'outline'}
              onClick={onToggleFeatured}
            >
              <Star className={`w-4 h-4 mr-1 ${testimonial.featured ? 'fill-current' : ''}`} />
              {testimonial.featured ? 'Featured' : 'Feature'}
            </Button>
          )}

          {status === 'rejected' && (
            <Button size="sm" variant="outline" onClick={onApprove}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
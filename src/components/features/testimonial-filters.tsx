'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

interface TestimonialFiltersProps {
  forms: Array<{
    id: string
    name: string
  }>
  selectedForm?: string
  onFormChange: (formId?: string) => void
  searchTerm: string
  onSearchChange: (search: string) => void
}

export function TestimonialFilters({
  forms,
  selectedForm,
  onFormChange,
  searchTerm,
  onSearchChange,
}: TestimonialFiltersProps) {
  return (
    <div className="mb-6 flex gap-4">
      {/* Form Filter */}
      <Select
        value={selectedForm || 'all'}
        onValueChange={(value) =>
          onFormChange(value === 'all' ? undefined : value)
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Forms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Forms</SelectItem>
          {forms.map((form) => (
            <SelectItem key={form.id} value={form.id}>
              {form.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          type="search"
          placeholder="Search testimonials..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  )
}

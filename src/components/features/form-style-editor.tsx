'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FormStyleEditorProps {
  styling: {
    theme: 'minimal' | 'modern' | 'bold' | 'custom'
    primaryColor: string
    backgroundColor: string
    fontFamily: string
    borderRadius: 'none' | 'small' | 'medium' | 'large'
    showLogo: boolean
    logoUrl?: string
  }
  onChange: (styling: Record<string, unknown>) => void
}

const themes = {
  minimal: {
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 'small' as const,
  },
  modern: {
    primaryColor: '#3b82f6',
    backgroundColor: '#f9fafb',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 'medium' as const,
  },
  bold: {
    primaryColor: '#dc2626',
    backgroundColor: '#ffffff',
    fontFamily: 'Poppins, sans-serif',
    borderRadius: 'large' as const,
  },
}

const fontOptions = [
  { value: 'Inter, sans-serif', label: 'Inter (Clean & Modern)' },
  { value: 'Poppins, sans-serif', label: 'Poppins (Friendly)' },
  { value: 'Roboto, sans-serif', label: 'Roboto (Professional)' },
  { value: 'Playfair Display, serif', label: 'Playfair (Elegant)' },
  { value: 'Space Grotesk, sans-serif', label: 'Space Grotesk (Tech)' },
]

export function FormStyleEditor({ styling, onChange }: FormStyleEditorProps) {
  const [activeTab, setActiveTab] = useState('themes')

  const handleThemeSelect = (theme: keyof typeof themes) => {
    onChange({
      ...styling,
      theme,
      ...themes[theme],
    })
  }

  const handleCustomChange = (updates: Partial<typeof styling>) => {
    onChange({
      ...styling,
      ...updates,
      theme: 'custom',
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Theme</CardTitle>
              <CardDescription>
                Start with a pre-designed theme and customize it to match your
                brand
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {Object.entries(themes).map(([key, theme]) => (
                <div
                  key={key}
                  onClick={() => handleThemeSelect(key as keyof typeof themes)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    styling.theme === key
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium capitalize">{key}</span>
                    {styling.theme === key && (
                      <span className="rounded bg-primary px-2 py-1 text-xs text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: theme.backgroundColor }}
                    />
                    <span className="text-sm text-gray-600">
                      {theme.fontFamily.split(',')[0]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {theme.borderRadius} corners
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-4">
          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
              <CardDescription>
                Customize the color scheme of your form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Primary Color</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    type="color"
                    value={styling.primaryColor}
                    onChange={(e) =>
                      handleCustomChange({ primaryColor: e.target.value })
                    }
                    className="h-10 w-20"
                  />
                  <Input
                    type="text"
                    value={styling.primaryColor}
                    onChange={(e) =>
                      handleCustomChange({ primaryColor: e.target.value })
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Background Color</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    type="color"
                    value={styling.backgroundColor}
                    onChange={(e) =>
                      handleCustomChange({ backgroundColor: e.target.value })
                    }
                    className="h-10 w-20"
                  />
                  <Input
                    type="text"
                    value={styling.backgroundColor}
                    onChange={(e) =>
                      handleCustomChange({ backgroundColor: e.target.value })
                    }
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>
                Choose fonts that match your brand personality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={styling.fontFamily}
                onValueChange={(value) =>
                  handleCustomChange({ fontFamily: value })
                }
              >
                {fontOptions.map((font) => (
                  <div
                    key={font.value}
                    className="flex items-center space-x-2 py-2"
                  >
                    <RadioGroupItem value={font.value} id={font.value} />
                    <Label
                      htmlFor={font.value}
                      className="flex-1 cursor-pointer"
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Border Radius */}
          <Card>
            <CardHeader>
              <CardTitle>Corner Style</CardTitle>
              <CardDescription>
                Adjust the roundness of form elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={styling.borderRadius}
                onValueChange={(value: string) =>
                  handleCustomChange({
                    borderRadius: value as
                      | 'none'
                      | 'small'
                      | 'medium'
                      | 'large',
                  })
                }
              >
                <div className="grid grid-cols-2 gap-3">
                  {['none', 'small', 'medium', 'large'].map((radius) => (
                    <div key={radius} className="flex items-center space-x-2">
                      <RadioGroupItem value={radius} id={radius} />
                      <Label
                        htmlFor={radius}
                        className="cursor-pointer capitalize"
                      >
                        {radius}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Display your logo at the top of the form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-logo">Show Logo</Label>
                <Switch
                  id="show-logo"
                  checked={styling.showLogo}
                  onCheckedChange={(checked) =>
                    handleCustomChange({ showLogo: checked })
                  }
                />
              </div>

              {styling.showLogo && (
                <div>
                  <Label>Logo URL</Label>
                  <Input
                    type="url"
                    value={styling.logoUrl || ''}
                    onChange={(e) =>
                      handleCustomChange({ logoUrl: e.target.value })
                    }
                    placeholder="https://example.com/logo.png"
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the URL of your logo image (PNG or SVG recommended)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

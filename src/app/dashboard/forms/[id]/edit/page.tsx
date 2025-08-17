'use client'

import { useState, useCallback, useMemo, use } from 'react'
import Link from 'next/link'
import { debounce } from 'lodash'
import { motion } from 'framer-motion'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FormPreview } from '@/components/features/form-preview'
import { FormStyleEditor } from '@/components/features/form-style-editor'
import { FormSettingsEditor } from '@/components/features/form-settings-editor'
import { QuestionBuilder } from '@/components/features/question-builder'

interface FormEditorPageProps {
  params: Promise<{ id: string }>
}

export default function FormEditorPage({ params }: FormEditorPageProps) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'settings'>(
    'content'
  )
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop'
  )

  const { data: form, isLoading } = api.form.get.useQuery({ id })
  const updateForm = api.form.update.useMutation({
    onSuccess: () => {
      setHasUnsavedChanges(false)
    },
  })

  // Debounced update function
  const debouncedUpdate = useMemo(
    () =>
      debounce((updates: Record<string, unknown>) => {
        updateForm.mutate({ id, ...updates })
      }, 1000),
    [id] // Remove updateForm from dependencies to prevent recreating on each render
  )

  const handleConfigUpdate = useCallback(
    (updates: Record<string, unknown>) => {
      setHasUnsavedChanges(true)
      const newConfig = { ...form?.config, ...updates }
      debouncedUpdate({ config: newConfig })
    },
    [form?.config, debouncedUpdate]
  )

  if (isLoading || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading form...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Editor */}
      <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/forms">
                <Button variant="ghost" size="sm">
                  ← Back
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold">{form.name}</h1>
                <p className="text-xs text-gray-500">Form ID: {form.id}</p>
              </div>
            </div>
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="animate-pulse">
                Saving...
              </Badge>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'content'
                  ? 'border-b-2 border-primary bg-gray-50 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'style'
                  ? 'border-b-2 border-primary bg-gray-50 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Style
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-b-2 border-primary bg-gray-50 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Information</CardTitle>
                  <CardDescription>
                    Customize your form&apos;s title and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Form Title</Label>
                    <Input
                      value={form.config.title}
                      onChange={(e) =>
                        handleConfigUpdate({ title: e.target.value })
                      }
                      placeholder="We'd love your feedback!"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={form.config.description}
                      onChange={(e) =>
                        handleConfigUpdate({ description: e.target.value })
                      }
                      placeholder="Help us improve by sharing your experience"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pre-Testimonial Prompt */}
              <Card>
                <CardHeader>
                  <CardTitle>Pre-Testimonial Prompt</CardTitle>
                  <CardDescription>
                    Guide customers with prompts before they write their testimonial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt-enabled">Enable Pre-Prompt</Label>
                    <input
                      id="prompt-enabled"
                      type="checkbox"
                      checked={form.config.prePrompt?.enabled || false}
                      onChange={(e) => {
                        const currentPrompt = form.config.prePrompt || {
                          enabled: false,
                          title: 'Before you start...',
                          questions: [
                            'What specific problem did our product solve for you?',
                            'How did it improve your workflow or results?',
                            'Would you recommend this to others? Why?'
                          ]
                        }
                        handleConfigUpdate({
                          prePrompt: { ...currentPrompt, enabled: e.target.checked }
                        })
                      }}
                      className="rounded"
                    />
                  </div>
                  
                  {form.config.prePrompt?.enabled && (
                    <>
                      <div>
                        <Label>Prompt Title</Label>
                        <Input
                          value={form.config.prePrompt?.title || 'Before you start...'}
                          onChange={(e) => handleConfigUpdate({
                            prePrompt: { ...form.config.prePrompt, title: e.target.value }
                          })}
                          placeholder="Before you start..."
                        />
                      </div>
                      
                      <div>
                        <Label>Prompt Questions (one per line)</Label>
                        <Textarea
                          value={form.config.prePrompt?.questions?.join('\n') || ''}
                          onChange={(e) => handleConfigUpdate({
                            prePrompt: {
                              ...form.config.prePrompt,
                              questions: e.target.value.split('\n').filter(q => q.trim())
                            }
                          })}
                          placeholder="What specific problem did our product solve?
How did it improve your workflow?
Would you recommend this to others?"
                          rows={5}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Custom Questions */}
              <Card>
                <CardHeader>
                  <CardTitle>Custom Questions</CardTitle>
                  <CardDescription>
                    Add additional questions to collect more specific feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuestionBuilder
                    questions={form.config.questions}
                    onChange={(questions) => handleConfigUpdate({ questions })}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'style' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FormStyleEditor
                styling={form.config.styling}
                onChange={(styling) => handleConfigUpdate({ styling })}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FormSettingsEditor
                settings={form.config.settings}
                onChange={(settings) => handleConfigUpdate({ settings })}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="w-1/2 overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Live Preview</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                onClick={() => setPreviewDevice('desktop')}
              >
                Desktop
              </Button>
              <Button
                size="sm"
                variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                onClick={() => setPreviewDevice('mobile')}
              >
                Mobile
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className={previewDevice === 'mobile' ? 'mx-auto max-w-sm' : ''}>
            <FormPreview form={form} />
          </div>
        </div>

        {/* Share Link */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Input
              readOnly
              value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/form/${form.slug}`}
              className="font-mono text-sm"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/form/${form.slug}`
                )
              }}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

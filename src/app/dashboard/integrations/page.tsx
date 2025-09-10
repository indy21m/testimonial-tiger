'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { DashboardNav } from '@/components/features/dashboard-nav'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Webhook, Trash2, Check, X, Clock, Send } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function IntegrationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<string>()

  // Form state for new integration
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'webhook' as 'webhook' | 'zapier',
    webhookUrl: '',
    triggers: [] as ('new_testimonial' | 'approved' | 'featured')[],
    headers: {} as Record<string, string>,
  })

  const { data: integrations, refetch } = api.integration.list.useQuery()
  const { data: logs } = api.integration.getLogs.useQuery(
    { integrationId: selectedIntegration! },
    { enabled: !!selectedIntegration }
  )

  const createMutation = api.integration.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreateOpen(false)
      setNewIntegration({
        name: '',
        type: 'webhook',
        webhookUrl: '',
        triggers: [],
        headers: {},
      })
      toast.success('Integration created successfully')
    },
    onError: () => {
      toast.error('Failed to create integration')
    },
  })

  const toggleMutation = api.integration.toggle.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Integration updated')
    },
  })

  const deleteMutation = api.integration.delete.useMutation({
    onSuccess: () => {
      refetch()
      setSelectedIntegration(undefined)
      toast.success('Integration deleted')
    },
  })

  const testMutation = api.integration.test.useMutation({
    onSuccess: () => {
      toast.success('Test webhook sent successfully')
    },
    onError: (error) => {
      toast.error(`Test failed: ${error.message}`)
    },
  })

  const handleCreate = () => {
    if (!newIntegration.name || !newIntegration.webhookUrl) {
      toast.error('Please fill in all required fields')
      return
    }

    createMutation.mutate({
      name: newIntegration.name,
      type: newIntegration.type,
      config: {
        webhookUrl: newIntegration.webhookUrl,
        triggers: newIntegration.triggers,
        headers: newIntegration.headers,
      },
    })
  }

  const handleTest = (integrationId: string) => {
    testMutation.mutate({
      integrationId,
      data: {
        event: 'test',
        testimonial: {
          id: 'test-123',
          customerName: 'Test Customer',
          content: 'This is a test testimonial',
          rating: 5,
          status: 'approved',
        },
      },
    })
  }

  const triggerOptions = [
    { value: 'new_testimonial', label: 'New Testimonial', icon: '📝' },
    { value: 'approved', label: 'Testimonial Approved', icon: '✅' },
    { value: 'featured', label: 'Testimonial Featured', icon: '⭐' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your testimonials to external services
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Webhook Integration</DialogTitle>
                <DialogDescription>
                  Send testimonial events to your webhook endpoint or Zapier
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Integration Name</Label>
                  <Input
                    placeholder="e.g., Slack Notifications"
                    value={newIntegration.name}
                    onChange={(e) =>
                      setNewIntegration({
                        ...newIntegration,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newIntegration.type}
                    onValueChange={(value: any) =>
                      setNewIntegration({ ...newIntegration, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webhook">Custom Webhook</SelectItem>
                      <SelectItem value="zapier">Zapier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    type="url"
                    placeholder={
                      newIntegration.type === 'zapier'
                        ? 'https://hooks.zapier.com/hooks/catch/...'
                        : 'https://your-webhook-endpoint.com'
                    }
                    value={newIntegration.webhookUrl}
                    onChange={(e) =>
                      setNewIntegration({
                        ...newIntegration,
                        webhookUrl: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trigger Events</Label>
                  <div className="space-y-2">
                    {triggerOptions.map((trigger) => (
                      <div
                        key={trigger.value}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          id={trigger.value}
                          checked={newIntegration.triggers.includes(
                            trigger.value as
                              | 'new_testimonial'
                              | 'approved'
                              | 'featured'
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewIntegration({
                                ...newIntegration,
                                triggers: [
                                  ...newIntegration.triggers,
                                  trigger.value as
                                    | 'new_testimonial'
                                    | 'approved'
                                    | 'featured',
                                ],
                              })
                            } else {
                              setNewIntegration({
                                ...newIntegration,
                                triggers: newIntegration.triggers.filter(
                                  (t) => t !== trigger.value
                                ),
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <Label
                          htmlFor={trigger.value}
                          className="cursor-pointer font-normal"
                        >
                          <span className="mr-2">{trigger.icon}</span>
                          {trigger.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {newIntegration.type === 'webhook' && (
                  <div className="space-y-2">
                    <Label>Custom Headers (Optional)</Label>
                    <Input
                      placeholder='e.g., {"Authorization": "Bearer YOUR_TOKEN"}'
                      onChange={(e) => {
                        try {
                          const headers = e.target.value
                            ? JSON.parse(e.target.value)
                            : {}
                          setNewIntegration({ ...newIntegration, headers })
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      Add custom headers as JSON for authentication
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  Create Integration
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Integrations List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Active Integrations</h2>

            {!integrations || integrations.length === 0 ? (
              <Card className="p-8 text-center">
                <Webhook className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold">
                  No integrations yet
                </h3>
                <p className="mb-4 text-gray-500">
                  Connect webhooks to automate your workflow
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Integration
                </Button>
              </Card>
            ) : (
              integrations.map((integration) => (
                <Card
                  key={integration.id}
                  className={`cursor-pointer transition-all ${
                    selectedIntegration === integration.id
                      ? 'ring-2 ring-primary'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedIntegration(integration.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {integration.name}
                        </CardTitle>
                        <CardDescription>
                          {integration.type === 'zapier'
                            ? 'Zapier'
                            : 'Custom Webhook'}
                        </CardDescription>
                      </div>
                      <Switch
                        checked={integration.isActive || false}
                        onCheckedChange={(checked) => {
                          toggleMutation.mutate({
                            id: integration.id,
                            isActive: checked,
                          })
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">URL:</span>{' '}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                          {integration.config.webhookUrl?.slice(0, 40)}...
                        </code>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {integration.config.triggers?.map((trigger: string) => {
                          const option = triggerOptions.find(
                            (o) => o.value === trigger
                          )
                          return (
                            <Badge key={trigger} variant="secondary">
                              {option?.icon} {option?.label || trigger}
                            </Badge>
                          )
                        })}
                      </div>

                      {integration.lastTriggered && (
                        <div className="text-xs text-gray-500">
                          Last triggered{' '}
                          {formatDistanceToNow(
                            new Date(integration.lastTriggered),
                            { addSuffix: true }
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTest(integration.id)
                          }}
                        >
                          <Send className="mr-1 h-3 w-3" />
                          Test
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (
                              confirm(
                                'Are you sure you want to delete this integration?'
                              )
                            ) {
                              deleteMutation.mutate({ id: integration.id })
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Webhook Logs */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Webhook Logs</h2>

            {selectedIntegration && logs ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Last 20 webhook deliveries</CardDescription>
                </CardHeader>
                <CardContent>
                  {logs.length === 0 ? (
                    <p className="py-4 text-center text-gray-500">
                      No activity yet. Test the webhook to see logs.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-2 dark:bg-gray-800"
                        >
                          <div className="flex items-center gap-3">
                            {log.status === 'success' ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{log.event}</p>
                              <p className="text-xs text-gray-500">
                                {log.statusCode &&
                                  `Status: ${log.statusCode} • `}
                                {log.createdAt
                                  ? formatDistanceToNow(
                                      new Date(log.createdAt),
                                      { addSuffix: true }
                                    )
                                  : 'Recently'}
                              </p>
                            </div>
                          </div>
                          {log.response && (
                            <Badge
                              variant={
                                log.status === 'success'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {log.response.slice(0, 20)}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">
                  Select an integration to view its activity logs
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

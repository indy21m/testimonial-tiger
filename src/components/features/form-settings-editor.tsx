'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

type FormSettings = {
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

interface FormSettingsEditorProps {
  settings: FormSettings
  onChange: (settings: FormSettings) => void
}

export function FormSettingsEditor({
  settings,
  onChange,
}: FormSettingsEditorProps) {
  const handleChange = (updates: Partial<typeof settings>) => {
    onChange({
      ...settings,
      ...updates,
    })
  }

  return (
    <div className="space-y-6">
      {/* Required Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Required Information</CardTitle>
          <CardDescription>
            Choose what information you want to collect from customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require-name">Require Name</Label>
              <p className="text-sm text-gray-500">
                Collect customer names with testimonials
              </p>
            </div>
            <Switch
              id="require-name"
              checked={settings.requireName}
              onCheckedChange={(checked) =>
                handleChange({ requireName: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require-email">Require Email</Label>
              <p className="text-sm text-gray-500">
                Collect email addresses for follow-up
              </p>
            </div>
            <Switch
              id="require-email"
              checked={settings.requireEmail}
              onCheckedChange={(checked) =>
                handleChange({ requireEmail: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Options */}
      <Card>
        <CardHeader>
          <CardTitle>Media Options</CardTitle>
          <CardDescription>
            Allow customers to add photos or videos to their testimonials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow-image">Allow Image Upload</Label>
              <p className="text-sm text-gray-500">Let customers add photos</p>
            </div>
            <Switch
              id="allow-image"
              checked={settings.allowImage}
              onCheckedChange={(checked) =>
                handleChange({ allowImage: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow-video">Allow Video Recording</Label>
              <p className="text-sm text-gray-500">Enable video testimonials</p>
            </div>
            <Switch
              id="allow-video"
              checked={settings.allowVideo}
              onCheckedChange={(checked) =>
                handleChange({ allowVideo: checked })
              }
            />
          </div>

          {settings.allowVideo && (
            <div>
              <Label>Maximum Video Length</Label>
              <div className="mt-2 flex items-center gap-3">
                <Slider
                  value={[settings.maxVideoLength]}
                  onValueChange={([value]) =>
                    handleChange({ maxVideoLength: value })
                  }
                  min={30}
                  max={300}
                  step={30}
                  className="flex-1"
                />
                <span className="w-16 text-right text-sm font-medium">
                  {settings.maxVideoLength}s
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 60-90 seconds for best engagement
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Settings</CardTitle>
          <CardDescription>
            Configure what happens after someone submits a testimonial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-approve">Auto-Approve Testimonials</Label>
              <p className="text-sm text-gray-500">
                Automatically publish testimonials without review
              </p>
            </div>
            <Switch
              id="auto-approve"
              checked={settings.autoApprove}
              onCheckedChange={(checked) =>
                handleChange({ autoApprove: checked })
              }
            />
          </div>

          <div>
            <Label>Success Message</Label>
            <Textarea
              value={settings.successMessage}
              onChange={(e) => handleChange({ successMessage: e.target.value })}
              placeholder="Thank you for your testimonial! We appreciate your feedback."
              rows={3}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              This message is shown after successful submission
            </p>
          </div>

          <div>
            <Label>Redirect URL (Optional)</Label>
            <Input
              type="url"
              value={settings.redirectUrl || ''}
              onChange={(e) => handleChange({ redirectUrl: e.target.value })}
              placeholder="https://example.com/thank-you"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Redirect users to this URL after submission (leave empty to show
              success message)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Get notified when new testimonials are submitted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label
                htmlFor="email-notification"
                className="flex items-center gap-2"
              >
                Email Notifications
                <Badge variant="secondary" className="text-xs">
                  Coming Soon
                </Badge>
              </Label>
              <p className="text-sm text-gray-500">
                Receive an email for each new testimonial
              </p>
            </div>
            <Switch
              id="email-notification"
              checked={settings.sendEmailNotification}
              onCheckedChange={(checked) =>
                handleChange({ sendEmailNotification: checked })
              }
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <CardDescription>Additional configuration options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Form Language</Label>
            <Select defaultValue="en">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Spam Protection</Label>
            <Select defaultValue="recaptcha">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select protection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="honeypot">Honeypot</SelectItem>
                <SelectItem value="recaptcha">Google reCAPTCHA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

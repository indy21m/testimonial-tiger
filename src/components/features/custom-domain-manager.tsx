'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, Copy, X, Loader2, Globe, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CustomDomainManagerProps {
  formId: string
  currentDomain?: string | null
  isVerified?: boolean
}

export function CustomDomainManager({
  formId,
  currentDomain,
}: CustomDomainManagerProps) {
  const [domain, setDomain] = useState(currentDomain || '')
  const [isEditing, setIsEditing] = useState(!currentDomain)

  const { data: domainStatus, refetch } = api.domain.getDomainStatus.useQuery({
    formId,
  })

  const setDomainMutation = api.domain.setCustomDomain.useMutation({
    onSuccess: () => {
      toast.success('Domain updated successfully')
      setIsEditing(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const verifyMutation = api.domain.verifyDomain.useMutation({
    onSuccess: (result) => {
      if (result.verified) {
        toast.success('Domain verified successfully!')
        refetch()
      } else {
        toast.error(result.message)
      }
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  useEffect(() => {
    if (domainStatus?.domain) {
      setDomain(domainStatus.domain)
    }
  }, [domainStatus])

  const handleSave = () => {
    if (!domain) {
      toast.error('Please enter a domain')
      return
    }

    // Basic domain validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i
    if (!domainRegex.test(domain)) {
      toast.error('Please enter a valid domain (e.g., reviews.yourdomain.com)')
      return
    }

    setDomainMutation.mutate({ formId, domain })
  }

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove this custom domain?')) {
      setDomainMutation.mutate({ formId, domain: undefined })
      setDomain('')
      setIsEditing(true)
    }
  }

  const handleVerify = () => {
    verifyMutation.mutate({ formId })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Custom Domain
            </CardTitle>
            <CardDescription>
              Use your own domain for testimonial forms (e.g.,
              reviews.yourdomain.com)
            </CardDescription>
          </div>
          {domainStatus?.hasDomain && (
            <Badge variant={domainStatus.verified ? 'default' : 'secondary'}>
              {domainStatus.verified ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Verified
                </>
              ) : (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Pending Verification
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="domain">Domain</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  id="domain"
                  placeholder="reviews.yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.toLowerCase())}
                  disabled={setDomainMutation.isPending}
                />
                <Button
                  onClick={handleSave}
                  disabled={setDomainMutation.isPending}
                >
                  {setDomainMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </Button>
                {domainStatus?.hasDomain && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDomain(domainStatus.domain || '')
                      setIsEditing(false)
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter the subdomain or domain you want to use for your
                testimonial forms
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-600" />
                <span className="font-mono text-sm">
                  {domainStatus?.domain}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!domainStatus?.verified && (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Domain verification required</strong>
                    <p className="mt-2">
                      Add the following DNS record to verify ownership:
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Type:</span>
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-700">
                        TXT
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Name:</span>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-700">
                          _testimonial-tiger
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('_testimonial-tiger')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Value:</span>
                      <div className="flex items-center gap-2">
                        <code className="break-all rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                          {domainStatus?.verificationToken}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              domainStatus?.verificationToken || ''
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={verifyMutation.isPending}
                    className="w-full"
                  >
                    {verifyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Verify Domain
                      </>
                    )}
                  </Button>
                </div>

                <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertDescription className="text-sm">
                    <strong>Next steps:</strong>
                    <ol className="ml-4 mt-2 list-decimal space-y-1">
                      <li>
                        Add the TXT record to your domain&apos;s DNS settings
                      </li>
                      <li>Wait 5-10 minutes for DNS propagation</li>
                      <li>Click &quot;Verify Domain&quot; to complete setup</li>
                      <li>
                        Add a CNAME record pointing to{' '}
                        <code>cname.vercel-dns.com</code>
                      </li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </>
            )}

            {domainStatus?.verified && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Domain verified!</strong>
                  <p className="mt-1">
                    Your custom domain is active. Forms can now be accessed at:
                  </p>
                  <code className="mt-2 block rounded bg-white p-2 dark:bg-gray-800">
                    https://{domainStatus.domain}/form/[form-slug]
                  </code>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

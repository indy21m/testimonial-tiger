import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DashboardNav } from '@/components/features/dashboard-nav'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="container mx-auto space-y-6 p-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here&apos;s your testimonial overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Testimonials
              </CardTitle>
              <span className="text-2xl">📝</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <span className="text-2xl">⏰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <Link href="/dashboard/testimonials?status=pending">
                <Button size="sm" variant="ghost" className="mt-2">
                  Review →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <span className="text-2xl">⭐</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.0</div>
              <p className="text-xs text-muted-foreground">from 0 reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <span className="text-2xl">📈</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with collecting testimonials
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link href="/dashboard/forms/new">
              <Button>Create New Form</Button>
            </Link>
            <Link href="/dashboard/widgets/new">
              <Button variant="outline">Create Widget</Button>
            </Link>
            <Link href="/dashboard/integrations">
              <Button variant="outline">Setup Integrations</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Testimonials */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Testimonials</CardTitle>
            <CardDescription>
              Latest submissions across all your forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-gray-500">
              No testimonials yet. Create a form to start collecting feedback!
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

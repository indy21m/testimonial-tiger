import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐅</span>
            <span className="text-xl font-bold">Testimonial Tiger</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge className="mb-4" variant="secondary">
          Beautiful Testimonial Platform
        </Badge>
        <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-6xl">
          Transform Customer Feedback into{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Powerful Social Proof
          </span>
        </h1>
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
          Collect, manage, and display beautiful testimonials that convert
          visitors into customers. A powerful alternative to expensive
          platforms, built with modern technology.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Start Free Trial
              <span className="text-xs">No credit card required</span>
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              See Features
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Everything You Need</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Powerful features to collect and showcase testimonials beautifully
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>🎨 Beautiful Forms</CardTitle>
              <CardDescription>
                Create stunning collection forms with full customization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Custom questions & fields</li>
                <li>✓ Theme & style customization</li>
                <li>✓ Photo & video uploads</li>
                <li>✓ Mobile-optimized design</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Smart Dashboard</CardTitle>
              <CardDescription>
                Manage testimonials with powerful analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Real-time analytics</li>
                <li>✓ Bulk management tools</li>
                <li>✓ Full-text search</li>
                <li>✓ Conversion tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Display Widgets</CardTitle>
              <CardDescription>
                Beautiful widgets for any website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Multiple widget types</li>
                <li>✓ Live customization</li>
                <li>✓ Zero conflicts</li>
                <li>✓ Fast performance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚡ Integrations</CardTitle>
              <CardDescription>
                Connect with your favorite tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Zapier integration</li>
                <li>✓ Webhook support</li>
                <li>✓ CSV import/export</li>
                <li>✓ API access</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤖 AI Features</CardTitle>
              <CardDescription>Smart features powered by AI</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Smart summaries</li>
                <li>✓ Question suggestions</li>
                <li>✓ Sentiment analysis</li>
                <li>✓ Auto-categorization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔒 Enterprise Ready</CardTitle>
              <CardDescription>
                Security and compliance built-in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Domain whitelisting</li>
                <li>✓ GDPR compliant</li>
                <li>✓ SSL encryption</li>
                <li>✓ Regular backups</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Card className="mx-auto max-w-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-blue-100">
              Join thousands of businesses collecting powerful testimonials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary">
                Start Your Free Trial
              </Button>
            </Link>
            <p className="mt-4 text-sm text-blue-100">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2025 Testimonial Tiger. Built with ❤️ using Next.js 15 &
            TypeScript.
          </div>
        </div>
      </footer>
    </div>
  )
}

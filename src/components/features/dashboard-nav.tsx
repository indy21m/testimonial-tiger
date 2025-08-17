'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/forms', label: 'Forms' },
    { href: '/dashboard/testimonials', label: 'Testimonials' },
    { href: '/dashboard/widgets', label: 'Widgets' },
    { href: '/dashboard/integrations', label: 'Integrations' },
    { href: '/dashboard/import', label: 'Import' },
  ]

  return (
    <header className="border-b bg-white dark:bg-gray-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image
            src="/tigerlogo.png"
            alt="Testimonial Tiger"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-bold">Testimonial Tiger</span>
        </div>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? 'font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
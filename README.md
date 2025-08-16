# 🐅 Testimonial Tiger

A beautiful, conversion-focused testimonial collection and display platform built with Next.js 15, TypeScript, and modern edge infrastructure.

## 🚀 Features

- **Beautiful Forms** - Fully customizable testimonial collection forms
- **Smart Dashboard** - Analytics and management tools
- **Display Widgets** - Multiple widget types (wall, carousel, grid)
- **Integrations** - Zapier webhooks and API access
- **AI Features** - Smart summaries and suggestions (optional)
- **Enterprise Ready** - Domain whitelisting, GDPR compliant

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Authentication**: Clerk
- **Database**: Neon Postgres
- **ORM**: Drizzle ORM
- **API**: tRPC
- **Styling**: Tailwind CSS + shadcn/ui patterns
- **Animation**: Framer Motion
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables:
   - Get database URL from [Neon](https://neon.tech)
   - Get Clerk keys from [Clerk Dashboard](https://clerk.com)
   - Set up other optional services as needed

5. Run database migrations:

   ```bash
   pnpm drizzle-kit generate:pg
   ```

   Then execute the generated SQL in your Neon console.

6. Start development server:
   ```bash
   pnpm dev
   ```

## 🏗 Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Base UI components
│   └── features/    # Feature-specific components
├── lib/             # Utilities and helpers
├── server/          # Server-side code
│   ├── api/         # tRPC routers
│   └── db/          # Database schema
├── types/           # TypeScript types
└── hooks/           # Custom React hooks
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Check TypeScript types
- `pnpm drizzle-kit generate:pg` - Generate database migrations

## 📝 Database Schema

The application uses the following main tables:

- `users` - User accounts (from Clerk)
- `forms` - Testimonial collection forms
- `testimonials` - Submitted testimonials
- `widgets` - Display widgets
- `integrations` - Webhook integrations
- `webhook_logs` - Integration logs

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

Every push to main deploys directly to production.

## 🔒 Security

- Authentication via Clerk
- Domain whitelisting for widgets
- CSRF protection
- Rate limiting on public endpoints
- SSL encryption

## 📄 License

Private project - all rights reserved.

## 🤝 Contributing

This is a private project. Please contact the maintainers for contribution guidelines.

---

Built with ❤️ using Next.js 15 and TypeScript

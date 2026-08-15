# Las Kwt — Tailoring Management Web App

A production-ready tailoring management web app for a Kuwaiti Dascha/Thobe business.
Bilingual (Arabic / English) with full RTL/LTR support, dual premium themes, and
Shopify Admin API sync for walk-in orders.

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, Postgres, Storage)
- **PDF:** `@react-pdf/renderer` (server-rendered)
- **Messaging:** WhatsApp (wa.me deep link with signed PDF URL)
- **Commerce sync:** Shopify Admin REST API
- **i18n:** Custom LanguageProvider (ar/en + RTL/LTR)
- **Themes:** Dual premium (dark-gold / light-cream) via `next-themes`

## Local Development

```bash
npm install
cp .env.example .env.local
# fill in Supabase + Shopify credentials
npm run dev
```

The app runs on `http://localhost:3000`.

## Environment Variables

See `.env.example` for the full list. Required for production:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`
- `SHOPIFY_SHOP`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN`, `SHOPIFY_API_VERSION`
- `NEXT_PUBLIC_APP_URL`, `INVOICE_BUCKET`

## Deploy

Connected to Vercel via the GitHub repo and auto-deploys on push.
Production URL: https://laskwt-webapp.vercel.app

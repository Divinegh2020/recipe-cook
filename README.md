# Recipe Cook

A Vercel-ready digital cookbook storefront for selling downloadable cookbooks in USD with Bachs Checkout and Supabase.

## Stack

- Next.js App Router
- Vercel deployment target
- Supabase Auth + Postgres + private Storage
- Bachs USD Checkout + signed webhooks

## Payment flow

1. Buyer opens a cookbook and enters an email.
2. /api/checkout loads the real cookbook price server-side and creates a pending order.
3. The server creates a Bachs checkout session using USD pricing.
4. Buyer completes payment on Bachs.
5. Bachs calls /api/webhooks/bachs.
6. The webhook signature is verified against the raw request body.
7. The matching order is marked paid.
8. /success checks the buyer's secret access token and, when paid, requests a short-lived signed Supabase Storage URL.

The browser redirect is never treated as proof of payment.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Fill the environment variables before testing checkout. Start with a Bachs sandbox key.

## Supabase

Apply supabase/schema.sql to a dedicated Supabase project. Create an Auth user whose email is included in ADMIN_EMAILS to access /admin.

## Storage

The SQL migration creates:
- cookbooks private bucket for PDF files
- covers public bucket for cover images

The admin upload page requests a signed upload URL and sends the file directly to Supabase Storage, avoiding Vercel function body-size limits.

The PDF files remain private and are only exposed through short-lived signed URLs after a paid order is verified.

## Bachs webhook

Register:

https://YOUR_VERCEL_DOMAIN/api/webhooks/bachs

Subscribe to collection.succeeded, collection.failed, collection.underpaid, and checkout.expired.

## Vercel deployment

1. Import this GitHub repository into Vercel as a Next.js project.
2. Add the environment variables from .env.example.
3. Use a dedicated Supabase project and apply supabase/schema.sql.
4. Create a Supabase Auth user for your admin email and put that email in ADMIN_EMAILS.
5. Start with a Bachs sandbox key and register the webhook at /api/webhooks/bachs.
6. Test a full sandbox purchase before switching BACHS_API_KEY to the live key and BACHS_API_BASE_URL to https://api.bachs.io.

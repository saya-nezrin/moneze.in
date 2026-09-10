# moneze.in
Build wealth with smarter mutual fund investing.

## Consultation flow

The consultation buttons open the Moneze Calendly event directly inside the website. Calendly manages availability, customer details, confirmations, Google Meet, and add-to-calendar actions.

Indian users verify their mobile number through the MSG91 SMS OTP API, while NRI users verify their email address. Either route creates a signed, HTTP-only session. The financial assessment is submitted to `/api/financial-assessments`, which validates that session and stores the record in the protected Supabase `consultation_leads` table. Keep `SUPABASE_SECRET_KEY` server-side and never expose it through a `VITE_*` variable.

## Learn CMS

Run `supabase/articles.sql` once in the Supabase SQL Editor. Then add and
manage rows in the Supabase `articles` Table Editor. Select one of the six
supported categories and set `published` to true; the article appears
automatically under the correct category at `/learn`.

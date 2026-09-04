# moneze.in
Build wealth with smarter mutual fund investing.

## Consultation flow

The consultation buttons open the Moneze Calendly event directly inside the website. Calendly manages availability, customer details, confirmations, Google Meet, and add-to-calendar actions.

Email OTP verification creates a signed, HTTP-only session. The financial assessment is submitted to `/api/financial-assessments`, which validates that session and stores the record in the protected Supabase `consultation_leads` table. Keep `SUPABASE_SECRET_KEY` server-side and never expose it through a `VITE_*` variable.

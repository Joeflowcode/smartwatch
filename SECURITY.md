# Security

## Baseline

- Supabase RLS on all `public` tables
- Server-side entitlement checks (never client-only)
- No `SUPABASE_SERVICE_ROLE_KEY` or Stripe secret in client bundles
- Admin authorization via `app_metadata.role` only (never `user_metadata`)
- Zod validation on AI chat and Stripe checkout inputs
- Stripe webhook signature verification
- Security headers + CSP in `next.config.ts`
- Parameterized Supabase client queries
- AI: refuse match-fix / insider / underage / illegal requests; treat external sports text as untrusted
- Error messages avoid leaking internals

## Secrets

Store secrets in Vercel / `.env.local` only. Rotate compromised keys immediately.

## Auth notes

- Email verification recommended in production
- JWT claims for admin may be stale until refresh — re-check on sensitive admin mutations
- Deleting a user does not invalidate outstanding JWTs; revoke sessions when suspending

## Reporting

Email security concerns via the Contact page. Do not file public issues with exploit details.

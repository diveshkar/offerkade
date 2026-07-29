# OfferCeylon auth email templates

Branded HTML for the Supabase Auth emails (signup confirmation and password
reset). Supabase renders these, so they are NOT part of the app build. You paste
them into the Supabase dashboard. Delivery goes through whatever SMTP you set in
Supabase (now Resend).

## Where to paste

Supabase Dashboard -> Authentication -> Emails -> Templates. Pick each template,
set the subject, and paste the matching file into the message body (HTML).

| Supabase template | Paste this file | Suggested subject |
|---|---|---|
| Confirm signup | `confirm-signup.html` | Confirm your OfferCeylon email |
| Reset password | `reset-password.html` | Reset your OfferCeylon password |

## Why these use `token_hash` (not `{{ .ConfirmationURL }}`)

The links here use the **stateless `token_hash` flow**, not the default
`{{ .ConfirmationURL }}`. `{{ .ConfirmationURL }}` uses the PKCE `code` flow,
which needs a `code_verifier` cookie stored in the exact browser that started
signup. When the link is opened on a different device or in an email app's
in-app browser (sign up on a laptop, click on a phone), that cookie is missing
and the link fails with "link has expired". The `token_hash` flow needs no
cookie, so it works everywhere.

The links are built as:

- Confirm signup: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/onboarding`
- Reset password: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`

They are handled by `app/auth/callback/route.ts`, which calls
`verifyOtp({ type, token_hash })`. Keep the spaces inside `{{ ... }}` exactly as
written; Supabase's parser needs them.

## Required Supabase settings

For the link to resolve, in Supabase Dashboard -> Authentication -> URL Configuration:

- **Site URL**: your production origin, e.g. `https://offerceylon.com` (this fills
  `{{ .SiteURL }}`).
- **Redirect URLs** (allow-list): add `https://offerceylon.com/auth/callback` and,
  for local testing, `http://localhost:3000/auth/callback`.

For local testing you may also temporarily set the Site URL to
`http://localhost:3000` so the link points at your dev server.

## Notes

- To preview the look, open either `.html` file directly in a browser (the
  `{{ ... }}` placeholders show literally until Supabase fills them in).
- Style matches the transactional emails in `lib/email.ts` (Flame theme, Olyntox
  footer, no emoji).

## Not included yet

Supabase also has Magic Link, Change Email Address, Invite, and Reauthentication
templates. Your app only uses Confirm signup and Reset password, so only those
two are here. Ask if you want branded versions of the others.

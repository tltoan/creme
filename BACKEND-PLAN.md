# Misé member platform

Status: proposed implementation. Public scheduling demos are removed. Authentication, database, customer imports, and the new hosting deployment are not yet connected.

## Hosting choice

Pricing checked September 14, 2026. Recommendation: Cloudflare Pages for the existing React frontend and Convex for the member backend. At this beta's expected scale, $0 in platform charges is a reasonable starting target within free-tier limits, not a guaranteed bill. Domain registration, email delivery, payment fees, backups, and usage overages are separate considerations.

| Service | Starting cost | Upgrade model |
| --- | --- | --- |
| [Cloudflare Pages](https://developers.cloudflare.com/pages/functions/pricing/) | Free static hosting; static asset requests free and unlimited | Functions consume Workers quotas if used |
| [Convex](https://www.convex.dev/pricing) | Free tier; Starter is $0 base plus usage | Professional is $25 per developer/month plus applicable usage |
| [Supabase](https://supabase.com/pricing) | Free tier | Pro from $25/month, first project included |

Convex is well suited to live schedules and a TypeScript codebase. Supabase remains a viable all-in-one Postgres/auth/storage alternative; it is not intrinsically more expensive at beta scale. Convex developer seats are the people building the app, not customers or cooks. Supabase free projects can pause after a week of inactivity.

Keep code in GitHub. Move the commercial member app off GitHub Pages before enabling sign-in: its [usage limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) exclude hosting commercial SaaS and sensitive transactions such as passwords.

## Access model

- Public: service information and client/cook applications only.
- Pending applicant: no schedule or customer-data access.
- Approved client: their household, preferences, visits, and payment history.
- Approved cook: their availability and assigned visits; household details only when necessary for that assignment.
- Administrator: reviews applications, records onboarding, assigns cooks, handles quotes/payments, and imports existing customers.

After verified sign-in, resolve the member record on the server. Check approved onboarding and role on every query, mutation, and file operation. Derive roles from staff-managed records, never a client-selected role or editable profile claim. A cook accepts an assignment made by Misé; a client cannot browse and choose cooks.

Use a maintained auth integration supported by Convex. [Convex's authentication documentation](https://docs.convex.dev/auth/overview) lists options and notes that its own Convex Auth library is currently beta. Choose the auth implementation when initializing the project, with explicit verified-email and invitation requirements.

## Records to implement

| Record | Purpose |
| --- | --- |
| Applications | Separate client/cook intake; status, submitted answers, private résumé reference |
| Members | Verified auth identity, normalized email, staff-managed role and onboarding status |
| Households | Client ownership, service address, food preferences, logistics |
| Cook profiles | Experience, review status, travel range, availability |
| Visits | Household, requested window, assigned cook, acceptance/status, agreed scope and quote |
| Payments | Amount in cents, currency, date, method, reference, verification, refund history |
| Membership invitations | Intended email/role, single-use expiry, acceptance and staff approval |
| Audit events | Who changed assignments, onboarding, and payment records |

Protect résumé files with staff-only access. They should not become public URLs or live in the Git repository. Keep availability updates and assignment conflict checks transactional.

## Existing customers who paid offline

No customer email list has been provided or found in the application repository. The configured form recipient is the owner's inbox, not a customer record. Do not infer payment from a signup.

For each customer, collect: name, email, household/service area, role, onboarding status, payment amount and currency, paid date, method, reference/receipt, and what the payment covers (deposit, credit, or specific visits).

Deduplicate by normalized email; flag ambiguous records for review. Import as existing customers with payment verification pending until staff checks the records. Mark verified offline payments as recorded payments—never create another charge. Payment status and onboarding approval remain separate. Link an imported record to a login only after email verification and staff approval. Do not send invitations until the user authorizes sending them.

## Delivery order

1. Activate the installed Convex plugin by restarting Codex; initialize or connect the actual Misé project.
2. Implement admin, client, and cook roles and onboarding checks with deny-by-default access.
3. Replace sample scheduling state with authenticated queries and mutations; test unauthorized and cross-household access, cook assignment, and overlapping visits.
4. Move signup intake and private file storage into the backend; configure transactional email.
5. Review/import verified offline customers and payments, then authorize account invitations.
6. Deploy the React frontend on Cloudflare, connect the domain, and verify real sign-in and an end-to-end booking before announcing member access.

# Misé member access

## Current status

Passkey registration, login, logout, pending approval, client/cook workspaces, private visit reads, and persistent availability are live at https://mise-iota-one.vercel.app/#login, backed by Convex production `formal-penguin-841`. They also work on the separate development deployment. Start `npm run dev` and use http://localhost:5173/#login. Use `localhost`, not `127.0.0.1`, because passkeys are tied to a hostname.

The public GitHub Pages build in `docs/` still has its previous holding page. Vercel now hosts the member app using the owner’s existing Pro team. Production auth is bound to `mise-iota-one.vercel.app`. No domain was purchased.

## How members get access

1. Client/cook submits the existing application and completes onboarding with Misé.
2. They open Log in, create a passkey, and provide their name, contact email, and requested role.
3. The account stays pending, with no visits or availability access. It shows an account reference.
4. Staff confirms that reference with the person through the contact channel already recorded during onboarding. A typed email is **not** proof of ownership and never auto-links records, payments, or roles.
5. Staff approves the exact member ID and role. The workspace opens automatically. Suspended accounts immediately lose access.

Staff currently uses the Convex dashboard's Functions tab, not a public admin page. In the intended deployment, run `members:pending` to see up to 100 pending accounts, and `members:review` with:

```json
{
  "memberId": "COPY_THE_VERIFIED_ACCOUNT_REFERENCE",
  "role": "client",
  "decision": "approved",
  "identityVerified": true,
  "onboardingComplete": true,
  "note": "Record how identity and onboarding were confirmed."
}
```

Use `cook` for cooks. Only mark the two checks true after completing them. To pause access, use decision `suspended`. Review functions are internal: browser clients cannot call them. Only trusted staff with Convex project access can run them. Review notes are retained in `memberAudit`; Convex project access should be limited accordingly.

## Identity and recovery

Authentication uses the Convex plugin's pinned passkey build (`@convex-dev/auth` commit `a42653e`, a prerelease implementation). Its shipped React declarations need the small reproducible postinstall fix in `scripts/patch-auth-types.mjs`. Face ID/PIN verification is required; email-based credential enumeration is disabled. No password or email service is configured.

The verified auth user ID owns a separate `members` record. The role picker is a preference, never authorization. Contact emails are unverified until staff checks them through onboarding; duplicate emails do not merge accounts. Staff must never approve or transfer access solely because someone typed an existing customer's email. Offline payment records have not been imported.

Approved members can add a backup passkey. If all passkeys are lost, staff must reverify identity through the established onboarding contact channel before transferring any records. There is no automated email recovery or self-service account transfer yet.

## Scheduling scope

Members can persist their usual weekend availability and notes. Clients read visits owned by their member ID; cooks read only visits assigned to their member ID. No sample schedules are seeded. Visit assignment, booking changes, and payment management still need their staff workflows; for now the workspace directs members to the team. A client never chooses their cook.

## Vercel deployment

The stable production address is `mise-iota-one.vercel.app`; no custom domain is required. The hostname becomes the passkey relying-party ID. A different custom domain later requires passkey migration/re-enrollment; keep the original sign-in address available during that transition.

The initial deployment is complete. For future setup or migration:

1. Sign in with `npx vercel login` and choose team `tltoans-projects`, project `mise`. Vercel Hobby is [restricted to non-commercial use](https://vercel.com/docs/plans/hobby); use a plan permitting Misé's commercial service.
2. Link the Vercel project. Set Production `VITE_CONVEX_URL` to the Misé production deployment URL (`https://formal-penguin-841.convex.cloud`). No private keys go in `VITE_*` variables.
3. Inspect the existing production Convex schema/functions before deploying these functions. Configure fresh production `JWT_PRIVATE_KEY` and `JWKS` on Convex (never copy development keys or print them), then set `SITE_URL` and `AUTH_PASSKEY_ORIGIN` to the stable HTTPS site origin, `AUTH_PASSKEY_RP_ID` to its hostname, and `AUTH_PASSKEY_RP_NAME` to `Misé`.
4. Deploy Convex functions to production, then deploy Vercel. The frontend build does not push backend code. Keep dev origin/settings intact.
5. Test real registration, staff approval, signout/login, denied unapproved access, and both roles on the actual public origin. Add customer records only after public auth is verified.

`npm run build` outputs `dist/`. The Vercel build fails if the backend URL is absent or the local dev URL is selected for production. `.env.local`, `.vercel/`, and `dist/` are ignored by Git. Existing GitHub Pages artifacts remain unchanged during this migration.

## Verification

`npm run typecheck`, `npm test`, and `npm run build` pass. The seven backend tests cover anonymous/pending/suspended access, role tampering, duplicate-email isolation, client/cook visit ownership, and availability validation/isolation. Real Chromium WebAuthn round trips with virtual authenticators passed on localhost and the public production domain for both roles, including registration, pending gating, staff approval, persisted availability, refresh, logout, login, an opposite-role selection, and mobile layout. Synthetic QA accounts and their auth sessions were removed afterward from both environments; no customer messages were sent.

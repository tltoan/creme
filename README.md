# Misé

Meal prep private chef beta website. The public homepage explains the service and accepts client and cook applications. Scheduling previews have been removed from the public site. FormSubmit forwards applications to the configured inbox; the repository contains no submitted customer records.

Project: `/Users/antony/Projects/creme`. The original folder and GitHub repository names remain unchanged. Live: https://mise-iota-one.vercel.app/

## Develop

Run `npm ci` and `npm run dev`. Open the local URL printed by Vite.

- `src/App.tsx`: homepage, navigation, cook application, hash routes.
- `src/InterestForm.tsx`: five-step client interest form.
- `src/MemberAccess.tsx`: passkey sign-in, onboarding gate, and client/cook workspaces.
- `src/Workspace.tsx`: retained design prototype; not imported, routed, or included in the production JavaScript bundle.
- `src/style.css`: responsive monochrome design and interaction styles.
- `src/main.tsx`, `src/intro.css`, `mise-handwritten.gif`: opening animation. Reduced-motion users skip it; Escape dismisses it.
- `DESIGN-NOTES.md`: research, decisions, and photo credits.

Routes: `#home`, `#join`, `#join-client`, `#login`. `#join` offers client and cook signup choices. Legacy `#client` and `#cook` links use the same authenticated gate; they never select a role with elevated access. Hash routes work without a server rewrite.

## Member access and backend status

Passkey registration, login, logout, approved client/cook workspaces, private visit reads, and persistent weekend availability are implemented. Pending and suspended members cannot access schedule data. Contact email and the role selector do not establish identity or grant access; staff verifies onboarding and assigns the role to an authenticated account.

See [MEMBER-ACCESS.md](MEMBER-ACCESS.md) for staff approval, account recovery, deployment settings, and verification details. Authentication uses the Convex plugin's pinned passkey build; no email/password auth or email delivery service is configured. The existing intake forms still use FormSubmit. No existing customer or payment records have been imported.

## Deploy

Vercel hosts the frontend at https://mise-iota-one.vercel.app/ and is linked to this GitHub repository. Vercel uses `npm ci`, `npm run build:vercel`, and output directory `dist`. Production `VITE_CONVEX_URL` points to `https://formal-penguin-841.convex.cloud`. Private signing keys stay in Convex environment variables.

The local development backend remains `hallowed-dogfish-469`. Local deployment settings are in ignored `.env.local`. Run `npm run dev` and open **http://localhost:5173/#login**; passkeys depend on this exact hostname. Run `npx convex dev` separately when editing backend functions. Before editing Convex code, read `convex/_generated/ai/guidelines.md`.

Backend code is deployed separately to Convex; pushing a frontend commit does not deploy backend changes. Run `npm run typecheck`, `npm test`, and `npm run build` before shipping. Use `npx convex dev --once` for development and `npx convex deploy` for production only after confirming the deployment target. See MEMBER-ACCESS.md for first-time production setup.

The previous GitHub Pages site at https://tltoan.github.io/creme/ still serves the informational build in `docs/`. Builds now output to ignored `dist/`; do not overwrite `docs/` with the authenticated app. No domain purchase is needed for the current Vercel address.

## Email delivery

Cook availability uses multi-select weekend windows and an optional travel radius. These are submitted as readable values with the application.

Résumés support one PDF, DOC, or DOCX up to 5 MB, selected through a file picker or drag and drop. Files remain in the browser until submission. Applications with a file use FormSubmit’s documented native `multipart/form-data` upload flow and leave Misé for its verification/confirmation screen. Applications without a file keep the existing AJAX success/error flow. See [FormSubmit file-upload documentation](https://formsubmit.co/documentation). No attachment is serialized into JSON, stored in this repo, or uploaded separately. Link and pasted-résumé options remain available.

Local browser checks intercept submissions to verify multipart file bytes, application fields, size/type validation, and mobile controls. They do not verify actual inbox delivery; check one real attachment after recipient activation before relying on email attachments operationally.

The recipient must activate FormSubmit using the verification email. Submission acceptance does not prove inbox delivery. After activation, make one test signup and verify receipt before promoting the form. Reply directly to a submission email to contact the interested person.

FormSubmit offers an opaque recipient identifier in the activation email; replace the recipient in both `src/App.tsx` and `src/InterestForm.tsx` with that identifier if desired, rebuild, and publish. Do not put Stripe secret keys or customer records in this public repository.

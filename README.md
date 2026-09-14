# Misé

Meal prep private chef beta website. The public homepage explains the service and accepts client and cook applications. Scheduling previews have been removed from the public site. FormSubmit forwards applications to the configured inbox; the repository contains no submitted customer records.

Project: `/Users/antony/Projects/creme`. The original folder and GitHub repository names remain unchanged. Live: https://tltoan.github.io/creme/

## Develop

Run `npm ci` and `npm run dev`. Open the local URL printed by Vite.

- `src/App.tsx`: homepage, navigation, cook application, hash routes.
- `src/InterestForm.tsx`: five-step client interest form.
- `src/MemberAccess.tsx`: honest member-access holding page until authentication is connected.
- `src/Workspace.tsx`: retained design prototype; not imported, routed, or included in the production JavaScript bundle.
- `src/style.css`: responsive monochrome design and interaction styles.
- `src/main.tsx`, `src/intro.css`, `mise-handwritten.gif`: opening animation. Reduced-motion users skip it; Escape dismisses it.
- `DESIGN-NOTES.md`: research, decisions, and photo credits.

Routes: `#home`, `#join`, `#join-client`, `#login`. `#join` offers client and cook signup choices. Legacy `#client` and `#cook` links show the member-access holding page; they do not expose the prototype. Hash routes work without a server rewrite.

## Member access and backend status

Member authentication and a shared database are not connected yet. The login entry collects no credentials and displays no customer schedules. Future access must be checked on the backend against verified identity, staff-approved onboarding, and the account role. Removing navigation or hiding a component is not a replacement for those checks.

See `BACKEND-PLAN.md` for the proposed Convex system, offline customer import fields, and hosting comparison. Convex's global Codex plugin was installed separately using its official agent setup guide. No Convex project was initialized and no project-managed AI files were generated because this repo does not yet meet the guide's existing-project criteria.

## Publish an update

Run `npm run build`, then `touch docs/.nojekyll`. Commit source and `docs/`, and push to `main`. GitHub Pages publishes from `main:/docs`.

The current Pages deployment remains an informational signup site. Move the commercial member application to Cloudflare or another appropriate application host before enabling authentication and private scheduling; see [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Email delivery

Cook availability uses multi-select weekend windows and an optional travel radius. These are submitted as readable values with the application.

Résumés support one PDF, DOC, or DOCX up to 5 MB, selected through a file picker or drag and drop. Files remain in the browser until submission. Applications with a file use FormSubmit’s documented native `multipart/form-data` upload flow and leave Misé for its verification/confirmation screen. Applications without a file keep the existing AJAX success/error flow. See [FormSubmit file-upload documentation](https://formsubmit.co/documentation). No attachment is serialized into JSON, stored in this repo, or uploaded separately. Link and pasted-résumé options remain available.

Local browser checks intercept submissions to verify multipart file bytes, application fields, size/type validation, and mobile controls. They do not verify actual inbox delivery; check one real attachment after recipient activation before relying on email attachments operationally.

The recipient must activate FormSubmit using the verification email. Submission acceptance does not prove inbox delivery. After activation, make one test signup and verify receipt before promoting the form. Reply directly to a submission email to contact the interested person.

FormSubmit offers an opaque recipient identifier in the activation email; replace the recipient in both `src/App.tsx` and `src/InterestForm.tsx` with that identifier if desired, rebuild, and publish. Do not put Stripe secret keys or customer records in this public repository.

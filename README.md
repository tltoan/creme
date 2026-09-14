# Misé

Meal prep private chef beta website hosted on GitHub Pages. The homepage explains the service, recruits cooks, and introduces separate client and cook scheduling previews. FormSubmit forwards interest forms and cook applications to the configured inbox; the repository contains no submitted customer records.

Project: `/Users/antony/Projects/creme`. The original folder and GitHub repository names remain unchanged. Live: https://tltoan.github.io/creme/

## Develop

Run `npm ci` and `npm run dev`. Open the local URL printed by Vite.

- `src/App.tsx`: homepage, navigation, cook application, hash routes.
- `src/InterestForm.tsx`: five-step client interest form.
- `src/Workspace.tsx`: interactive scheduling prototype shared between client and cook views.
- `src/style.css`: responsive monochrome design and interaction styles.
- `src/main.tsx`, `src/intro.css`, `mise-handwritten.gif`: opening animation. Reduced-motion users skip it; Escape dismisses it.
- `DESIGN-NOTES.md`: research, decisions, and photo credits.

Routes: `#home`, `#join`, `#join-client`, `#client`, `#cook`. `#join` offers client and cook signup choices; the client choice opens the interest form and the cook choice opens the application dialog. Hash routes work without a server rewrite on GitHub Pages.

## Scheduling preview boundaries

The client and cook views share sample state while switching roles. Request, reschedule, cancel, accept, decline, edit food preferences, and save recurring weekend availability are interactive. Reloading or leaving the workspace resets this state. Requests only allow weekend dates; cook acceptance checks saved availability and conflicts in the same half-day window.

This is not an authenticated booking system. No real booking, cook assignment, payment, calendar sync, or customer address is created. Production needs shared storage, account roles and access rules, Misé assignment operations, and notifications. Keep the preview labels until those are connected.

## Publish an update

Run `npm run build`, then `touch docs/.nojekyll`. Commit source and `docs/`, and push to `main`. GitHub Pages publishes from `main:/docs`.

## Email delivery

Cook availability uses multi-select weekend windows and an optional travel radius. These are submitted as readable values with the application.

Résumés support one PDF, DOC, or DOCX up to 5 MB, selected through a file picker or drag and drop. Files remain in the browser until submission. Applications with a file use FormSubmit’s documented native `multipart/form-data` upload flow and leave Misé for its verification/confirmation screen. Applications without a file keep the existing AJAX success/error flow. See [FormSubmit file-upload documentation](https://formsubmit.co/documentation). No attachment is serialized into JSON, stored in this repo, or uploaded separately. Link and pasted-résumé options remain available.

Local browser checks intercept submissions to verify multipart file bytes, application fields, size/type validation, and mobile controls. They do not verify actual inbox delivery; check one real attachment after recipient activation before relying on email attachments operationally.

The recipient must activate FormSubmit using the verification email. Submission acceptance does not prove inbox delivery. After activation, make one test signup and verify receipt before promoting the form. Reply directly to a submission email to contact the interested person.

FormSubmit offers an opaque recipient identifier in the activation email; replace the recipient in both `src/App.tsx` and `src/InterestForm.tsx` with that identifier if desired, rebuild, and publish. Do not put Stripe secret keys or customer records in this public repository.

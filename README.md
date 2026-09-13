# CREME

Private-chef interest form hosted on GitHub Pages. FormSubmit forwards submissions to the configured inbox; the GitHub repository contains no submitted customer records.

## Publish an update

Run `npm ci`, edit `src/App.tsx` or `src/style.css`, then run `npm run build`. Commit source and `docs/`, and push to `main`. GitHub Pages publishes from `main:/docs`.

## Email delivery

The recipient must activate FormSubmit using the verification email. Submission acceptance does not prove inbox delivery. After activation, make one test signup and verify receipt before promoting the form. Reply directly to a submission email to contact the interested person.

FormSubmit offers an opaque recipient identifier in the activation email; replace the recipient in `src/App.tsx` with that identifier if desired, rebuild, and publish.

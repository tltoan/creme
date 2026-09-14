// Fail the deployment instead of publishing a login screen with no backend.
const url = process.env.VITE_CONVEX_URL;
if (!url || !/^https:\/\/[a-z0-9-]+\.convex\.cloud$/.test(url)) {
  throw new Error(
    "Set VITE_CONVEX_URL in the Vercel project before deploying.",
  );
}
if (
  process.env.VERCEL_ENV === "production" &&
  url === "https://hallowed-dogfish-469.convex.cloud"
) {
  throw new Error(
    "Production must use the Mise production backend, not the local development deployment.",
  );
}

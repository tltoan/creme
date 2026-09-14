import { defineApp } from "convex/server";
import { v } from "convex/values";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp({
  env: {
    AUTH_GMAIL_USER: v.optional(v.string()),
    AUTH_GMAIL_APP_PASSWORD: v.optional(v.string()),
    AUTH_EMAIL_ENABLED: v.optional(v.string()),
  },
});
app.use(rateLimiter);
export default app;

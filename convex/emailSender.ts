"use node";
import nodemailer from "nodemailer";
import { v } from "convex/values";
import { internalAction, env } from "./_generated/server";
import { normalizeEmail, emailTemplate } from "./emailValidation";

export const sendCode = internalAction({
  args: {
    to: v.string(),
    code: v.string(),
    kind: v.union(v.literal("verify"), v.literal("reset")),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const user = env.AUTH_GMAIL_USER;
    const pass = env.AUTH_GMAIL_APP_PASSWORD?.replace(/\s/g, "");
    if (!user || !pass || env.AUTH_EMAIL_ENABLED !== "true")
      throw new Error("Email sign-in is not configured yet.");
    const to = normalizeEmail(args.to);
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      disableFileAccess: true,
      disableUrlAccess: true,
      logger: false,
      debug: false,
    });
    try {
      const result = await transport.sendMail({
        from: { name: "Misé", address: normalizeEmail(user) },
        to: { address: to, name: "" },
        ...emailTemplate(args.kind, args.code),
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      if (!result.accepted?.includes(to))
        throw new Error("Recipient not accepted");
      return null;
    } catch {
      // SMTP errors can contain addresses and provider details. Keep auth
      // responses and function logs free of credentials and verification codes.
      throw new Error("We couldn’t send your code. Please try again shortly.");
    } finally {
      transport.close();
    }
  },
});

import { Passkey } from "@convex-dev/auth/providers/Passkey";
import {
  convexAuth,
  getAuthUserId,
  getAuthSessionId,
} from "@convex-dev/auth/server";
import { emailPassword } from "./passwordProvider";
import { normalizeEmail } from "./emailValidation";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    emailPassword,
    Passkey({
      allowCredentialsByIdentifier: false,
      requireUserVerification: true,
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
      },
      profile: () => ({}),
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      // Existing credentials always keep their owner. A new password may be
      // attached to a currently authenticated passkey user, never to a member
      // found by a contact email supplied by the browser.
      const currentUserId =
        args.provider.id === "password" && args.type === "credentials"
          ? await getAuthUserId(ctx)
          : null;
      if (currentUserId) {
        const sessionId = await getAuthSessionId(ctx);
        const session = sessionId ? await ctx.db.get(sessionId) : null;
        if (!session || session.userId !== currentUserId)
          throw new Error("Sign in again before adding a password.");
      }
      const userId = args.existingUserId ?? currentUserId;
      const email =
        args.profile.email === undefined
          ? undefined
          : normalizeEmail(args.profile.email);
      const verified = args.profile.emailVerified === true;
      if (userId) {
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("Account not found.");
        if (email && user.email && user.email !== email)
          throw new Error("Use the email already attached to this account.");
        if (email)
          await ctx.db.patch(userId, {
            email,
            ...(verified ? { emailVerificationTime: Date.now() } : {}),
          });
        return userId;
      }
      return ctx.db.insert("users", {
        ...(email ? { email } : {}),
        ...(verified ? { emailVerificationTime: Date.now() } : {}),
      });
    },
  },
});

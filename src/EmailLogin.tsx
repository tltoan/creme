import { useEffect, useState, type FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAction } from "convex/react";
import { ArrowUpRight, Eye, EyeOff, Mail } from "lucide-react";
import { api } from "../convex/_generated/api";

type Step =
  | "signIn"
  | "signUp"
  | "email-verification"
  | "reset"
  | "reset-verification";
export function EmailLogin({
  attach = false,
  initialEmail = "",
  onComplete,
}: {
  attach?: boolean;
  initialEmail?: string;
  onComplete?: () => void;
}) {
  const { signIn } = useAuthActions();
  const getStatus = useAction(api.account.emailStatus);
  const [ready, setReady] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>(attach ? "signUp" : "signIn");
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [visible, setVisible] = useState(false),
    [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    getStatus()
      .then((value) => {
        if (active) setReady(value);
      })
      .catch(() => {
        if (active) setReady(false);
      });
    return () => {
      active = false;
    };
  }, [getStatus]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  const verifying =
    step === "email-verification" || step === "reset-verification";
  const needsPassword =
    step === "signIn" || step === "signUp" || step === "reset-verification";
  const newPassword = step === "signUp" || step === "reset-verification";
  function change(next: Step) {
    setStep(next);
    setError("");
    setNotice("");
    setVisible(false);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    if (newPassword && password !== data.get("confirm")) {
      setError("Your passwords don’t match.");
      return;
    }
    setBusy(true);
    try {
      const params: Record<string, string> = {
        email: email.trim().toLowerCase(),
        flow: step,
      };
      if (needsPassword)
        params[step === "reset-verification" ? "newPassword" : "password"] =
          password;
      if (verifying) params.code = String(data.get("code") ?? "").trim();
      const result = await signIn("password", params);
      if (result.signingIn) {
        onComplete?.();
      } else if (step === "reset") {
        setStep("reset-verification");
        setCooldown(60);
      } else if (step === "signIn" || step === "signUp") {
        setStep("email-verification");
        setCooldown(60);
      } else {
        setError("That code couldn’t be verified. Check it and try again.");
      }
    } catch {
      setError(
        verifying
          ? "That code is incorrect, expired, or already used. Check it or request a new code."
          : step === "signIn"
            ? "We couldn’t sign you in. Check your email and password, or reset your password."
            : step === "signUp"
              ? "We couldn’t create your account. If you already have one, log in or reset your password. Otherwise, try again shortly."
              : "We couldn’t send a reset code. Please wait a minute and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        flow: step === "reset-verification" ? "reset" : "email-verification",
      });
      setCooldown(60);
      setNotice("If the account can receive a code, a new one is on its way.");
    } catch {
      setError(
        "We couldn’t send another code yet. Please wait a minute and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (ready === null)
    return (
      <p role="status" className="auth-explainer">
        Loading sign-in options…
      </p>
    );
  if (!ready)
    return (
      <p className="auth-explainer">
        Email sign-in will be available shortly. You can still use a passkey
        below.
      </p>
    );
  return (
    <div className="email-login">
      {(step !== "signIn" || attach) && (
        <div className="email-step-title">
          <Mail size={20} />
          <h3>
            {step === "signUp"
              ? attach
                ? "Add email and password"
                : "Create your account"
              : step === "reset"
                ? "Forgot your password?"
                : step === "reset-verification"
                  ? "Choose a new password"
                  : "Check your email"}
          </h3>
        </div>
      )}
      {verifying && (
        <p className="email-instruction">
          {step === "reset-verification"
            ? "If an account exists for"
            : "We sent a verification code to"}{" "}
          <strong>{email}</strong>
          {step === "reset-verification"
            ? ", we’ve sent a reset code."
            : "."}{" "}
          Codes expire in 10 minutes. Check your spam folder too.
        </p>
      )}
      {step === "signUp" && !attach && (
        <p className="email-instruction">
          Verify your email, then send your details to Misé for onboarding
          approval.
        </p>
      )}
      {attach && step === "signUp" && (
        <p className="email-instruction">
          Verify your email to add a password to this account. Your workspace
          stays with you.
        </p>
      )}
      {step === "reset" && (
        <p className="email-instruction">
          Enter your account email. We’ll send a code so you can set a new
          password.
        </p>
      )}
      <form key={step} className="email-form" onSubmit={submit}>
        {!verifying && (
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
              required
              readOnly={attach && Boolean(initialEmail)}
            />
          </label>
        )}
        {verifying && (
          <label>
            8-digit code
            <input
              name="code"
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]{8}"
              minLength={8}
              maxLength={8}
              className="email-code"
              required
              autoFocus
            />
          </label>
        )}
        {needsPassword && (
          <label>
            {step === "reset-verification" ? "New password" : "Password"}
            <span className="password-input">
              <input
                name="password"
                type={visible ? "text" : "password"}
                autoComplete={newPassword ? "new-password" : "current-password"}
                minLength={newPassword ? 12 : undefined}
                maxLength={128}
                required
              />
              <button
                type="button"
                className="password-reveal"
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            {newPassword && (
              <small>
                12–128 characters. A long, memorable phrase works well.
              </small>
            )}
          </label>
        )}
        {newPassword && (
          <label>
            Confirm password
            <input
              name="confirm"
              type={visible ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
            />
          </label>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="auth-success" role="status">
            {notice}
          </p>
        )}
        <button className="btn" disabled={busy}>
          {busy
            ? "Please wait…"
            : step === "signIn"
              ? "Log in"
              : step === "signUp"
                ? "Create account"
                : step === "reset"
                  ? "Send reset code"
                  : step === "reset-verification"
                    ? "Save new password"
                    : "Verify email"}
          <ArrowUpRight size={17} />
        </button>
      </form>
      <div className="email-form-links">
        {step === "signIn" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => change("reset")}
            >
              Forgot password?
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => change("signUp")}
            >
              Create an account
            </button>
          </>
        )}
        {verifying && (
          <button
            type="button"
            disabled={busy || cooldown > 0}
            onClick={resend}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        )}
        {step !== "signIn" && !attach && (
          <button
            type="button"
            disabled={busy}
            onClick={() => change("signIn")}
          >
            Back to log in
          </button>
        )}
      </div>
    </div>
  );
}

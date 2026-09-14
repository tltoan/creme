export function normalizeEmail(value: unknown): string {
  if (typeof value !== "string")
    throw new Error("Enter a valid email address.");
  const email = value.trim().toLowerCase();
  // One plain mailbox only; no display names, comments, Unicode lookalikes,
  // address lists, or header characters reach the mail transport.
  if (
    email.length > 254 ||
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}$/.test(
      email,
    )
  )
    throw new Error("Enter a valid email address.");
  return email;
}

export function validatePassword(password: string) {
  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  )
    throw new Error("Use a password between 12 and 128 characters.");
}

export function emailTemplate(kind: "verify" | "reset", code: string) {
  if (!/^\d{8}$/.test(code))
    throw new Error("Invalid verification code format.");
  const title =
    kind === "verify"
      ? "Verify your email for Misé"
      : "Reset your Misé password";
  const instruction =
    kind === "verify"
      ? "Enter this code on Misé to verify your email."
      : "Enter this code on Misé to choose a new password.";
  return {
    subject: title,
    text: `${title}\n\n${instruction}\n\n${code}\n\nThis code expires in 10 minutes and can only be used once. If you didn’t request this, you can ignore this email. Never share your code.\n\nMisé`,
    html: `<div style="font-family:Arial,sans-serif;background:#f6f6f2;padding:32px;color:#181816"><div style="max-width:480px;margin:auto;background:white;padding:32px;border-radius:20px"><div style="font-family:Georgia,serif;font-size:38px;font-style:italic">misé.</div><h1 style="font-size:24px;font-weight:500;margin-top:32px">${title}</h1><p style="line-height:1.7">${instruction}</p><p style="font-size:32px;letter-spacing:6px;background:#f6f6f2;border-radius:12px;padding:20px;text-align:center">${code}</p><p style="color:#73736c;font-size:13px;line-height:1.8">This code expires in 10 minutes and can only be used once. If you didn’t request this, you can ignore this email. Never share your code.</p></div></div>`,
  };
}

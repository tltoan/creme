import { Component, useState, type ReactNode } from "react";
import {
  ConvexAuthProvider,
  useAuthActions,
  usePasskeyAuth,
} from "@convex-dev/auth/react";
import {
  ConvexReactClient,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChefHat,
  Fingerprint,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import "./member.css";
import { EmailLogin } from "./EmailLogin";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const client = convexUrl ? new ConvexReactClient(convexUrl) : null;
type Role = "client" | "cook";

class MemberErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="member-access page-width">
          <div className="member-access-card">
            <h1>Let’s reconnect.</h1>
            <p>We couldn’t load your account. Please reload and try again.</p>
            <button className="btn" onClick={() => window.location.reload()}>
              Try again
            </button>
            <a className="back-link" href="mailto:antonyltran@gmail.com">
              Contact Misé
            </a>
          </div>
        </div>
      );
    return this.props.children;
  }
}

export default function MemberAccess() {
  if (!client)
    return (
      <section className="member-access page-width">
        <div className="member-intro">
          <p className="eyebrow">YOUR MISÉ ACCOUNT</p>
          <h1>
            Your place
            <br />
            <em>at the table.</em>
          </h1>
        </div>
        <div className="member-access-card">
          <h2>Member access is coming soon.</h2>
          <p>Contact the team about your account or next visit.</p>
          <a className="btn" href="mailto:antonyltran@gmail.com">
            Contact Misé <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
    );
  return (
    <MemberErrorBoundary>
      <ConvexAuthProvider client={client}>
        <AccountGate />
      </ConvexAuthProvider>
    </MemberErrorBoundary>
  );
}

function AccountGate() {
  const [role, setRole] = useState<Role>(() =>
    window.location.hash === "#cook" ? "cook" : "client",
  );
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading)
    return (
      <div className="member-loading" role="status">
        Opening your Misé account…
      </div>
    );
  return isAuthenticated ? (
    <SignedIn requestedRole={role} />
  ) : (
    <SignIn role={role} setRole={setRole} />
  );
}

function SignIn({
  role,
  setRole,
}: {
  role: Role;
  setRole: (role: Role) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { signInWithPasskey, registerPasskey } = usePasskeyAuth();
  const supported =
    typeof window.PublicKeyCredential !== "undefined" && window.isSecureContext;
  async function authenticate(register: boolean) {
    setBusy(true);
    setError("");
    try {
      if (register)
        await registerPasskey({
          name: `Misé ${role === "client" ? "client" : "cook"}`,
        });
      else await signInWithPasskey();
    } catch {
      setError(
        "Sign-in wasn’t completed. Try again with your saved passkey, or choose another device in the passkey prompt.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="member-access page-width"
      aria-labelledby="member-heading"
    >
      <div className="member-intro">
        <p className="eyebrow">A GOOD WEEK STARTS HERE</p>
        <h1 id="member-heading">
          Your place
          <br />
          <em>at the table.</em>
        </h1>
        <p>
          Your meals, your calendar, a little more breathing room. Welcome back
          to Misé.
        </p>
        <div className="auth-photo">
          <img
            src="./mise-salad.jpg"
            alt="A colorful bowl of freshly prepared vegetables"
          />
          <span>Made for your kind of week.</span>
        </div>
      </div>
      <div className="member-access-card auth-card">
        <div
          className="auth-role-picker"
          role="group"
          aria-label="Account type"
        >
          <button
            type="button"
            aria-pressed={role === "client"}
            onClick={() => setRole("client")}
          >
            <CalendarDays size={18} />
            I’m a client
          </button>
          <button
            type="button"
            aria-pressed={role === "cook"}
            onClick={() => setRole("cook")}
          >
            <ChefHat size={18} />
            I’m a cook
          </button>
        </div>
        <span className="member-lock">
          <Fingerprint size={26} />
        </span>
        <h2>
          {role === "client"
            ? "Your week, taken care of."
            : "Good food starts with you."}
        </h2>
        <p>
          {role === "client"
            ? "Sign in to view your visits and share when you’re home."
            : "Sign in to see your assigned visits and update your availability."}
        </p>
        <EmailLogin />
        <div className="auth-divider">
          <span>or use a passkey</span>
        </div>
        <button
          className="btn auth-main-button"
          disabled={busy || !supported}
          onClick={() => authenticate(false)}
        >
          {busy ? "Follow your device’s prompt…" : "Log in with a passkey"}
          <ArrowUpRight size={18} />
        </button>
        <p className="auth-explainer">
          Use Face ID, Touch ID, your screen lock, or a security key. Your
          device keeps your passkey safe.
        </p>
        {!supported && (
          <p className="auth-error" role="alert">
            Open this page in a browser that supports passkeys over HTTPS or
            localhost.
          </p>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <div className="auth-first-time">
          <strong>Prefer to create a passkey?</strong>
          <p>
            After applying, create your account. Misé will verify your details
            and complete onboarding before opening your workspace.
          </p>
          <button
            className="btn outline"
            disabled={busy || !supported}
            onClick={() => authenticate(true)}
          >
            Create a passkey
          </button>
        </div>
        <div className="member-join">
          <span>Haven’t applied yet?</span>
          <a href="#join">
            Join as a client or cook <ArrowUpRight size={14} />
          </a>
        </div>
        <a
          className="auth-help"
          href="mailto:antonyltran@gmail.com?subject=Mise%20account%20help"
        >
          Lost access to your passkey? Contact Misé.
        </a>
      </div>
    </section>
  );
}

function SignedIn({ requestedRole }: { requestedRole: Role }) {
  const member = useQuery(api.members.me);
  const { signOut } = useAuthActions();
  const [error, setError] = useState("");
  async function logout() {
    try {
      await signOut();
    } catch {
      setError("We couldn’t sign you out. Please try again.");
    }
  }
  if (member === undefined)
    return (
      <div className="member-loading" role="status">
        Loading your account…
      </div>
    );
  return (
    <div className="account-shell page-width">
      <div className="account-top">
        <span className="eyebrow">YOUR MISÉ ACCOUNT</span>
        <button className="text-button" onClick={logout}>
          Log out <LogOut size={16} />
        </button>
      </div>
      {error && (
        <p role="alert" className="auth-error">
          {error}
        </p>
      )}
      {!member ? (
        <CompleteProfile requestedRole={requestedRole} />
      ) : member.status !== "approved" ||
        !member.role ||
        !member.identityVerifiedAt ||
        !member.onboardedAt ? (
        <Pending member={member} />
      ) : (
        <MemberWorkspace member={member} />
      )}
    </div>
  );
}

function CompleteProfile({ requestedRole }: { requestedRole: Role }) {
  const identity = useQuery(api.account.identity);
  const requestAccess = useMutation(api.members.requestAccess);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await requestAccess({
        name: String(data.get("name")),
        contactEmail: String(data.get("email")),
        requestedRole: data.get("role") as Role,
      });
    } catch {
      setError(
        "We couldn’t save your details. Check your name and email, then try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="account-onboarding">
      <p className="eyebrow">01 / LET’S CONNECT YOUR ACCOUNT</p>
      <h1>
        A few details.
        <br />
        <em>Then you’re on your way.</em>
      </h1>
      <p>
        Use the same contact details you shared with Misé. Our team will confirm
        your identity and onboarding.
      </p>
      <form className="auth-profile-form" onSubmit={submit}>
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </label>
        <label>
          Contact email
          <input
            name="email"
            defaultValue={identity?.email ?? ""}
            key={identity?.email ?? "unverified"}
            readOnly={Boolean(identity?.emailVerified)}
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </label>
        <fieldset>
          <legend>I’m joining as a</legend>
          <label>
            <input
              type="radio"
              name="role"
              value="client"
              defaultChecked={requestedRole === "client"}
            />
            Client
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="cook"
              defaultChecked={requestedRole === "cook"}
            />
            Cook
          </label>
        </fieldset>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "Saving…" : "Send for approval"}
          <ArrowUpRight size={18} />
        </button>
      </form>
    </section>
  );
}

function Pending({ member }: { member: Doc<"members"> }) {
  return (
    <section className="account-onboarding">
      <span className="member-lock">
        <ShieldCheck size={26} />
      </span>
      <p className="eyebrow">
        {member.status === "suspended"
          ? "ACCOUNT ACCESS PAUSED"
          : "ACCOUNT CREATED"}
      </p>
      <h1>
        {member.status === "suspended"
          ? "Let’s check in."
          : "You’re on the list."}
      </h1>
      <p>
        {member.status === "suspended"
          ? "Please contact Misé to review your account access."
          : `Thanks, ${member.name.split(" ")[0]}. Misé will confirm your ${member.requestedRole === "cook" ? "cook" : "client"} onboarding before your schedule opens here.`}
      </p>
      <div className="account-review">
        <Check size={18} />
        <span>Account created</span>
        <span className="status-pill">
          {member.status === "suspended" ? "Paused" : "Awaiting approval"}
        </span>
      </div>
      <p>
        Already onboarded or paid in person? Share this account reference with
        the team so we can connect the right records.
      </p>
      <label className="account-reference">
        Your account reference
        <input readOnly value={member._id} onFocus={(e) => e.target.select()} />
      </label>
      <a
        className="btn"
        href={`mailto:antonyltran@gmail.com?subject=${encodeURIComponent("Misé account access")}&body=${encodeURIComponent(`My account reference is ${member._id}.`)}`}
      >
        Contact Misé <ArrowUpRight size={17} />
      </a>
      <p className="auth-explainer">
        Account approval is separate from payments. Creating an account does not
        charge you.
      </p>
    </section>
  );
}

function MemberWorkspace({ member }: { member: Doc<"members"> }) {
  const [from] = useState(() => new Date().setHours(0, 0, 0, 0));
  const visits = useQuery(api.visits.mine, { from });
  const cook = member.role === "cook";
  return (
    <section className="live-workspace">
      <div className="workspace-welcome">
        <div>
          <p className="eyebrow">
            {cook ? "COOK WORKSPACE" : "CLIENT WORKSPACE"}
          </p>
          <h1>
            Hello, {member.name.split(" ")[0]}.<br />
            <em>
              {cook ? "Let’s make a good week." : "Make room for your week."}
            </em>
          </h1>
        </div>
        <span className="status-pill">
          <Check size={14} /> Onboarding complete
        </span>
      </div>
      <div className="account-grid">
        <div className="account-panel">
          <div className="account-panel-title">
            <h2>{cook ? "Your assigned visits" : "Your upcoming visits"}</h2>
            <CalendarDays size={22} />
          </div>
          <p>
            {cook
              ? "Visits assigned to you by Misé appear here."
              : "Misé matches your cook around your timing and food preferences."}
          </p>
          {visits === undefined ? (
            <p role="status">Loading visits…</p>
          ) : visits.length === 0 ? (
            <div className="visits-empty">
              <CalendarDays size={32} />
              <h3>A little space in your calendar.</h3>
              <p>
                {cook
                  ? "Add your availability so the team can plan your next assignment."
                  : "Share your preferred windows and contact the team to arrange your next visit."}
              </p>
              <a href="mailto:antonyltran@gmail.com" className="back-link">
                Contact Misé <ArrowUpRight size={15} />
              </a>
            </div>
          ) : (
            <ul className="real-visit-list">
              {visits.map((visit) => (
                <li key={visit.id}>
                  <div>
                    <strong>
                      {new Date(visit.startsAt).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </strong>
                    <span>
                      {new Date(visit.startsAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      –{" "}
                      {new Date(visit.endsAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className="status-pill">{visit.status}</span>
                  {visit.menu && <p>{visit.menu}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Availability member={member} />
      </div>
      <AccountPasswordSettings />
      <PasskeySettings />
    </section>
  );
}

function Availability({ member }: { member: Doc<"members"> }) {
  const save = useMutation(api.members.saveAvailability);
  const [slots, setSlots] = useState(member.availability);
  const [note, setNote] = useState(member.availabilityNote);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      await save({ slots, note });
      setMessage("Your availability is saved.");
    } catch {
      setFailed(true);
      setMessage("We couldn’t save your availability. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="account-panel" onSubmit={submit}>
      <div className="account-panel-title">
        <h2>
          {member.role === "cook" ? "When can you cook?" : "When are you home?"}
        </h2>
        <ChefHat size={22} />
      </div>
      <p>
        Select your usual weekend windows. The team will confirm exact visit
        times with you.
      </p>
      <div className="member-slot-grid">
        {(["Saturday", "Sunday"] as const).map((day) => (
          <fieldset key={day}>
            <legend>{day}</legend>
            {(["morning", "afternoon", "evening"] as const).map((window) => {
              const selected = slots.some(
                (s) => s.day === day && s.window === window,
              );
              return (
                <label key={window} className={selected ? "selected" : ""}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      setMessage("");
                      setSlots(
                        selected
                          ? slots.filter(
                              (s) => s.day !== day || s.window !== window,
                            )
                          : [...slots, { day, window }],
                      );
                    }}
                  />
                  <span>
                    {window}
                    <small>
                      {window === "morning"
                        ? "9 am – noon"
                        : window === "afternoon"
                          ? "Noon – 5 pm"
                          : "5 pm – 9 pm"}
                    </small>
                  </span>
                  {selected && <Check size={15} />}
                </label>
              );
            })}
          </fieldset>
        ))}
      </div>
      <label className="availability-note">
        Anything we should know? <span>Optional</span>
        <textarea
          value={note}
          maxLength={500}
          rows={3}
          onChange={(e) => {
            setNote(e.target.value);
            setMessage("");
          }}
          placeholder="A rotating work schedule, an upcoming trip…"
        />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? "Saving…" : "Save availability"}
        <ArrowUpRight size={17} />
      </button>
      {message && (
        <p
          className={failed ? "auth-error" : "auth-success"}
          role={failed ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}

function PasskeySettings() {
  const { registerPasskey } = usePasskeyAuth();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function add() {
    setBusy(true);
    setMessage("");
    try {
      await registerPasskey();
      setMessage("Another passkey is ready to use.");
    } catch {
      setMessage("The passkey wasn’t added. You can try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="passkey-settings">
      <div>
        <h3>Your sign-in, kept simple.</h3>
        <p>Add a backup passkey using another device or security key.</p>
        {message && <p role="status">{message}</p>}
      </div>
      <button className="btn outline" disabled={busy} onClick={add}>
        <Fingerprint size={18} />
        {busy ? "Follow your device’s prompt…" : "Add a passkey"}
      </button>
    </div>
  );
}

function AccountPasswordSettings() {
  const identity = useQuery(api.account.identity);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  if (!identity) return null;
  return (
    <div className="account-password-settings">
      <div className="passkey-settings">
        <div>
          <h3>Email and password</h3>
          <p>
            {identity.hasPassword && identity.emailVerified
              ? `Email verified: ${identity.email}`
              : "Add email and password as another way to access this account."}
          </p>
          {message && <p role="status">{message}</p>}
        </div>
        {(!identity.hasPassword || !identity.emailVerified) && (
          <button className="btn outline" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Add email and password"}
          </button>
        )}
      </div>
      {open && (
        <EmailLogin
          attach
          initialEmail={identity.email ?? ""}
          onComplete={() => {
            setOpen(false);
            setMessage(
              "Email verified. You can now log in with your password.",
            );
          }}
        />
      )}
    </div>
  );
}

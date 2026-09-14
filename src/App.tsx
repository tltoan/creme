import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChefHat,
  Check,
  Clock3,
  Heart,
  Leaf,
  Menu,
  Plus,
  X,
  Utensils,
  Sparkles,
  Upload,
  FileText,
  MapPin,
} from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "./components/ui/button";
import InterestForm from "./InterestForm";
import MemberAccess from "./MemberAccess";

export function tactile() {
  if (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    "vibrate" in navigator
  )
    navigator.vibrate(8);
}
export const go = (path: string) => {
  tactile();
  window.location.hash = path;
};
const faq = [
  [
    "What exactly is Misé?",
    "A meal prep private chef service, made for real life. A vetted cook comes to your kitchen and prepares meals around your food preferences, dietary needs, and schedule.",
  ],
  [
    "Do I choose my cook?",
    "Misé handles the match based on availability, location, and your food needs. We confirm your cook and visit details with you before the session.",
  ],
  [
    "Who gets the groceries?",
    "You can shop from a list, arrange delivery, or request that your cook shops. We agree on the arrangement and grocery budget before your visit.",
  ],
  [
    "How much does it cost?",
    "During beta, we quote each household based on the number of meals, portions, and cooking needs. Chef service and grocery costs are made clear before you commit.",
  ],
  [
    "Can you work around my dietary needs?",
    "Tell us your preferences and allergies when you join. We discuss them with your cook and confirm what can be safely accommodated before cooking.",
  ],
  [
    "How do I join the beta?",
    "Choose to join as a client or as a cook. Clients share their food preferences and schedule; cooks tell us about their experience and availability. We’ll follow up with next steps. Client and cook accounts are reserved for onboarded members.",
  ],
];

function CookApplication({ trigger }: { trigger?: React.ReactNode }) {
  const [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [windows, setWindows] = useState<string[]>([]);
  const [flexible, setFlexible] = useState(false);
  const [radius, setRadius] = useState("");
  const resumeInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const restore = () => setBusy(false);
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);
  function chooseResume(files: FileList | File[]) {
    const file = files[0];
    if (!file) return;
    const issue =
      files.length > 1
        ? "Please choose one résumé file."
        : !/\.(pdf|doc|docx)$/i.test(file.name)
          ? "Choose a PDF, DOC, or DOCX file."
          : file.size === 0
            ? "This file is empty. Please choose another file."
            : file.size > 5 * 1024 * 1024
              ? "This file is too large. Please choose a file under 5 MB."
              : "";
    setFileError(issue);
    if (issue) {
      setResume(null);
      if (resumeInput.current) resumeInput.current.value = "";
      return;
    }
    const transfer = new DataTransfer();
    transfer.items.add(file);
    if (resumeInput.current) resumeInput.current.files = transfer.files;
    setResume(file);
  }
  function removeResume() {
    setResume(null);
    setFileError("");
    if (resumeInput.current) resumeInput.current.value = "";
  }
  async function send(event: React.FormEvent<HTMLFormElement>) {
    if (fileError) {
      event.preventDefault();
      return;
    }
    // FormSubmit documents attachments for native multipart forms. Let the
    // browser send the actual file instead of serializing it into AJAX JSON.
    if (resumeInput.current?.files?.length) {
      setBusy(true);
      setError("");
      return;
    }
    event.preventDefault();
    setBusy(true);
    setError("");
    const fields = new FormData(event.currentTarget);
    fields.delete("attachment");
    const payload = Object.fromEntries(fields);
    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/antonyltran@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...payload,
            _subject: "Misé cook beta application",
            _template: "table",
          }),
        },
      );
      const data = await response.json();
      if (!response.ok || ![true, "true"].includes(data.success))
        throw new Error();
      setSent(true);
    } catch {
      setError(
        "We couldn’t send your application. Your answers are still here. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open) {
          removeResume();
          setDragging(false);
          setBusy(false);
        }
      }}
    >
      <Dialog.Trigger asChild>
        {trigger ?? (
          <Button className="btn">
            Cook with Misé <ArrowUpRight />
          </Button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content cook-application">
          <Dialog.Close
            className="icon-button modal-close"
            aria-label="Close cook application"
          >
            <X />
          </Dialog.Close>
          <p className="eyebrow">FOR PEOPLE WHO LOVE TO COOK</p>
          <Dialog.Title>Bring your craft to the table.</Dialog.Title>
          <Dialog.Description>
            Tell us about your background, the food you love to cook, and how
            you work. A résumé is welcome but optional. About 5–7 minutes.
          </Dialog.Description>
          {sent ? (
            <div className="success-message" role="status">
              <Check /> Application received. We’ll be in touch.
            </div>
          ) : (
            <form
              className="application-form"
              onSubmit={send}
              action="https://formsubmit.co/antonyltran@gmail.com"
              method="POST"
              encType="multipart/form-data"
            >
              <input
                type="hidden"
                name="_subject"
                value="Misé cook beta application"
              />
              <input type="hidden" name="_template" value="table" />
              <fieldset className="application-section">
                <legend>01 / About you</legend>
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={120}
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </label>
                <label>
                  Where are you based?
                  <input
                    name="location"
                    required
                    maxLength={180}
                    placeholder="City or neighborhood"
                  />
                </label>
              </fieldset>
              <fieldset className="application-section">
                <legend>02 / Your cooking experience</legend>
                <label>
                  What best describes your background?
                  <select name="Cooking background" required defaultValue="">
                    <option value="" disabled>
                      Select your background
                    </option>
                    <option>Culinary student</option>
                    <option>Restaurant or catering cook</option>
                    <option>Freelance or private chef</option>
                    <option>Experienced home cook</option>
                    <option>Other cooking background</option>
                  </select>
                </label>
                <label>
                  How long have you been cooking regularly?
                  <select
                    name="Years cooking regularly"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select experience level
                    </option>
                    <option>Less than 1 year</option>
                    <option>1–2 years</option>
                    <option>3–5 years</option>
                    <option>6–10 years</option>
                    <option>More than 10 years</option>
                  </select>
                </label>
                <label>
                  Tell us about your cooking experience
                  <textarea
                    name="experience"
                    required
                    rows={5}
                    maxLength={4000}
                    aria-describedby="cook-experience-hint"
                    placeholder="Where have you cooked, who have you cooked for, and what were you responsible for?"
                  />
                </label>
                <p id="cook-experience-hint" className="field-help">
                  Include restaurants, catering, private clients, culinary
                  school, or cooking at home. Tell us about planning menus,
                  shopping, preparing several meals at once, and working
                  independently.
                </p>
                <label>
                  Which cuisines or dishes are your specialties? (optional)
                  <textarea
                    name="Cuisines and signature dishes"
                    maxLength={1500}
                    placeholder="Your favorite cuisines, signature dishes, or the meals people ask you to make again."
                  />
                </label>
                <label>
                  Experience with dietary needs and allergies (optional)
                  <textarea
                    name="Dietary needs and allergy experience"
                    maxLength={1500}
                    placeholder="For example: vegetarian menus, high-protein meal prep, gluten-free cooking, or managing cross-contact. It’s okay if you’re still learning."
                  />
                </label>
                <label>
                  Culinary training or food-safety certifications (optional)
                  <textarea
                    name="Training and certifications"
                    maxLength={1500}
                    placeholder="School or program, qualifications, and any food-safety certification with its expiration date. Self-taught experience is welcome."
                  />
                </label>
                <label>
                  What would you cook for a household’s week? (optional)
                  <textarea
                    name="Sample weekly menu"
                    maxLength={2000}
                    placeholder="Share 3–5 meals you’d enjoy preparing, and how you’d keep the menu varied and practical to reheat."
                  />
                </label>
              </fieldset>
              <fieldset className="application-section">
                <legend>03 / Résumé & work samples</legend>
                <p className="field-help">
                  Have a résumé? Add it here. It’s optional, and your experience
                  above is a great place to start.
                </p>
                <label
                  className={`resume-dropzone ${dragging ? "dragging" : ""} ${fileError ? "has-error" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={(event) => {
                    if (
                      !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                      )
                    )
                      setDragging(false);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    chooseResume(event.dataTransfer.files);
                  }}
                >
                  <input
                    ref={resumeInput}
                    className="resume-file-input"
                    type="file"
                    name="attachment"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    aria-label="Upload résumé (optional)"
                    aria-describedby="resume-file-help"
                    aria-invalid={!!fileError}
                    onChange={(event) => {
                      if (event.target.files) chooseResume(event.target.files);
                    }}
                  />
                  <span className="upload-icon">
                    <Upload size={22} />
                  </span>
                  <strong>
                    {dragging
                      ? "Drop your résumé here"
                      : resume
                        ? "Choose a different résumé"
                        : "Drop your résumé here"}
                  </strong>
                  <span>
                    or <span className="browse-files">browse files</span>
                  </span>
                  <small id="resume-file-help">
                    PDF, DOC, or DOCX · Up to 5 MB · One file
                  </small>
                </label>
                {resume && (
                  <div className="resume-file-row" role="status">
                    <FileText size={22} />
                    <span>
                      <strong>{resume.name}</strong>
                      <small>
                        {(resume.size / 1024 / 1024).toFixed(2)} MB · Ready to
                        attach
                      </small>
                    </span>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Remove résumé"
                      onClick={removeResume}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {fileError && (
                  <div className="file-error" role="alert">
                    <span>{fileError}</span>
                    <button type="button" onClick={removeResume}>
                      Clear
                    </button>
                  </div>
                )}
                <details className="resume-details">
                  <summary>Prefer to share a résumé link?</summary>
                  <label>
                    Résumé or LinkedIn link (optional)
                    <input
                      name="Resume or LinkedIn URL"
                      type="url"
                      maxLength={2000}
                      placeholder="https://…"
                    />
                  </label>
                </details>
                <label>
                  Portfolio or food photos link (optional)
                  <input
                    name="Portfolio or food photos URL"
                    type="url"
                    maxLength={2000}
                    placeholder="https://…"
                  />
                </label>
                <details className="resume-details">
                  <summary>Prefer to paste your résumé?</summary>
                  <label>
                    Résumé text (optional)
                    <textarea
                      name="Resume text"
                      rows={7}
                      maxLength={12000}
                      placeholder="Paste relevant roles, education, skills, and accomplishments here."
                    />
                  </label>
                </details>
              </fieldset>
              <fieldset className="application-section">
                <legend>04 / Your availability</legend>
                <div className="availability-intro">
                  <CalendarDays size={20} />
                  <div>
                    <h3>Your weekends, your rhythm.</h3>
                    <p>
                      Choose the windows when you’re usually free. Select all
                      that work for you.
                    </p>
                  </div>
                </div>
                <input
                  type="hidden"
                  name="availability"
                  value={
                    flexible
                      ? "Flexible — coordinate with me"
                      : windows.join("; ") || "Not specified"
                  }
                />
                <div className="cook-day-grid">
                  {["Saturday", "Sunday"].map((day) => (
                    <div className="cook-day-card" key={day}>
                      <h4>{day}</h4>
                      {[
                        ["Morning", "9 AM–12 PM"],
                        ["Afternoon", "12–5 PM"],
                        ["Evening", "5–9 PM"],
                      ].map(([time, hours]) => {
                        const slot = `${day} ${time} (${hours})`,
                          chosen = !flexible && windows.includes(slot);
                        return (
                          <button
                            type="button"
                            className={chosen ? "selected" : ""}
                            aria-pressed={chosen}
                            aria-label={`${day} ${time}, ${hours}`}
                            key={time}
                            onClick={() => {
                              setFlexible(false);
                              setWindows((all) =>
                                all.includes(slot)
                                  ? all.filter((value) => value !== slot)
                                  : [...all, slot],
                              );
                            }}
                          >
                            <span>
                              <strong>{time}</strong>
                              <small>{hours}</small>
                            </span>
                            <span className="slot-check">
                              {chosen ? (
                                <Check size={14} />
                              ) : (
                                <Plus size={14} />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className={`flexible-choice ${flexible ? "selected" : ""}`}
                  aria-pressed={flexible}
                  onClick={() => {
                    setFlexible((value) => !value);
                    setWindows([]);
                  }}
                >
                  <Clock3 size={17} />
                  <span>My schedule varies. Let’s coordinate.</span>
                  {flexible && <Check size={16} />}
                </button>
                <p className="availability-summary" role="status">
                  {flexible
                    ? "Flexible timing selected."
                    : windows.length
                      ? `${windows.length} time ${windows.length === 1 ? "window" : "windows"} selected.`
                      : "No windows selected yet. You can also discuss timing with us."}{" "}
                  We’ll confirm each visit with you.
                </p>
                <fieldset className="travel-fieldset">
                  <legend>
                    <MapPin size={19} /> How far would you like to travel?
                  </legend>
                  <p className="field-help">
                    Choose a one-way distance from where you’re based. Optional.
                  </p>
                  <div className="travel-grid">
                    {[
                      ["5 miles", "Close to home"],
                      ["10 miles", "Around town"],
                      ["20 miles", "A little farther"],
                      ["30+ miles", "Happy to travel"],
                    ].map(([value, hint]) => (
                      <label
                        className={`travel-option ${radius === value ? "selected" : ""}`}
                        key={value}
                      >
                        <input
                          type="radio"
                          name="Travel radius"
                          value={value}
                          checked={radius === value}
                          onChange={() => setRadius(value)}
                        />
                        <strong>{value}</strong>
                        <span>{hint}</span>
                      </label>
                    ))}
                  </div>
                  <label
                    className={`travel-flexible ${radius === "Flexible — depends on the visit" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="Travel radius"
                      value="Flexible — depends on the visit"
                      checked={radius === "Flexible — depends on the visit"}
                      onChange={(event) => setRadius(event.target.value)}
                    />
                    I’m flexible—it depends on the visit.
                  </label>
                  {radius && (
                    <button
                      type="button"
                      className="clear-travel"
                      onClick={() => setRadius("")}
                    >
                      Clear distance
                    </button>
                  )}
                </fieldset>
                <details className="resume-details">
                  <summary>Anything else about timing or travel?</summary>
                  <label>
                    Availability or travel notes (optional)
                    <textarea
                      name="Availability and travel notes"
                      maxLength={1000}
                      placeholder="Specific neighborhoods, changing class schedules, transport needs, or a different time that works…"
                    />
                  </label>
                </details>
              </fieldset>
              <p className="fine">
                Submitting lets Misé contact you about cooking opportunities.
                Your answers are sent through FormSubmit.
              </p>
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
              {resume && (
                <p className="fine">
                  With a résumé attached, you’ll finish submitting on
                  FormSubmit. Your file is sent with your application.
                </p>
              )}
              <Button className="btn" disabled={busy || !!fileError}>
                {busy
                  ? "Sending…"
                  : resume
                    ? "Continue with résumé"
                    : "Send application"}
                <ArrowRight />
              </Button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function JoinChoice() {
  return (
    <section className="join-choice page-width" aria-labelledby="join-heading">
      <div className="join-choice-intro">
        <p className="eyebrow">JOIN THE MISÉ BETA</p>
        <h1 id="join-heading">
          A place for you
          <br />
          <em>at the table.</em>
        </h1>
        <p>Good food brings people together. How would you like to join?</p>
      </div>
      <div className="join-role-grid">
        <a className="join-role-card" href="#join-client">
          <img src="./mise-salad.jpg" alt="A freshly prepared vegetable bowl" />
          <div className="join-role-copy">
            <span className="eyebrow">
              <Utensils size={15} /> FOR YOUR HOME
            </span>
            <h2>
              Join the beta as a client <ArrowUpRight />
            </h2>
            <p>
              Meals made around your preferences, prepared in your kitchen. Find
              your weekly rhythm.
            </p>
            <span className="join-role-action">
              Find your cook <ArrowRight size={17} />
            </span>
          </div>
        </a>
        <CookApplication
          trigger={
            <button className="join-role-card" type="button">
              <img
                src="./mise-cook.jpg"
                alt="A cook preparing fresh ingredients in a kitchen"
              />
              <div className="join-role-copy">
                <span className="eyebrow">
                  <ChefHat size={15} /> FOR YOUR CRAFT
                </span>
                <h2>
                  Join the beta as a cook <ArrowUpRight />
                </h2>
                <p>
                  Bring your skills to local kitchens. Share your experience and
                  the days you’re free to cook.
                </p>
                <span className="join-role-action">
                  Bring your craft <ArrowRight size={17} />
                </span>
              </div>
            </button>
          }
        />
      </div>
      <p className="join-choice-note">
        Tell us a little about yourself. We’ll be in touch with next steps.
      </p>
    </section>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || "home");
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const navigate = () => {
      setRoute(window.location.hash.slice(1) || "home");
      setMobile(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  const memberAccess = ["login", "client", "cook"].includes(route);
  function section(id: string) {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    setMobile(false);
    if (route !== "home") {
      go("home");
      setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior }),
        80,
      );
    } else document.getElementById(id)?.scrollIntoView({ behavior });
  }
  return (
    <div
      className="mise-app"
      onClick={(event) => {
        if ((event.target as Element).closest("button")) tactile();
      }}
    >
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-nav">
        <a className="brand" href="#home" aria-label="Misé home">
          misé<span className="brand-period">.</span>
        </a>
        <nav className="desktop-links" aria-label="Main navigation">
          <button onClick={() => section("how")}>How it works</button>
          <button onClick={() => section("for-cooks")}>For cooks</button>
        </nav>
        <div className="nav-actions">
          <button className="text-button" onClick={() => go("login")}>
            Log in <ArrowUpRight size={15} />
          </button>
          <Button className="btn small" onClick={() => go("join")}>
            Join the beta <ArrowUpRight />
          </Button>
          <button
            className="icon-button mobile-toggle"
            aria-label="Toggle navigation"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {mobile && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          <button onClick={() => section("how")}>How it works</button>
          <button onClick={() => section("for-cooks")}>For cooks</button>
          <button onClick={() => go("login")}>Log in</button>
        </nav>
      )}
      <main id="main" tabIndex={-1}>
        {memberAccess ? (
          <MemberAccess />
        ) : route === "join" ? (
          <JoinChoice />
        ) : route === "join-client" ? (
          <div className="join-layout">
            <aside className="join-aside">
              <a href="#join" className="back-link">
                ← Choose client or cook
              </a>
              <p className="eyebrow">YOUR NEXT GOOD WEEK STARTS HERE</p>
              <h1>
                Let’s make room
                <br />
                for <em>good food.</em>
              </h1>
              <p>
                A few details help us find the right cook and plan for your
                household.
              </p>
              <img
                src="./mise-salad.jpg"
                alt="A bowl of colorful vegetables, chickpeas, and greens"
              />
              <div className="join-reassurance">
                <Check /> Personal menus <Check /> Your kitchen <Check /> Your
                schedule
              </div>
            </aside>
            <InterestForm />
          </div>
        ) : (
          <>
            <section className="hero page-width">
              <div className="hero-copy">
                <span className="beta-chip">
                  <span className="tiny-star">✳</span> HOME COOKING, REIMAGINED{" "}
                  <span className="chip-end">IN BETA</span>
                </span>
                <h1>
                  Good food.
                  <br />
                  Your kitchen.
                  <br />
                  <span className="serif-line">Your life back.</span>
                </h1>
                <p>
                  A private chef experience, made for your everyday. A vetted
                  cook prepares your week of meals, right in your kitchen.
                </p>
                <div className="hero-actions">
                  <Button className="btn" onClick={() => go("join")}>
                    Find your weekly rhythm <ArrowUpRight />
                  </Button>
                  <button
                    className="round-play"
                    onClick={() => section("how")}
                    aria-label="See how Misé works"
                  >
                    <ArrowRight />
                  </button>
                </div>
                <div className="hero-foot">
                  <span className="mini-stack">
                    <ChefHat />
                    <Utensils />
                    <Heart />
                  </span>
                  <span>
                    Real cooks. Real kitchens.
                    <br />
                    <strong>More time for the good stuff.</strong>
                  </span>
                </div>
              </div>
              <div className="hero-visual">
                <img
                  className="hero-food"
                  src="./mise-salad.jpg"
                  alt="Freshly prepared vegetable bowl with avocado, sweet potato, chickpeas, and tomatoes"
                  fetchPriority="high"
                />
                <div className="floating-label">
                  <span className="circle-icon">
                    <Utensils size={18} />
                  </span>
                  <span>
                    Made around you.<small>Never one-size-fits-all.</small>
                  </span>
                  <Check size={17} />
                </div>
                <div className="photo-bottom">
                  <span>YOUR WEEK, WELL FED.</span>
                  <span>01 / MISÉ AT HOME</span>
                </div>
                <div className="circle-stamp">
                  a little prep.
                  <br />
                  <span>a lot more life.</span>
                </div>
              </div>
            </section>
            <div className="promise-strip page-width">
              <span>
                <ChefHat /> A cook you can count on
              </span>
              <span>
                <Leaf /> Food that fits your goals
              </span>
              <span>
                <CalendarDays /> A rhythm that works for you
              </span>
              <span>
                <Heart /> Made fresh in your home
              </span>
            </div>
            <section className="how-section page-width" id="how">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">A BETTER KIND OF MEAL PREP</p>
                  <h2>
                    Your week, with
                    <br />
                    <em>one less thing.</em>
                  </h2>
                </div>
                <p>
                  Private-chef care meets everyday convenience. You bring your
                  appetite. We take care of the moving parts.
                </p>
              </div>
              <div className="how-grid">
                {[
                  [
                    "01",
                    "Tell us what’s on your plate.",
                    "Your food goals, your favorite flavors, and the days that work. We get to know your week.",
                    <Utensils />,
                  ],
                  [
                    "02",
                    "We find your kitchen match.",
                    "Misé matches you with a vetted cook. Together, we confirm the menu, groceries, and visit.",
                    <ChefHat />,
                  ],
                  [
                    "03",
                    "Come home to a head start.",
                    "Your cook prepares meals in your kitchen. Your fridge is ready for the week ahead.",
                    <Sparkles />,
                  ],
                ].map(([n, title, body, icon]) => (
                  <article className="how-card" key={String(n)}>
                    <div className="card-top">
                      <span>{n}</span>
                      {icon}
                    </div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="food-story page-width">
              <div className="food-editorial">
                <img
                  src="./mise-pasta.jpg"
                  alt="Fresh pasta with mushrooms, greens, and grated cheese"
                  loading="lazy"
                />
                <div className="food-caption">
                  <span>MORE FRESH. MORE YOU.</span>
                  <span>Photography: Eaters Collective</span>
                </div>
              </div>
              <div className="food-story-copy">
                <p className="eyebrow">YOUR FOOD. YOUR WAY.</p>
                <h2>
                  Less compromise.
                  <br />
                  <em>More seconds.</em>
                </h2>
                <p>
                  For the solo professional with a full calendar. The household
                  juggling two careers. Anyone who wants to eat well without
                  another Sunday spent cooking.
                </p>
                <div className="feature-row">
                  <span className="circle-icon">
                    <Leaf />
                  </span>
                  <div>
                    <h3>Preferences are the starting point.</h3>
                    <p>
                      Your flavors, dietary needs, and food goals shape the
                      menu.
                    </p>
                  </div>
                </div>
                <div className="feature-row">
                  <span className="circle-icon">
                    <Clock3 />
                  </span>
                  <div>
                    <h3>Your time stays yours.</h3>
                    <p>
                      We handle matching and scheduling. You get more of your
                      weekend back.
                    </p>
                  </div>
                </div>
                <Button className="btn outline" onClick={() => go("join")}>
                  Make it your week <ArrowUpRight />
                </Button>
              </div>
            </section>
            <section className="cook-section page-width" id="for-cooks">
              <div className="cook-photo">
                <img
                  src="./mise-cook.jpg"
                  alt="A cook chopping fresh tomatoes at a kitchen counter"
                  loading="lazy"
                />
                <span className="photo-credit">Or Hakim / Unsplash</span>
              </div>
              <div className="cook-copy">
                <p className="eyebrow">GOOD FOOD NEEDS GOOD PEOPLE</p>
                <h2>
                  You bring the craft.
                  <br />
                  <em>We bring the table.</em>
                </h2>
                <p>
                  For culinary students and freelance chefs who love to cook and
                  want a steadier flow of clients. Misé finds households and
                  handles scheduling and payments, so you can focus on the food.
                </p>
                <ul>
                  <li>
                    <Check /> Opportunities that fit your availability
                  </li>
                  <li>
                    <Check /> Household preferences before you arrive
                  </li>
                  <li>
                    <Check /> A team behind every visit
                  </li>
                </ul>
                <div className="cook-actions">
                  <CookApplication />
                </div>
              </div>
            </section>
            <section className="faq-section page-width">
              <div>
                <p className="eyebrow">A FEW THINGS YOU MIGHT WONDER</p>
                <h2>
                  Good questions.
                  <br />
                  <em>Simple answers.</em>
                </h2>
              </div>
              <div className="faq-list">
                {faq.map(([q, a]) => (
                  <details key={q}>
                    <summary>
                      {q}
                      <Plus size={18} />
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </section>
            <section className="closing page-width">
              <span className="closing-star">✳</span>
              <p className="eyebrow">MAKE ROOM FOR WHAT MATTERS</p>
              <h2>
                Your week could
                <br />
                taste <em>like this.</em>
              </h2>
              <Button className="btn light" onClick={() => go("join")}>
                Get on the beta list <ArrowUpRight />
              </Button>
              <span>No commitment. Just a better possibility.</span>
            </section>
          </>
        )}
      </main>
      <footer className="site-footer page-width">
        <div className="footer-top">
          <a className="brand" href="#home">
            misé.
          </a>
          <p>
            A little prep.
            <br />A lot more life.
          </p>
          <div>
            <a href="#join">Join the beta</a>
            <a href="#login">Log in</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Misé · Made with care in North
            Carolina
          </span>
          <span>
            Photos:{" "}
            <a
              href="https://unsplash.com/photos/bowl-of-vegetable-salads-IGfIGP5ONV0"
              target="_blank"
              rel="noreferrer"
            >
              Anna Pelzer
            </a>
            ,{" "}
            <a
              href="https://unsplash.com/photos/pasta-dish-on-white-plate-ddZYOtZUnBk"
              target="_blank"
              rel="noreferrer"
            >
              Eaters Collective
            </a>{" "}
            &{" "}
            <a
              href="https://unsplash.com/photos/a-person-cutting-up-vegetables-on-a-cutting-board-S2Eql9vHN3o"
              target="_blank"
              rel="noreferrer"
            >
              Or Hakim
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

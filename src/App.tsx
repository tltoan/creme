import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "./components/ui/button";
import InterestForm from "./InterestForm";
import Workspace from "./Workspace";

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
    "Choose to join as a client or as a cook. Clients share their food preferences and schedule; cooks tell us about their experience and availability. We’ll follow up with next steps. The scheduling views on this draft are interactive previews.",
  ],
];

function CookApplication({ trigger }: { trigger?: React.ReactNode }) {
  const [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload = Object.fromEntries(new FormData(event.currentTarget));
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
    <Dialog.Root>
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
            <form className="application-form" onSubmit={send}>
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
                  Optional. Share a link to your résumé, LinkedIn, portfolio, or
                  food photos. A view-only link from Google Drive or Dropbox
                  works too—check that we can open it.
                </p>
                <label>
                  Résumé or LinkedIn link (optional)
                  <input
                    name="Resume or LinkedIn URL"
                    type="url"
                    maxLength={2000}
                    placeholder="https://…"
                  />
                </label>
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
                <label>
                  When are you usually available?
                  <input
                    name="availability"
                    maxLength={300}
                    placeholder="For example: Saturday mornings"
                  />
                </label>
                <label>
                  How far can you travel for a visit? (optional)
                  <input
                    name="Travel area"
                    maxLength={300}
                    placeholder="Neighborhoods, towns, or a comfortable travel radius"
                  />
                </label>
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
              <Button className="btn" disabled={busy}>
                {busy ? "Sending…" : "Send application"}
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
  const [audience, setAudience] = useState<"client" | "cook">("client");
  useEffect(() => {
    const navigate = () => {
      setRoute(window.location.hash.slice(1) || "home");
      setMobile(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  const portal = route === "client" || route === "cook";
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
          <button className="text-button" onClick={() => go("client")}>
            My week <ArrowUpRight size={15} />
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
          <button onClick={() => go("client")}>Client schedule</button>
          <button onClick={() => go("cook")}>Cook schedule</button>
        </nav>
      )}
      <main id="main" tabIndex={-1}>
        {portal ? (
          <Workspace role={route as "client" | "cook"} />
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
            <section className="workspace-teaser page-width" id="your-week">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">EVERYONE ON THE SAME PAGE</p>
                  <h2>
                    A little planning.
                    <br />
                    <em>A lot of possibility.</em>
                  </h2>
                </div>
                <div
                  className="audience-switch"
                  aria-label="Choose a scheduling preview"
                >
                  <button
                    aria-pressed={audience === "client"}
                    className={audience === "client" ? "active" : ""}
                    onClick={() => setAudience("client")}
                  >
                    For your home
                  </button>
                  <button
                    aria-pressed={audience === "cook"}
                    className={audience === "cook" ? "active" : ""}
                    onClick={() => setAudience("cook")}
                  >
                    For your craft
                  </button>
                </div>
              </div>
              <div className="teaser-shell">
                <div className="teaser-copy">
                  <span className="pill">SCHEDULING PREVIEW</span>
                  <h3>
                    {audience === "client"
                      ? "Your week. Beautifully in order."
                      : "Your craft. A fuller calendar."}
                  </h3>
                  <p>
                    {audience === "client"
                      ? "Request a prep day, keep your preferences in one place, and see what’s coming up. Misé takes care of finding your cook."
                      : "Set when you’re free, review incoming visits, and keep the details of each kitchen close at hand."}
                  </p>
                  <Button className="btn" onClick={() => go(audience)}>
                    {audience === "client"
                      ? "Explore the client view"
                      : "Explore the cook view"}
                    <ArrowUpRight />
                  </Button>
                  <span className="teaser-note">
                    Try the flow with sample visits.
                  </span>
                </div>
                <div className="mini-calendar" aria-label="Example week">
                  <div className="mini-calendar-head">
                    <span>
                      <CalendarDays size={18} /> A good week ahead
                    </span>
                    <span>WEEKEND PREP</span>
                  </div>
                  <div className="mini-days">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <div className={i === 5 ? "chosen" : ""} key={i}>
                        <span>{d}</span>
                        <strong>{14 + i}</strong>
                        <span className="calendar-dot" />
                      </div>
                    ))}
                  </div>
                  <div className="mini-visit">
                    <span className="circle-icon">
                      <ChefHat />
                    </span>
                    <div>
                      <strong>
                        {audience === "client"
                          ? "Your weekly prep"
                          : "Your next kitchen"}
                      </strong>
                      <p>Saturday · 10:00 AM</p>
                    </div>
                    <span className="pill">
                      {audience === "client" ? "REQUESTED" : "INVITATION"}
                    </span>
                  </div>
                  <div className="mini-visit muted">
                    <span className="circle-icon">
                      <Check />
                    </span>
                    <div>
                      <strong>Everything in its place.</strong>
                      <p>Menu, groceries, and timing. Together.</p>
                    </div>
                  </div>
                </div>
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
                  <button className="text-button" onClick={() => go("cook")}>
                    See the cook workspace <ArrowRight size={16} />
                  </button>
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
            <a href="#client">Client preview</a>
            <a href="#cook">Cook preview</a>
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

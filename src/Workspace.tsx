import { useRef, useState } from "react";
import { Dialog } from "radix-ui";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock3,
  MapPin,
  Plus,
  X,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "./components/ui/button";

type Visit = {
  id: number;
  date: string;
  time: string;
  meals: string;
  groceries: string;
  status: "Requested" | "Confirmed" | "Declined" | "Cancelled";
};
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s: string) => new Date(`${s}T12:00:00`);
const nextSaturday = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return iso(d);
};
const pretty = (s: string) =>
  parse(s).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
const initial = (): Visit[] => [
  {
    id: 1,
    date: nextSaturday(),
    time: "10:00 AM",
    meals: "4–5 meals per person",
    groceries: "Cook shops",
    status: "Requested",
  },
];
const slots = [
  "Saturday · Morning",
  "Saturday · Afternoon",
  "Sunday · Morning",
  "Sunday · Afternoon",
];
const slotFor = (v: Visit) =>
  `${parse(v.date).getDay() === 6 ? "Saturday" : "Sunday"} · ${v.time.includes("AM") ? "Morning" : "Afternoon"}`;

export default function Workspace({ role }: { role: "client" | "cook" }) {
  const [visits, setVisits] = useState<Visit[]>(initial),
    [availability, setAvailability] = useState(slots),
    [savedAvailability, setSavedAvailability] = useState(slots);
  const [week, setWeek] = useState(0),
    [selected, setSelected] = useState(nextSaturday()),
    [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Visit | null>(null),
    [open, setOpen] = useState(false),
    [detail, setDetail] = useState<Visit | null>(null);
  const [cancel, setCancel] = useState<Visit | null>(null),
    [formError, setFormError] = useState("");
  const [preferences, setPreferences] = useState([
      "More vegetables",
      "High-protein",
    ]),
    [prefOpen, setPrefOpen] = useState(false);
  const client = role === "client";
  const returnFocus = useRef<HTMLElement | null>(null);
  const rememberFocus = () => {
    returnFocus.current = document.activeElement as HTMLElement;
  };
  const restoreFocus = (event: Event) => {
    event.preventDefault();
    returnFocus.current?.focus();
  };
  const active = visits
    .filter((v) => !["Cancelled", "Declined"].includes(v.status))
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
    );
  const start = parse(nextSaturday());
  start.setDate(start.getDate() - 5 + week * 7);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  function changeStatus(v: Visit, status: Visit["status"]) {
    if (status === "Confirmed" && !savedAvailability.includes(slotFor(v))) {
      setNotice(
        "This visit is outside your saved availability. Update your availability first.",
      );
      return;
    }
    if (
      status === "Confirmed" &&
      visits.some(
        (o) =>
          o.id !== v.id &&
          o.status === "Confirmed" &&
          o.date === v.date &&
          slotFor(o) === slotFor(v),
      )
    ) {
      setNotice(
        "You already have a confirmed visit in this time window. Choose another time.",
      );
      return;
    }
    setVisits((all) => all.map((o) => (o.id === v.id ? { ...o, status } : o)));
    setNotice(
      `${status === "Confirmed" ? "Visit accepted" : `Visit ${status.toLowerCase()}`} in this preview. Switch views to see the update.`,
    );
  }
  function request(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<
      string,
      string
    >;
    if (![0, 6].includes(parse(data.date).getDay())) {
      setFormError("Choose a Saturday or Sunday for weekend prep.");
      return;
    }
    if (
      visits.some(
        (v) =>
          v.id !== editing?.id &&
          v.date === data.date &&
          v.time === data.time &&
          !["Cancelled", "Declined"].includes(v.status),
      )
    ) {
      setFormError(
        "There’s already a visit at this time. Choose another time.",
      );
      return;
    }
    const v: Visit = {
      id: editing?.id ?? Date.now(),
      date: data.date,
      time: data.time,
      meals: data.meals,
      groceries: data.groceries,
      status: "Requested",
    };
    setVisits((all) =>
      editing ? all.map((o) => (o.id === editing.id ? v : o)) : [...all, v],
    );
    setSelected(v.date);
    setOpen(false);
    setNotice(
      "Preview request added. In the live service, Misé matches a cook before confirming your visit.",
    );
  }
  function launch(v: Visit | null = null) {
    rememberFocus();
    setEditing(v);
    setFormError("");
    setOpen(true);
  }
  return (
    <div className="workspace page-width">
      <div className="preview-banner">
        <span>
          <span className="status-dot" />
          <strong>Interactive preview</strong>
          <span>
            Sample visits. No bookings or payments are sent. Changes reset when
            you leave this workspace.
          </span>
        </span>
        <a href="#join">
          Join the real beta <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <p className="eyebrow">YOUR MISÉ SPACE</p>
          <div className="role-links">
            <a href="#client" className={client ? "active" : ""}>
              <CalendarDays /> Client view <ArrowUpRight />
            </a>
            <a href="#cook" className={!client ? "active" : ""}>
              <ChefHat /> Cook view <ArrowUpRight />
            </a>
          </div>
          <div className="sidebar-note">
            <span className="tiny-star">✳</span>
            <h3>
              {client
                ? "A little prep. A lot more life."
                : "Good food starts with you."}
            </h3>
            <p>
              {client
                ? "Your cook is matched by Misé, based on timing and food needs."
                : "Review the kitchen, menu, and timing before accepting a visit."}
            </p>
          </div>
          <button
            className="reset-preview"
            onClick={() => {
              setVisits(initial());
              setAvailability(slots);
              setSavedAvailability(slots);
              setWeek(0);
              setSelected(nextSaturday());
              setPreferences(["More vegetables", "High-protein"]);
              setNotice("Preview reset to the sample week.");
            }}
          >
            Reset preview
          </button>
        </aside>
        <div className="workspace-main">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">
                {client ? "THE CLIENT EXPERIENCE" : "THE COOK EXPERIENCE"}
              </p>
              <h1>
                {client
                  ? "Your week, taken care of."
                  : "More cooking. Less coordinating."}
              </h1>
              <p>
                {client
                  ? "A home-cooked week starts with a little planning."
                  : "A clear view of your kitchens, your time, and what’s next."}
              </p>
            </div>
            {client && (
              <Button className="btn" onClick={() => launch()}>
                <Plus /> Request a visit
              </Button>
            )}
          </div>
          {notice && (
            <div className="workspace-notice" role="status">
              <Check size={18} />
              <span>{notice}</span>
              <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}
          <div className="workspace-stats">
            <div>
              <span>{client ? "NEXT PREP DAY" : "PENDING INVITATIONS"}</span>
              <strong>
                {client
                  ? active[0]
                    ? parse(active[0].date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "Let’s plan"
                  : visits.filter((v) => v.status === "Requested").length}
              </strong>
              <small>
                {client
                  ? "Make room for a good week"
                  : "Matched by the Misé team"}
              </small>
            </div>
            <div>
              <span>{client ? "YOUR COOK" : "CONFIRMED VISITS"}</span>
              <strong>
                {client
                  ? active.some((v) => v.status === "Confirmed")
                    ? "Cook confirmed"
                    : "We’ll find your match"
                  : visits.filter((v) => v.status === "Confirmed").length}
              </strong>
              <small>
                {client
                  ? "Matched around your needs"
                  : "Ready for your calendar"}
              </small>
            </div>
            <div>
              <span>{client ? "YOUR RHYTHM" : "AVAILABILITY"}</span>
              <strong>
                {client
                  ? "Weekend prep"
                  : `${savedAvailability.length} windows`}
              </strong>
              <small>
                {client ? "Flexible to fit your life" : "Saturday & Sunday"}
              </small>
            </div>
          </div>
          <section className="calendar-card">
            <div className="calendar-heading">
              <h2>Your week at a glance</h2>
              <div>
                <span>
                  {start.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  className="icon-button"
                  aria-label="Previous week"
                  onClick={() => setWeek((w) => w - 1)}
                >
                  <ChevronLeft />
                </button>
                <button
                  className="icon-button"
                  aria-label="Next week"
                  onClick={() => setWeek((w) => w + 1)}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
            <div className="week-grid">
              {dates.map((d) => {
                const key = iso(d),
                  count = active.filter((v) => v.date === key).length;
                return (
                  <button
                    key={key}
                    className={selected === key ? "selected" : ""}
                    onClick={() => setSelected(key)}
                    aria-pressed={selected === key}
                    aria-label={`${pretty(key)}${count ? `, ${count} visit` : ""}`}
                  >
                    <span>
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <strong>{d.getDate()}</strong>
                    <span className={count ? "visit-dot" : ""} />
                  </button>
                );
              })}
            </div>
            <div className="calendar-agenda">
              <Clock3 size={16} />
              <span>
                {pretty(selected)} ·{" "}
                {active
                  .filter((v) => v.date === selected)
                  .map((v) => `${v.time} — ${v.status}`)
                  .join(" / ") ||
                  "No visits planned. A little room to breathe."}
              </span>
            </div>
          </section>
          <div className="dashboard-columns">
            <section className="visits-panel">
              <div className="panel-heading">
                <h2>{client ? "Your visits" : "Kitchen invitations"}</h2>
                <span className="pill">{active.length} UPCOMING</span>
              </div>
              {visits.length === 0 && (
                <p className="empty-state">
                  Your next good week starts here. Request a visit to get
                  planning.
                </p>
              )}
              {[...visits]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((v) => (
                  <article
                    className={`visit-card ${["Cancelled", "Declined"].includes(v.status) ? "inactive" : ""}`}
                    key={v.id}
                  >
                    <div className="visit-top">
                      <span className="circle-icon">
                        <ChefHat />
                      </span>
                      <div>
                        <h3>
                          {client ? "Your weekly prep" : "Sample household"}
                        </h3>
                        <p>
                          {client
                            ? "2 people · Sample household"
                            : "Chapel Hill · 2 people · Sample visit"}
                        </p>
                      </div>
                      <span
                        className={`pill ${v.status === "Confirmed" ? "confirmed" : ""}`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <div className="visit-facts">
                      <span>
                        <CalendarDays />
                        {pretty(v.date)}
                      </span>
                      <span>
                        <Clock3 />
                        {v.time}
                      </span>
                      <span>
                        <ShoppingBag />
                        {v.groceries}
                      </span>
                    </div>
                    <p className="visit-explainer">
                      {v.status === "Requested"
                        ? client
                          ? "Misé finds an available cook. Your visit is confirmed after acceptance."
                          : "Review the sample visit and accept only if the timing fits."
                        : v.status === "Confirmed"
                          ? "Accepted in preview. Menu and grocery details still need to be agreed."
                          : `This preview visit was ${v.status.toLowerCase()}.`}
                    </p>
                    <div className="visit-actions">
                      <button
                        className="text-button"
                        onClick={() => {
                          rememberFocus();
                          setDetail(v);
                        }}
                      >
                        View details <ArrowUpRight size={15} />
                      </button>
                      {!["Cancelled", "Declined"].includes(v.status) && (
                        <>
                          {client ? (
                            <>
                              <button
                                className="text-button"
                                onClick={() => launch(v)}
                              >
                                Reschedule
                              </button>
                              <button
                                className="text-button subtle"
                                onClick={() => {
                                  rememberFocus();
                                  setCancel(v);
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : v.status === "Requested" ? (
                            <>
                              <Button
                                className="btn small"
                                onClick={() => changeStatus(v, "Confirmed")}
                              >
                                Accept visit <Check />
                              </Button>
                              <button
                                className="text-button subtle"
                                onClick={() => changeStatus(v, "Declined")}
                              >
                                Decline
                              </button>
                            </>
                          ) : (
                            <span className="fine">
                              On your calendar <Check size={14} />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                ))}
            </section>
            <aside className="dashboard-aside">
              {client ? (
                <>
                  <section className="preferences-card">
                    <div className="panel-heading">
                      <h2>Your food, your way</h2>
                      <SlidersHorizontal size={19} />
                    </div>
                    <p>Sample preferences shared with your cook.</p>
                    <div className="preference-tags">
                      {preferences.map((p) => (
                        <span className="pill" key={p}>
                          {p}
                        </span>
                      ))}
                      {preferences.length === 0 && (
                        <span className="fine">Open to anything</span>
                      )}
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        rememberFocus();
                        setPrefOpen(true);
                      }}
                    >
                      Edit preferences <ArrowRight size={16} />
                    </button>
                  </section>
                  <section className="menu-card">
                    <img
                      src="./mise-pasta.jpg"
                      alt="Pasta with fresh greens and mushrooms"
                    />
                    <div>
                      <span className="eyebrow">A LITTLE MENU INSPIRATION</span>
                      <h3>
                        Fresh, familiar.
                        <br />
                        Made for you.
                      </h3>
                      <p>
                        Your actual menu is agreed with your cook before each
                        visit.
                      </p>
                    </div>
                  </section>
                </>
              ) : (
                <section className="availability-card">
                  <div className="panel-heading">
                    <h2>When you’re free</h2>
                    <Clock3 size={19} />
                  </div>
                  <p>
                    Choose your recurring weekend windows. Morning: 9 AM–12 PM.
                    Afternoon: 12–5 PM.
                  </p>
                  <div className="availability-options">
                    {slots.map((s) => (
                      <button
                        key={s}
                        aria-pressed={availability.includes(s)}
                        className={availability.includes(s) ? "selected" : ""}
                        onClick={() =>
                          setAvailability((all) =>
                            all.includes(s)
                              ? all.filter((v) => v !== s)
                              : [...all, s],
                          )
                        }
                      >
                        {s}
                        <span>
                          {availability.includes(s) ? (
                            <Check size={15} />
                          ) : (
                            <Plus size={15} />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  <Button
                    className="btn"
                    onClick={() => {
                      setSavedAvailability([...availability]);
                      setNotice(
                        "Availability updated in this preview. Existing accepted visits stay on your calendar.",
                      );
                    }}
                  >
                    Save availability <Check />
                  </Button>
                  <p className="fine">
                    Misé checks these windows when matching requests. You
                    confirm each visit.
                  </p>
                </section>
              )}
            </aside>
          </div>
        </div>
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content
            className="modal-content"
            onCloseAutoFocus={restoreFocus}
          >
            <Dialog.Close
              className="icon-button modal-close"
              aria-label="Close visit request"
            >
              <X />
            </Dialog.Close>
            <p className="eyebrow">CLIENT PREVIEW</p>
            <Dialog.Title>
              {editing ? "Find a new time." : "Make room for good food."}
            </Dialog.Title>
            <Dialog.Description>
              Try a weekend prep request. This updates the preview only; Misé
              will handle cook matching in the live service.
            </Dialog.Description>
            <form className="application-form" onSubmit={request}>
              <label>
                Prep date
                <input
                  name="date"
                  type="date"
                  min={iso(new Date())}
                  defaultValue={editing?.date ?? nextSaturday()}
                  required
                />
              </label>
              <label>
                Start time
                <select name="time" defaultValue={editing?.time ?? "10:00 AM"}>
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>1:00 PM</option>
                  <option>2:00 PM</option>
                </select>
              </label>
              <label>
                Meals per person
                <select
                  name="meals"
                  defaultValue={editing?.meals ?? "4–5 meals per person"}
                >
                  <option>2–3 meals per person</option>
                  <option>4–5 meals per person</option>
                  <option>6+ meals per person</option>
                </select>
              </label>
              <label>
                Groceries
                <select
                  name="groceries"
                  defaultValue={editing?.groceries ?? "Cook shops"}
                >
                  <option>Cook shops</option>
                  <option>I shop from a list</option>
                  <option>I arrange delivery</option>
                  <option>Let’s decide together</option>
                </select>
              </label>
              {formError && (
                <p className="error" role="alert">
                  {formError}
                </p>
              )}
              <Button className="btn">
                {editing ? "Update preview request" : "Add preview request"}
                <ArrowRight />
              </Button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content
            className="modal-content"
            onCloseAutoFocus={restoreFocus}
          >
            <Dialog.Close
              className="icon-button modal-close"
              aria-label="Close visit details"
            >
              <X />
            </Dialog.Close>
            <p className="eyebrow">SAMPLE VISIT · {detail?.status}</p>
            <Dialog.Title>Everything in its place.</Dialog.Title>
            <Dialog.Description>
              Example household details. Real addresses and access instructions
              are shared privately with the assigned cook.
            </Dialog.Description>
            {detail && (
              <div className="detail-list">
                <p>
                  <CalendarDays />
                  {pretty(detail.date)} · {detail.time}
                </p>
                <p>
                  <MapPin />
                  Chapel Hill · sample household of 2
                </p>
                <p>
                  <UtensilIcon />
                  {detail.meals}
                </p>
                <p>
                  <ShoppingBag />
                  {detail.groceries}
                </p>
                <hr />
                <h3>Food preferences</h3>
                <p>{preferences.join(" · ") || "Open to anything"}</p>
                <h3>Before the visit</h3>
                <p>
                  Confirm menu, dietary needs, grocery budget, and kitchen
                  access with Misé. No actual address or client data is stored
                  in this preview.
                </p>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={!!cancel} onOpenChange={(v) => !v && setCancel(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content
            className="modal-content"
            onCloseAutoFocus={restoreFocus}
          >
            <Dialog.Title>Cancel this preview visit?</Dialog.Title>
            <Dialog.Description>
              This removes it from the sample calendar. No real booking will be
              changed.
            </Dialog.Description>
            <div className="modal-actions">
              <Dialog.Close className="btn outline">Keep visit</Dialog.Close>
              <Button
                className="btn"
                onClick={() => {
                  if (cancel) changeStatus(cancel, "Cancelled");
                  setCancel(null);
                }}
              >
                Cancel preview visit
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={prefOpen} onOpenChange={setPrefOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content
            className="modal-content"
            onCloseAutoFocus={restoreFocus}
          >
            <Dialog.Close
              className="icon-button modal-close"
              aria-label="Close preferences"
            >
              <X />
            </Dialog.Close>
            <Dialog.Title>What feels good on your plate?</Dialog.Title>
            <Dialog.Description>
              Try preferences for the sample household. Selections also appear
              in the cook’s visit details.
            </Dialog.Description>
            <div className="choices preference-editor">
              {[
                "More vegetables",
                "High-protein",
                "Vegetarian",
                "Mediterranean",
                "Less takeout",
                "Family-friendly",
              ].map((p) => (
                <button
                  className={`choice ${preferences.includes(p) ? "selected" : ""}`}
                  aria-pressed={preferences.includes(p)}
                  key={p}
                  onClick={() =>
                    setPreferences((all) =>
                      all.includes(p)
                        ? all.filter((x) => x !== p)
                        : [...all, p],
                    )
                  }
                >
                  {p}
                  {preferences.includes(p) && <Check size={15} />}
                </button>
              ))}
            </div>
            <Dialog.Close className="btn">
              Done <Check size={17} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
function UtensilIcon() {
  return <ChefHat size={18} />;
}

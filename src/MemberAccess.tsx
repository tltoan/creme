import { ArrowUpRight, LockKeyhole } from "lucide-react";

// Keep the public site closed to scheduling data until a real authentication
// provider and server-side onboarding/role checks are connected.
export default function MemberAccess() {
  return (
    <section
      className="member-access page-width"
      aria-labelledby="member-heading"
    >
      <div className="member-intro">
        <p className="eyebrow">YOUR MISÉ ACCOUNT</p>
        <h1 id="member-heading">
          Your place
          <br />
          <em>at the table.</em>
        </h1>
        <p>Private access for clients and cooks, after onboarding with Misé.</p>
      </div>
      <div className="member-access-card">
        <span className="member-lock">
          <LockKeyhole size={23} />
        </span>
        <h2>Member sign-in is being set up.</h2>
        <p>
          Already a Misé client or cook? Contact the team about account access
          or your next visit.
        </p>
        <a className="btn" href="mailto:antonyltran@gmail.com">
          Contact Misé <ArrowUpRight size={17} />
        </a>
        <div className="member-join">
          <span>New to Misé?</span>
          <a href="#join">
            Join as a client or cook <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

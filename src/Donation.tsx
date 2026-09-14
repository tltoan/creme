import { ArrowUpRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Use only the recipient's verified, hosted payment link. Never put secret keys here.
export const fundraiser = {
  goal: 1000,
  paymentUrl: '',
  purpose: 'Help us bring Misé to life.',
};

export default function Donation() {
  return <section className="donation" id="support" aria-labelledby="donation-title">
    <div className="donation-copy">
      <p className="eyebrow"><Heart size={16} aria-hidden="true"/> A LITTLE SUPPORT GOES A LONG WAY</p>
      <h2 id="donation-title">Help bring Misé<br/><em>to the table.</em></h2>
      <p>{fundraiser.purpose} We’re raising ${fundraiser.goal.toLocaleString('en-US')} and welcome contributions of any size.</p>
      <p className="donation-note">Contributing is optional and separate from joining the interest list. A contribution doesn’t book a chef or purchase meals.</p>
    </div>
    <div className="donation-card">
      <span className="donation-label">OUR FUNDRAISING GOAL</span>
      <p className="donation-goal">${fundraiser.goal.toLocaleString('en-US')}<span> USD</span></p>
      <p>Every contribution helps us take the next step.</p>
      {fundraiser.paymentUrl ? <Button asChild className="donation-button"><a href={fundraiser.paymentUrl} target="_blank" rel="noopener noreferrer">Contribute to Misé <ArrowUpRight size={18}/></a></Button> : <Button className="donation-button" disabled>Donations opening soon</Button>}
      <p className="donation-note">{fundraiser.paymentUrl ? 'Choose your amount on the payment page. Opens in a new tab.' : 'We’re getting our donation page ready.'}</p>
    </div>
  </section>;
}

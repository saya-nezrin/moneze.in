import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, ShieldCheck, UserRound } from "lucide-react";

const investmentOptions = ["Below ₹5 Lakhs", "₹5 Lakhs to ₹25 Lakhs", "₹25 Lakhs to ₹50 Lakhs", "₹50 Lakhs and above"];

function WelcomeQuestionnaire({ onClose, onConsultation }) {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({ name: "", phone: "", email: "", investmentValue: "" });
  const update = (field) => (event) => setDetails((current) => ({ ...current, [field]: event.target.value }));
  const canContinue = step === 1 ? details.name.trim().length > 1 : step === 2 ? /^\d{10}$/.test(details.phone.replace(/\D/g, "")) && /\S+@\S+\.\S+/.test(details.email) : Boolean(details.investmentValue);
  const next = () => canContinue && setStep((current) => Math.min(4, current + 1));

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="welcome-shell">
        <aside className="welcome-story">
          <img src="/moneze-logo.png" alt="Moneze" className="welcome-logo" />
          <div className="welcome-advisor-icon"><UserRound size={34} /></div>
          <div><h2>1:1 with a Moneze financial advisor</h2><p>Free • No-commitment call</p></div>
          <blockquote>“Get clarity on your investments, goals, and the next steps for building long-term wealth.”</blockquote>
          <div className="welcome-advisor-card"><ShieldCheck size={24} /><div><strong>Personalised guidance</strong><span>Your information helps us prepare for a more useful conversation.</span></div></div>
          <a className="welcome-help" href="https://wa.me/919972654330" target="_blank" rel="noreferrer"><MessageCircle size={20} /> Need help?</a>
        </aside>
        <section className="welcome-form-panel">
          <header className="welcome-progress-row">
            <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1} aria-label="Previous step"><ArrowLeft size={24} /></button>
            <span>Step {step} of 4</span><div className="welcome-progress-track" aria-hidden="true"><span style={{ width: `${step * 25}%` }} /></div>
          </header>
          <div className="welcome-step" key={step}>
            {step === 1 && <><p className="welcome-kicker">Welcome to Moneze</p><h1 id="welcome-title">What is your name?</h1><p>Let us personalise your experience.</p><label className="welcome-field"><span>Full name</span><input autoFocus value={details.name} onChange={update("name")} placeholder="Enter your full name" autoComplete="name" /></label><button className="welcome-next" type="button" disabled={!canContinue} onClick={next}>Next <ArrowRight size={20} /></button></>}
            {step === 2 && <><p className="welcome-kicker">Contact details</p><h1>How can we reach you?</h1><p>We will only use these details for your consultation.</p><label className="welcome-field"><span>Phone number</span><div className="welcome-phone-input"><b>+91</b><input autoFocus inputMode="numeric" maxLength={10} value={details.phone} onChange={update("phone")} placeholder="10-digit mobile number" autoComplete="tel" /></div></label><label className="welcome-field"><span>Email address</span><input type="email" value={details.email} onChange={update("email")} placeholder="you@example.com" autoComplete="email" /></label><button className="welcome-next" type="button" disabled={!canContinue} onClick={next}>Continue <ArrowRight size={20} /></button></>}
            {step === 3 && <><p className="welcome-kicker">Your financial snapshot</p><h1>What is the approximate value of your investments?</h1><p>Include mutual funds, stocks, deposits, gold, and cash savings.</p><div className="welcome-options">{investmentOptions.map((option) => <button className={details.investmentValue === option ? "selected" : ""} type="button" key={option} onClick={() => setDetails((current) => ({ ...current, investmentValue: option }))}><span>{option}</span><i>{details.investmentValue === option && <Check size={18} />}</i></button>)}</div><button className="welcome-next" type="button" disabled={!canContinue} onClick={next}>Continue <ArrowRight size={20} /></button></>}
            {step === 4 && <><div className="welcome-success-icon"><Check size={34} /></div><p className="welcome-kicker">You are all set</p><h1>Let’s build your financial plan, {details.name.split(" ")[0]}.</h1><p>A Moneze advisor can help you review your current investments and plan toward your goals.</p><div className="welcome-summary"><span>Investment range</span><strong>{details.investmentValue}</strong><span>Consultation</span><strong>Free • 30 minutes</strong></div><button className="welcome-next" type="button" onClick={onConsultation}>Get free consultation <ArrowRight size={20} /></button><button className="welcome-skip" type="button" onClick={onClose}>Explore the website first</button></>}
          </div>
          <p className="welcome-protected"><ShieldCheck size={18} /> Your data is protected</p>
        </section>
      </div>
    </div>
  );
}

export default WelcomeQuestionnaire;

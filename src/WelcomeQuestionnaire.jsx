import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, ShieldCheck, UserRound } from "lucide-react";

function WelcomeQuestionnaire({ onClose, onConsultation }) {
  const [details, setDetails] = useState({ name: "", email: "", investmentValue: "" });
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState({ state: "idle", message: "" });
  const otpRequestRef = useRef(null);
  const update = (field) => (event) => setDetails((current) => ({ ...current, [field]: event.target.value }));
  const contactValid = /\S+@\S+\.\S+/.test(details.email);
  const sendOtp = async () => {
    if (!contactValid || otpStatus.state === "sending") return;
    setOtpStatus({ state: "sending", message: "Sending verification code…" });
    try {
      const endpoint = "/api/auth/email/send-otp";
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: details.email.trim().toLowerCase() }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "The OTP could not be sent.");
      otpRequestRef.current = payload.requestId || payload.reqId || details.email.trim().toLowerCase();
      setOtp("");
      setOtpStatus({ state: "sent", message: "A 6-digit verification code was sent to your email." });
    } catch (error) {
      setOtpStatus({ state: "error", message: error?.message || "The OTP could not be sent. Please try again." });
    }
  };

  const verifyOtp = async () => {
    if (!otpRequestRef.current || !/^\d{6}$/.test(otp) || otpStatus.state === "verifying") return;
    setOtpStatus({ state: "verifying", message: "Verifying your code…" });
    try {
      const endpoint = "/api/auth/email/verify-otp";
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: details.email.trim().toLowerCase(), otp, requestId: otpRequestRef.current }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.verified === false) throw new Error(payload.message || "The verification code is incorrect.");
      setOtpStatus({ state: "verified", message: "Email address verified successfully." });
      onConsultation({ ...details, email: details.email.trim().toLowerCase() });
    } catch (error) {
      setOtpStatus({ state: "error", message: error?.message || "OTP verification failed. Please try again." });
    }
  };

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
          <header className="welcome-back-row">
            <button
              type="button"
              onClick={onClose}
              aria-label="Return to website"
            >
              <ArrowLeft size={24} />
            </button>
          </header>
          <div className="welcome-step">
            <p className="welcome-kicker">Email verification</p><h1 id="welcome-title">What is your email address?</h1><p>We will send a secure verification code to your email.</p><label className="welcome-field"><span>Email address</span><input autoFocus type="email" value={details.email} onChange={(event) => { update("email")(event); setOtpStatus({ state: "idle", message: "" }); otpRequestRef.current = null; }} placeholder="you@example.com" autoComplete="email" /></label>{otpStatus.state !== "sent" && otpStatus.state !== "verifying" && otpStatus.state !== "verified" && <button className="welcome-next" type="button" disabled={!contactValid || otpStatus.state === "sending"} onClick={sendOtp}>{otpStatus.state === "sending" ? "Sending OTP…" : "Send Email OTP"} <ArrowRight size={20} /></button>}{(otpStatus.state === "sent" || otpStatus.state === "verifying" || otpStatus.state === "error") && otpRequestRef.current && <><label className="welcome-field welcome-otp-field"><span>6-digit email OTP</span><input inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="Enter verification code" autoComplete="one-time-code" /></label><button className="welcome-next" type="button" disabled={!/^\d{6}$/.test(otp) || otpStatus.state === "verifying"} onClick={verifyOtp}>{otpStatus.state === "verifying" ? "Verifying…" : "Verify Email OTP"} <Check size={20} /></button><button className="welcome-resend" type="button" onClick={sendOtp}>Resend OTP</button></>}{otpStatus.message && <p className={`welcome-otp-message ${otpStatus.state}`} role="status">{otpStatus.message}</p>}
          </div>
          <p className="welcome-protected"><ShieldCheck size={18} /> Your data is protected</p>
        </section>
      </div>
    </div>
  );
}

export default WelcomeQuestionnaire;

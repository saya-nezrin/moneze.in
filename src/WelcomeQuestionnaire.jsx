import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, ShieldCheck, UserRound } from "lucide-react";

function WelcomeQuestionnaire({ onClose, onConsultation }) {
  const [customerType, setCustomerType] = useState("indian");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", investmentValue: "" });
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState({ state: "idle", message: "" });
  const otpRequestRef = useRef(null);
  const emailValid = /\S+@\S+\.\S+/.test(details.email);
  const phoneValid = /^[6-9]\d{9}$/.test(details.phone);
  const contactValid = customerType === "indian" ? phoneValid : emailValid;
  const channelLabel = customerType === "indian" ? "mobile" : "email";

  const resetVerification = () => {
    setOtp("");
    setOtpStatus({ state: "idle", message: "" });
    otpRequestRef.current = null;
  };

  const selectCustomerType = (type) => {
    setCustomerType(type);
    resetVerification();
  };

  const sendOtp = async () => {
    if (!contactValid || otpStatus.state === "sending") return;
    setOtpStatus({ state: "sending", message: `Sending verification code to your ${channelLabel}…` });
    try {
      const endpoint = customerType === "indian" ? "/api/auth/phone" : "/api/auth/email/send-otp";
      const body = customerType === "indian" ? { action: "send", phone: details.phone } : { email: details.email.trim().toLowerCase() };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "The OTP could not be sent.");
      otpRequestRef.current = payload.requestId || (customerType === "indian" ? details.phone : details.email.trim().toLowerCase());
      setOtp("");
      setOtpStatus({ state: "sent", message: `A 6-digit verification code was sent to your ${channelLabel}.` });
    } catch (error) {
      setOtpStatus({ state: "error", message: error?.message || "The OTP could not be sent. Please try again." });
    }
  };

  const verifyOtp = async () => {
    if (!otpRequestRef.current || !/^\d{6}$/.test(otp) || otpStatus.state === "verifying") return;
    setOtpStatus({ state: "verifying", message: "Verifying your code…" });
    try {
      const endpoint = customerType === "indian" ? "/api/auth/phone" : "/api/auth/email/verify-otp";
      const body = customerType === "indian"
        ? { action: "verify", phone: details.phone, otp }
        : { email: details.email.trim().toLowerCase(), otp, requestId: otpRequestRef.current };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.verified === false) throw new Error(payload.message || "The verification code is incorrect.");
      setOtpStatus({ state: "verified", message: `${customerType === "indian" ? "Mobile number" : "Email address"} verified successfully.` });
      onConsultation({ ...details, customerType, email: customerType === "nri" ? details.email.trim().toLowerCase() : "", phone: customerType === "indian" ? details.phone : "" });
    } catch (error) {
      setOtpStatus({ state: "error", message: error?.message || "OTP verification failed. Please try again." });
    }
  };

  const otpActive = ["sent", "verifying", "error"].includes(otpStatus.state) && otpRequestRef.current;

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
          <header className="welcome-back-row"><button type="button" onClick={onClose} aria-label="Return to website"><ArrowLeft size={24} /></button></header>
          <div className="welcome-step">
            <p className="welcome-kicker">Contact verification</p>
            <h1 id="welcome-title">Book your consultation</h1>
            <p>Choose your location and verify your contact details to continue.</p>
            <div className="welcome-customer-type" role="group" aria-label="Select customer location">
              <button type="button" className={customerType === "indian" ? "selected" : ""} aria-pressed={customerType === "indian"} onClick={() => selectCustomerType("indian")}>🇮🇳 <span>Indian</span></button>
              <button type="button" className={customerType === "nri" ? "selected" : ""} aria-pressed={customerType === "nri"} onClick={() => selectCustomerType("nri")}>🌍 <span>NRI</span></button>
            </div>
            {customerType === "indian" ? (
              <label className="welcome-field"><span>Mobile number</span><div className="welcome-phone-input"><b>+91</b><input autoFocus type="tel" inputMode="numeric" maxLength={10} value={details.phone} onChange={(event) => { setDetails((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) })); resetVerification(); }} placeholder="98765 43210" autoComplete="tel-national" aria-label="10-digit Indian mobile number" /></div></label>
            ) : (
              <label className="welcome-field"><span>Email address</span><input autoFocus type="email" value={details.email} onChange={(event) => { setDetails((current) => ({ ...current, email: event.target.value })); resetVerification(); }} placeholder="you@example.com" autoComplete="email" /></label>
            )}
            {!otpActive && otpStatus.state !== "verified" && <button className="welcome-next" type="button" disabled={!contactValid || otpStatus.state === "sending"} onClick={sendOtp}>{otpStatus.state === "sending" ? "Sending OTP…" : `Send ${customerType === "indian" ? "Mobile" : "Email"} OTP`} <ArrowRight size={20} /></button>}
            {otpActive && <><label className="welcome-field welcome-otp-field"><span>6-digit {channelLabel} OTP</span><input inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="Enter verification code" autoComplete="one-time-code" /></label><button className="welcome-next" type="button" disabled={!/^\d{6}$/.test(otp) || otpStatus.state === "verifying"} onClick={verifyOtp}>{otpStatus.state === "verifying" ? "Verifying…" : `Verify ${customerType === "indian" ? "Mobile" : "Email"} OTP`} <Check size={20} /></button><button className="welcome-resend" type="button" onClick={sendOtp}>Resend OTP</button></>}
            {otpStatus.message && <p className={`welcome-otp-message ${otpStatus.state}`} role="status">{otpStatus.message}</p>}
          </div>
          <p className="welcome-protected"><ShieldCheck size={18} /> Your data is protected</p>
        </section>
      </div>
    </div>
  );
}

export default WelcomeQuestionnaire;

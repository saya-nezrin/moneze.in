import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, X } from "lucide-react";

const stepTitles = [
  "Let’s understand you",
  "Let’s look at your income",
  "Where does your money go each month?",
  "What have you already built?",
  "Let’s understand your financial protection",
  "What would you like your money to help you achieve?",
  "Let’s understand what you’re comfortable with",
];

const investmentOptions = ["Mutual Funds", "FD / RD", "EPF / PPF / NPS", "Stocks", "Gold", "Bonds", "Chitty", "None"];
const goalOptions = ["Wealth Creation", "Retirement", "Child Education", "House Purchase", "Child Marriage", "Emergency Fund", "Other"];
const horizons = ["1–3 years", "3–5 years", "5–10 years", "10+ years", "Not sure"];

function CurrencyField({ label, name, value, onChange, helper, required = true }) {
  return (
    <label className="assessment-field">
      <span>{label}</span>
      <div className="assessment-currency"><b>₹</b><input name={name} type="number" min="0" inputMode="numeric" value={value || ""} onChange={(event) => onChange(name, event.target.value)} required={required} /></div>
      {helper && <small>{helper}</small>}
    </label>
  );
}

function BinaryChoice({ legend, name, value, onChange, yesLabel = "Yes", noLabel = "No" }) {
  return (
    <fieldset className="assessment-choice-group">
      <legend>{legend}</legend>
      <div className="assessment-choice-row">
        {[noLabel, yesLabel].map((option) => <label className={value === option ? "selected" : ""} key={option}><input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(name, option)} required /><span>{option}</span></label>)}
      </div>
    </fieldset>
  );
}

function SelectableCards({ options, selected, onToggle, name }) {
  return <div className="assessment-card-grid">{options.map((option) => <label className={selected.includes(option) ? "selected" : ""} key={option}><input type="checkbox" name={name} checked={selected.includes(option)} onChange={() => onToggle(option)} /><span>{option}</span><i><Check size={15} /></i></label>)}</div>;
}

const formatCurrency = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default function FinancialAssessment({ initialDetails, consultationScheduled, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    name: initialDetails?.name || "",
    phone: initialDetails?.phone || "",
    email: initialDetails?.email || "",
    childAges: [],
    investmentTypes: [],
  });
  const [goals, setGoals] = useState({});
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const updateAnswer = (name, value) => setAnswers((previous) => ({ ...previous, [name]: value }));
  const surplus = useMemo(() => Number(answers.monthlyIncome || 0) + Number(answers.otherIncome || 0) - Number(answers.householdExpenses || 0) - Number(answers.emiLoans || 0), [answers.monthlyIncome, answers.otherIncome, answers.householdExpenses, answers.emiLoans]);

  const updateChildren = (countValue) => {
    const count = Math.max(1, Math.min(10, Number(countValue) || 1));
    setAnswers((previous) => ({ ...previous, childrenCount: String(count), childAges: Array.from({ length: count }, (_, index) => previous.childAges?.[index] || "") }));
  };
  const updateChildAge = (index, value) => setAnswers((previous) => ({ ...previous, childAges: previous.childAges.map((age, childIndex) => childIndex === index ? value : age) }));

  const toggleInvestment = (option) => setAnswers((previous) => {
    const current = previous.investmentTypes || [];
    if (option === "None") return { ...previous, investmentTypes: current.includes("None") ? [] : ["None"] };
    const withoutNone = current.filter((item) => item !== "None");
    return { ...previous, investmentTypes: withoutNone.includes(option) ? withoutNone.filter((item) => item !== option) : [...withoutNone, option] };
  });

  const toggleGoal = (goal) => setGoals((previous) => ({ ...previous, [goal]: previous[goal] ? undefined : { amount: "", horizon: "" } }));
  const updateGoal = (goal, key, value) => setGoals((previous) => ({ ...previous, [goal]: { ...previous[goal], [key]: value } }));
  const selectGoalUncertain = () => {
    const nextValue = !answers.goalUncertain;
    updateAnswer("goalUncertain", nextValue);
    if (nextValue) setGoals({});
  };

  const next = (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    if (step === 3 && answers.investmentTypes.length === 0) {
      setStatus({ state: "error", message: "Please select your current investments, or choose None." });
      return;
    }
    if (step === 5 && !answers.goalUncertain && !Object.values(goals).some(Boolean)) {
      setStatus({ state: "error", message: "Please select at least one goal, or tell us that you’re not sure yet." });
      return;
    }
    setStatus({ state: "idle", message: "" });
    setStep((value) => Math.min(value + 1, stepTitles.length - 1));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    if (!answers.marketFallResponse) return setStatus({ state: "error", message: "Please choose the response that feels most natural to you." });
    if (!consentAccepted) return setStatus({ state: "error", message: "Please provide consent before submitting your assessment." });
    setStatus({ state: "loading", message: "Submitting your assessment..." });
    try {
      const response = await fetch("/api/financial-assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { name: answers.name, investmentRange: initialDetails?.investmentValue || "" },
          answers: { ...answers, monthlySurplus: surplus },
          goals: Object.fromEntries(Object.entries(goals).filter(([, value]) => value)),
          assessmentStatus: "complete",
          consultationScheduled: Boolean(consultationScheduled),
          consentAccepted,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "The assessment could not be submitted.");
      window.gtag?.("event", "generate_lead", { lead_source: "financial_assessment" });
      setStatus({ state: "success", message: "" });
    } catch (error) {
      setStatus({ state: "error", message: error.message || "Submission failed. Please try again." });
    }
  };

  const stepContent = [
    <div className="assessment-stack" key="about">
      <label className="assessment-field"><span>What’s your name?</span><input name="name" type="text" value={answers.name || ""} onChange={(event) => updateAnswer("name", event.target.value)} required /></label>
      <label className="assessment-field"><span>Your age</span><input name="age" type="number" min="18" max="100" inputMode="numeric" value={answers.age || ""} onChange={(event) => updateAnswer("age", event.target.value)} required /></label>
      <BinaryChoice legend="Marital status" name="maritalStatus" value={answers.maritalStatus} onChange={updateAnswer} yesLabel="Married" noLabel="Single" />
      <BinaryChoice legend="Do you have children?" name="hasChildren" value={answers.hasChildren} onChange={updateAnswer} />
      {answers.hasChildren === "Yes" && <div className="assessment-conditional"><label className="assessment-field"><span>How many children?</span><input name="childrenCount" type="number" min="1" max="10" inputMode="numeric" value={answers.childrenCount || ""} onChange={(event) => updateChildren(event.target.value)} required /></label><div className="assessment-child-grid">{answers.childAges.map((age, index) => <label className="assessment-field" key={index}><span>Child {index + 1} age</span><input type="number" min="0" max="40" inputMode="numeric" value={age} onChange={(event) => updateChildAge(index, event.target.value)} required /></label>)}</div></div>}
    </div>,
    <div className="assessment-stack" key="income">
      <CurrencyField label="What is your monthly take-home income?" name="monthlyIncome" value={answers.monthlyIncome} onChange={updateAnswer} />
      <BinaryChoice legend="Do you have any other income?" name="hasOtherIncome" value={answers.hasOtherIncome} onChange={updateAnswer} />
      {answers.hasOtherIncome === "Yes" && <div className="assessment-conditional"><CurrencyField label="Approximate monthly other income" name="otherIncome" value={answers.otherIncome} onChange={updateAnswer} helper="Rent, side business, freelance income, etc." /></div>}
    </div>,
    <div className="assessment-stack" key="outgo">
      <CurrencyField label="Approximate monthly household expenses" name="householdExpenses" value={answers.householdExpenses} onChange={updateAnswer} helper="Excluding loan EMIs, SIPs and investment contributions." />
      <CurrencyField label="What are your current monthly EMIs?" name="emiLoans" value={answers.emiLoans} onChange={updateAnswer} helper="Home loan + car loan + personal loan + education loan + other EMIs." />
      <div className="assessment-surplus"><span>Your approximate monthly surplus</span><strong className={surplus < 0 ? "negative" : ""}>₹{formatCurrency(surplus)}</strong><small>Income + other income − household expenses − EMIs</small></div>
    </div>,
    <div className="assessment-stack" key="savings">
      <CurrencyField label="How much do you have in savings/emergency funds?" name="emergencyFund" value={answers.emergencyFund} onChange={updateAnswer} />
      <fieldset className="assessment-choice-group"><legend>Which investments do you currently have?</legend><SelectableCards name="investmentTypes" options={investmentOptions} selected={answers.investmentTypes || []} onToggle={toggleInvestment} /></fieldset>
      {answers.investmentTypes.includes("Chitty") && <div className="assessment-conditional"><CurrencyField label="Monthly Chitty amount" name="chittyMonthlyAmount" value={answers.chittyMonthlyAmount} onChange={updateAnswer} /><BinaryChoice legend="Is it currently prized?" name="chittyStatus" value={answers.chittyStatus} onChange={updateAnswer} yesLabel="Prized" noLabel="Not prized" /></div>}
      <CurrencyField label="Approximate total value of your existing investments" name="investmentValue" value={answers.investmentValue} onChange={updateAnswer} />
      <CurrencyField label="Current monthly SIP / investment amount" name="existingSip" value={answers.existingSip} onChange={updateAnswer} />
    </div>,
    <div className="assessment-stack" key="protection">
      <section className="assessment-protection-card"><h3>Health Insurance</h3><BinaryChoice legend="Do you have health insurance?" name="hasHealthInsurance" value={answers.hasHealthInsurance} onChange={updateAnswer} />{answers.hasHealthInsurance === "Yes" && <CurrencyField label="Approximate cover" name="healthInsurance" value={answers.healthInsurance} onChange={updateAnswer} />}</section>
      <section className="assessment-protection-card"><h3>Term Insurance</h3><BinaryChoice legend="Do you have term insurance?" name="hasTermInsurance" value={answers.hasTermInsurance} onChange={updateAnswer} />{answers.hasTermInsurance === "Yes" && <CurrencyField label="Approximate cover" name="termInsurance" value={answers.termInsurance} onChange={updateAnswer} />}</section>
    </div>,
    <div className="assessment-stack" key="goals">
      <p className="assessment-intro">You can select one or more, or tell us if you’re not sure yet.</p>
      <SelectableCards name="goals" options={goalOptions} selected={Object.keys(goals).filter((goal) => goals[goal])} onToggle={(goal) => { updateAnswer("goalUncertain", false); toggleGoal(goal); }} />
      <label className={`assessment-uncertain ${answers.goalUncertain ? "selected" : ""}`}><input type="checkbox" checked={Boolean(answers.goalUncertain)} onChange={selectGoalUncertain} /><span>I’m not sure / I don’t have a specific goal yet</span><i><Check size={15} /></i></label>
      {answers.goalUncertain && <div className="assessment-reassurance"><strong>That’s completely fine.</strong><p>Based on your income, expenses, existing investments and monthly surplus, your Moneze advisor can help identify suitable financial goals during your consultation.</p></div>}
      {Object.entries(goals).filter(([, value]) => value).map(([goal, details], index) => <section className="assessment-goal-detail" key={goal}><span className="assessment-goal-count">Goal {index + 1}</span><h3>{goal}</h3><CurrencyField label="How much would you like to build?" name={`${goal}-amount`} value={details.amount} onChange={(_, value) => updateGoal(goal, "amount", value)} /><fieldset className="assessment-choice-group"><legend>When do you expect to need this money?</legend><div className="assessment-horizon-row">{horizons.map((horizon) => <label className={details.horizon === horizon ? "selected" : ""} key={horizon}><input type="radio" name={`${goal}-horizon`} checked={details.horizon === horizon} onChange={() => updateGoal(goal, "horizon", horizon)} required /><span>{horizon}</span></label>)}</div></fieldset></section>)}
    </div>,
    <div className="assessment-stack" key="risk">
      <CurrencyField label="How much could you comfortably invest every month going forward?" name="sipCapacity" value={answers.sipCapacity} onChange={updateAnswer} />
      <div className="assessment-quick-row">{[["₹5K", 5000], ["₹10K", 10000], ["₹25K", 25000], ["₹50K+", 50000]].map(([label, amount]) => <button className={Number(answers.sipCapacity) === amount ? "selected" : ""} type="button" key={label} onClick={() => updateAnswer("sipCapacity", String(amount))}>{label}</button>)}</div>
      <fieldset className="assessment-choice-group assessment-risk"><legend><span>One final question</span>If an investment of ₹10 lakh temporarily falls to ₹8 lakh, what would you do?</legend><div className="assessment-risk-cards">{["Sell immediately", "Wait for recovery", "Invest more"].map((option) => <label className={answers.marketFallResponse === option ? "selected" : ""} key={option}><input type="radio" name="marketFallResponse" checked={answers.marketFallResponse === option} onChange={() => updateAnswer("marketFallResponse", option)} /><span>{option}</span><i><Check size={16} /></i></label>)}</div><small>There are no right or wrong answers. This helps us understand your investment comfort level.</small></fieldset>
      <label className="assessment-consent"><input type="checkbox" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} required /><span>I consent to Moneze securely storing these details and contacting me regarding my consultation.</span></label>
    </div>,
  ];

  return (
    <div className="assessment-modal assessment-flow" role="dialog" aria-modal="true" aria-labelledby="assessment-title">
      <div className="assessment-dialog">
        <button className="assessment-close" type="button" onClick={onClose} aria-label="Close financial assessment"><X size={22} /></button>
        {status.state === "success" ? (
          <div className="assessment-success"><span><Check size={34} /></span><h2>You’re all set.</h2><p>Thank you for sharing your financial information.</p><p>Your Moneze advisor will review your assessment before your consultation so we can make your conversation more relevant to your financial goals.</p><div className="assessment-consultation"><h3>Your Consultation</h3><dl><div><dt>📅 Date</dt><dd>See your Calendly confirmation</dd></div><div><dt>⏰ Time</dt><dd>See your Calendly confirmation</dd></div><div><dt>🎥 Google Meet</dt><dd>Link sent with your booking</dd></div></dl><a href="https://calendly.com/moneze-support/30min" target="_blank" rel="noreferrer"><CalendarPlus size={18} />View booking & add to calendar</a></div><button type="button" onClick={() => onComplete({ answers, goals })}>Finish <ArrowRight size={18} /></button></div>
        ) : (
          <><header className="assessment-header"><p className="eyebrow">Financial Assessment</p><h2 id="assessment-title">{stepTitles[step]}</h2><div className="assessment-progress-copy"><span>{step + 1} of {stepTitles.length}</span></div><div className="assessment-dots" aria-label={`Step ${step + 1} of ${stepTitles.length}`}>{stepTitles.map((_, index) => <span className={index === step ? "active" : index < step ? "complete" : ""} key={index} />)}</div></header><form className="assessment-form" onSubmit={step === stepTitles.length - 1 ? submit : next}>{stepContent[step]}{status.message && <p className={`assessment-message ${status.state}`} role="status">{status.message}</p>}<div className="assessment-actions"><button className="assessment-back" type="button" disabled={step === 0} onClick={() => { setStatus({ state: "idle", message: "" }); setStep((value) => value - 1); }}><ArrowLeft size={18} />Back</button><button className="assessment-next" type="submit" disabled={status.state === "loading"}>{step === stepTitles.length - 1 ? (status.state === "loading" ? "Submitting..." : "Submit Assessment") : "Continue"}<ArrowRight size={18} /></button></div></form></>
        )}
      </div>
    </div>
  );
}

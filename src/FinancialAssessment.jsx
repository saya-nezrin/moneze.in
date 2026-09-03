import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

const steps = [
  {
    title: "Personal Details",
    fields: [
      ["name", "Full name", "text"], ["dateOfBirth", "Date of birth", "date"],
      ["age", "Age", "number"], ["phone", "Phone number", "tel"], ["email", "Email address", "email"],
      ["city", "City", "text"], ["maritalStatus", "Marital status", "radio", ["Single", "Married", "Other"]],
      ["children", "Number of children and their ages", "textarea"]
    ]
  },
  {
    title: "Income",
    fields: [
      ["monthlyIncome", "Monthly take-home salary / business income (₹)", "number"], ["otherIncome", "Other income — rent, side business, etc. (₹)", "number"],
      ["employmentDetails", "Employment or business details", "textarea"]
    ]
  },
  {
    title: "Expenses",
    fields: [
      ["householdExpenses", "Approximate monthly household expenses, excluding EMIs and investments (₹)", "number"],
      ["emiLoans", "Current EMI commitments — home, car, personal, education and other loans (₹)", "number"]
    ]
  },
  {
    title: "Savings & Investments",
    fields: [
      ["emergencyFund", "Approximate savings / emergency fund available (₹)", "number"],
      ["investmentTypes", "What investments do you currently have?", "checkboxes", ["Mutual Funds", "FD / RD", "EPF / PPF / NPS", "Stocks", "Gold", "Bonds", "None"]],
      ["investmentValue", "Approximate total value of existing investments (₹)", "number"],
      ["existingSip", "Current monthly SIP / investment amount (₹)", "number"],
      ["hasChitty", "Do you have a chitty?", "radio", ["Yes", "No"]],
      ["chittyDetails", "If yes, monthly amount and whether it is prized or not prized", "textarea"]
    ]
  },
  {
    title: "Insurance & Liabilities",
    fields: [
      ["hasHealthInsurance", "Do you have health insurance?", "radio", ["Yes", "No"]],
      ["healthInsurance", "If yes, health insurance cover amount (₹)", "number"],
      ["hasTermInsurance", "Do you have term insurance?", "radio", ["Yes", "No"]],
      ["termInsurance", "If yes, term insurance cover amount (₹)", "number"],
      ["liabilities", "Other existing liabilities / loans", "textarea"]
    ]
  },
  { title: "Financial Goals", goals: true },
  {
    title: "Risk & Investment Preferences",
    fields: [
      ["investmentExperience", "Investment experience", "select", ["Beginner", "1–3 years", "3–5 years", "5+ years"]],
      ["sipCapacity", "How much could you comfortably invest every month? (₹)", "number"],
      ["marketFallResponse", "If an investment of ₹10 lakh falls to ₹8 lakh temporarily, what would you do?", "radio", ["Sell immediately", "Wait for recovery", "Invest more"]]
    ]
  }
];

const goalNames = ["Retirement", "Child education", "Home", "Marriage", "Wealth creation", "Emergency fund", "Other goals"];

function Field({ field, value, onChange }) {
  const [name, label, type, options] = field;
  if (type === "select") {
    return <label>{label}<select name={name} value={value || ""} onChange={(event) => onChange(name, event.target.value)} required><option value="">Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
  }
  if (type === "textarea") return <label className="assessment-wide">{label}<textarea name={name} value={value || ""} onChange={(event) => onChange(name, event.target.value)} rows="3" /></label>;
  if (type === "radio") return <fieldset className="assessment-options assessment-wide"><legend>{label}</legend>{options.map((option) => <label key={option}><input name={name} type="radio" value={option} checked={value === option} onChange={() => onChange(name, option)} required />{option}</label>)}</fieldset>;
  if (type === "checkboxes") return <fieldset className="assessment-options assessment-wide"><legend>{label}</legend>{options.map((option) => <label key={option}><input type="checkbox" checked={(value || []).includes(option)} onChange={() => onChange(name, (value || []).includes(option) ? value.filter((item) => item !== option) : [...(value || []), option])} />{option}</label>)}</fieldset>;
  return <label>{label}<input name={name} type={type} value={value || ""} onChange={(event) => onChange(name, event.target.value)} min={type === "number" ? "0" : undefined} required={stepRequired(name)} /></label>;
}

const stepRequired = (name) => ["name", "age", "phone", "email", "city", "monthlyIncome", "householdExpenses", "emiLoans", "emergencyFund", "investmentValue", "existingSip", "investmentExperience", "sipCapacity"].includes(name);

export default function FinancialAssessment({ onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [goals, setGoals] = useState({});
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const current = steps[step];

  const updateAnswer = (name, value) => setAnswers((previous) => ({ ...previous, [name]: value }));
  const toggleGoal = (goal) => setGoals((previous) => ({ ...previous, [goal]: previous[goal] ? undefined : { amount: "", horizon: "" } }));
  const updateGoal = (goal, key, value) => setGoals((previous) => ({ ...previous, [goal]: { ...previous[goal], [key]: value } }));

  const next = (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setStep((value) => Math.min(value + 1, steps.length - 1));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const endpoint = import.meta.env.VITE_FINANCIAL_ASSESSMENT_API_URL;
    if (!endpoint || endpoint.includes("example.com")) {
      setStatus({ state: "success", message: "Thank you. Your assessment is complete and will help the advisor prepare for your scheduled consultation." });
      return;
    }
    setStatus({ state: "loading", message: "Submitting your assessment..." });
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, goals: Object.entries(goals).filter(([, value]) => value), assessmentStatus: "complete", submittedAt: new Date().toISOString() })
      });
      if (!response.ok) throw new Error("The assessment could not be submitted.");
      setStatus({ state: "success", message: "Thank you. Your financial assessment has been submitted successfully. Your advisor will review it before the scheduled consultation." });
    } catch (error) {
      setStatus({ state: "error", message: error.message || "Submission failed. Please try again." });
    }
  };

  return (
    <div className="assessment-modal" role="dialog" aria-modal="true" aria-labelledby="assessment-title">
      <div className="assessment-dialog">
        <button className="assessment-close" type="button" onClick={onClose} aria-label="Close financial assessment"><X size={22} /></button>
        {status.state === "success" ? (
          <div className="assessment-success"><span><Check size={34} /></span><h2>Assessment complete</h2><p>{status.message}</p><button type="button" onClick={() => onComplete({ answers, goals })}>Finish <ArrowRight size={18} /></button></div>
        ) : (
          <>
            <div className="assessment-header">
              <p className="eyebrow">Financial Assessment</p>
              <h2 id="assessment-title">{current.title}</h2>
              <div className="assessment-progress-copy"><span>Step {step + 1} of {steps.length}</span><strong>{Math.round(((step + 1) / steps.length) * 100)}%</strong></div>
              <div className="assessment-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
            </div>
            <form className="assessment-form" onSubmit={step === steps.length - 1 ? submit : next}>
              {current.goals ? (
                <div className="goal-list">
                  <p>Select your goals and add an approximate target amount and year.</p>
                  {goalNames.map((goal) => <div className="goal-row" key={goal}><label className="goal-check"><input type="checkbox" checked={Boolean(goals[goal])} onChange={() => toggleGoal(goal)} />{goal}</label>{goals[goal] && <div><input type="number" min="0" placeholder="Target amount ₹" value={goals[goal].amount} onChange={(event) => updateGoal(goal, "amount", event.target.value)} required /><select value={goals[goal].horizon} onChange={(event) => updateGoal(goal, "horizon", event.target.value)} required><option value="">When needed?</option><option>1–3 years</option><option>3–5 years</option><option>5–10 years</option><option>10+ years</option><option>Not sure</option></select></div>}</div>)}
                </div>
              ) : <div className="assessment-fields">{current.fields.filter(([name]) => {
                if (name === "chittyDetails") return answers.hasChitty === "Yes";
                if (name === "healthInsurance") return answers.hasHealthInsurance === "Yes";
                if (name === "termInsurance") return answers.hasTermInsurance === "Yes";
                return true;
              }).map((field) => <Field key={field[0]} field={field} value={answers[field[0]]} onChange={updateAnswer} />)}</div>}
              {status.message && <p className={`assessment-message ${status.state}`} role="status">{status.message}</p>}
              <div className="assessment-actions">
                <button className="assessment-back" type="button" disabled={step === 0} onClick={() => setStep((value) => value - 1)}><ArrowLeft size={18} />Back</button>
                <button className="assessment-next" type="submit" disabled={status.state === "loading"}>{step === steps.length - 1 ? (status.state === "loading" ? "Submitting..." : "Submit Assessment") : "Continue"}<ArrowRight size={18} /></button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

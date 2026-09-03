import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

const steps = [
  {
    title: "Personal Details",
    fields: [
      ["name", "Full name", "text"], ["dateOfBirth", "Date of birth", "date"],
      ["phone", "Phone number", "tel"], ["email", "Email address", "email"],
      ["city", "City", "text"], ["maritalStatus", "Marital status", "select", ["Single", "Married", "Other"]],
      ["dependents", "Number of dependents", "number"]
    ]
  },
  {
    title: "Income",
    fields: [
      ["monthlyIncome", "Monthly income (₹)", "number"], ["otherIncome", "Other monthly income (₹)", "number"],
      ["employmentDetails", "Employment or business details", "textarea"]
    ]
  },
  {
    title: "Expenses",
    fields: [
      ["householdExpenses", "Monthly household expenses (₹)", "number"], ["emiLoans", "Monthly EMI or loan payments (₹)", "number"],
      ["majorExpenses", "Other major expenses", "textarea"]
    ]
  },
  {
    title: "Savings & Investments",
    fields: [
      ["bankSavings", "Bank savings (₹)", "number"], ["emergencyFund", "Emergency fund (₹)", "number"],
      ["mutualFunds", "Mutual funds (₹)", "number"], ["stocks", "Stocks (₹)", "number"],
      ["fixedDeposits", "Fixed deposits (₹)", "number"], ["bonds", "Bonds (₹)", "number"],
      ["gold", "Gold (₹)", "number"], ["existingSip", "Existing monthly SIP (₹)", "number"],
      ["otherInvestments", "Other investments", "textarea"]
    ]
  },
  {
    title: "Insurance & Liabilities",
    fields: [
      ["lifeInsurance", "Life insurance cover (₹)", "number"], ["healthInsurance", "Health insurance cover (₹)", "number"],
      ["liabilities", "Existing liabilities or loans", "textarea"]
    ]
  },
  { title: "Financial Goals", goals: true },
  {
    title: "Risk & Investment Preferences",
    fields: [
      ["riskTolerance", "How comfortable are you with market fluctuations?", "select", ["Low", "Moderate", "High"]],
      ["investmentExperience", "Investment experience", "select", ["Beginner", "1–3 years", "3–5 years", "5+ years"]],
      ["investmentPreference", "Investment preferences", "textarea"], ["sipCapacity", "Comfortable monthly SIP amount (₹)", "number"]
    ]
  }
];

const goalNames = ["Retirement", "Child education", "Home", "Marriage", "Wealth creation", "Emergency fund", "Other goals"];

function Field({ field, value, onChange }) {
  const [name, label, type, options] = field;
  if (type === "select") {
    return <label>{label}<select name={name} value={value || ""} onChange={onChange} required><option value="">Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
  }
  if (type === "textarea") return <label className="assessment-wide">{label}<textarea name={name} value={value || ""} onChange={onChange} rows="3" /></label>;
  return <label>{label}<input name={name} type={type} value={value || ""} onChange={onChange} min={type === "number" ? "0" : undefined} required={stepRequired(name)} /></label>;
}

const stepRequired = (name) => ["name", "dateOfBirth", "phone", "email", "city", "monthlyIncome", "householdExpenses", "riskTolerance", "investmentExperience", "sipCapacity"].includes(name);

export default function FinancialAssessment({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [goals, setGoals] = useState({});
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const current = steps[step];

  const updateAnswer = ({ target }) => setAnswers((previous) => ({ ...previous, [target.name]: target.value }));
  const toggleGoal = (goal) => setGoals((previous) => ({ ...previous, [goal]: previous[goal] ? undefined : { amount: "", year: "" } }));
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
      setStatus({ state: "error", message: "The Moneze assessment API still needs to be connected by the admin team." });
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
      setStatus({ state: "success", message: "Thank you. Your financial assessment has been submitted successfully. Your advisor will review it before the consultation." });
    } catch (error) {
      setStatus({ state: "error", message: error.message || "Submission failed. Please try again." });
    }
  };

  return (
    <div className="assessment-modal" role="dialog" aria-modal="true" aria-labelledby="assessment-title">
      <div className="assessment-dialog">
        <button className="assessment-close" type="button" onClick={onClose} aria-label="Close financial assessment"><X size={22} /></button>
        {status.state === "success" ? (
          <div className="assessment-success"><span><Check size={34} /></span><h2>Assessment submitted</h2><p>{status.message}</p><button type="button" onClick={onClose}>Close</button></div>
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
                  {goalNames.map((goal) => <div className="goal-row" key={goal}><label className="goal-check"><input type="checkbox" checked={Boolean(goals[goal])} onChange={() => toggleGoal(goal)} />{goal}</label>{goals[goal] && <div><input type="number" min="0" placeholder="Target amount ₹" value={goals[goal].amount} onChange={(event) => updateGoal(goal, "amount", event.target.value)} required /><input type="number" min={new Date().getFullYear()} placeholder="Target year" value={goals[goal].year} onChange={(event) => updateGoal(goal, "year", event.target.value)} required /></div>}</div>)}
                </div>
              ) : <div className="assessment-fields">{current.fields.map((field) => <Field key={field[0]} field={field} value={answers[field[0]]} onChange={updateAnswer} />)}</div>}
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

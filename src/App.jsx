import { useEffect, useMemo, useRef, useState } from "react";
import FinancialAssessment from "./FinancialAssessment";
import WelcomeQuestionnaire from "./WelcomeQuestionnaire";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Calculator,
  Check,
  Clock3,
  LineChart,
  Mail,
  Menu,
  Phone,
  PieChart,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  UsersRound,
  WalletCards,
  X
} from "lucide-react";

const appScreens = [
  {
    image: "/moneze-app-home-phone-clean.png",
    title: "Portfolio Home",
    text: "Portfolio value, quick actions, goal plans, and fund discovery in one clean home screen."
  },
  {
    image: "/moneze-app-screener-phone-clean.png",
    title: "Fund Screener",
    text: "Search and compare mutual funds with category filters, risk markers, ratings, and returns."
  },
  {
    image: "/moneze-app-ai-tools-phone-clean.png",
    title: "AI Tools",
    text: "Mutual Fund GPT, fund comparison, portfolio analysis, and calculators powered by AI."
  },
  {
    image: "/moneze-app-menu-phone-clean.png",
    title: "Account & Reports",
    text: "KYC, transactions, reports, calculators, goal planning, and portfolio analysis stay easy to access."
  }
];

const highlights = [
  "AI investment tools",
  "Mutual fund screener",
  "Goal-based planning",
  "Portfolio tracking"
];

const features = [
  {
    icon: BrainCircuit,
    title: "Mutual Fund GPT",
    text: "Ask questions about mutual funds and understand investment concepts in a simpler way."
  },
  {
    icon: Search,
    title: "Compare Funds",
    text: "Compare multiple mutual funds side by side to understand their differences."
  },
  {
    icon: BarChart3,
    title: "Portfolio Analysis",
    text: "Analyse your portfolio and get AI-powered insights and suggestions."
  },
  {
    icon: Calculator,
    title: "Smart Calculators",
    text: "SIP, EMI, SWP, and lumpsum tools support practical planning before investment decisions."
  }
];

const offerings = [
  {
    eyebrow: "FUTURE PLANNING",
    title: "Goal-Based Investing",
    text: "Plan, invest, and secure long-term goals with guided planning.",
    action: "Explore Plans",
    image: "/offerings/financial-goals.png"
  },
  {
    eyebrow: "SIF",
    title: "Specialised Investment Funds",
    text: "Explore specialised investment funds with better clarity.",
    action: "View SIF Options",
    image: "/offerings/top-sif.png"
  },
  {
    eyebrow: "SIP",
    title: "Systematic Investment Plans",
    text: "Invest a fixed amount every month with simple tracking.",
    action: "Start SIP",
    image: "/offerings/start-sip.png"
  },
  {
    eyebrow: "FREEDOM SIP",
    title: "Flexible SIP Planning",
    text: "Monthly investments and withdrawals planned together.",
    action: "Start Now",
    image: "/offerings/freedom-sip.png"
  },
  {
    eyebrow: "LOAN",
    title: "Loan Against Mutual Funds",
    text: "Get liquidity against eligible mutual fund holdings.",
    action: "Explore Loan",
    image: "/offerings/loan-mf.png"
  },
  {
    eyebrow: "GOLD",
    title: "Gold Investment",
    text: "Invest in digital gold through a clean digital experience.",
    action: "Explore Gold",
    image: "/offerings/digital-gold.png"
  }
];
const formatIndianCurrency = (value) => `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
function App() {
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [consultationDetails, setConsultationDetails] = useState(null);
  const [flippedEducationStep, setFlippedEducationStep] = useState(null);
  const heroPhonesRef = useRef(null);
  const featureCardsRef = useRef(null);
  const closeMenu = () => setMenuOpen(false);
  const openBooking = () => {
    setBookingConfirmed(false);
    setAssessmentOpen(false);
    setBookingOpen(true);
    window.history.pushState(null, "", "#consultation-booking");
  };
  const startConsultationFlow = () => {
    setBookingOpen(false);
    setAssessmentOpen(false);
    setWelcomeOpen(true);
    window.history.pushState(null, "", "#consultation");
  };
  const completeAssessment = () => {
    setAssessmentOpen(false);
    window.history.pushState(null, "", "#home");
  };
  const openAssessmentAfterBooking = () => {
    setBookingOpen(false);
    setAssessmentOpen(true);
    window.history.pushState(null, "", "#financial-assessment");
  };
  const openPreview = (image, title) => setPreviewImage({ image, title });
  const openPreviewWithKeyboard = (event, image, title) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPreview(image, title);
    }
  };
  const [calculatorMode, setCalculatorMode] = useState("SIP");
  const [monthlyAmount, setMonthlyAmount] = useState(10000);
  const [duration, setDuration] = useState(5);
  const [returnRate, setReturnRate] = useState(12);
  const [stepUp, setStepUp] = useState(0);
  const [currentAge, setCurrentAge] = useState(35);
  const [sipEndAge, setSipEndAge] = useState(55);
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(50000);
  const [withdrawalIncrease, setWithdrawalIncrease] = useState(5);
  const [withdrawalReturn, setWithdrawalReturn] = useState(8);
  const [serverCalculatorData, setServerCalculatorData] = useState(null);

  useEffect(() => {
    const openLinkedConsultation = () => {
      if (window.location.hash === "#consultation") setWelcomeOpen(true);
    };
    openLinkedConsultation();
    window.addEventListener("hashchange", openLinkedConsultation);
    return () => window.removeEventListener("hashchange", openLinkedConsultation);
  }, []);

  useEffect(() => {
    const phones = heroPhonesRef.current;
    if (!phones) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => phones.classList.toggle("is-visible", entry.isIntersecting),
      { threshold: 0.18 }
    );

    observer.observe(phones);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cards = featureCardsRef.current;
    if (!cards) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => cards.classList.toggle("is-visible", entry.isIntersecting),
      { threshold: 0.14 }
    );

    observer.observe(cards);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!welcomeOpen && !previewImage && !bookingOpen && !assessmentOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
        setWelcomeOpen(false);
        setBookingOpen(false);
        setAssessmentOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.classList.add("preview-open");
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("preview-open");
    };
  }, [welcomeOpen, previewImage, bookingOpen, assessmentOpen]);

  useEffect(() => {
    const receiveCalendlyEvent = (event) => {
      let messageData = event.data;
      if (typeof messageData === "string") {
        try { messageData = JSON.parse(messageData); } catch { return; }
      }
      let calendlyMessage = false;
      try {
        const hostname = new URL(event.origin).hostname;
        calendlyMessage = hostname === "calendly.com" || hostname.endsWith(".calendly.com");
      } catch {
        calendlyMessage = false;
      }
      if (calendlyMessage && messageData?.event === "calendly.event_scheduled") {
        setBookingConfirmed(true);
        window.setTimeout(openAssessmentAfterBooking, 1000);
      }
    };
    window.addEventListener("message", receiveCalendlyEvent);
    return () => window.removeEventListener("message", receiveCalendlyEvent);
  }, []);
  const calculatorData = useMemo(() => {
    const months = duration * 12;
    const monthlyRate = returnRate / 100 / 12;
    const points = Array.from({ length: 13 }, (_, index) => {
      const elapsedMonths = Math.max(1, Math.round((months / 12) * index));
      const elapsedYears = elapsedMonths / 12;
      let value = 0;

      if (calculatorMode === "SIP") {
        let runningValue = 0;
        let totalPaid = 0;
        for (let month = 1; month <= elapsedMonths; month += 1) {
          const year = Math.floor((month - 1) / 12);
          const steppedAmount = monthlyAmount * ((1 + stepUp / 100) ** year);
          runningValue = (runningValue + steppedAmount) * (1 + monthlyRate);
          totalPaid += steppedAmount;
        }
        value = runningValue || totalPaid;
      } else if (calculatorMode === "SIP & SWP") {
        let runningValue = 0;
        const investmentMonths = Math.max((sipEndAge - currentAge) * 12, 12);
        const sampleMonths = Math.max(1, Math.round((investmentMonths / 12) * index));
        for (let month = 1; month <= sampleMonths; month += 1) {
          const year = Math.floor((month - 1) / 12);
          runningValue = (runningValue + monthlyAmount * ((1 + stepUp / 100) ** year)) * (1 + monthlyRate);
        }
        value = runningValue + lumpsumAmount * ((1 + returnRate / 100) ** (sampleMonths / 12));
      } else if (calculatorMode === "Lumpsum") {
        value = monthlyAmount * 12 * ((1 + returnRate / 100) ** elapsedYears);
      } else {
        const startingCorpus = monthlyAmount * 120;
        const withdrawn = monthlyAmount * elapsedMonths * 0.42;
        value = Math.max(startingCorpus - withdrawn, 0) * ((1 + returnRate / 100) ** Math.max(elapsedYears / 2, 0.2));
      }

      return value;
    });
    const projectedCorpus = points.at(-1) || 0;
    const totalInvested = calculatorMode === "SIP"
      ? Array.from({ length: months }, (_, index) => monthlyAmount * ((1 + stepUp / 100) ** Math.floor(index / 12))).reduce((sum, value) => sum + value, 0)
      : calculatorMode === "SIP & SWP"
        ? Array.from({ length: Math.max((sipEndAge - currentAge) * 12, 12) }, (_, index) => monthlyAmount * ((1 + stepUp / 100) ** Math.floor(index / 12))).reduce((sum, value) => sum + value, lumpsumAmount)
      : monthlyAmount * 12;
    const wealthGained = Math.max(projectedCorpus - totalInvested, 0);
    const maxPoint = Math.max(...points, totalInvested, 1);
    const chartPoints = points.map((value, index) => {
      const x = 36 + (index / (points.length - 1)) * 460;
      const y = 164 - (value / maxPoint) * 130;
      return `${x.toFixed(1)},${Math.max(24, Math.min(164, y)).toFixed(1)}`;
    });

    if (calculatorMode === "SIP & SWP") {
      const corpusAtRetirement = projectedCorpus;
      let corpus = corpusAtRetirement;
      let totalWithdrawal = 0;
      let sustainableTillAge = sipEndAge;
      const retirementMonthlyRate = withdrawalReturn / 100 / 12;
      for (let month = 1; month <= (100 - sipEndAge) * 12 && corpus > 0; month += 1) {
        const withdrawalYear = Math.floor((month - 1) / 12);
        const withdrawal = monthlyWithdrawal * ((1 + withdrawalIncrease / 100) ** withdrawalYear);
        const available = corpus * (1 + retirementMonthlyRate);
        const actualWithdrawal = Math.min(withdrawal, available);
        corpus = Math.max(available - actualWithdrawal, 0);
        totalWithdrawal += actualWithdrawal;
        sustainableTillAge = sipEndAge + month / 12;
      }
      return {
        amountLabel: "Monthly SIP Amount",
        totalLabel: `Corpus at Age ${sipEndAge}`,
        secondaryLabel: "Total Withdrawal",
        totalInvested: corpusAtRetirement,
        projectedCorpus: corpus,
        wealthGained: totalWithdrawal,
        resultLabel: "Remaining Corpus",
        sustainableTillAge: Math.min(100, Math.floor(sustainableTillAge)),
        chartLine: `M ${chartPoints.join(" L ")}`,
        chartArea: `M ${chartPoints.join(" L ")} L 496 168 L 36 168 Z`
      };
    }

    return {
      amountLabel: calculatorMode === "SIP" ? "Monthly Inv. Amount" : calculatorMode === "Lumpsum" ? "One-time Investment" : "Monthly Withdrawal",
      totalLabel: calculatorMode === "SWP" ? "Starting Corpus" : "Total Invested",
      secondaryLabel: "Wealth Gained",
      totalInvested,
      projectedCorpus,
      wealthGained,
      resultLabel: calculatorMode === "SWP" ? "Estimated Balance" : "Projected Corpus",
      chartLine: `M ${chartPoints.join(" L ")}`,
      chartArea: `M ${chartPoints.join(" L ")} L 496 168 L 36 168 Z`
    };
  }, [calculatorMode, currentAge, duration, lumpsumAmount, monthlyAmount, monthlyWithdrawal, returnRate, sipEndAge, stepUp, withdrawalIncrease, withdrawalReturn]);

  useEffect(() => {
    const controller = new AbortController();
    setServerCalculatorData(null);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/calculator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: calculatorMode, monthlyAmount, duration, returnRate, stepUp, currentAge, sipEndAge, lumpsumAmount, monthlyWithdrawal, withdrawalIncrease, withdrawalReturn }),
          signal: controller.signal
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (payload?.result) setServerCalculatorData(payload.result);
      } catch (error) {
        if (error.name !== "AbortError") setServerCalculatorData(null);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [calculatorMode, currentAge, duration, lumpsumAmount, monthlyAmount, monthlyWithdrawal, returnRate, sipEndAge, stepUp, withdrawalIncrease, withdrawalReturn]);

  const displayedCalculatorData = serverCalculatorData || calculatorData;

  return (
    <main>
      <a className="login-link desktop-login-outside" href="https://www.moneze.in/">Login</a>
      <nav className="topbar">
        <a className="brand" href="#home" aria-label="Moneze home" onClick={closeMenu}>
          <img className="brand-logo" src="/moneze-logo.png" alt="Moneze" />
        </a>
        <div className="nav-links" aria-label="Primary navigation">
          <a href="#app">App</a>
          <a href="#ai">AI Tools</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-actions">
          <button
            className="menu-button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            title="Menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-menu" aria-label="Mobile navigation">
          <a href="/" onClick={closeMenu}>Home</a>
          <a href="/financial-planning" onClick={closeMenu}>Financial Planning</a>
          <a href="/mutual-funds" onClick={closeMenu}>Mutual Funds</a>
          <a href="/learn" onClick={closeMenu}>Learn</a>
          <a href="/about" onClick={closeMenu}>About Moneze</a>
          <a href="/contact" onClick={closeMenu}>Contact</a>
        </div>
      )}

      <section id="home" className="hero">
        <div className="hero-copy-wrap">          <h1><span>Understand Your Money.</span><span>Plan Your Future.</span><span>Invest With Confidence.</span></h1>
          <p className="hero-copy hero-mobile-description">
            Personalized financial planning and mutual fund investment guidance designed around your goals, financial situation and risk profile.
          </p>
          <p className="hero-copy hero-copy-detail hero-mobile-description">
            You don&apos;t have to know exactly what you should invest in. We start by understanding where you are today, what you want to achieve, and what your money needs to do for you.
          </p>
          <div className="hero-actions">
            <div className="hero-secondary-actions">
              <button className="hero-secondary-button hero-consultation-button" type="button" onClick={startConsultationFlow}>
                Get Free Consultation
                <ArrowRight size={20} />
              </button>
              <a className="hero-secondary-button hero-explore-button" href="https://www.moneze.in/">
                Explore Moneze App
                <ArrowRight size={20} />
              </a>
            </div>
          </div>
          <p className="hero-support-line">Education First. Investment Second.</p>
          <p className="hero-desktop-intro">
            Personalized financial planning and mutual fund investment guidance designed around your goals, financial situation and risk profile.
          </p>
          <div className="proof-row" aria-label="Platform highlights">
            {highlights.map((point) => (
              <span key={point}><Check size={16} /> {point}</span>
            ))}
          </div>
        </div>
        <div ref={heroPhonesRef} className="hero-phone-card hero-product-card hero-dual-ui scroll-animate" aria-label="Moneze mobile app investment screens">
          <img className="hero-ui-front phone-popup-trigger" src="/moneze-app-home-phone-clean.png" alt="Moneze mobile app portfolio home screen" role="button" tabIndex={0} onClick={() => openPreview("/moneze-app-home-phone-clean.png", "Portfolio Home")} onKeyDown={(event) => openPreviewWithKeyboard(event, "/moneze-app-home-phone-clean.png", "Portfolio Home")} />
          <img className="hero-ui-back phone-popup-trigger" src="/moneze-app-ai-tools-phone-clean.png" alt="Moneze mobile app AI tools screen" role="button" tabIndex={0} onClick={() => openPreview("/moneze-app-ai-tools-phone-clean.png", "AI Tools")} onKeyDown={(event) => openPreviewWithKeyboard(event, "/moneze-app-ai-tools-phone-clean.png", "AI Tools")} />
        </div>
        <div className="hero-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 170" preserveAspectRatio="none">
            <path className="hero-wave-back" d="M0 58C238 5 380 116 654 82C910 50 1091 6 1440 53V170H0Z" />
            <path className="hero-wave-front" d="M0 91C250 47 411 139 674 108C941 76 1128 37 1440 74V170H0Z" />
          </svg>
        </div>
      </section>

      <section className="desktop-hero-description" aria-label="Moneze financial planning introduction">
        <p>You don&apos;t have to know exactly what you should invest in. We start by understanding where you are today, what you want to achieve, and what your money needs to do for you.</p>
      </section>

      <section className="investment-paths" aria-labelledby="investment-paths-title">
        <div className="investment-paths-inner">
          <div className="choice-heading">
            <span />
            <h2 id="investment-paths-title">How would you like to invest?</h2>
            <span />
          </div>
          <div className="choice-grid">
            <article className="choice-card choice-card-advisor">
              <div className="choice-card-heading">
                <span className="choice-icon choice-icon-blue"><UsersRound size={32} /></span>
                <div><h3>Guided by an Advisor</h3><p>Understand your financial situation, identify your goals and get a personalized financial plan with mutual fund investment guidance.</p></div>
              </div>
              <ul>
                {["Understand your current financial position", "Identify and prioritize your financial goals", "Assess your risk profile", "Create a personalized financial plan", "Get mutual fund portfolio recommendations"].map((item) => <li key={item}><Check size={19} />{item}</li>)}
              </ul>
              <p className="choice-supporting-copy">The consultation journey is supported by Moneze&apos;s existing process: financial questionnaire, risk profiling, goal planning, portfolio recommendation and a presentation explaining the recommendations.</p>
              <button className="choice-cta choice-cta-blue" type="button" onClick={startConsultationFlow}>Get Free Financial Consultation <ArrowRight size={20} /></button>
            </article>
            <span className="choice-or">OR</span>
            <article className="choice-card choice-card-self">
              <div className="choice-card-heading">
                <span className="choice-icon choice-icon-green"><Smartphone size={30} /></span>
                <div><h3>Invest on Your Own</h3><p>Explore mutual funds, SIPs, financial calculators, goal planning and AI-powered tools through the Moneze App.</p></div>
              </div>
              <ul>
                {["Explore mutual funds", "Start and manage SIPs", "Plan financial goals", "Track your portfolio", "Use AI-powered tools", "Use financial calculators"].map((item) => <li key={item}><Check size={19} />{item}</li>)}
              </ul>
              <p className="choice-supporting-copy">The current app includes SIPs, goal planning, portfolio tracking, calculators, AI tools, fund exploration and portfolio analysis.</p>
              <a className="choice-cta choice-cta-green" href="https://www.moneze.in/">Explore Moneze App <ArrowRight size={20} /></a>
            </article>
          </div>

          <section className="education-first" aria-labelledby="education-first-title">
            <h2 id="education-first-title">Education First. Investment Second.</h2>
            <div className="education-flow" aria-label="Understand, Plan, Discuss, Protect, Invest, Review">
              {[
                ["Understand", "Know your money, goals, income and expenses."],
                ["Plan", "Build a clear financial plan around your priorities."],
                ["Discuss", "Review your plan with personalized guidance."],
                ["Protect", "Prepare for risks before building long-term wealth."],
                ["Invest", "Choose suitable investments with confidence."],
                ["Review", "Track progress and adjust your plan regularly."]
              ].map(([step, detail], index) => (
                <button
                  className={`education-flow-step${flippedEducationStep === index ? " is-flipped" : ""}`}
                  type="button"
                  key={step}
                  aria-pressed={flippedEducationStep === index}
                  aria-label={`${step}: ${detail}`}
                  onClick={() => setFlippedEducationStep((current) => current === index ? null : index)}
                >
                  <span className="education-card-inner">
                    <span className="education-card-face education-card-front">
                      <small>{String(index + 1).padStart(2, "0")}</small>
                      <strong>{step}</strong>
                      <em>Tap to learn more</em>
                    </span>
                    <span className="education-card-face education-card-back">
                      <strong>{step}</strong>
                      <span>{detail}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="wealth-protection" aria-labelledby="wealth-protection-title">
            <div className="wealth-protection-heading">
              <p>WEALTH PROTECTION</p>
              <h2 id="wealth-protection-title">Build Wealth. Protect What Matters.</h2>
            </div>
            <div className="wealth-protection-grid">
              {[
                [Clock3, "Emergency Fund"],
                [ShieldCheck, "Health Insurance"],
                [BadgeCheck, "Term Insurance"],
                [LineChart, "Investment Planning"]
              ].map(([Icon, title]) => (
                <article key={title}>
                  <span><Icon size={22} /></span>
                  <strong>{title}</strong>
                </article>
              ))}
            </div>
            <button className="wealth-protection-cta" type="button" onClick={startConsultationFlow}>
              Get Free Financial Consultation <ArrowRight size={19} />
            </button>
          </section>
        </div>
      </section>

      <section id="ai" className="ai-section">
        <div className="ai-copy">
          <p className="eyebrow">AI Tools</p>
          <h2>Built-in intelligence for smarter investment decisions.</h2>
          <p>
            The AI Tools experience gives customers fast fund answers, side-by-side comparison, portfolio insights, and planning calculators directly inside the Moneze app.
          </p>
          <div className="ai-list">
            <span><BrainCircuit size={18} /> Mutual Fund GPT</span>
            <span><Search size={18} /> Compare Funds</span>
            <span><BarChart3 size={18} /> Portfolio Analysis</span>
            <span><Calculator size={18} /> SIP, EMI, SWP and Lumpsum calculators</span>
          </div>
        </div>
        <div className="ai-phone-card">
          <img className="phone-popup-trigger" src="/moneze-app-ai-tools-phone-clean.png" alt="Moneze AI tools mobile screen" role="button" tabIndex={0} onClick={() => openPreview("/moneze-app-ai-tools-phone-clean.png", "AI Tools")} onKeyDown={(event) => openPreviewWithKeyboard(event, "/moneze-app-ai-tools-phone-clean.png", "AI Tools")} />
        </div>
      </section>

      <section id="app" className="app-showcase">
        <div className="app-showcase-copy">
          <p className="eyebrow">All you need in one app</p>
          <h2>Powerful investing.<br />Simplified.</h2>
          <p>Mutual funds, SIPs, AI tools, portfolio tracking, goal planning and more—everything you need to grow your wealth, in one place.</p>
          <div className="app-feature-list" aria-label="Moneze app features">
            <span><WalletCards size={24} />Mutual Funds</span>
            <span><LineChart size={24} />SIPs</span>
            <span><Target size={24} />Goals</span>
            <span><BrainCircuit size={24} />AI Tools</span>
            <span><PieChart size={24} />Portfolio</span>
            <span><Calculator size={24} />Calculators</span>
          </div>
        </div>
        <div className="app-phone-showcase">
          <div className="app-phone-stage" aria-label="Moneze mobile app screens">
            <img className="app-phone app-phone-left phone-popup-trigger" src="/moneze-app-ai-tools-phone-clean.png" alt="Moneze AI tools screen" role="button" tabIndex={0} onClick={() => openPreview("/moneze-app-ai-tools-phone-clean.png", "AI Tools")} onKeyDown={(event) => openPreviewWithKeyboard(event, "/moneze-app-ai-tools-phone-clean.png", "AI Tools")} />
            <img className="app-phone app-phone-center phone-popup-trigger" src="/moneze-app-home-phone-clean.png" alt="Moneze portfolio home screen" role="button" tabIndex={0} onClick={() => openPreview("/moneze-app-home-phone-clean.png", "Portfolio Home")} onKeyDown={(event) => openPreviewWithKeyboard(event, "/moneze-app-home-phone-clean.png", "Portfolio Home")} />
            <img className="app-phone app-phone-right phone-popup-trigger" src="/moneze-app-menu-phone-clean.png" alt="Moneze account and reports screen" role="button" tabIndex={0} onClick={() => openPreview("/moneze-app-menu-phone-clean.png", "Account & Reports")} onKeyDown={(event) => openPreviewWithKeyboard(event, "/moneze-app-menu-phone-clean.png", "Account & Reports")} />
          </div>
          <a className="app-explore-cta" href="https://www.moneze.in/">Explore Moneze App <ArrowRight size={19} /></a>
        </div>
      </section>

      <section id="calculator" className="wealth-section">
        <div className="wealth-heading">
          <div>
            <p className="eyebrow">Investment Calculator</p>
            <h2>Plan Your Investments With the Right<span className="calculator-title-break"><br /></span> <span>Numbers</span></h2>
            <p className="wealth-supporting-copy">Before investing, understand what your money could potentially do over time. Use Moneze&apos;s financial calculators to explore different investment scenarios and make more informed decisions.</p>
          </div>
          <div className="wealth-tabs" role="tablist" aria-label="Investment calculator type">
            {["SIP", "Lumpsum", "SWP", "SIP & SWP"].map((mode) => (
              <button
                className={calculatorMode === mode ? "active" : ""}
                key={mode}
                type="button"
                onClick={() => setCalculatorMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="wealth-calculator">
          <div className="calculator-controls">
            <div className="control-row">
              <div>
                <label htmlFor="amountRange">{displayedCalculatorData.amountLabel}</label>
                <div className="quick-values">
                  {[50000, 80000, 100000].map((value) => (
                    <button type="button" key={value} onClick={() => setMonthlyAmount(value)}>
                      + {value.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>
              <strong>{formatIndianCurrency(monthlyAmount)}</strong>
            </div>
            <input
              id="amountRange"
              className="range-input"
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={monthlyAmount}
              onChange={(event) => setMonthlyAmount(Number(event.target.value))}
            />

            {calculatorMode === "SIP & SWP" ? (
              <>
                <div className="control-row compact">
                  <label htmlFor="currentAgeRange">Current Age</label>
                  <strong>{currentAge} <small>Years</small></strong>
                </div>
                <input id="currentAgeRange" className="range-input" type="range" min="18" max="70" value={currentAge} onChange={(event) => {
                  const age = Number(event.target.value);
                  setCurrentAge(age);
                  if (sipEndAge <= age) setSipEndAge(Math.min(age + 1, 80));
                }} />
                <div className="control-row compact">
                  <label htmlFor="sipEndAgeRange">SIP End Age</label>
                  <strong>{sipEndAge} <small>Years</small></strong>
                </div>
                <input id="sipEndAgeRange" className="range-input" type="range" min={currentAge + 1} max="80" value={sipEndAge} onChange={(event) => setSipEndAge(Number(event.target.value))} />
              </>
            ) : (
              <>
                <div className="control-row compact">
                  <label htmlFor="durationRange">Duration</label>
                  <strong>{duration} <small>Years</small></strong>
                </div>
                <input id="durationRange" className="range-input" type="range" min="1" max="30" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
              </>
            )}

            <div className="control-row compact">
              <label htmlFor="returnsRange">Expected Returns (p.a.)</label>
              <strong>{returnRate} <small>%</small></strong>
            </div>
            <input
              id="returnsRange"
              className="range-input"
              type="range"
              min="1"
              max="30"
              value={returnRate}
              onChange={(event) => setReturnRate(Number(event.target.value))}
            />

            <div className="control-row compact">
              <label htmlFor="stepRange">Annual Step-Up</label>
              <strong>{stepUp} <small>%</small></strong>
            </div>
            <input
              id="stepRange"
              className="range-input"
              type="range"
              min="0"
              max="25"
              value={stepUp}
              onChange={(event) => setStepUp(Number(event.target.value))}
            />
            {calculatorMode === "SIP & SWP" && (
              <div className="combined-calculator-fields">
                <div className="control-row compact">
                  <label htmlFor="lumpsumRange">Lumpsum Amount</label>
                  <strong>{formatIndianCurrency(lumpsumAmount)}</strong>
                </div>
                <input id="lumpsumRange" className="range-input" type="range" min="10000" max="2000000" step="10000" value={lumpsumAmount} onChange={(event) => setLumpsumAmount(Number(event.target.value))} />
                <div className="control-row compact">
                  <label htmlFor="withdrawalRange">Monthly Withdrawal</label>
                  <strong>{formatIndianCurrency(monthlyWithdrawal)}</strong>
                </div>
                <input id="withdrawalRange" className="range-input" type="range" min="10000" max="5000000" step="10000" value={monthlyWithdrawal} onChange={(event) => setMonthlyWithdrawal(Number(event.target.value))} />
                <div className="control-row compact">
                  <label htmlFor="withdrawalIncreaseRange">Yearly Withdrawal Increase</label>
                  <strong>{withdrawalIncrease} <small>%</small></strong>
                </div>
                <input id="withdrawalIncreaseRange" className="range-input" type="range" min="0" max="20" value={withdrawalIncrease} onChange={(event) => setWithdrawalIncrease(Number(event.target.value))} />
                <div className="control-row compact">
                  <label htmlFor="withdrawalReturnRange">Return During Withdrawal</label>
                  <strong>{withdrawalReturn} <small>%</small></strong>
                </div>
                <input id="withdrawalReturnRange" className="range-input" type="range" min="1" max="20" value={withdrawalReturn} onChange={(event) => setWithdrawalReturn(Number(event.target.value))} />
              </div>
            )}
          </div>

          <div className="calculator-results">
            <div className="result-card">
              <div>
                <span>{displayedCalculatorData.totalLabel}</span>
                <strong>{formatIndianCurrency(displayedCalculatorData.totalInvested)}</strong>
              </div>
              <div>
                <span>{displayedCalculatorData.secondaryLabel || "Wealth Gained"}</span>
                <strong className="gain">+{formatIndianCurrency(displayedCalculatorData.wealthGained).replace("Rs. ", "Rs. ")}</strong>
              </div>
              <h3>{formatIndianCurrency(displayedCalculatorData.projectedCorpus)}</h3>
              <p>{displayedCalculatorData.resultLabel || (calculatorMode === "SWP" ? "Estimated Balance" : "Projected Corpus")}</p>
              {displayedCalculatorData.sustainableTillAge && <small className="sustainability-result">Sustainable till approximately age {displayedCalculatorData.sustainableTillAge}</small>}
            </div>
            <div className="curve-card">
              <h3>Wealth Curve</h3>
              <div className="curve-chart" aria-label="Projected wealth curve">
                <svg viewBox="0 0 520 190" role="img">
                  <path d={displayedCalculatorData.chartLine} fill="none" stroke="#1559bf" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                  <path d={displayedCalculatorData.chartArea} fill="url(#wealthFill)" />
                  <line x1="36" y1="168" x2="496" y2="168" stroke="#e5ebf5" strokeWidth="2" />
                  <defs>
                    <linearGradient id="wealthFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#dce8f8" />
                      <stop offset="1" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section><section id="features" className="section features-section">
        <div className="section-heading centered">
          <p className="eyebrow">Platform Capabilities</p>
          <h2>Smarter Tools for Better Investment<br />Decisions</h2>
        </div>
        <div ref={featureCardsRef} className="feature-grid side-reveal-cards">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title}>
                <div className="feature-icon"><Icon size={24} /></div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
        <a className="feature-explore-cta" href="https://www.moneze.in/">
          Explore Moneze App <ArrowRight size={19} />
        </a>
      </section>

      <section className="why-moneze" aria-labelledby="why-moneze-title">
        <div className="why-moneze-heading">
          <p>WHY MONEZE</p>
          <h2 id="why-moneze-title">Invest With Purpose,<br />Not Just Products.</h2>
          <div>
            <p>Investing is only one part of your financial journey.</p>
            <p>The bigger question is whether your investments are connected to your financial situation, your goals and your future.</p>
          </div>
        </div>
        <div className="why-comparison">
          <article className="why-comparison-basic">
            <h3>Simply Investing</h3>
            <ul>
              {["Choose an investment", "Focus on products", "Invest based on available money", "Make decisions independently", "Track investments", "Invest and forget"].map((item) => (
                <li key={item}><X size={17} />{item}</li>
              ))}
            </ul>
          </article>
          <article className="why-comparison-moneze">
            <span className="why-recommended">THE MONEZE WAY</span>
            <h3>Investing With Moneze</h3>
            <ul>
              {["Understand why you’re investing", "Focus on goals", "Invest based on your financial capacity", "Get personalized guidance", "Track progress toward goals", "Review and adjust over time"].map((item) => (
                <li key={item}><Check size={17} />{item}</li>
              ))}
            </ul>
          </article>
        </div>
        <div className="why-moneze-closing">
          <p>At Moneze, we combine financial education, personalized planning, mutual fund investing, technology and ongoing guidance to help you make more informed financial decisions.</p>
          <strong>AI helps you understand. Human guidance helps you plan.</strong>
          <button type="button" onClick={startConsultationFlow}>Get Free Financial Consultation <ArrowRight size={19} /></button>
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-copy">
          <p className="eyebrow">Trust &amp; Platform</p>
          <h2>Built for confident mutual fund investing.</h2>
          <p>
            Moneze brings secure investing infrastructure, personalised financial guidance and intelligent tools together in one simple platform.
          </p>
          <div className="ondc-mark" aria-label="Open Network for Digital Commerce">
            <strong>ONDC</strong>
            <span>Open Network for Digital Commerce</span>
          </div>
        </div>
        <div className="assurance-list">
          <article><span><Check size={18} /></span><div><h3>ONDC-enabled investment infrastructure</h3><p>Access mutual fund investments through a secure digital ecosystem.</p></div></article>
          <article><span><Check size={18} /></span><div><h3>100% Safe, SEBI &amp; AMFI Approved</h3><p>Your trust matters most.</p><small>✓ Investments through SEBI-registered Mutual Funds<br />✓ AMFI-compliant processes</small></div></article>
          <article><span><Check size={18} /></span><div><h3>Secure KYC &amp; Transactions</h3><p>Complete KYC and manage your investment transactions through the Moneze platform.</p></div></article>
          <article><span><Check size={18} /></span><div><h3>Portfolio Tracking &amp; Analysis</h3><p>Track your investments, returns and portfolio performance in one place.</p></div></article>
          <article><span><Check size={18} /></span><div><h3>AI-Powered Financial Tools</h3><p>Compare funds, analyse portfolios and understand mutual funds with intelligent tools.</p></div></article>
        </div>
        <div className="amc-partners">
          <div className="amc-partners-heading">
            <span><Check size={18} /></span>
            <div><h3>Partnered with Leading Asset Management Companies</h3><p>Access a wide range of mutual fund investment options through Moneze.</p></div>
          </div>
          <div className="amc-marquee" aria-label="Asset management company partners">
            <div className="amc-marquee-track">
              {[0, 1].map((copy) => [
                { name: "HDFC AMC", domain: "hdfcfund.com" },
                { name: "ICICI Prudential AMC", domain: "icicipruamc.com" },
                { name: "Bandhan AMC", domain: "bandhanmutual.com" },
                { name: "Axis AMC", domain: "axismf.com" },
                { name: "Nippon India AMC", domain: "mf.nipponindiaim.com" },
                { name: "Kotak AMC", domain: "kotakmf.com" },
                { name: "Aditya Birla Sun Life AMC", domain: "mutualfund.adityabirlacapital.com" },
                { name: "DSP AMC", domain: "dspim.com" },
                { name: "UTI AMC", domain: "utimf.com" },
                { name: "HSBC AMC", domain: "assetmanagement.hsbc.co.in" },
                { name: "Canara Robeco AMC", domain: "canararobeco.com" },
                { name: "Invesco AMC", domain: "invescomutualfund.com" },
              ].map(({ name, domain }) => (
                <span key={`${copy}-${name}`} aria-label={copy === 0 ? `${name} logo` : undefined} aria-hidden={copy === 1 ? "true" : undefined} title={name}>
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                    alt=""
                    loading="lazy"
                    onError={(event) => event.currentTarget.parentElement?.classList.add("logo-missing")}
                  />
                  <b>{name}</b>
                </span>
              )))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section contact-section-simple">
        <div className="contact-simple-content">
          <h2>Contact Moneze</h2>
          <p>Have a question or need assistance? Get in touch with us.</p>
          <div className="contact-methods">
            <a href="tel:+918848485543">
              <Phone size={19} />
              <span><small>Call us</small><strong>+91 8848485543</strong></span>
            </a>
            <a href="mailto:support@moneze.in">
              <Mail size={19} />
              <span><small>Email us</small><strong>support@moneze.in</strong></span>
            </a>
          </div>
        </div>
      </section>

      {welcomeOpen && (
        <WelcomeQuestionnaire
          onClose={() => setWelcomeOpen(false)}
          onConsultation={(details) => {
            setConsultationDetails(details);
            setWelcomeOpen(false);
            openBooking();
          }}
        />
      )}

      {bookingOpen && (
        <div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title" onClick={() => setBookingOpen(false)}>
          <div className="booking-dialog calendly-dialog" onClick={(event) => event.stopPropagation()}>
            <button className="booking-close" type="button" aria-label="Close booking form" onClick={() => setBookingOpen(false)}><X size={22} /></button>
            <div className="calendly-heading">
              <p className="eyebrow">Free consultation</p>
              <h2 id="booking-title">Choose your date and time</h2>
              {!bookingConfirmed && (
                <button className="calendly-assessment-fallback" type="button" onClick={openAssessmentAfterBooking}>
                  Booking completed? Continue to Financial Assessment <ArrowRight size={18} />
                </button>
              )}
            </div>
            <iframe
              className="calendly-frame"
              title="Book a Moneze financial consultation"
              src="https://calendly.com/moneze-support/30min?hide_gdpr_banner=1&background_color=ffffff&text_color=07163d&primary_color=087be5"
            />
            {bookingConfirmed && (
              <div className="calendly-booked-message" role="status">
                <span>Booking confirmed ✅ Your financial assessment is next.</span>
                <button type="button" onClick={openAssessmentAfterBooking}>Continue to Financial Assessment <ArrowRight size={18} /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {assessmentOpen && <FinancialAssessment initialDetails={consultationDetails} consultationScheduled={bookingConfirmed} onClose={() => setAssessmentOpen(false)} onComplete={completeAssessment} />}

      {previewImage && (
        <div className="phone-preview-modal" role="dialog" aria-modal="true" aria-label={`${previewImage.title} screen preview`} onClick={() => setPreviewImage(null)}>
          <div className="phone-preview-content" onClick={(event) => event.stopPropagation()}>
            <button className="phone-preview-close" type="button" aria-label="Close screen preview" onClick={() => setPreviewImage(null)}>
              <X size={24} />
            </button>
            <img src={previewImage.image} alt={`${previewImage.title} enlarged app screen`} />
            <strong>{previewImage.title}</strong>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <div className="footer-top">
          <p>(c) 2026 Moneze. All Rights Reserved</p>
          <div className="footer-store-badges" aria-label="Download the Moneze app">
            <span className="store-badge-frame google-play-frame"><img src="/google-play-badge.png" alt="Get it on Google Play" /></span>
            <span className="store-badge-frame app-store-frame"><img src="/app-store-badge.svg" alt="Download on the App Store" /></span>
          </div>
        </div>
        <div className="footer-line" />
        <div className="footer-details">
          <p><strong>Corporate Office:</strong> Moneze Financial Services, India</p>
          <p><strong>Email ID:</strong> support@moneze.in <span>|</span> <strong>Contact Us at:</strong> +91 99726 54330 <span>|</span> <strong>Whatsapp:</strong> +91 99726 54330</p>
        </div>
        <a className="back-top" href="#home" aria-label="Back to top">Top</a>
      </footer>
    </main>
  );
}

export default App;

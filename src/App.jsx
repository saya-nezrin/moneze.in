import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Calculator,
  Check,
  Clock3,
  FileCheck2,
  LineChart,
  Mail,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards
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
    text: "Give customers a smarter way to ask fund-related questions and understand options faster."
  },
  {
    icon: Search,
    title: "Compare Funds",
    text: "Side-by-side analysis helps customers review categories, returns, risk, and suitability signals."
  },
  {
    icon: BarChart3,
    title: "Portfolio Analysis",
    text: "AI-assisted insights and suggestions help users understand portfolio quality and next steps."
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
const stats = [
  ["1106+", "Funds to explore"],
  ["4", "AI-led tools"],
  ["5", "Core app sections"],
  ["24/7", "Digital access"]
];

const process = [
  {
    num: "01",
    title: "Discover",
    text: "Explore mutual funds by type, risk profile, ratings, and performance.",
    backTitle: "Find suitable funds faster",
    backText: "Use fund categories, return periods, ratings, and risk indicators to narrow down choices with confidence."
  },
  {
    num: "02",
    title: "Ask AI",
    text: "Use Mutual Fund GPT and comparison tools to clarify options.",
    backTitle: "AI guidance built in",
    backText: "Ask fund questions, compare schemes side by side, and understand portfolio suggestions without leaving the app."
  },
  {
    num: "03",
    title: "Plan",
    text: "Build goal plans and calculate SIP, EMI, SWP, or lumpsum outcomes.",
    backTitle: "Plan before investing",
    backText: "Estimate monthly investments, withdrawal plans, loan payments, and goal progress before taking action."
  },
  {
    num: "04",
    title: "Invest & Track",
    text: "Add funds to cart, proceed to payment, and monitor portfolio progress.",
    backTitle: "Stay in control",
    backText: "Track portfolio value, reports, transactions, and performance from a single customer dashboard."
  }
];

const formatIndianCurrency = (value) => `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const [calculatorMode, setCalculatorMode] = useState("SIP");
  const [monthlyAmount, setMonthlyAmount] = useState(10000);
  const [duration, setDuration] = useState(5);
  const [returnRate, setReturnRate] = useState(12);
  const [stepUp, setStepUp] = useState(0);
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
      : monthlyAmount * 12;
    const wealthGained = Math.max(projectedCorpus - totalInvested, 0);
    const maxPoint = Math.max(...points, totalInvested, 1);
    const chartPoints = points.map((value, index) => {
      const x = 36 + (index / (points.length - 1)) * 460;
      const y = 164 - (value / maxPoint) * 130;
      return `${x.toFixed(1)},${Math.max(24, Math.min(164, y)).toFixed(1)}`;
    });

    return {
      amountLabel: calculatorMode === "SIP" ? "Monthly Inv. Amount" : calculatorMode === "Lumpsum" ? "One-time Investment" : "Monthly Withdrawal",
      totalLabel: calculatorMode === "SWP" ? "Starting Corpus" : "Total Invested",
      totalInvested,
      projectedCorpus,
      wealthGained,
      chartLine: `M ${chartPoints.join(" L ")}`,
      chartArea: `M ${chartPoints.join(" L ")} L 496 168 L 36 168 Z`
    };
  }, [calculatorMode, duration, monthlyAmount, returnRate, stepUp]);

  return (
    <main>
      <nav className="topbar">
        <a className="brand" href="#home" aria-label="Moneze home" onClick={closeMenu}>
          <span className="brand-mark">M</span>
          <span>MONEZE</span>
        </a>
        <div className="nav-links" aria-label="Primary navigation">
          <a href="#app">App</a>
          <a href="#ai">AI Tools</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>
        <a className="start-link" href="https://www.moneze.in/CustomerAppPages/CustomerDashboardPage">Get Started</a>
        <button
          className="menu-button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          title="Menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu size={22} />
        </button>
      </nav>
      {menuOpen && (
        <div className="mobile-menu" aria-label="Mobile navigation">
          <a href="#app" onClick={closeMenu}>App</a>
          <a href="#ai" onClick={closeMenu}>AI Tools</a>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <a className="mobile-menu-cta" href="https://www.moneze.in/CustomerAppPages/CustomerDashboardPage" onClick={closeMenu}>Get Started</a>
        </div>
      )}

      <section id="home" className="hero">
        <div className="hero-copy-wrap">          <h1>Build wealth with smarter mutual fund investing.</h1>
          <p className="hero-copy">
            100% online investing with fund discovery, AI tools, goal planning, portfolio insights, and a clean mobile-first experience.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="https://www.moneze.in/CustomerAppPages/CustomerDashboardPage">
              Start Investing
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="proof-row" aria-label="Platform highlights">
            {highlights.map((point) => (
              <span key={point}><Check size={16} /> {point}</span>
            ))}
          </div>
        </div>
        <div className="hero-phone-card hero-product-card hero-dual-ui" aria-label="Moneze mobile app investment screens">
          <img className="hero-ui-front" src="/moneze-app-home-phone-clean.png" alt="Moneze mobile app portfolio home screen" />
          <img className="hero-ui-back" src="/moneze-app-ai-tools-phone-clean.png" alt="Moneze mobile app AI tools screen" />
        </div>
      </section>

      <section className="metrics" aria-label="Moneze app metrics">
        {stats.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
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
          <img src="/moneze-app-ai-tools-phone-clean.png" alt="Moneze AI tools mobile screen" />
        </div>
      </section>

      <section id="app" className="app-showcase">
        <div className="section-heading centered">
          <p className="eyebrow">Mobile Experience</p>
          <h2>A professional app-led website built around real Moneze screens.</h2>
          <p>Show investors the product before they sign up: home dashboard, screener, AI tools, investment cart, and account utilities.</p>
        </div>
        <div className="screen-grid">
          {appScreens.map((screen) => (
            <article className="screen-card" key={screen.title}>
              <div className="screen-image">
                <img src={screen.image} alt={`Moneze ${screen.title} app screen`} />
              </div>
              <div className="screen-copy">
                <h3>{screen.title}</h3>
                <p>{screen.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="calculator" className="wealth-section">
        <div className="wealth-heading">
          <div>
            <p className="eyebrow">Investment Calculator</p>
            <h2>Project Your <span>Wealth</span></h2>
          </div>
          <div className="wealth-tabs" role="tablist" aria-label="Investment calculator type">
            {["SIP", "Lumpsum", "SWP"].map((mode) => (
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
                <label htmlFor="amountRange">{calculatorData.amountLabel}</label>
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

            <div className="control-row compact">
              <label htmlFor="durationRange">Duration</label>
              <strong>{duration} <small>Years</small></strong>
            </div>
            <input
              id="durationRange"
              className="range-input"
              type="range"
              min="1"
              max="30"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />

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
          </div>

          <div className="calculator-results">
            <div className="result-card">
              <div>
                <span>{calculatorData.totalLabel}</span>
                <strong>{formatIndianCurrency(calculatorData.totalInvested)}</strong>
              </div>
              <div>
                <span>Wealth Gained</span>
                <strong className="gain">+{formatIndianCurrency(calculatorData.wealthGained).replace("Rs. ", "Rs. ")}</strong>
              </div>
              <h3>{formatIndianCurrency(calculatorData.projectedCorpus)}</h3>
              <p>{calculatorMode === "SWP" ? "Estimated Balance" : "Projected Corpus"}</p>
            </div>
            <div className="curve-card">
              <h3>Wealth Curve</h3>
              <div className="curve-chart" aria-label="Projected wealth curve">
                <svg viewBox="0 0 520 190" role="img">
                  <path d={calculatorData.chartLine} fill="none" stroke="#1559bf" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                  <path d={calculatorData.chartArea} fill="url(#wealthFill)" />
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
          <h2>Everything customers need to move from research to action.</h2>
        </div>
        <div className="feature-grid">
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
      </section>

      <section id="process" className="section process-section">
        <div className="section-heading">
          <p className="eyebrow">How It Works</p>
          <h2>A structured investment journey from fund discovery to portfolio tracking.</h2>
        </div>
        <div className="steps-grid">
          {process.map((step) => (
            <article className="flip-card" key={step.num} tabIndex="0" aria-label={`${step.title}: ${step.text}`}>
              <div className="flip-card-inner">
                <div className="flip-card-face flip-card-front">
                  <span>{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                <div className="flip-card-face flip-card-back">
                  <BadgeCheck size={26} />
                  <h3>{step.backTitle}</h3>
                  <p>{step.backText}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-copy">
          <p className="eyebrow">Trust & Utility</p>
          <h2>A clean platform experience for serious financial decisions.</h2>
          <p>
            Moneze presents fund exploration, AI assistance, KYC, reports, transactions, calculators, and portfolio analysis in a clear interface designed for confident customer action.
          </p>
        </div>
        <div className="assurance-list">
          <div><ShieldCheck size={20} /> KYC-ready customer workflows</div>
          <div><FileCheck2 size={20} /> Reports and transaction visibility</div>
          <div><LineChart size={20} /> Portfolio tracking and fund performance</div>
          <div><Sparkles size={20} /> AI-assisted investment tools</div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div>
          <p className="eyebrow">Start Now</p>
          <h2>Bring customers into a better investment experience.</h2>
          <p>Connect with Moneze for product access, onboarding support, and customer assistance.</p>
        </div>
        <div className="contact-card">
          <div className="contact-card-header">
            <span>Contact Moneze</span>
            <strong>We are ready to help</strong>
          </div>
          <div className="contact-methods">
            <a href="tel:+919972654330">
              <Phone size={19} />
              <span><small>Call support</small><strong>+91 99726 54330</strong></span>
            </a>
            <a href="mailto:service@moneze.in">
              <Mail size={19} />
              <span><small>Email us</small><strong>service@moneze.in</strong></span>
            </a>
          </div>
          <div className="contact-note">
            <span><WalletCards size={18} /> Mutual fund and portfolio platform</span>
            <span><Clock3 size={18} /> Digital access available 24/7</span>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-top">
          <p>(c) 2026 Moneze. All Rights Reserved</p>
          <div className="footer-socials" aria-label="Social links">
            <a href="#home">f</a>
            <a href="#home">in</a>
            <a href="#home">x</a>
            <a href="#home">YT</a>
            <a href="#home">wa</a>
          </div>
        </div>
        <div className="footer-line" />
        <div className="footer-details">
          <p><strong>Corporate Office:</strong> Moneze Financial Services, India</p>
          <p><strong>Email ID:</strong> service@moneze.in <span>|</span> <strong>Contact Us at:</strong> +91 99726 54330 <span>|</span> <strong>Whatsapp:</strong> +91 99726 54330</p>
        </div>
        <a className="back-top" href="#home" aria-label="Back to top">Top</a>
      </footer>
    </main>
  );
}

export default App;














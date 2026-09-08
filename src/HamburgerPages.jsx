import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, BookOpen, Check, ChevronDown, CircleDollarSign,
  FileCheck2, Goal, HeartHandshake, Home, Landmark, Mail, Menu, MessageCircle,
  PieChart, Search, ShieldCheck, Sparkles, Target, TrendingUp, UsersRound, WalletCards, X
} from "lucide-react";

const appUrl = "https://www.moneze.in/";
const menuLinks = [
  ["Home", "/"], ["Financial Planning", "/financial-planning"], ["Mutual Funds", "/mutual-funds"],
  ["Learn", "/learn"], ["About Moneze", "/about"], ["Contact", "/contact"]
];

const fallbackArticles = [
  { slug: "how-to-start-financial-planning", title: "How Do You Start Financial Planning?", excerpt: "A practical way to understand your finances, identify goals, and create a plan.", category: "Financial Planning", published_at: "2026-09-01", featured: true },
  { slug: "what-is-a-mutual-fund", title: "What Is a Mutual Fund?", excerpt: "Understand how mutual funds pool money, diversify investments, and follow defined objectives.", category: "Mutual Funds", published_at: "2026-08-28", featured: true },
  { slug: "sip-investing-explained", title: "How Does SIP Investing Work?", excerpt: "Learn how regular investing can support disciplined, long-term financial habits.", category: "SIP & Investing", published_at: "2026-08-24", featured: false }
];

function usePageMeta({ title, description, keywords, path, schema }) {
  useEffect(() => {
    document.title = title;
    const upsert = (selector, create, value) => {
      let element = document.head.querySelector(selector);
      if (!element) { element = document.createElement(create.tag); Object.entries(create.attrs).forEach(([key, item]) => element.setAttribute(key, item)); document.head.appendChild(element); }
      element.setAttribute(create.valueAttribute, value);
      return element;
    };
    upsert('meta[name="description"]', { tag: "meta", attrs: { name: "description" }, valueAttribute: "content" }, description);

    if (keywords) upsert('meta[name="keywords"]', { tag: "meta", attrs: { name: "keywords" }, valueAttribute: "content" }, keywords);
    const canonical = upsert('link[rel="canonical"]', { tag: "link", attrs: { rel: "canonical" }, valueAttribute: "href" }, `https://moneze-in.vercel.app${path}`);
    let script;
    if (schema) { script = document.createElement("script"); script.type = "application/ld+json"; script.dataset.monezePageSchema = "true"; script.textContent = JSON.stringify(schema); document.head.appendChild(script); }
    return () => { canonical.remove(); script?.remove(); };
  }, [title, description, keywords, path, schema]);
}

function PageHeader() {
  const [open, setOpen] = useState(false);
  return <>
    <header className="hub-header">
      <a href="/" aria-label="Moneze home"><img src="/moneze-logo.png" alt="Moneze" /></a>
      <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
    </header>
    {open && <div className="hub-menu" role="dialog" aria-modal="true" aria-label="Moneze navigation">
      <div className="hub-menu-inner"><p>EXPLORE MONEZE</p>{menuLinks.map(([label, href]) => <a key={label} href={href} className={window.location.pathname === href ? "active" : ""}>{label}<ArrowRight size={20} /></a>)}<a className="hub-menu-login" href={appUrl}>Login to Moneze App <ArrowRight size={20} /></a></div>
    </div>}
  </>;
}

function PageFooter() {
  return <footer className="hub-footer"><a href="/"><img src="/moneze-logo.png" alt="Moneze" /></a><p>Education first. Investment second.</p><div><a href="mailto:support@moneze.in">support@moneze.in</a><a href="tel:+919972654330">+91 99726 54330</a></div><small>© 2026 Moneze. All rights reserved.</small></footer>;
}

function PageShell({ children }) { return <main className="hub-page"><PageHeader />{children}<PageFooter /></main>; }
function ConsultationCta({ primary = "consultation" }) {
  return <div className="hub-cta-row">
    {primary === "app" ? <><a className="hub-btn hub-btn-primary" href={appUrl}>Explore Moneze App <ArrowRight size={18} /></a><a className="hub-btn hub-btn-secondary" href="/#consultation">Get Free Financial Consultation <ArrowRight size={18} /></a></> : <><a className="hub-btn hub-btn-primary" href="/#consultation">Get Free Financial Consultation <ArrowRight size={18} /></a><a className="hub-btn hub-btn-secondary" href={appUrl}>Explore Moneze App <ArrowRight size={18} /></a></>}
  </div>;
}
function SectionHeading({ eyebrow, title, children }) { return <div className="hub-section-heading">{eyebrow && <p>{eyebrow}</p>}<h2>{title}</h2>{children && <div>{children}</div>}</div>; }
function IconCards({ items }) { return <div className="hub-card-grid">{items.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon size={25} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>; }
function Faq({ items }) { return <div className="hub-faq">{items.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={20} /></summary><p>{answer}</p></details>)}</div>; }

const planningFaqs = [
  ["What is financial planning?", "Financial planning is the process of understanding your financial situation, identifying your goals and creating a structured plan for managing your money and investments."],
  ["Do I need to know my financial goals before booking a consultation?", "No. You can start even if you're unsure about your goals. During the planning process, we help you identify and prioritize goals based on your financial situation and priorities."],
  ["Is financial planning only about investing?", "No. A complete financial plan can also consider cash flow, emergency savings, insurance, financial goals, risk and existing investments."],
  ["Will Moneze recommend mutual funds?", "Where appropriate, mutual fund investments can form part of your personalized investment strategy. Recommendations are based on your financial situation, goals, risk profile and investment horizon."],
  ["Do I have to invest after the consultation?", "No. The purpose of the consultation is to help you understand your financial situation and plan. You can decide whether you want to proceed with the investment recommendations."],
  ["Can I invest directly through the Moneze App?", "Yes. Customers can also use the Moneze App to explore mutual funds, SIPs, goals, portfolio information and other investment tools."],
  ["Is financial planning a one-time activity?", "Your financial plan should evolve as your circumstances and goals change. Moneze's ongoing approach includes portfolio reviews and rebalancing where appropriate."]
];

export function FinancialPlanningPage() {
  const schema = useMemo(() => ({ "@context": "https://schema.org", "@graph": [
    { "@type": "Service", name: "Personalized Financial Planning", serviceType: "Financial planning and investment planning", areaServed: { "@type": "AdministrativeArea", name: "Kerala" }, provider: { "@type": "Organization", name: "Moneze", url: "https://moneze-in.vercel.app/" }, url: "https://moneze-in.vercel.app/financial-planning", description: "Personalized financial planning, goal-based investment planning and mutual fund guidance designed around your financial situation, goals and risk profile." },
    { "@type": "FAQPage", mainEntity: planningFaqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }
  ] }), []);
  usePageMeta({
    title: "Financial Planning Kerala | Personalized Investment Planning | Moneze",
    description: "Explore financial planning in Kerala with Moneze: personalized financial planning, goal-based investment planning and mutual fund guidance built around your finances and risk profile.",
    keywords: "financial planning Kerala, financial planning in Kerala, personalized financial planning, personal financial planning, financial planning services Kerala, financial plan Kerala, goal based financial planning, financial planning and investment, investment planning Kerala, investment planning, personalized investment planning, mutual fund investment planning, investment advisor Kerala, mutual fund investment Kerala, mutual funds Kerala, mutual fund SIP Kerala, SIP investment Kerala, SIP investment planning, financial goal planning, goal based investing, goal based investment planning, financial goals planning, goal based mutual fund investment",
    path: "/financial-planning",
    schema
  });
  const planCards = [
    { icon: WalletCards, title: "Your Financial Position", text: "Income, expenses, savings, assets, liabilities, and existing investments." },
    { icon: Goal, title: "Your Financial Goals", text: "Turn important life goals into measurable financial targets." },
    { icon: BarChart3, title: "Your Risk Profile", text: "Understand how risk, time horizon, and goals influence your approach." },
    { icon: ShieldCheck, title: "Your Protection", text: "Consider health insurance and term insurance as part of your overall financial protection." },
    { icon: PieChart, title: "Your Investment Strategy", text: "Build an investment strategy around your goals and risk profile." },
    { icon: TrendingUp, title: "Your Future Progress", text: "Review your portfolio and financial progress over time." }
  ];
  const journey = [
    ["01", "Understand Your Finances", "Income, expenses, EMIs, savings, investments, insurance, and commitments."],
    ["02", "Identify Your Goals", "Clarify and prioritize what you want your money to achieve."],
    ["03", "Understand Your Risk Profile", "Connect risk, time horizon, and goals to an appropriate approach."],
    ["04", "Build Your Financial Plan", "Bring your position, goals, capacity, asset allocation, and strategy together."],
    ["05", "One-to-One Discussion", "Understand why the plan, approach, investment amount, and horizon were selected."],
    ["06", "Invest With Confidence", "Proceed through Moneze only after you understand and accept the plan."],
    ["07", "Review & Rebalance", "Review progress as your income, goals, and circumstances change."]
  ];
  return <PageShell>
    <section className="hub-hero planning-hero"><div><p className="hub-eyebrow">PERSONALIZED FINANCIAL PLANNING</p><h1>A Financial Plan Built Around Your Life.</h1><p>Your income, expenses, goals, responsibilities, and priorities are unique. Your financial plan should be too. Moneze helps you understand your current financial position, identify what you want your money to achieve and create a personalized financial plan designed around your goals and risk profile.</p><ConsultationCta /><small>No investment decision is required to start a consultation.</small></div><div className="plan-visual"><span>YOUR PLAN</span>{["Financial position", "Goals", "Risk profile", "Protection", "Investment strategy"].map((item) => <div key={item}><Check size={17} />{item}</div>)}</div></section>
    <section className="hub-section hub-problem"><SectionHeading eyebrow="START WITH THE WHY" title="Financial Planning Is More Than Choosing an Investment."><p>Instead of starting with “Which mutual fund should I invest in?”, begin with “What am I trying to achieve with my money?”</p></SectionHeading><div className="planning-equation">{["Income", "Expenses", "Savings", "Insurance", "Existing investments", "Goals", "Risk profile"].map((item) => <span key={item}>{item}</span>)}<strong>Personalized financial plan</strong></div></section>
    <section className="hub-section hub-tint"><SectionHeading eyebrow="THE COMPLETE PICTURE" title="What Is Personalized Financial Planning?"><p>It is the process of understanding your complete financial situation and creating a structured plan around personal goals.</p></SectionHeading><IconCards items={planCards} /></section>
    <section className="hub-section hub-highlight planning-answers"><div>
      <header className="planning-answers-heading"><p className="hub-eyebrow">START WITHOUT ALL THE ANSWERS</p><h2>You Don&apos;t Need to Know Your Financial Goals Before You Start.</h2></header>
      <div className="planning-answers-grid">
        <div className="planning-goals"><p>Sometimes you know you want to:</p><ul><li>Build wealth</li><li>Prepare for retirement</li><li>Fund your child&apos;s education</li><li>Buy a home</li><li>Build financial security</li></ul><p>…but you don&apos;t know how much you need, when you need it or how to plan for it.</p></div>
        <div className="planning-guidance"><p>That&apos;s okay.</p><p>You don&apos;t have to arrive with a complete financial plan.</p><p>During the planning process, we help you understand your current financial position and identify meaningful financial goals based on your priorities and available surplus.</p></div>
      </div>
      <div className="planning-answers-action"><strong className="planning-answers-highlight">You bring your questions. We help you build the plan.</strong><div className="hub-cta-row"><a className="hub-btn hub-btn-primary planning-answers-cta" href="/#consultation">Get Free Financial Consultation <ArrowRight size={18} /></a></div></div>
    </div></section>
    <section className="hub-section"><SectionHeading eyebrow="THE MONEZE ADVISOR JOURNEY" title="How Your Financial Planning Journey Works"><p>A clear process designed to move from uncertainty to a financial plan you understand.</p></SectionHeading><div className="hub-timeline">{journey.map(([num, title, text]) => <article key={num}><span>{num}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>
    <section className="hub-section hub-tint"><SectionHeading title="One Plan. Multiple Parts of Your Financial Life." /><IconCards items={[
      { icon: CircleDollarSign, title: "Cash Flow", text: "Understand income, expenses, and available surplus." },
      { icon: ShieldCheck, title: "Wealth Protection", text: "Consider health insurance and term insurance as part of your overall financial protection." },
      { icon: Target, title: "Financial Goals", text: "Turn important life goals into measurable financial targets." },
      { icon: TrendingUp, title: "Investment Planning", text: "Build an investment strategy around your goals and risk profile." },
      { icon: PieChart, title: "Mutual Fund Portfolio", text: "Explore suitable mutual fund investment options aligned with your plan." },
      { icon: Sparkles, title: "Ongoing Review", text: "Review your portfolio and financial progress over time." }
    ]} /></section>
    <section className="hub-section hub-education">
      <p className="hub-eyebrow">EDUCATION FIRST</p>
      <h2>Understand Before You Invest.</h2>
      <div className="hub-education-belief"><p>We believe investing should not begin with a product.</p><p>It should begin with understanding.</p></div>
      <p className="hub-education-intro">Before making an investment decision, you should understand:</p>
      <div className="hub-education-grid">
        {["Why you’re investing.", "What you’re investing for.", "How much you may need to invest.", "How long you may need to stay invested.", "What risks you may take.", "How the investment fits into your overall financial plan."].map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>)}
      </div>
      <strong>Education First. Investment Second.</strong>
    </section>
    <section className="hub-section hub-split"><div><SectionHeading eyebrow="MONEZE + MUTUAL FUNDS" title="From Financial Plan to Mutual Fund Portfolio"><p>We help you understand and build a mutual fund investment strategy aligned with your financial plan—not chase a generic “best fund.”</p></SectionHeading><ConsultationCta /></div><div className="purpose-list">{["Financial goals", "Investment horizon", "Risk profile", "Available monthly surplus", "Existing investments", "Asset allocation", "Required investment amount"].map((item) => <span key={item}><Check size={17} />{item}</span>)}</div></section>
    <section className="hub-section hub-tint"><SectionHeading title="Financial Planning for Every Stage of Life" /><div className="hub-stage-grid">{[
      ["Starting Your Investment Journey", "Not sure where to begin?"],
      ["Growing Your Wealth", "Already investing but don’t know whether your investments are aligned with your goals?"],
      ["Planning for Your Family", "Preparing for children’s education, home purchase or other family goals?"],
      ["Preparing for Retirement", "Want to understand how much you may need and how to prepare?"],
      ["Building Financial Security", "Want to strengthen your emergency fund, insurance and investment strategy?"]
    ].map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div><div className="hub-cta-row hub-stage-cta"><a className="hub-btn hub-btn-primary" href="/#consultation">Get Free Financial Consultation <ArrowRight size={18} /></a></div></section>
    <section className="hub-section"><SectionHeading eyebrow="FAQ" title="Frequently Asked Questions About Financial Planning" /><Faq items={planningFaqs} /></section>
    <section className="hub-final"><h2>Don’t Just Invest. Have a Plan.</h2><p>Start by understanding where you are today and where you want your money to take you.</p><ConsultationCta /><small>No obligation to invest.</small></section>
  </PageShell>;
}

const mutualFaqs = [
  ["What is a mutual fund?", "A mutual fund pools money from multiple investors and invests it according to a defined objective and strategy."],
  ["Is mutual fund investing safe?", "Mutual funds are market-linked and involve risk. Different funds have different risk characteristics, which you should understand before investing."],
  ["What is a SIP?", "A Systematic Investment Plan allows you to invest a predetermined amount regularly into a mutual fund."],
  ["Is SIP better than lump-sum investing?", "Neither is automatically better for everyone. The appropriate approach depends on your finances, objective, time horizon, and risk profile."],
  ["How do I choose a mutual fund?", "Consider your goal, time horizon, risk profile, investment capacity, and existing portfolio before choosing."],
  ["Can Moneze help me choose mutual funds?", "Moneze can provide personalized guidance based on your financial situation, goals, and risk profile."],
  ["Do I need a consultation before investing?", "No. You can invest independently through the Moneze App or book a consultation if you want personalized guidance."]
];

export function MutualFundsPage() {
  const schema = useMemo(() => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: mutualFaqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }), []);
  usePageMeta({ title: "Mutual Fund Investment in Kerala | SIP & Investment Planning | Moneze", description: "Explore mutual fund investment in Kerala with Moneze. Understand mutual funds, SIPs, goal-based investing, portfolio planning, and personalized guidance.", path: "/mutual-funds", schema });
  return <PageShell>
    <section className="hub-hero mutual-hero"><div><p className="hub-eyebrow">MUTUAL FUND INVESTING</p><h1>Invest in Mutual Funds With a Plan.</h1><p>Mutual funds can be a powerful way to participate in the market, but choosing an investment should start with your goals, time horizon, and risk—not simply picking a fund.</p><ConsultationCta primary="app" /><small>Education First. Investment Second.</small></div><div className="goal-path"><span>Goal</span><ArrowRight /><span>Investment</span><ArrowRight /><span>Growth</span><ArrowRight /><span>Goal</span></div></section>
    <section className="hub-section"><SectionHeading title="What Is a Mutual Fund?"><p>A mutual fund pools money from multiple investors and invests in a portfolio of securities according to its stated investment objective.</p></SectionHeading><IconCards items={[
      { icon: PieChart, title: "Diversification", text: "Your money can be spread across multiple securities within a fund." },
      { icon: UsersRound, title: "Professional Management", text: "The fund is managed according to a defined objective and strategy." },
      { icon: BarChart3, title: "Different Options", text: "Categories and strategies are available across different risk levels." }
    ]} /><p className="hub-risk-note">Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing.</p></section>
    <section className="hub-section hub-tint"><SectionHeading title="Why Consider Mutual Funds?" /><IconCards items={[
      { icon: TrendingUp, title: "Wealth Creation", text: "Invest for long-term financial growth." }, { icon: Target, title: "Goal Planning", text: "Build investments around specific financial goals." },
      { icon: Sparkles, title: "SIP Investing", text: "Invest a fixed amount regularly instead of relying on one-time investments." }, { icon: PieChart, title: "Diversification", text: "Spread investments across a portfolio rather than relying on a single security." },
      { icon: WalletCards, title: "Flexibility", text: "Choose investment approaches based on your financial situation and objectives." }
    ]} /></section>
    <section className="hub-section hub-split sip-block"><div><p className="hub-eyebrow">SYSTEMATIC INVESTMENT PLAN</p><h2>Start Small. Invest Consistently.</h2><p>A SIP lets you invest a predetermined amount at regular intervals and can help turn investing into a disciplined habit.</p><ConsultationCta primary="app" /></div><div className="vertical-flow">{["Monthly income", "Monthly surplus", "SIP", "Long-term investment", "Financial goal"].map((item) => <span key={item}>{item}</span>)}<a className="hub-btn hub-btn-primary sip-calculator-cta" href="/#calculator">Calculate your SIP <ArrowRight size={18} /></a></div></section>
    <section className="hub-section hub-tint hub-split"><div><SectionHeading title="Investing Doesn’t Always Have to Be Monthly."><p>A lump sum may also be invested according to your financial plan. The approach depends on goals, horizon, existing investments, and risk profile.</p></SectionHeading><a className="hub-btn hub-btn-primary" href={appUrl}>Explore Moneze App <ArrowRight size={18} /></a></div><div className="lumpsum-visual"><CircleDollarSign size={60} /><strong>One amount</strong><span>A plan-aligned investment approach</span></div></section>
    <section className="hub-section hub-highlight mutual-choice-section">
      <SectionHeading eyebrow="DON’T CHOOSE A FUND FIRST" title="The Best Mutual Fund Isn’t the Same for Everyone."><p>A fund that may be appropriate for one investor may not be appropriate for another.</p><p className="mutual-choice-intro">Before choosing a mutual fund, consider:</p></SectionHeading>
      <div className="mutual-choice-grid">{[
        [Goal, "Your Goal", "What are you investing for?"],
        [Target, "Your Time Horizon", "When will you need the money?"],
        [BarChart3, "Your Risk Profile", "How much investment volatility can you reasonably accept?"],
        [WalletCards, "Your Investment Capacity", "How much can you invest without affecting your financial commitments?"],
        [PieChart, "Your Existing Portfolio", "How does a new investment fit with what you already own?"]
      ].map(([Icon, title, text]) => <article key={title}><span><Icon size={23} /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      <div className="mutual-choice-highlight"><p>The right question isn&apos;t “Which fund is best?”</p><strong>It&apos;s “Which investment approach is appropriate for my financial plan?”</strong></div>
    </section>
    <section className="hub-section"><SectionHeading title="Your Mutual Funds Should Have a Purpose." /><div className="hub-stage-grid">{[
      ["Retirement", "Long-term investment strategy."],
      ["Child’s Education", "Invest toward a future education requirement."],
      ["Home Purchase", "Plan investments around your expected purchase timeline."],
      ["Wealth Creation", "Build long-term wealth based on your financial capacity and objectives."],
      ["Emergency Fund", "Maintain appropriate liquidity separately from long-term investments."]
    ].map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div><p className="mutual-purpose-closing">Instead of asking “Where should I invest?”, start with “What am I investing for?”</p><ConsultationCta /></section>
    <section className="hub-section hub-tint"><SectionHeading title="Understand the Different Types of Mutual Funds"><p>Mutual funds differ in what they invest in, their investment objectives and the level of risk involved.</p><p>The page can introduce categories at a high level without overwhelming the customer.</p></SectionHeading><IconCards items={[
      { icon: TrendingUp, title: "Equity Funds", text: "Primarily invest in equities and are generally associated with higher market risk and long-term investment horizons." },
      { icon: Landmark, title: "Debt Funds", text: "Primarily invest in fixed-income securities and have different risk and return characteristics from equity funds." },
      { icon: PieChart, title: "Hybrid Funds", text: "Combine different asset classes according to the fund's investment strategy." },
      { icon: BarChart3, title: "Index Funds", text: "Seek to track the performance of a particular market index." },
      { icon: Sparkles, title: "Other Categories", text: "Other categories are available for different investment objectives." }
    ]} /><a className="hub-btn hub-btn-primary hub-centered-btn" href={appUrl}>Explore Mutual Funds in Moneze App <ArrowRight size={18} /></a></section>
    <section className="hub-section"><SectionHeading title="From Understanding to Investing" /><div className="hub-option-grid"><article><span>OPTION 01</span><h3>Invest on Your Own</h3><p>Explore and compare funds, start SIPs, track your portfolio, plan goals, use calculators, and access AI tools.</p><a href={appUrl}>Explore Moneze App <ArrowRight size={17} /></a></article><article><span>OPTION 02</span><h3>Get Personalized Guidance</h3><p>Start with your finances, goals, risk profile, and investment capacity before discussing suitable options.</p><a href="/#consultation">Get Free Financial Consultation <ArrowRight size={17} /></a></article></div></section>
    <section className="hub-section hub-tint"><SectionHeading title="A Simpler Way to Approach Mutual Fund Investing" /><div className="hub-invest-journey">{[
      ["Understand", "Learn how mutual funds work."],
      ["Plan", "Connect investments to your financial goals."],
      ["Choose", "Explore mutual funds based on your investment approach."],
      ["Invest", "Invest through the Moneze platform."],
      ["Track", "Monitor your portfolio and investment progress."],
      ["Review", "Review your portfolio and make changes when appropriate."]
    ].map(([title, text], index) => <article key={title}><b>{String(index + 1).padStart(2, "0")}</b><h3>{title}</h3><p>{text}</p></article>)}</div><p className="hub-invest-review-note">Moneze&apos;s ongoing model includes annual portfolio reviews and rebalancing where appropriate.</p></section>
    <section className="hub-section"><SectionHeading title="Built for a Simple and Transparent Investing Experience" /><IconCards items={[
      { icon: Landmark, title: "ONDC-Enabled Investment Infrastructure", text: "Digital investment infrastructure designed to support mutual fund investing." },
      { icon: HeartHandshake, title: "Partnered With Leading Asset Management Companies", text: "Access mutual fund investment options from leading AMCs through the Moneze platform." },
      { icon: ShieldCheck, title: "Secure KYC & Transactions", text: "Complete KYC and manage investment transactions through a structured digital process." },
      { icon: BarChart3, title: "Portfolio Tracking & Analysis", text: "Track your investment value, returns and portfolio performance in one place." }
    ]} /></section>
    <section className="hub-section hub-education"><p className="hub-eyebrow">MONEZE DIGITAL TOOLS</p><h2>Research Before You Invest.</h2><p>Compare funds, ask Mutual Fund GPT, and analyse your portfolio using tools inside the Moneze ecosystem.</p><a className="hub-btn hub-btn-light" href={appUrl}>Explore Moneze App <ArrowRight size={18} /></a></section>
    <section className="hub-section"><SectionHeading eyebrow="FAQ" title="Frequently Asked Questions About Mutual Funds" /><Faq items={mutualFaqs} /></section>
    <section className="hub-final"><h2>Don’t Just Pick a Mutual Fund. Invest With a Purpose.</h2><p>Understand your options, connect investments to your goals, and choose the approach that works for you.</p><ConsultationCta primary="app" /><small>Education First. Investment Second.</small></section>
  </PageShell>;
}

const categories = ["Personal Finance", "Mutual Funds", "SIP & Investing", "Financial Planning", "Wealth Protection", "Investing Basics"];
export function LearnPage() {
  const [articles, setArticles] = useState(fallbackArticles);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  usePageMeta({ title: "Learn Personal Finance & Investing | Moneze", description: "Clear, practical education about personal finance, mutual funds, SIP investing, financial planning, wealth protection, and investing basics.", path: "/learn" });
  useEffect(() => { fetch("/api/articles").then((response) => response.ok ? response.json() : Promise.reject()).then((payload) => payload.articles?.length && setArticles(payload.articles)).catch(() => {}); }, []);
  const filtered = articles.filter((article) => (category === "All" || article.category === category) && `${article.title} ${article.excerpt}`.toLowerCase().includes(query.toLowerCase()));
  const ArticleGrid = ({ items }) => <div className="article-grid">{items.map((article)=><article key={article.slug} className={article.featured ? "featured" : ""}><span>{article.category}</span><h2>{article.title}</h2><p>{article.excerpt}</p><a href={`/learn/${article.slug}`}>Read article <ArrowRight size={17}/></a></article>)}</div>;
  return <PageShell><section className="learn-hero"><p className="hub-eyebrow">MONEZE LEARN</p><h1>Learn Personal Finance & Investing</h1><p>Clear answers and practical education to help you understand before you invest.</p><label><Search size={20} /><input type="search" placeholder="Search articles" value={query} onChange={(event)=>setQuery(event.target.value)} /></label></section><section className="hub-section learn-content"><div className="learn-categories"><button className={category === "All" ? "active" : ""} onClick={()=>setCategory("All")}>All topics</button>{categories.map((item)=><button className={category === item ? "active" : ""} key={item} onClick={()=>setCategory(item)}>{item}</button>)}</div>{category === "All" && !query ? <><SectionHeading eyebrow="FEATURED ARTICLES" title="Start with the essentials." /><ArticleGrid items={articles.filter((article)=>article.featured)} /><div className="learn-section-break"><SectionHeading eyebrow="LATEST ARTICLES" title="Recently published" /><ArticleGrid items={articles.slice(0,6)} /></div>{categories.map((item)=>{const categoryArticles=articles.filter((article)=>article.category===item);return categoryArticles.length?<div className="learn-section-break" key={item}><SectionHeading eyebrow="ARTICLES BY CATEGORY" title={item}/><ArticleGrid items={categoryArticles.slice(0,3)}/></div>:null;})}</> : <><SectionHeading eyebrow={category === "All" ? "SEARCH RESULTS" : category.toUpperCase()} title={category === "All" ? "Articles matching your search" : `Articles about ${category}`} /><ArticleGrid items={filtered} /></>}{!filtered.length && <p className="learn-empty">No articles match your search yet.</p>}</section></PageShell>;
}

function ArticleContent({ content }) {
  return content.split(/\n+/).filter(Boolean).map((line,index) => {
    if (line.startsWith("### ")) return <h3 key={index}>{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={index}>{line.slice(3)}</h2>;
    return <p key={index}>{line}</p>;
  });
}

export function ArticlePage({ slug }) {
  const [article, setArticle] = useState(fallbackArticles.find((item)=>item.slug===slug));
  useEffect(() => { fetch(`/api/articles?slug=${encodeURIComponent(slug)}`).then((response)=>response.ok?response.json():Promise.reject()).then((payload)=>payload.articles?.[0]&&setArticle(payload.articles[0])).catch(()=>{}); }, [slug]);
  usePageMeta({ title: article?.meta_title || (article ? `${article.title} | Moneze Learn` : "Article | Moneze Learn"), description: article?.meta_description || article?.excerpt || "Learn about personal finance and investing with Moneze.", path: `/learn/${slug}`, schema: article ? { "@context":"https://schema.org", "@type":"Article", headline:article.title, description:article.excerpt, datePublished:article.published_at, publisher:{"@type":"Organization",name:"Moneze"} } : undefined });
  if (!article) return <PageShell><section className="hub-section article-page"><p className="hub-eyebrow">MONEZE LEARN</p><h1>Article not found</h1><a className="hub-btn hub-btn-primary" href="/learn">Browse all articles</a></section></PageShell>;
  const content = article.content || `${article.excerpt}\n\nFinancial decisions become clearer when you begin with your current situation, define what you want to achieve, and understand the risks involved. Use this article as an educational starting point and consider personalized guidance when your situation requires it.`;
  return <PageShell><article className="article-page"><nav aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/learn">Learn</a><span>/</span><span>{article.category}</span></nav><p className="hub-eyebrow">{article.category}</p><h1>{article.title}</h1><p className="article-lead">{article.excerpt}</p><div className="article-body"><ArticleContent content={content} /></div><aside><h2>Ready to connect learning with a plan?</h2><ConsultationCta /></aside></article></PageShell>;
}

export function AboutPage() {
  usePageMeta({ title: "About Moneze | Financial Planning & Mutual Fund Investing", description: "Learn how Moneze combines financial education, advisor-led planning, and digital mutual fund tools.", path: "/about" });
  return <PageShell><section className="hub-hero about-hero"><div><p className="hub-eyebrow">ABOUT MONEZE</p><h1>Clarity Before Every Financial Decision.</h1><p>Moneze brings education, personalized financial planning, and digital mutual fund tools together so customers can move from uncertainty to informed action.</p><ConsultationCta /></div><div className="about-mark"><Sparkles size={54}/><strong>Education first.</strong><span>Investment second.</span></div></section><section className="hub-section"><SectionHeading title="Two Ways to Move Forward" /><div className="hub-option-grid"><article><span>GUIDED</span><h3>Plan With an Advisor</h3><p>Understand your finances, define your goals, review your risk profile, and discuss a personalized plan.</p><a href="/#consultation">Get Free Consultation <ArrowRight size={17}/></a></article><article><span>INDEPENDENT</span><h3>Invest Through the App</h3><p>Explore mutual funds, compare options, use AI tools and calculators, and track your portfolio.</p><a href={appUrl}>Explore Moneze App <ArrowRight size={17}/></a></article></div></section><section className="hub-section hub-tint"><SectionHeading title="What Guides Us" /><IconCards items={[{icon:BookOpen,title:"Clear Education",text:"Explain financial concepts in language customers can understand."},{icon:Target,title:"Purpose-Led Planning",text:"Connect financial decisions to goals and real-life priorities."},{icon:ShieldCheck,title:"Responsible Guidance",text:"Help customers understand approach, horizon, and risk before acting."},{icon:TrendingUp,title:"Ongoing Progress",text:"Support portfolio visibility, reviews, and long-term financial progress."}]}/></section></PageShell>;
}

export function ContactPage() {
  usePageMeta({ title: "Contact Moneze | Financial Planning Support", description: "Contact Moneze for financial planning consultations, mutual fund platform support, and customer assistance.", path: "/contact" });
  return <PageShell><section className="contact-page-hero"><p className="hub-eyebrow">CONTACT MONEZE</p><h1>How Can We Help?</h1><p>Connect with us for personalized financial planning, Moneze App access, onboarding, or customer support.</p></section><section className="hub-section contact-page-grid"><a href="tel:+919972654330"><PhoneIcon/><span>Call support</span><strong>+91 99726 54330</strong></a><a href="mailto:support@moneze.in"><Mail size={28}/><span>Email us</span><strong>support@moneze.in</strong></a><a href="https://wa.me/919972654330"><MessageCircle size={28}/><span>WhatsApp</span><strong>Chat with Moneze</strong></a></section><section className="hub-section hub-tint contact-consult"><div><h2>Looking for personalized financial guidance?</h2><p>Start with a free, no-obligation consultation.</p></div><a className="hub-btn hub-btn-primary" href="/#consultation">Get Free Financial Consultation <ArrowRight size={18}/></a></section></PageShell>;
}

function PhoneIcon() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92z"/></svg>; }

export function HamburgerRoute() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/financial-planning") return <FinancialPlanningPage />;
  if (path === "/mutual-funds") return <MutualFundsPage />;
  if (path === "/learn") return <LearnPage />;
  if (path.startsWith("/learn/")) return <ArticlePage slug={decodeURIComponent(path.slice(7))} />;
  if (path === "/about") return <AboutPage />;
  if (path === "/contact") return <ContactPage />;
  return null;
}

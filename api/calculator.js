import { sendJson } from "../lib/emailOtp.js";

const MODES = new Set(["SIP", "Lumpsum", "SWP", "SIP & SWP"]);

function numberInRange(value, minimum, maximum) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}

function calculate({ mode, monthlyAmount, duration, returnRate, stepUp, currentAge, sipEndAge, lumpsumAmount, monthlyWithdrawal, withdrawalIncrease, withdrawalReturn }) {
  const months = duration * 12;
  const monthlyRate = returnRate / 100 / 12;
  const points = Array.from({ length: 13 }, (_, index) => {
    const elapsedMonths = Math.max(1, Math.round((months / 12) * index));
    const elapsedYears = elapsedMonths / 12;
    let value = 0;

    if (mode === "SIP") {
      for (let month = 1; month <= elapsedMonths; month += 1) {
        const year = Math.floor((month - 1) / 12);
        value = (value + monthlyAmount * ((1 + stepUp / 100) ** year)) * (1 + monthlyRate);
      }
    } else if (mode === "SIP & SWP") {
      const investmentMonths = Math.max((sipEndAge - currentAge) * 12, 12);
      const sampleMonths = Math.max(1, Math.round((investmentMonths / 12) * index));
      for (let month = 1; month <= sampleMonths; month += 1) {
        const year = Math.floor((month - 1) / 12);
        value = (value + monthlyAmount * ((1 + stepUp / 100) ** year)) * (1 + monthlyRate);
      }
      value += lumpsumAmount * ((1 + returnRate / 100) ** (sampleMonths / 12));
    } else if (mode === "Lumpsum") {
      value = monthlyAmount * 12 * ((1 + returnRate / 100) ** elapsedYears);
    } else {
      const startingCorpus = monthlyAmount * 120;
      const withdrawn = monthlyAmount * elapsedMonths * 0.42;
      value = Math.max(startingCorpus - withdrawn, 0) * ((1 + returnRate / 100) ** Math.max(elapsedYears / 2, 0.2));
    }

    return value;
  });

  const projectedCorpus = points.at(-1) || 0;
  const totalInvested = mode === "SIP"
    ? Array.from({ length: months }, (_, index) => monthlyAmount * ((1 + stepUp / 100) ** Math.floor(index / 12))).reduce((sum, value) => sum + value, 0)
    : mode === "SIP & SWP"
      ? Array.from({ length: Math.max((sipEndAge - currentAge) * 12, 12) }, (_, index) => monthlyAmount * ((1 + stepUp / 100) ** Math.floor(index / 12))).reduce((sum, value) => sum + value, lumpsumAmount)
      : monthlyAmount * 12;
  const wealthGained = Math.max(projectedCorpus - totalInvested, 0);
  const maxPoint = Math.max(...points, totalInvested, 1);
  const chartPoints = points.map((value, index) => {
    const x = 36 + (index / (points.length - 1)) * 460;
    const y = 164 - (value / maxPoint) * 130;
    return `${x.toFixed(1)},${Math.max(24, Math.min(164, y)).toFixed(1)}`;
  });

  if (mode === "SIP & SWP") {
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
    amountLabel: mode === "SIP" ? "Monthly Inv. Amount" : mode === "Lumpsum" ? "One-time Investment" : "Monthly Withdrawal",
    totalLabel: mode === "SWP" ? "Starting Corpus" : "Total Invested",
    secondaryLabel: "Wealth Gained",
    totalInvested,
    projectedCorpus,
    wealthGained,
    resultLabel: mode === "SWP" ? "Estimated Balance" : "Projected Corpus",
    chartLine: `M ${chartPoints.join(" L ")}`,
    chartArea: `M ${chartPoints.join(" L ")} L 496 168 L 36 168 Z`
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { message: "Method not allowed." });
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
  const mode = typeof body.mode === "string" && MODES.has(body.mode) ? body.mode : null;
  const monthlyAmount = numberInRange(body.monthlyAmount, 1000, 100000);
  const duration = numberInRange(body.duration, 1, 30);
  const returnRate = numberInRange(body.returnRate, 1, 30);
  const stepUp = numberInRange(body.stepUp, 0, 25);
  const currentAge = numberInRange(body.currentAge, 18, 70);
  const sipEndAge = numberInRange(body.sipEndAge, 19, 80);
  const lumpsumAmount = numberInRange(body.lumpsumAmount, 10000, 2000000);
  const monthlyWithdrawal = numberInRange(body.monthlyWithdrawal, 10000, 5000000);
  const withdrawalIncrease = numberInRange(body.withdrawalIncrease, 0, 20);
  const withdrawalReturn = numberInRange(body.withdrawalReturn, 1, 20);

  const combinedInputsInvalid = mode === "SIP & SWP" && (currentAge === null || sipEndAge === null || sipEndAge <= currentAge || lumpsumAmount === null || monthlyWithdrawal === null || withdrawalIncrease === null || withdrawalReturn === null);
  if (!mode || monthlyAmount === null || duration === null || returnRate === null || stepUp === null || combinedInputsInvalid) {
    return sendJson(response, 400, { message: "Invalid calculator inputs." });
  }

  response.setHeader("Cache-Control", "no-store");
  return sendJson(response, 200, { result: calculate({ mode, monthlyAmount, duration, returnRate, stepUp, currentAge, sipEndAge, lumpsumAmount, monthlyWithdrawal, withdrawalIncrease, withdrawalReturn }) });
}

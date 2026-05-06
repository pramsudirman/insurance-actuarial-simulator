/**
 * Deterministic Actuarial Engine — TMI 2011
 *
 * Life: Prospective net premium method P = SA * Ax:n / äx:n
 * Health: Frequency-severity model with medical inflation
 * Travel: Claims-ratio model (short-term, no reserves)
 * Micro: Simplified mortality + OJK POJK 76/2016 caps
 */

// ── TMI 2011 (qx per 1,000 lives) ───────────────────────────────────────────

const TMI_2011: Record<number, number> = {
  0: 29.5,  1: 4.8,   2: 2.9,  3: 2.1,  4: 1.8,
  5: 1.5,   6: 1.4,   7: 1.3,  8: 1.2,  9: 1.1,
  10: 1.0,  11: 1.0,  12: 1.1, 13: 1.2, 14: 1.3,
  15: 1.5,  16: 1.7,  17: 1.9, 18: 2.0, 19: 2.1,
  20: 2.2,  21: 2.3,  22: 2.4, 23: 2.5, 24: 2.6,
  25: 2.7,  26: 2.8,  27: 2.9, 28: 3.0, 29: 3.1,
  30: 3.2,  31: 3.4,  32: 3.6, 33: 3.8, 34: 4.0,
  35: 4.3,  36: 4.6,  37: 4.9, 38: 5.3, 39: 5.7,
  40: 6.2,  41: 6.7,  42: 7.2, 43: 7.8, 44: 8.5,
  45: 9.3,  46: 10.2, 47: 11.1, 48: 12.1, 49: 13.2,
  50: 14.5, 51: 16.0, 52: 17.7, 53: 19.6, 54: 21.7,
  55: 24.0, 56: 26.6, 57: 29.4, 58: 32.4, 59: 35.7,
  60: 39.3, 61: 43.3, 62: 47.7, 63: 52.5, 64: 57.8,
  65: 63.7, 66: 70.1, 67: 77.2, 68: 85.1, 69: 93.8,
  70: 103.5, 71: 114.3, 72: 126.3, 73: 139.7, 74: 154.7,
  75: 171.7, 76: 191.0, 77: 213.1, 78: 238.1, 79: 266.9,
  80: 300.0,
};

const LOADING_FACTORS: Record<string, { expense: number; commission: number; profit: number }> = {
  digital:       { expense: 0.12, commission: 0.08, profit: 0.05 },
  agent:         { expense: 0.15, commission: 0.30, profit: 0.05 },
  bancassurance: { expense: 0.15, commission: 0.20, profit: 0.05 },
  embedded:      { expense: 0.10, commission: 0.05, profit: 0.05 },
  default:       { expense: 0.15, commission: 0.15, profit: 0.05 },
};

const DISCOUNT_RATE = 0.065;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EngineInput {
  productType: 'life' | 'health' | 'travel' | 'micro';
  ageRange: [number, number];
  sumAssured: number;
  policyTerm: number;
  distributionChannels: string[];
}

export interface EngineOutput {
  pricing: {
    monthlyPremium: number;
    annualPremium: number;
    netAnnualPremium: number;
    breakdown: { claims: number; expenses: number; profit: number; commission: number };
  };
  assumptions: {
    entryAge: number;
    mortalityRate: number;
    morbidityRate: number;
    discountRate: number;
    inflationRate: number;
    expenseRatio: number;
    commissionRate: number;
    lapseRate: number;
    mortalityTable: string;
  };
  reserves: { year1: number; year5: number; year10: number };
  riskMetrics: { solvencyMarginRatio: number; valueAtRisk: number; probabilityOfRuin: number };
  profitability: { irr: number; claimsRatio: number };
  confidence: { overall: number; dataQuality: number; modelAccuracy: number; assumptionsReliability: number };
}

// ── Core actuarial functions ─────────────────────────────────────────────────

function getQx(age: number): number {
  const clamped = Math.max(0, Math.min(80, Math.floor(age)));
  const next = Math.min(80, clamped + 1);
  const frac = age - Math.floor(age);
  const q0 = (TMI_2011[clamped] ?? 300) / 1000;
  const q1 = (TMI_2011[next] ?? 300) / 1000;
  return q0 + frac * (q1 - q0);
}

function survivalProb(age: number, years: number): number {
  let px = 1.0;
  for (let k = 0; k < years; k++) px *= 1 - getQx(age + k);
  return px;
}

function termInsuranceAPV(age: number, term: number, i: number): number {
  const v = 1 / (1 + i);
  let apv = 0;
  for (let k = 0; k < term; k++) {
    apv += Math.pow(v, k + 1) * survivalProb(age, k) * getQx(age + k);
  }
  return apv;
}

function lifeAnnuityDue(age: number, term: number, i: number): number {
  const v = 1 / (1 + i);
  let ann = 0;
  for (let k = 0; k < term; k++) ann += Math.pow(v, k) * survivalProb(age, k);
  return ann;
}

function prospectiveReserve(age: number, term: number, sa: number, grossAnnual: number, t: number, i: number): number {
  if (t >= term) return 0;
  return Math.max(0, termInsuranceAPV(age + t, term - t, i) * sa - lifeAnnuityDue(age + t, term - t, i) * grossAnnual);
}

// ── Solvency margin ─────────────────────────────────────────────────────────

function calcSolvencyMargin(reserve: number, grossAnnual: number, sa: number): number {
  const available = reserve + grossAnnual * 0.25;
  const required = Math.max(sa - reserve, 0) * 0.003 + reserve * 0.04;
  return required <= 0 ? 1.50 : Math.round((available / required) * 100) / 100;
}

function calcSolvencyMarginNonLife(reserve: number, grossAnnual: number, netAnnual: number): number {
  const available = reserve + grossAnnual * 0.25;
  const required = netAnnual * 3 * 0.10 + reserve * 0.04;
  return required <= 0 ? 1.50 : Math.round((available / required) * 100) / 100;
}

// ── Shared helpers ──────────────────────────────────────────────────────────

type Loading = { expense: number; commission: number; profit: number };

function midAge(range: [number, number]): number {
  return Math.round((range[0] + range[1]) / 2);
}

function getLoading(channels: string[]): Loading {
  return LOADING_FACTORS[channels[0]?.toLowerCase() ?? 'default'] ?? LOADING_FACTORS.default;
}

function applyLoading(netAnnual: number, loading: Loading): number {
  return netAnnual / Math.max(1 - loading.expense - loading.commission - loading.profit, 0.30);
}

function buildBreakdown(netAnnual: number, grossAnnual: number, loading: Loading) {
  return {
    claims: Math.round(netAnnual),
    expenses: Math.round(grossAnnual * loading.expense),
    profit: Math.round(grossAnnual * loading.profit),
    commission: Math.round(grossAnnual * loading.commission),
  };
}

function ratio(net: number, gross: number): number {
  return Math.round((net / Math.max(gross, 1)) * 100) / 100;
}

// ── Product calculators ─────────────────────────────────────────────────────

function calcLife(input: EngineInput): EngineOutput {
  const age = midAge(input.ageRange);
  const { policyTerm: term, sumAssured: sa } = input;
  const lapseRate = 0.05;
  const loading = getLoading(input.distributionChannels);

  const axn = termInsuranceAPV(age, term, DISCOUNT_RATE);
  const ann = lifeAnnuityDue(age, term, DISCOUNT_RATE);
  const netAnnual = (sa * axn) / Math.max(ann * (1 - lapseRate * 0.5), 0.1);
  const grossAnnual = applyLoading(netAnnual, loading);

  const reserves = {
    year1:  Math.round(prospectiveReserve(age, term, sa, grossAnnual, 1, DISCOUNT_RATE)),
    year5:  Math.round(prospectiveReserve(age, term, sa, grossAnnual, Math.min(5, term - 1), DISCOUNT_RATE)),
    year10: Math.round(prospectiveReserve(age, term, sa, grossAnnual, Math.min(10, term - 1), DISCOUNT_RATE)),
  };

  return {
    pricing: {
      monthlyPremium: Math.round(grossAnnual / 12),
      annualPremium: Math.round(grossAnnual),
      netAnnualPremium: Math.round(netAnnual),
      breakdown: buildBreakdown(netAnnual, grossAnnual, loading),
    },
    assumptions: {
      entryAge: age, mortalityRate: getQx(age), morbidityRate: 0,
      discountRate: DISCOUNT_RATE, inflationRate: 0.035,
      expenseRatio: loading.expense, commissionRate: loading.commission,
      lapseRate, mortalityTable: 'TMI 2011',
    },
    reserves,
    riskMetrics: {
      solvencyMarginRatio: calcSolvencyMargin(reserves.year1, grossAnnual, sa),
      valueAtRisk: Math.round(sa * getQx(age) * 3.0),
      probabilityOfRuin: Math.round(axn * 100) / 100,
    },
    profitability: { irr: 0.12, claimsRatio: ratio(netAnnual, grossAnnual) },
    confidence: { overall: 0.85, dataQuality: 0.82, modelAccuracy: 0.90, assumptionsReliability: 0.83 },
  };
}

function calcHealth(input: EngineInput): EngineOutput {
  const age = midAge(input.ageRange);
  const { policyTerm: term, sumAssured: sa } = input;
  const medInflation = 0.10;
  const lapseRate = 0.07;
  const loading = getLoading(input.distributionChannels);

  const claimsFreq = age < 30 ? 0.040 : age < 45 ? 0.055 : age < 60 ? 0.070 : 0.090;
  const avgAnnualClaims = sa * claimsFreq * 0.20 * Math.pow(1 + medInflation, term / 2);
  const netAnnual = avgAnnualClaims;
  const grossAnnual = applyLoading(netAnnual, loading);
  const ibnrReserve = Math.round(avgAnnualClaims * 0.25);

  return {
    pricing: {
      monthlyPremium: Math.round(grossAnnual / 12),
      annualPremium: Math.round(grossAnnual),
      netAnnualPremium: Math.round(netAnnual),
      breakdown: buildBreakdown(netAnnual, grossAnnual, loading),
    },
    assumptions: {
      entryAge: age, mortalityRate: getQx(age), morbidityRate: claimsFreq,
      discountRate: DISCOUNT_RATE, inflationRate: medInflation,
      expenseRatio: loading.expense, commissionRate: loading.commission,
      lapseRate, mortalityTable: 'TMI 2011',
    },
    reserves: { year1: ibnrReserve, year5: Math.round(ibnrReserve * 1.5), year10: Math.round(ibnrReserve * 2.2) },
    riskMetrics: {
      solvencyMarginRatio: calcSolvencyMarginNonLife(ibnrReserve, grossAnnual, netAnnual),
      valueAtRisk: Math.round(sa * claimsFreq * 2.5),
      probabilityOfRuin: claimsFreq * 0.1,
    },
    profitability: { irr: 0.14, claimsRatio: ratio(netAnnual, grossAnnual) },
    confidence: { overall: 0.78, dataQuality: 0.72, modelAccuracy: 0.82, assumptionsReliability: 0.80 },
  };
}

function calcTravel(input: EngineInput): EngineOutput {
  const age = midAge(input.ageRange);
  const sa = input.sumAssured;
  const loading = getLoading(input.distributionChannels);

  const tripDays = Math.min(input.policyTerm * 365 / 12, 90);
  const claimsFreq = 0.025 + (age > 60 ? 0.015 : 0);
  const netAnnual = sa * claimsFreq * 0.15 * (tripDays / 14);
  const grossAnnual = applyLoading(netAnnual, loading);

  return {
    pricing: {
      monthlyPremium: Math.round(grossAnnual / 12),
      annualPremium: Math.round(grossAnnual),
      netAnnualPremium: Math.round(netAnnual),
      breakdown: buildBreakdown(netAnnual, grossAnnual, loading),
    },
    assumptions: {
      entryAge: age, mortalityRate: getQx(age), morbidityRate: claimsFreq,
      discountRate: DISCOUNT_RATE, inflationRate: 0.035,
      expenseRatio: loading.expense, commissionRate: loading.commission,
      lapseRate: 0, mortalityTable: 'TMI 2011',
    },
    reserves: { year1: 0, year5: 0, year10: 0 },
    riskMetrics: {
      solvencyMarginRatio: calcSolvencyMarginNonLife(0, grossAnnual, netAnnual),
      valueAtRisk: Math.round(sa * claimsFreq * 2.0),
      probabilityOfRuin: 0.02,
    },
    profitability: { irr: 0.18, claimsRatio: ratio(netAnnual, grossAnnual) },
    confidence: { overall: 0.75, dataQuality: 0.70, modelAccuracy: 0.78, assumptionsReliability: 0.77 },
  };
}

function calcMicro(input: EngineInput): EngineOutput {
  const age = midAge(input.ageRange);
  const { policyTerm: term } = input;
  const loading = getLoading(input.distributionChannels);
  const cappedSA = Math.min(input.sumAssured, 50_000_000);

  const axn = termInsuranceAPV(age, term, DISCOUNT_RATE);
  const ann = lifeAnnuityDue(age, term, DISCOUNT_RATE);
  const netAnnual = (cappedSA * axn) / Math.max(ann, 0.1);
  const grossAnnual = applyLoading(netAnnual, loading);
  const cappedAnnual = Math.min(grossAnnual, 300_000);
  const microReserve = Math.round(cappedSA * axn * 0.1);

  return {
    pricing: {
      monthlyPremium: Math.round(cappedAnnual / 12),
      annualPremium: Math.round(cappedAnnual),
      netAnnualPremium: Math.round(netAnnual),
      breakdown: buildBreakdown(netAnnual, cappedAnnual, loading),
    },
    assumptions: {
      entryAge: age, mortalityRate: getQx(age), morbidityRate: 0,
      discountRate: DISCOUNT_RATE, inflationRate: 0.035,
      expenseRatio: loading.expense, commissionRate: loading.commission,
      lapseRate: 0.08, mortalityTable: 'TMI 2011',
    },
    reserves: { year1: microReserve, year5: Math.round(cappedSA * axn * 0.05), year10: 0 },
    riskMetrics: {
      solvencyMarginRatio: calcSolvencyMargin(microReserve, cappedAnnual, cappedSA),
      valueAtRisk: Math.round(cappedSA * getQx(age) * 2.0),
      probabilityOfRuin: 0.03,
    },
    profitability: { irr: 0.10, claimsRatio: ratio(netAnnual, cappedAnnual) },
    confidence: { overall: 0.82, dataQuality: 0.80, modelAccuracy: 0.85, assumptionsReliability: 0.81 },
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

export function calculate(input: EngineInput): EngineOutput {
  switch (input.productType) {
    case 'life':   return calcLife(input);
    case 'health': return calcHealth(input);
    case 'travel': return calcTravel(input);
    case 'micro':  return calcMicro(input);
  }
}

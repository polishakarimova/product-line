import type {
  GoalsData, MonthlyData, SalesData, ProductPricing,
  FinalDecompositionRow,
} from './types';

export const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

export const fmtMoney = (n: number | undefined | null): string => {
  if (!isFinite(Number(n))) return '0 ₽';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(Number(n || 0));
};

export const fmtNum = (n: number | undefined | null, d = 0): string => {
  if (!isFinite(Number(n))) return '0';
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: d }).format(Number(n || 0));
};

// STEP 1.1: Цели и потребности
export function goalsTotals(g: GoalsData) {
  const personalGoalsTotal = sum(g.personalGoals.map(x => x.amount));
  const companyGoalsTotal = sum(g.companyGoals.map(x => x.amount));
  const annualGoalsTotal = personalGoalsTotal + companyGoalsTotal; // L20 = F19+J19

  const personalMonthlyExpenses = sum(g.personalExpenses.map(x => x.amount));
  const companyMonthlyExpenses = sum(g.companyExpenses.map(x => x.amount));
  const monthlyBase = personalMonthlyExpenses + companyMonthlyExpenses; // L32 = F34+J34

  const personalAnnualExpenses = personalMonthlyExpenses * 12;
  const companyAnnualExpenses = companyMonthlyExpenses * 12;
  const annualBase = personalAnnualExpenses + companyAnnualExpenses; // L35

  const totalNeeded = annualGoalsTotal + annualBase; // L38

  return {
    personalGoalsTotal,
    companyGoalsTotal,
    annualGoalsTotal,
    personalMonthlyExpenses,
    companyMonthlyExpenses,
    monthlyBase,
    personalAnnualExpenses,
    companyAnnualExpenses,
    annualBase,
    totalNeeded,
  };
}

// STEP 1.2: Декомпозиция по месяцам
export function monthlyTotals(monthly: MonthlyData, goals: GoalsData) {
  const t = goalsTotals(goals);
  const rows = monthly.map(m => {
    const personalGoalsSum = sum(m.personalGoalsValues);
    const companyGoalsSum = sum(m.companyGoalsValues);
    const personalBase = t.personalMonthlyExpenses;
    const companyBase = t.companyMonthlyExpenses;
    const totalForMonth = personalBase + companyBase + personalGoalsSum + companyGoalsSum + m.reserve;
    return {
      month: m.month,
      personalBase,
      companyBase,
      personalGoalsSum,
      companyGoalsSum,
      reserve: m.reserve,
      totalForMonth,
    };
  });
  const yearTotal = sum(rows.map(r => r.totalForMonth));
  return { rows, yearTotal };
}

// STEP 1.3: Декомпозиция по продажам
export function salesTotals(sales: SalesData, monthly: MonthlyData, goals: GoalsData) {
  const m = monthlyTotals(monthly, goals);
  const audienceVolume = sales.audience.reach * (sales.audience.percent / 100);
  const rows = sales.months.map((s, i) => {
    const targetRevenue = m.rows[i]?.totalForMonth || 0;
    const calculated = s.salesCount * s.avgCheck;
    const delta = calculated - targetRevenue;
    return { month: s.month, targetRevenue, salesCount: s.salesCount, avgCheck: s.avgCheck, calculated, delta };
  });
  return { audienceVolume, rows };
}

// STEP 4: Pricing
export function pricingTotals(p: ProductPricing) {
  const creationTotal = sum(p.creationCosts.map(c => c.amount));
  const deliveryTotal = sum(p.deliveryCosts.map(c => c.amount));
  const minRevenueToCoverCosts = creationTotal + deliveryTotal;
  const optimal = p.optimalParticipants > 0 ? p.optimalParticipants : 1;
  const minCostPerParticipant = minRevenueToCoverCosts / optimal;
  const expertCost = p.expertHourRate * p.expertHours;
  const expertCostPerParticipant = expertCost / optimal;
  const basePricePerParticipant = (minCostPerParticipant + expertCostPerParticipant) * (1 + p.profitPercent / 100);
  const allPrices = [
    p.firstRight.min, p.firstRight.base, p.firstRight.max,
    p.standard.min,   p.standard.base,   p.standard.max,
    p.finalChance.min, p.finalChance.base, p.finalChance.max,
  ];
  const avgCheck = sum(allPrices) / 9;
  return {
    creationTotal,
    deliveryTotal,
    minRevenueToCoverCosts,
    minCostPerParticipant,
    expertCost,
    expertCostPerParticipant,
    basePricePerParticipant,
    avgCheck,
  };
}

// STEP 5: Final decomposition row
export function finalDecompositionRowTotal(row: FinalDecompositionRow): number {
  const fr = row.firstRight, st = row.standard, fc = row.finalChance;
  return (
    fr.minPrice * fr.minQty + fr.basePrice * fr.baseQty + fr.maxPrice * fr.maxQty +
    st.minPrice * st.minQty + st.basePrice * st.baseQty + st.maxPrice * st.maxQty +
    fc.minPrice * fc.minQty + fc.basePrice * fc.baseQty + fc.maxPrice * fc.maxQty
  );
}

export function finalDecompositionYearTotal(rows: FinalDecompositionRow[]): number {
  return sum(rows.map(finalDecompositionRowTotal));
}

// Общий прогресс заполнения по 6 шагам (эвристика)
export function progressByStep(state: import('./types').ProductLineState) {
  const g = state.goals;
  const step1 = (() => {
    let filled = 0; let total = 4;
    if (g.personalGoals.some(x => x.amount > 0) || g.companyGoals.some(x => x.amount > 0)) filled++;
    if (g.personalExpenses.some(x => x.amount > 0) || g.companyExpenses.some(x => x.amount > 0)) filled++;
    if (state.monthly.some(m => sum(m.personalGoalsValues) + sum(m.companyGoalsValues) + m.reserve > 0)) filled++;
    if (state.sales.months.some(m => m.salesCount > 0 || m.avgCheck > 0)) filled++;
    return filled / total;
  })();
  const step2 = state.calendar.days.length > 0 || state.calendar.vacations.some(v => v.dates) ? 1 : 0;
  const step3 = (() => {
    const a = state.audience.filter(g => g.summary).length;
    const p = state.products.products.filter(p => p.name && p.format).length;
    return ((a > 0 ? 0.5 : 0) + (p > 0 ? 0.5 : 0));
  })();
  const step4 = state.pricing.some(pr => pr.firstRight.base > 0 || pr.standard.base > 0) ? 1 : 0;
  const step5 = state.assembly.assembly.some(a => a.functionInLineup) ? 1 : 0;
  const step6 = state.tasks.months.some(m => m.keyTask) ? 1 : 0;
  return {
    step1, step2, step3, step4, step5, step6,
    overall: (step1 + step2 + step3 + step4 + step5 + step6) / 6,
  };
}

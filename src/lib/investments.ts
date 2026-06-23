import type { Investment, RateType } from '../types';
import type { ReferenceRates } from '../store/ratesStore';

/** Taxa efetiva ao ano (%) conforme o tipo de rendimento e as taxas de referência. */
export function effectiveAnnualRate(inv: { rateType?: RateType; rate?: number }, rates: ReferenceRates): number {
  switch (inv.rateType) {
    case 'prefixado': return inv.rate ?? 0;
    case 'cdi':       return rates.cdi * ((inv.rate ?? 100) / 100);
    case 'selic':     return rates.selic * ((inv.rate ?? 100) / 100);
    case 'ipca':      return rates.ipca + (inv.rate ?? 0);
    default:          return 0; // manual
  }
}

/** Dias corridos desde a data inicial do investimento. */
function daysSince(date: Date, now: number): number {
  const start = new Date(date).getTime();
  return Math.max(0, (now - start) / 86_400_000);
}

/**
 * Valor atual calculado. Para renda fixa (rateType != manual), projeta o
 * montante por juros compostos pro rata die; para manual, usa o currentValue.
 */
export function projectedValue(inv: Investment, rates: ReferenceRates, now: number = Date.now()): number {
  if (!inv.rateType || inv.rateType === 'manual') return inv.currentValue;
  const annual = effectiveAnnualRate(inv, rates) / 100;
  if (annual <= 0) return inv.investedAmount;
  const factor = Math.pow(1 + annual, daysSince(inv.date, now) / 365);
  return inv.investedAmount * factor;
}

export interface InvestmentReturn {
  current: number;
  gain: number;
  gainPct: number;
}

/** Rentabilidade (R$ e %) de um investimento. */
export function investmentReturn(inv: Investment, rates: ReferenceRates, now: number = Date.now()): InvestmentReturn {
  const current = projectedValue(inv, rates, now);
  const gain = current - inv.investedAmount;
  const gainPct = inv.investedAmount > 0 ? (gain / inv.investedAmount) * 100 : 0;
  return { current, gain, gainPct };
}

/** Totais da carteira já com os rendimentos projetados. */
export function portfolioTotals(investments: Investment[], rates: ReferenceRates, now: number = Date.now()) {
  let invested = 0, current = 0;
  for (const inv of investments) {
    invested += inv.investedAmount;
    current += projectedValue(inv, rates, now);
  }
  const gain = current - invested;
  const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
  return { invested, current, gain, gainPct };
}

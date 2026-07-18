import { scaleByCountry } from './countries'
import type { AssetCategory } from './assets'

/**
 * Money model. Salaries and these costs are all country-scaled by the
 * same multiplier as jobs (see countries.ts), so what you keep depends
 * on where you live. Balances can go negative — that's debt, and debt
 * grows a little each year until you pay it off.
 */

/** US-level yearly cost of living; kicks in at 19. */
export const PERSONAL_EXPENSES_BASE = 20000
/** Age at which you start paying your own way. */
export const EXPENSES_START_AGE = 19
/** US-level base university tuition per year. */
export const TUITION_BASE_PER_YEAR = 18000
/** US-level yearly cost of keeping up a friendship. */
export const FRIEND_COST_BASE = 250
/** US-level yearly cost of a relationship, by status. */
export const PARTNER_COST_BASE: Record<'dating' | 'engaged' | 'married', number> = {
  dating: 1500,
  engaged: 2500,
  married: 4000,
}
/** Debt grows by this fraction each year you stay in the red. */
export const DEBT_INTEREST = 0.03

/**
 * Progressive income tax on a year's gross pay, using country-scaled
 * brackets. This is the main reason big salaries don't turn into instant
 * fortunes — a top earner keeps ~60%, an ordinary worker most of theirs.
 */
export function incomeTax(gross: number, code: string | null): number {
  if (gross <= 0) return 0
  const s = (n: number) => scaleByCountry(n, code)
  const brackets: Array<{ upTo: number; rate: number }> = [
    { upTo: s(15000), rate: 0 },
    { upTo: s(40000), rate: 0.12 },
    { upTo: s(95000), rate: 0.24 },
    { upTo: s(200000), rate: 0.33 },
    { upTo: Infinity, rate: 0.4 },
  ]
  let tax = 0
  let prev = 0
  for (const b of brackets) {
    if (gross <= prev) break
    tax += (Math.min(gross, b.upTo) - prev) * b.rate
    prev = b.upTo
  }
  return Math.round(tax)
}

/**
 * Yearly cost of living, given your take-home income. Two ideas keep the
 * economy honest:
 *  - the poor spend most of what they have just to get by (little saved), so
 *    a low earner roughly breaks even rather than drowning in debt;
 *  - "lifestyle creep" means higher earners spend more in absolute terms, but
 *    save a growing *share* — which is why only well-paid professions build
 *    real wealth over a career, and a teacher never becomes a millionaire fast.
 */
export function livingCost(netIncome: number, code: string | null): number {
  const s = (n: number) => scaleByCountry(n, code)
  // Essentials scale down for the poor (cheaper housing, support), capped at
  // the full cost of living for everyone else.
  const base = Math.min(s(PERSONAL_EXPENSES_BASE), Math.max(s(6000), Math.round(netIncome * 0.85)))
  const disposable = Math.max(0, netIncome - base)
  const rate =
    disposable <= s(20000) ? 0.95 : disposable <= s(60000) ? 0.82 : disposable <= s(150000) ? 0.66 : 0.52
  return Math.round(base + disposable * rate)
}

/** Yearly upkeep as a fraction of an asset's price, by category. */
const UPKEEP_RATE: Record<AssetCategory, number> = {
  car: 0.02,
  home: 0.01,
  luxury: 0.005,
  phone: 0,
}

export function assetUpkeep(price: number, category: AssetCategory): number {
  return Math.round(price * UPKEEP_RATE[category])
}

/** Salary multiplier for a job tier (0 = entry). Each promotion adds 40%. */
export function tierMultiplier(tier: number): number {
  return 1 + 0.4 * tier
}

/** Years in a job before each promotion to the next tier. */
export const YEARS_PER_PROMOTION = 3

export const personalExpenses = (code: string | null) =>
  scaleByCountry(PERSONAL_EXPENSES_BASE, code)
export const tuitionPerYear = (code: string | null) =>
  scaleByCountry(TUITION_BASE_PER_YEAR, code)
export const friendCost = (code: string | null) => scaleByCountry(FRIEND_COST_BASE, code)
export const partnerCost = (code: string | null, status: 'dating' | 'engaged' | 'married') =>
  scaleByCountry(PARTNER_COST_BASE[status], code)

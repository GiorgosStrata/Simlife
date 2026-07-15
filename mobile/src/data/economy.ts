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
export const DEBT_INTEREST = 0.05

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

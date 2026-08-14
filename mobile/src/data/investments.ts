/**
 * The Vestr markets. Three flavours of asset, all with a positive long-run
 * drift (the house — er, the market — favours the player), but very different
 * risk:
 *  - `index`  broad funds that grind steadily upward with low volatility;
 *  - `stock`  single companies: better returns, bumpier ride;
 *  - `crypto` wild swings, the highest ceiling — and the scariest dips.
 * Names are parodies to dodge trademarks.
 */
export type InvestmentKind = 'index' | 'stock' | 'crypto'

export interface Investment {
  id: string
  name: string
  ticker: string
  emoji: string
  kind: InvestmentKind
  /** Average yearly return (as a fraction, e.g. 0.08 = +8%). */
  drift: number
  /** Yearly volatility (standard deviation of the return). */
  vol: number
  /** Starting unit price. */
  start: number
}

export const INVESTMENTS: Investment[] = [
  // ----- Index funds: slow and steady, the sensible long-term play -----
  { id: 'sp500', name: 'Standard 500', ticker: 'SPX', emoji: '📈', kind: 'index', drift: 0.085, vol: 0.11, start: 450 },
  { id: 'total', name: 'Total Market Fund', ticker: 'VTM', emoji: '🧺', kind: 'index', drift: 0.08, vol: 0.1, start: 230 },
  { id: 'techtop', name: 'TechTop 100', ticker: 'QQZ', emoji: '💽', kind: 'index', drift: 0.1, vol: 0.17, start: 380 },

  // ----- Stocks: single companies, riskier but rewarding -----
  { id: 'pear', name: 'Pear Inc.', ticker: 'PEAR', emoji: '🍐', kind: 'stock', drift: 0.13, vol: 0.28, start: 190 },
  { id: 'zap', name: 'Zap Motors', ticker: 'ZAP', emoji: '🚗', kind: 'stock', drift: 0.15, vol: 0.42, start: 240 },
  { id: 'boogle', name: 'Boogle', ticker: 'BGL', emoji: '🔎', kind: 'stock', drift: 0.12, vol: 0.26, start: 140 },
  { id: 'rizzco', name: 'Rizzgram Media', ticker: 'RIZZ', emoji: '📸', kind: 'stock', drift: 0.11, vol: 0.34, start: 70 },

  // ----- Crypto: to the moon, or not -----
  { id: 'bitcorn', name: 'Bitcorn', ticker: 'BTX', emoji: '🪙', kind: 'crypto', drift: 0.22, vol: 0.62, start: 32000 },
  { id: 'aetherium', name: 'Aetherium', ticker: 'ATH', emoji: '💠', kind: 'crypto', drift: 0.24, vol: 0.72, start: 2100 },
  { id: 'dogecosm', name: 'Dogecosm', ticker: 'DGC', emoji: '🐕', kind: 'crypto', drift: 0.2, vol: 1.0, start: 0.18 },
]

export function getInvestment(id: string): Investment | undefined {
  return INVESTMENTS.find((i) => i.id === id)
}

/** Starting prices for a fresh life. */
export function initialInvestPrices(): Record<string, number> {
  return Object.fromEntries(INVESTMENTS.map((i) => [i.id, i.start]))
}

/** A standard-normal sample (Box–Muller). */
function gauss(): number {
  const u = 1 - Math.random()
  const v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/**
 * One year of price movement. Positive drift means the long run favours the
 * player; the downside is floored so a single year can't wipe an asset out.
 */
export function stepInvestmentPrice(inv: Investment, price: number): number {
  const ret = Math.max(-0.7, inv.drift + gauss() * inv.vol)
  const floor = inv.start * 0.03
  return Math.max(floor, price * (1 + ret))
}

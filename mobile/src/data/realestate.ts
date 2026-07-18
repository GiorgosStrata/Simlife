import { scaleByCountry } from './countries'

/**
 * Rental real estate. A rotating market of random properties you can buy to
 * earn passive rent every year. Yields are tuned so a property pays for
 * itself in ~15-20 years (then it's pure profit), and it holds/gains value
 * so you can sell it on later.
 */

export interface RentalListing {
  id: string
  name: string
  emoji: string
  price: number
  /** Net rent paid to you each year (already after costs/vacancy). */
  rentPerYear: number
}

export interface OwnedRental extends RentalListing {
  boughtYear: number
}

const TYPES = [
  { name: 'Studio Flat', emoji: '🏚️', min: 45000, max: 90000 },
  { name: 'Holiday Cottage', emoji: '🌲', min: 110000, max: 240000 },
  { name: 'City Apartment', emoji: '🏢', min: 95000, max: 190000 },
  { name: 'Terraced House', emoji: '🏘️', min: 160000, max: 280000 },
  { name: 'Suburban House', emoji: '🏠', min: 230000, max: 420000 },
  { name: 'Beach Condo', emoji: '🏖️', min: 350000, max: 700000 },
  { name: 'Duplex', emoji: '🏡', min: 300000, max: 560000 },
  { name: 'Apartment Block', emoji: '🏬', min: 650000, max: 1300000 },
]

let counter = 0
function randInt(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a
}

/** A fresh batch of properties on the market. */
export function rollRentalListings(code: string | null, count = 5): RentalListing[] {
  const shuffled = [...TYPES].sort(() => Math.random() - 0.5).slice(0, count)
  return shuffled.map((tp) => {
    const price = scaleByCountry(randInt(tp.min, tp.max), code)
    // ROI in ~15-20 years: annual net rent = price / (15..20).
    const rentPerYear = Math.round(price / randInt(15, 20))
    return { id: `rent-${counter++}-${randInt(1000, 9999)}`, name: tp.name, emoji: tp.emoji, price, rentPerYear }
  })
}

/** Resale value: real estate appreciates ~3%/yr held (simple, capped). */
export function propertyResale(p: OwnedRental, currentYear: number): number {
  const held = Math.max(0, currentYear - p.boughtYear)
  return Math.round(p.price * (1 + Math.min(1.2, held * 0.03)))
}

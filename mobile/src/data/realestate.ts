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

// Property tiers set the price band, emoji and the "kind" word in the name.
const TYPES = [
  { word: 'Flat', emoji: '🏚️', min: 45000, max: 90000 },
  { word: 'Cottage', emoji: '🌲', min: 110000, max: 240000 },
  { word: 'Apartment', emoji: '🏢', min: 95000, max: 190000 },
  { word: 'House', emoji: '🏘️', min: 160000, max: 280000 },
  { word: 'Residence', emoji: '🏠', min: 230000, max: 420000 },
  { word: 'Condo', emoji: '🏖️', min: 350000, max: 700000 },
  { word: 'Duplex', emoji: '🏡', min: 300000, max: 560000 },
  { word: 'Block', emoji: '🏬', min: 650000, max: 1300000 },
]

// Street names to randomise property names, e.g. "Parker's Street Apartment 129".
const STREETS = [
  "Parker's Street", 'Oak Avenue', 'Maple Lane', 'Elm Road', 'Sunset Boulevard',
  'Birch Close', 'Cedar Drive', 'Willow Way', 'Kingfisher Court', 'Rosewood Terrace',
  'Highgate Road', 'Ashford Lane', 'Bramble Close', 'Harbour View', 'Meadow Lane',
  'Victoria Street', 'Church Road', 'Mill Lane', 'Station Road', 'Baker Street',
  'Riverside Walk', 'Grove Avenue', 'Chestnut Grove', 'Hillcrest Road', 'Kingsway',
  'Pine Hollow', 'Marigold Court', 'Old Mill Road', 'Foxglove Lane', 'Primrose Hill',
]

let counter = 0
function randInt(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** A fresh batch of randomly-named properties on the market. */
export function rollRentalListings(code: string | null, count = 5): RentalListing[] {
  const shuffled = [...TYPES].sort(() => Math.random() - 0.5).slice(0, count)
  return shuffled.map((tp) => {
    const price = scaleByCountry(randInt(tp.min, tp.max), code)
    // Yield tuned so a property pays for itself in ~15-20 years (hidden).
    const rentPerYear = Math.round(price / randInt(15, 20))
    const name = `${pick(STREETS)} ${tp.word} ${randInt(1, 300)}`
    return { id: `rent-${counter++}-${randInt(1000, 9999)}`, name, emoji: tp.emoji, price, rentPerYear }
  })
}

/** Resale value: real estate appreciates ~3%/yr held (simple, capped). */
export function propertyResale(p: OwnedRental, currentYear: number): number {
  const held = Math.max(0, currentYear - p.boughtYear)
  return Math.round(p.price * (1 + Math.min(1.2, held * 0.03)))
}

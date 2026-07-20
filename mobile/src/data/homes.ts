import { homeRent } from './assets'
import { scaleByCountry } from './countries'

/**
 * Houses on the market. Like the old rental board, the shop's Homes tab shows
 * a rotating set of randomly-named houses ("Elm Road House 125") that refresh
 * every year. Once bought, a house is either where you live or a rental —
 * see the store's residence logic.
 */

export interface HomeListing {
  id: string
  name: string
  emoji: string
  price: number
  /** How many people it comfortably houses. */
  size: number
}

export interface OwnedHome extends HomeListing {
  boughtYear: number
}

const TYPES = [
  { word: 'Flat', emoji: '🏚️', min: 45000, max: 90000, size: 1 },
  { word: 'Apartment', emoji: '🏢', min: 95000, max: 190000, size: 2 },
  { word: 'Cottage', emoji: '🌲', min: 110000, max: 240000, size: 2 },
  { word: 'House', emoji: '🏘️', min: 160000, max: 300000, size: 3 },
  { word: 'Residence', emoji: '🏠', min: 240000, max: 430000, size: 4 },
  { word: 'Duplex', emoji: '🏡', min: 300000, max: 560000, size: 4 },
  { word: 'Condo', emoji: '🏖️', min: 350000, max: 700000, size: 3 },
  { word: 'Villa', emoji: '🌴', min: 700000, max: 1400000, size: 6 },
  { word: 'Mansion', emoji: '🏰', min: 1200000, max: 3000000, size: 7 },
  { word: 'Penthouse', emoji: '🏙️', min: 900000, max: 2200000, size: 5 },
  { word: 'Estate', emoji: '🏯', min: 3000000, max: 10000000, size: 10 },
]

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

/** A fresh, randomly-named batch of houses for sale. */
export function rollHomeListings(code: string | null, count = 6): HomeListing[] {
  const shuffled = [...TYPES].sort(() => Math.random() - 0.5).slice(0, count)
  return shuffled
    .map((tp) => {
      const price = scaleByCountry(randInt(tp.min, tp.max), code)
      const name = `${pick(STREETS)} ${tp.word} ${randInt(1, 300)}`
      return { id: `home-${counter++}-${randInt(1000, 9999)}`, name, emoji: tp.emoji, price, size: tp.size }
    })
    .sort((a, b) => a.price - b.price)
}

export { homeRent }

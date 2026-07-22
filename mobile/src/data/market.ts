import { scaleByCountry } from './countries'

/**
 * Rotating markets for cars and jewelry — just like the homes board, the shop
 * shows a fresh, randomly-generated set each year (e.g. "Doyota Corona GT
 * '26"). Once bought, an item is a self-contained belonging you can sell back
 * for ~half. Parody names avoid trademarks.
 */

export interface MarketItem {
  id: string
  name: string
  emoji: string
  price: number
  joy: number
  category: 'car' | 'luxury'
}

export interface OwnedItem extends MarketItem {
  boughtYear: number
}

let counter = 0
const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const maybe = <T,>(arr: T[], chance: number): string => (Math.random() < chance ? ` ${pick(arr)}` : '')

// ---------------------------------------------------------------- cars

const CAR_TIERS = [
  { emoji: '🚙', min: 900, max: 4000, joy: [2, 3], names: ['Kdrifto Junker', 'Rusty Ranger', 'Tanoo Micro', 'Old Beater'] },
  { emoji: '🚗', min: 6000, max: 16000, joy: [3, 5], names: ['Bahonda Civet', 'Doyota Corona', 'Nord Focal', 'Hyundong Elantis', 'Fiot Panda'] },
  { emoji: '🚗', min: 18000, max: 34000, joy: [5, 7], names: ['Chevier Malantis', 'Nissano Altimo', 'Bolkswagen Gulf', 'Subario Imprezza', 'Mazza Roadster'] },
  { emoji: '🚙', min: 34000, max: 65000, joy: [6, 9], names: ['Voulvo Wagon', 'Land Rider Freebie', 'Doyota Highliner', 'Jip Wranglor'] },
  { emoji: '🚘', min: 50000, max: 95000, joy: [8, 11], names: ['Bercedes C-Klass', 'DMW Series 3', 'Owdi A4', 'Lexicon RX', 'Tezla Model Z'] },
  { emoji: '🏎️', min: 90000, max: 190000, joy: [11, 15], names: ['Jaguor F-Cat', 'Land Rider Defiant', 'Porcha Boxer', 'Bercedes AMD GT'] },
  { emoji: '🏎️', min: 220000, max: 650000, joy: [16, 22], names: ['Porcha 918', 'Ferrori Rossa', 'Lambogotti Toro', 'Rolls-Royston Phantasm', 'Bently Continent'] },
  { emoji: '🏎️', min: 1200000, max: 3200000, joy: [24, 30], names: ['Buggati Cheron', 'Konigsegh Jesku', 'Pogani Huevo'] },
]
const CAR_TRIMS = ['LX', 'Sport', 'GT', 'Turbo', 'AWD', 'Limited', 'S-Line', 'RS', 'Hybrid']

export function rollCarListings(code: string | null, year = 2026, count = 7): MarketItem[] {
  const tiers = [...CAR_TIERS].sort(() => Math.random() - 0.5).slice(0, count)
  return tiers
    .map((t) => {
      const price = scaleByCountry(randInt(t.min, t.max), code)
      const yr = `'${String((year + randInt(-2, 0)) % 100).padStart(2, '0')}`
      const name = `${pick(t.names)}${maybe(CAR_TRIMS, 0.6)} ${yr}`
      return {
        id: `car-${counter++}-${randInt(1000, 9999)}`,
        name,
        emoji: t.emoji,
        price,
        joy: randInt(t.joy[0], t.joy[1]),
        category: 'car' as const,
      }
    })
    .sort((a, b) => a.price - b.price)
}

// ---------------------------------------------------------------- jewelry

const GEMS = ['Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Opal', 'Amethyst', 'Topaz', 'Pearl', 'Onyx']
const METALS = ['Gold', 'Rose-Gold', 'White-Gold', 'Platinum', 'Silver']
const JEWEL_TIERS = [
  { emoji: '⌚', min: 800, max: 6000, joy: [4, 7], types: ['Watch', 'Bracelet', 'Cufflinks'] },
  { emoji: '💍', min: 4000, max: 22000, joy: [7, 11], types: ['Ring', 'Earrings', 'Pendant'] },
  { emoji: '📿', min: 20000, max: 90000, joy: [10, 14], types: ['Necklace', 'Tennis Bracelet', 'Brooch'] },
  { emoji: '👑', min: 90000, max: 500000, joy: [14, 20], types: ['Tiara', 'Choker', 'Chandelier Earrings'] },
]
// Rare, iconic big-ticket luxuries that occasionally appear at the top.
const LUX_SPECIALS = [
  { emoji: '🖼️', name: 'Original Oil Painting', min: 60000, max: 400000, joy: 13 },
  { emoji: '🛥️', name: 'Luxury Yacht', min: 900000, max: 4000000, joy: 26 },
  { emoji: '✈️', name: 'Private Jet', min: 5000000, max: 20000000, joy: 35 },
]

export function rollJewelryListings(code: string | null, count = 6): MarketItem[] {
  const items: MarketItem[] = JEWEL_TIERS.map((t) => {
    const price = scaleByCountry(randInt(t.min, t.max), code)
    const name = `${pick(GEMS)} ${pick(METALS)} ${pick(t.types)}`
    return {
      id: `lux-${counter++}-${randInt(1000, 9999)}`,
      name,
      emoji: t.emoji,
      price,
      joy: randInt(t.joy[0], t.joy[1]),
      category: 'luxury' as const,
    }
  })
  // Sometimes a headline luxury item shows up.
  for (const sp of LUX_SPECIALS) {
    if (Math.random() < 0.5) {
      items.push({
        id: `lux-${counter++}-${randInt(1000, 9999)}`,
        name: sp.name,
        emoji: sp.emoji,
        price: scaleByCountry(randInt(sp.min, sp.max), code),
        joy: sp.joy,
        category: 'luxury',
      })
    }
  }
  return items.sort((a, b) => a.price - b.price).slice(0, count)
}

// ---------------------------------------------------------------- stolen goods
// Some crimes net you an actual belonging rather than just cash: grand theft
// auto hands you a car you can drive or sell, and pickpocketing / burglary
// turns up phones, watches, handbags and jewelry you can pawn. These return a
// ready-to-own item (already stamped with the year) so the store can drop it
// straight into your belongings.

/** A car lifted off the street — mostly everyday rides, rarely an exotic. */
export function rollStolenCar(code: string | null, year = 2026): OwnedItem {
  const roll = Math.random()
  const idx = roll < 0.55 ? randInt(1, 2) : roll < 0.85 ? randInt(3, 4) : roll < 0.97 ? 5 : randInt(6, 7)
  const t = CAR_TIERS[idx]
  const price = scaleByCountry(randInt(t.min, t.max), code)
  const yr = `'${String((year + randInt(-3, 0)) % 100).padStart(2, '0')}`
  const name = `Stolen ${pick(t.names)}${maybe(CAR_TRIMS, 0.6)} ${yr}`
  return {
    id: `car-${counter++}-${randInt(1000, 9999)}`,
    name,
    emoji: t.emoji,
    price,
    joy: randInt(t.joy[0], t.joy[1]),
    category: 'car',
    boughtYear: year,
  }
}

const STOLEN_VALUABLES = [
  { emoji: '📱', min: 300, max: 1400, names: ['iThing 15 Pro', 'Galassy S24', 'Pixil 8 Phone'] },
  { emoji: '💻', min: 500, max: 3000, names: ['MacroBook Pro', 'Thinkpod Laptop', 'Gaming Laptop'] },
  { emoji: '👜', min: 400, max: 6000, names: ['Louie V. Handbag', 'Gukki Purse', 'Chanelle Clutch'] },
  { emoji: '⌚', min: 800, max: 12000, names: ['Rollex Watch', 'Omego Seamaster', 'Diamond Watch'] },
  { emoji: '💍', min: 1500, max: 40000, names: ['Diamond Ring', 'Gold Necklace', 'Ruby Earrings'] },
  { emoji: '🎮', min: 200, max: 900, names: ['Games Console', 'VR Headset'] },
]

/** A valuable lifted from a pocket or a house — sellable at the pawn shop. */
export function rollStolenGoods(code: string | null, year = 2026): OwnedItem {
  const t = pick(STOLEN_VALUABLES)
  const price = scaleByCountry(randInt(t.min, t.max), code)
  return {
    id: `lux-${counter++}-${randInt(1000, 9999)}`,
    name: `Stolen ${pick(t.names)}`,
    emoji: t.emoji,
    price,
    joy: Math.max(1, Math.round(price / 4000)),
    category: 'luxury',
    boughtYear: year,
  }
}

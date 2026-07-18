import type { Asset } from './assets'

/**
 * Phones aren't a fixed list — each brand ships a new flagship every year,
 * so the model number in the shop climbs as the years pass (Pear Phone 16,
 * 17, 18 …). Owned phones are stored by a generated id like "phone-pear-18"
 * and rebuilt on demand, so they keep working across saves.
 */

export interface PhoneBrand {
  id: string
  name: string
  emoji: string
  /** Flagship price at the anchor model, before per-year increments. */
  basePrice: number
  pricePerModel: number
  joyBase: number
  /** The model number in the anchor year (release cadence is one/year). */
  anchorYear: number
  anchorModel: number
}

export const PHONE_BRANDS: PhoneBrand[] = [
  { id: 'pear', name: 'Pear Phone', emoji: '📱', basePrice: 820, pricePerModel: 70, joyBase: 6, anchorYear: 2026, anchorModel: 16 },
  { id: 'galaxa', name: 'Samsong Galaxa S', emoji: '📱', basePrice: 760, pricePerModel: 60, joyBase: 5, anchorYear: 2026, anchorModel: 24 },
  { id: 'pixil', name: 'Boogle Pixil', emoji: '📱', basePrice: 660, pricePerModel: 55, joyBase: 5, anchorYear: 2026, anchorModel: 9 },
  { id: 'onefone', name: 'Onefone', emoji: '📱', basePrice: 520, pricePerModel: 45, joyBase: 4, anchorYear: 2026, anchorModel: 12 },
  { id: 'redmi', name: 'Xioami Redmimi', emoji: '📱', basePrice: 280, pricePerModel: 25, joyBase: 3, anchorYear: 2026, anchorModel: 14 },
]

function getBrand(id: string): PhoneBrand | undefined {
  return PHONE_BRANDS.find((b) => b.id === id)
}

/** The flagship model number a brand sells in a given year. */
export function modelForYear(brand: PhoneBrand, year: number): number {
  return Math.max(brand.anchorModel, brand.anchorModel + (year - brand.anchorYear))
}

function buildPhone(brand: PhoneBrand, model: number): Asset {
  const price = Math.max(60, brand.basePrice + (model - brand.anchorModel) * brand.pricePerModel)
  return {
    id: `phone-${brand.id}-${model}`,
    emoji: brand.emoji,
    name: `${brand.name} ${model}`,
    category: 'phone',
    price,
    joy: brand.joyBase,
  }
}

/** This year's phones: each brand's flagship, priciest first. */
export function phonesForYear(year: number): Asset[] {
  return PHONE_BRANDS.map((b) => buildPhone(b, modelForYear(b, year))).sort(
    (a, b) => b.price - a.price,
  )
}

/** Rebuild a phone Asset from a generated id (for owned phones). */
export function resolvePhone(id: string): Asset | undefined {
  // id looks like "phone-<brand>-<model>"
  const rest = id.replace(/^phone-/, '')
  const lastDash = rest.lastIndexOf('-')
  if (lastDash < 0) return undefined
  const brandId = rest.slice(0, lastDash)
  const model = Number(rest.slice(lastDash + 1))
  const brand = getBrand(brandId)
  if (!brand || !Number.isFinite(model)) return undefined
  return buildPhone(brand, model)
}

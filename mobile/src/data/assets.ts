/**
 * Buyable belongings. Names are original parodies to avoid trademarks
 * (e.g. "DMW" not BMW, "Bercedes" not Mercedes, "Pear Phone" not
 * iPhone). Prices are in fixed dollars; resale returns ~50%.
 */
import { resolvePhone } from './phones'

export type AssetCategory = 'car' | 'phone' | 'home' | 'luxury'

export interface Asset {
  id: string
  emoji: string
  name: string
  category: AssetCategory
  price: number
  /** Small one-time happiness boost when purchased. */
  joy: number
}

export const ASSET_CATEGORIES: Array<{ key: AssetCategory; emoji: string; label: string }> = [
  { key: 'car', emoji: '🚗', label: 'Cars' },
  { key: 'phone', emoji: '📱', label: 'Phones' },
  { key: 'home', emoji: '🏠', label: 'Homes' },
  { key: 'luxury', emoji: '💎', label: 'Luxury' },
]

export const ASSETS: Asset[] = [
  // ----- Cars (parody names) -----
  { id: 'car-junker', emoji: '🚙', name: 'Kdrifto Junker', category: 'car', price: 1500, joy: 2 },
  { id: 'car-nano', emoji: '🚗', name: 'Tanoo Micro', category: 'car', price: 6000, joy: 3 },
  { id: 'car-civet', emoji: '🚗', name: 'Bahonda Civet', category: 'car', price: 18000, joy: 5 },
  { id: 'car-corona', emoji: '🚗', name: 'Doyota Corona', category: 'car', price: 20000, joy: 5 },
  { id: 'car-focal', emoji: '🚗', name: 'Nord Focal', category: 'car', price: 19000, joy: 5 },
  { id: 'car-malantis', emoji: '🚗', name: 'Chevier Malantis', category: 'car', price: 24000, joy: 6 },
  { id: 'car-elantis', emoji: '🚗', name: 'Hyundong Elantis', category: 'car', price: 21000, joy: 5 },
  { id: 'car-altimo', emoji: '🚗', name: 'Nissano Altimo', category: 'car', price: 25000, joy: 6 },
  { id: 'car-gulf', emoji: '🚗', name: 'Bolkswagen Gulf', category: 'car', price: 27000, joy: 6 },
  { id: 'car-imprezza', emoji: '🚙', name: 'Subario Imprezza', category: 'car', price: 28000, joy: 6 },
  { id: 'car-roadster', emoji: '🏎️', name: 'Mazza Roadster', category: 'car', price: 32000, joy: 8 },
  { id: 'car-wagon', emoji: '🚙', name: 'Voulvo Wagon', category: 'car', price: 42000, joy: 7 },
  { id: 'car-cklass', emoji: '🚘', name: 'Bercedes C-Klass', category: 'car', price: 52000, joy: 9 },
  { id: 'car-dmw3', emoji: '🚘', name: 'DMW Series 3', category: 'car', price: 54000, joy: 9 },
  { id: 'car-owdi', emoji: '🚘', name: 'Owdi A4', category: 'car', price: 50000, joy: 9 },
  { id: 'car-lexicon', emoji: '🚘', name: 'Lexicon RX', category: 'car', price: 56000, joy: 9 },
  { id: 'car-tezla', emoji: '🔌', name: 'Tezla Model Z', category: 'car', price: 52000, joy: 11 },
  { id: 'car-jaguor', emoji: '🏎️', name: 'Jaguor F-Cat', category: 'car', price: 92000, joy: 12 },
  { id: 'car-defiant', emoji: '🚙', name: 'Land Rider Defiant', category: 'car', price: 96000, joy: 12 },
  { id: 'car-porcha', emoji: '🏎️', name: 'Porcha 918', category: 'car', price: 130000, joy: 14 },
  { id: 'car-ferrori', emoji: '🏎️', name: 'Ferrori Rossa', category: 'car', price: 320000, joy: 18 },
  { id: 'car-lambo', emoji: '🏎️', name: 'Lambogotti Toro', category: 'car', price: 420000, joy: 20 },
  { id: 'car-royston', emoji: '🚘', name: 'Rolls-Royston Phantasm', category: 'car', price: 520000, joy: 22 },
  { id: 'car-buggati', emoji: '🏎️', name: 'Buggati Cheron', category: 'car', price: 2500000, joy: 28 },

  // ----- Phones (parody names) -----
  { id: 'phone-nockia', emoji: '📞', name: 'Nockia Brick', category: 'phone', price: 60, joy: 1 },
  { id: 'phone-redmimi', emoji: '📱', name: 'Xioami Redmimi', category: 'phone', price: 250, joy: 3 },
  { id: 'phone-razer', emoji: '📱', name: 'Motorolla Razer', category: 'phone', price: 400, joy: 3 },
  { id: 'phone-pixil', emoji: '📱', name: 'Boogle Pixil', category: 'phone', price: 700, joy: 4 },
  { id: 'phone-onefone', emoji: '📱', name: 'Onefone Pro', category: 'phone', price: 550, joy: 4 },
  { id: 'phone-milkyway', emoji: '📱', name: 'Samsong Milkyway S', category: 'phone', price: 850, joy: 5 },
  { id: 'phone-pear-se', emoji: '📱', name: 'Pear Phone SE', category: 'phone', price: 450, joy: 4 },
  { id: 'phone-pear-12', emoji: '📱', name: 'Pear Phone 12', category: 'phone', price: 950, joy: 6 },
  { id: 'phone-pear-max', emoji: '📱', name: 'Pear Phone 12 Ultra Max', category: 'phone', price: 1400, joy: 8 },

  // ----- Homes -----
  { id: 'home-studio', emoji: '🏚️', name: 'Studio Apartment', category: 'home', price: 40000, joy: 8 },
  { id: 'home-cottage', emoji: '🏡', name: 'Country Cottage', category: 'home', price: 120000, joy: 12 },
  { id: 'home-townhouse', emoji: '🏘️', name: 'Townhouse', category: 'home', price: 200000, joy: 14 },
  { id: 'home-suburban', emoji: '🏠', name: 'Suburban House', category: 'home', price: 260000, joy: 16 },
  { id: 'home-condo', emoji: '🏢', name: 'Downtown Condo', category: 'home', price: 340000, joy: 17 },
  { id: 'home-mansion', emoji: '🏰', name: 'Countryside Mansion', category: 'home', price: 1200000, joy: 24 },
  { id: 'home-villa', emoji: '🌴', name: 'Beachfront Villa', category: 'home', price: 2000000, joy: 27 },
  { id: 'home-penthouse', emoji: '🏙️', name: 'Skyline Penthouse', category: 'home', price: 3500000, joy: 30 },

  // ----- Luxury -----
  { id: 'lux-watch', emoji: '⌚', name: 'Gold Watch', category: 'luxury', price: 12000, joy: 8 },
  { id: 'lux-ring', emoji: '💍', name: 'Diamond Ring', category: 'luxury', price: 25000, joy: 10 },
  { id: 'lux-art', emoji: '🖼️', name: 'Abstract Painting', category: 'luxury', price: 80000, joy: 12 },
  { id: 'lux-yacht', emoji: '🛥️', name: 'Luxury Yacht', category: 'luxury', price: 1500000, joy: 26 },
  { id: 'lux-jet', emoji: '✈️', name: 'Private Jet', category: 'luxury', price: 8000000, joy: 35 },
]

export function getAsset(id: string): Asset | undefined {
  const found = ASSETS.find((a) => a.id === id)
  if (found) return found
  // Dynamic (year-generated) phones aren't in the static list.
  if (id.startsWith('phone-')) return resolvePhone(id)
  return undefined
}

/** Resale value: half the purchase price, rounded. */
export function resaleValue(asset: Asset): number {
  return Math.round(asset.price / 2)
}

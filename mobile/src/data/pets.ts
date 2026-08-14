/**
 * Adoptable pets. Each catalogue entry is a template; adopting creates a
 * live Pet (see types.ts) with its own happiness and bond. Upkeep is
 * country-scaled like other yearly costs; lifespan varies by species.
 */

export interface PetOption {
  id: string
  species: string
  breed: string
  emoji: string
  /** Adoption/purchase price (fixed dollars). */
  price: number
  /** Yearly upkeep (country-scaled at spend time). */
  upkeep: number
  /** Happiness bump when adopted. */
  joy: number
  /** Typical lifespan in years. */
  maxAge: number
  /** Dogs can be walked. */
  walkable?: boolean
}

export const PET_CATALOG: PetOption[] = [
  // Dogs
  { id: 'dog-golden', species: 'Dog', breed: 'Golden Retriever', emoji: '🐕', price: 800, upkeep: 600, joy: 10, maxAge: 14, walkable: true },
  { id: 'dog-lab', species: 'Dog', breed: 'Labrador', emoji: '🐕', price: 700, upkeep: 600, joy: 10, maxAge: 13, walkable: true },
  { id: 'dog-pug', species: 'Dog', breed: 'Pug', emoji: '🐶', price: 900, upkeep: 500, joy: 9, maxAge: 13, walkable: true },
  { id: 'dog-husky', species: 'Dog', breed: 'Husky', emoji: '🐕‍🦺', price: 1000, upkeep: 700, joy: 9, maxAge: 13, walkable: true },
  { id: 'dog-chihuahua', species: 'Dog', breed: 'Chihuahua', emoji: '🐕', price: 600, upkeep: 400, joy: 8, maxAge: 16, walkable: true },
  // Cats
  { id: 'cat-tabby', species: 'Cat', breed: 'Tabby', emoji: '🐈', price: 200, upkeep: 400, joy: 8, maxAge: 16 },
  { id: 'cat-siamese', species: 'Cat', breed: 'Siamese', emoji: '🐈', price: 500, upkeep: 400, joy: 8, maxAge: 16 },
  { id: 'cat-persian', species: 'Cat', breed: 'Persian', emoji: '🐈', price: 700, upkeep: 450, joy: 9, maxAge: 15 },
  { id: 'cat-black', species: 'Cat', breed: 'Black Cat', emoji: '🐈‍⬛', price: 150, upkeep: 400, joy: 8, maxAge: 16 },
  // Small pets
  { id: 'rabbit', species: 'Rabbit', breed: 'Lop Rabbit', emoji: '🐇', price: 120, upkeep: 250, joy: 6, maxAge: 10 },
  { id: 'hamster', species: 'Hamster', breed: 'Hamster', emoji: '🐹', price: 40, upkeep: 120, joy: 5, maxAge: 3 },
  { id: 'guinea', species: 'Guinea Pig', breed: 'Guinea Pig', emoji: '🐹', price: 50, upkeep: 150, joy: 5, maxAge: 7 },
  // Birds
  { id: 'parrot', species: 'Bird', breed: 'Parrot', emoji: '🦜', price: 1200, upkeep: 500, joy: 8, maxAge: 40 },
  { id: 'canary', species: 'Bird', breed: 'Canary', emoji: '🐦', price: 80, upkeep: 150, joy: 5, maxAge: 12 },
  // Exotic
  { id: 'goldfish', species: 'Fish', breed: 'Goldfish', emoji: '🐟', price: 15, upkeep: 60, joy: 3, maxAge: 6 },
  { id: 'turtle', species: 'Reptile', breed: 'Turtle', emoji: '🐢', price: 150, upkeep: 200, joy: 5, maxAge: 40 },
  { id: 'snake', species: 'Reptile', breed: 'Python', emoji: '🐍', price: 300, upkeep: 300, joy: 6, maxAge: 20 },
  { id: 'horse', species: 'Horse', breed: 'Stallion', emoji: '🐴', price: 8000, upkeep: 4000, joy: 12, maxAge: 28, walkable: true },
]

export function getPetOption(id: string): PetOption | undefined {
  return PET_CATALOG.find((p) => p.id === id)
}

/** A random pet option of a species ("Cat", "Dog", "Fish"…), for free adoptions. */
export function randomPetOfSpecies(species: string): PetOption | undefined {
  const pool = PET_CATALOG.filter((p) => p.species === species)
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : undefined
}

/** Cute names for a freshly adopted pet. */
export const PET_NAMES = [
  'Buddy', 'Luna', 'Max', 'Bella', 'Charlie', 'Milo', 'Lucy', 'Rocky', 'Daisy', 'Coco',
  'Rex', 'Molly', 'Simba', 'Nala', 'Shadow', 'Ginger', 'Peanut', 'Oreo', 'Ziggy', 'Mochi',
]

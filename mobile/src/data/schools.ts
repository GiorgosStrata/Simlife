import { poolKeyFor, randomLastName } from './names'

/**
 * Country-appropriate school names, generated BitLife-style:
 * a local place name + the school type ("Palm Street High School").
 * Place pools follow the same cultural mapping as names.ts.
 */

const PLACES: Record<string, string[]> = {
  anglo: ['Palm Street', 'Palm Beach', 'Oak Hill', 'Riverside', 'Maple Grove', 'Lakeside', 'Springfield', 'Hillcrest', 'Kingsway', 'Sunset Park', 'Cedar Valley', 'Brookfield', 'Northgate', 'Fairview', 'Elm Grove'],
  hispanic: ['San Martín', 'Santa Rosa', 'El Prado', 'Las Flores', 'Bolívar', 'La Esperanza', 'San Isidro', 'Los Álamos', 'Miraflores', 'Santa Lucía', 'El Paraíso', 'Buenavista'],
  francophone: ['Saint-Michel', 'Belleville', 'Montclair', 'Les Tilleuls', 'Sainte-Marie', 'Beauregard', 'Lamartine', 'Victor Hugo', 'Rousseau', 'Le Parc', 'Fontaine', 'Clairmont'],
  german: ['Lindenhof', 'Goethe', 'Schiller', 'Am Wald', 'Rosental', 'Bergstraße', 'Humboldt', 'Sonnenberg', 'Eichendorf', 'Neustadt', 'Talblick', 'Birkenau'],
  dutch: ['Willemspark', 'De Linde', 'Oranje', 'Vondel', 'Zonnehof', 'Erasmus', 'Rembrandt', 'De Regenboog', 'Het Anker', 'Windmolen'],
  italian: ['Garibaldi', 'Dante Alighieri', 'San Marco', 'Bellavista', 'Leonardo da Vinci', 'Montebello', 'Santa Chiara', 'Verdi', 'Colombo', 'Fontanella'],
  portuguese: ['São Jorge', 'Santa Clara', 'Boa Vista', 'Ipanema', 'Dom Pedro', 'Alameda', 'Primavera', 'Monte Verde', 'São Bento', 'Camões'],
  nordic: ['Björkhagen', 'Solberg', 'Fjellheim', 'Nørrebro', 'Vasastan', 'Grönalund', 'Nordstrand', 'Skogsbacken', 'Havsvik', 'Lillehammer'],
  slavic: ['Pushkin', 'Kosciuszko', 'Zelena Gora', 'Slavia', 'Vltava', 'Kalinka', 'Mickiewicz', 'Dunav', 'Morava', 'Vesna'],
  greek: ['Palm Street', 'Aristotelous', 'Platanos', 'Agia Sofia', 'Elia', 'Akropoli', 'Thalassa', 'Olympos', 'Kastro', 'Paralia'],
  turkish: ['Atatürk', 'Cumhuriyet', 'Yıldız', 'Gülistan', 'Bahçelievler', 'Zeytinlik', 'Çamlıca', 'Güneş', 'Yeşiltepe', 'Deniz'],
  arabic: ['Al-Nour', 'Al-Andalus', 'Al-Salam', 'Ibn Sina', 'Al-Farabi', 'Al-Zahra', 'Al-Waha', 'Palm Oasis', 'Al-Amal', 'Al-Hikma'],
  persian: ['Ferdowsi', 'Hafez', 'Saadi', 'Golestan', 'Bahar', 'Khayyam', 'Laleh', 'Aftab', 'Bustan', 'Damavand'],
  hebrew: ['HaShalom', 'Herzl', 'Ben Gurion', 'HaGefen', 'Carmel', 'Yarden', 'HaZait', 'Galil', 'Tamar', 'Negev'],
  southAsian: ['Gandhi', 'Nehru', 'Lotus Valley', 'Saraswati', 'Jasmine Garden', 'Tagore', 'Green Park', 'Ashoka', 'Himalaya', 'Ganga'],
  chinese: ['Guanghua', 'Mingde', 'Zhongshan', 'Jade Garden', 'Huaxing', 'Wenhua', 'Xinhua', 'Springfield', 'Lotus Hill', 'Golden Bridge'],
  japanese: ['Sakura', 'Fujimi', 'Aoyama', 'Midori', 'Hikari', 'Wakaba', 'Asahi', 'Kaede', 'Shirakawa', 'Hoshino'],
  korean: ['Hanbit', 'Sejong', 'Arirang', 'Namsan', 'Mugunghwa', 'Haneul', 'Dasom', 'Saebyeok', 'Baekdu', 'Hangang'],
  southeastAsian: ['Merdeka', 'Lotus', 'Bayan', 'Sri Mulia', 'Golden Temple', 'Mekong', 'Frangipani', 'Harmony', 'Rajah', 'Orchid Park'],
  african: ['Ubuntu', 'Kilimanjaro', 'Baobab', 'Savanna', 'Unity', 'Freedom Park', 'Acacia', 'Harambee', 'Palm Grove', 'Sunrise'],
}

export type SchoolStage = 'primary' | 'middle' | 'high' | 'university'

const STAGE_LABEL: Record<Exclude<SchoolStage, 'university'>, string> = {
  primary: 'Primary School',
  middle: 'Middle School',
  high: 'High School',
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function placesFor(countryCode: string | null): string[] {
  return PLACES[poolKeyFor(countryCode)] ?? PLACES.anglo
}

/** e.g. "Palm Street High School", "Sakura Middle School". */
export function schoolNameFor(countryCode: string | null, stage: SchoolStage): string {
  const place = pick(placesFor(countryCode))
  if (stage === 'university') {
    return Math.random() < 0.5 ? `University of ${place}` : `${place} University`
  }
  return `${place} ${STAGE_LABEL[stage]}`
}

/** "Mr. Tanaka" / "Ms. García" — teachers go by their last name. */
export function teacherName(countryCode: string | null, gender: 'male' | 'female'): string {
  return `${gender === 'male' ? 'Mr.' : 'Ms.'} ${randomLastName(countryCode)}`
}

/** Which school stage the character is in, if any. */
export function schoolStageFor(age: number, inUniversity: boolean): SchoolStage | null {
  if (inUniversity) return 'university'
  if (age >= 6 && age < 12) return 'primary'
  if (age >= 12 && age < 15) return 'middle'
  if (age >= 15 && age < 18) return 'high'
  return null
}

/**
 * Sports leagues for the special (fame) sports careers. League and team
 * names are original parodies to avoid trademarks (like the car brands).
 * Football has five leagues (England/Spain/France/Italy/Germany) and
 * basketball five (NBA/EuroLeague/Spain/Greece/France). When you turn pro
 * you're drafted onto a random team in a random league of your sport.
 */

export type SportKind = 'basketball' | 'football'

export interface Team {
  id: string
  name: string
}

export interface League {
  id: string
  sport: SportKind
  name: string
  /** Games in a season (used to build the win/loss record). */
  games: number
  teams: Team[]
}

const t = (id: string, name: string): Team => ({ id, name })

export const LEAGUES: League[] = [
  // ---------------- Football ----------------
  {
    id: 'eng-prem',
    sport: 'football',
    name: 'Anglian Premier Division',
    games: 38,
    teams: [
      t('eng-man-red', 'Manchester Red'),
      t('eng-man-sky', 'Manchester Sky'),
      t('eng-gunners', 'London Gunners'),
      t('eng-liverpol', 'Liverpol FC'),
      t('eng-chelsee', 'Chelsee FC'),
      t('eng-spurz', 'Totteringham Spurz'),
      t('eng-newcassel', 'Newcassel United'),
      t('eng-villans', 'Aston Villans'),
    ],
  },
  {
    id: 'esp-loga',
    sport: 'football',
    name: 'Iberian La Loga',
    games: 38,
    teams: [
      t('esp-madril', 'Real Madril'),
      t('esp-barca', 'Barcalona'),
      t('esp-atleti', 'Atletico Madril'),
      t('esp-sevillo', 'Sevillo FC'),
      t('esp-valentia', 'Valentia CF'),
      t('esp-villareal', 'Villareal Yellows'),
      t('esp-betica', 'Real Betica'),
      t('esp-bilbo', 'Athletico Bilbo'),
    ],
  },
  {
    id: 'fra-ligue',
    sport: 'football',
    name: 'French Ligue Un',
    games: 34,
    teams: [
      t('fra-psj', 'Paris Saint-Jermaine'),
      t('fra-marseille', 'Marseille Olympic'),
      t('fra-lyon', 'Lyonnais OL'),
      t('fra-monaco', 'Monaco Rouge'),
      t('fra-lille', 'Lille Dogues'),
      t('fra-rennes', 'Rennais FC'),
      t('fra-nice', 'Nice Eagles'),
      t('fra-lens', 'Lens Bloods'),
    ],
  },
  {
    id: 'ita-seria',
    sport: 'football',
    name: 'Italian Seria A',
    games: 38,
    teams: [
      t('ita-juventos', 'Juventos'),
      t('ita-millan', 'AC Millan'),
      t('ita-inter', 'Inter Milano'),
      t('ita-napoletano', 'Napoletano'),
      t('ita-roma', 'Roma Lupi'),
      t('ita-lazio', 'Lazio Skyblue'),
      t('ita-fiorentino', 'Fiorentino'),
      t('ita-atalanto', 'Atalanto'),
    ],
  },
  {
    id: 'ger-liga',
    sport: 'football',
    name: 'German Bundesligo',
    games: 34,
    teams: [
      t('ger-bavaria', 'Bavaria Munch'),
      t('ger-dortmond', 'Dortmond Bees'),
      t('ger-leipsig', 'Leipsig Bulls'),
      t('ger-leverkuse', 'Leverkuse Aspirins'),
      t('ger-schalko', 'Schalko Miners'),
      t('ger-frankfort', 'Frankfort Eagles'),
      t('ger-wolfsborg', 'Wolfsborg'),
      t('ger-gladbach', 'Gladbach Foals'),
    ],
  },

  // ---------------- Basketball ----------------
  {
    id: 'nbb',
    sport: 'basketball',
    name: 'National Basketball Bureau',
    games: 82,
    teams: [
      t('nbb-larkers', 'LA Larkers'),
      t('nbb-seltics', 'Boston Seltics'),
      t('nbb-bows', 'Chicago Bows'),
      t('nbb-heatwave', 'Miami Heatwave'),
      t('nbb-warlords', 'Golden State Warlords'),
      t('nbb-netz', 'Brooklyn Netz'),
      t('nbb-mavrix', 'Dallas Mavrix'),
      t('nbb-rapture', 'Toronto Rapture'),
      t('nbb-nugs', 'Denver Golden Nugs'),
      t('nbb-blaze', 'Phoenix Blaze'),
    ],
  },
  {
    id: 'euro-cup',
    sport: 'basketball',
    name: 'Continental Basket Cup',
    games: 34,
    teams: [
      t('eu-moskva', 'Moskva Reds'),
      t('eu-madril-bc', 'Madril Basket'),
      t('eu-barca-bc', 'Barcalona Basket'),
      t('eu-fenerbache', 'Fenerbache'),
      t('eu-olympiacos', 'Piraeus Reds'),
      t('eu-panathinos', 'Athens Greens'),
      t('eu-maccabi', 'Maccabi Telaviv'),
      t('eu-efes', 'Istanbul Efes'),
    ],
  },
  {
    id: 'esp-acb',
    sport: 'basketball',
    name: 'Iberian Basket Liga',
    games: 34,
    teams: [
      t('acb-madril', 'Madril Basket'),
      t('acb-barca', 'Barcalona Basket'),
      t('acb-baskonio', 'Baskonio'),
      t('acb-malago', 'Malago Unicorns'),
      t('acb-valentia', 'Valentia Basket'),
      t('acb-canario', 'Gran Canario'),
      t('acb-joventut', 'Joventut Badalono'),
    ],
  },
  {
    id: 'gre-basket',
    sport: 'basketball',
    name: 'Hellenic Basket League',
    games: 26,
    teams: [
      t('gre-olympiacos', 'Piraeus Reds'),
      t('gre-panathinos', 'Athens Greens'),
      t('gre-aris', 'Aris Salonika'),
      t('gre-paok', 'PAOK Salonika'),
      t('gre-aek', 'AEK Athens'),
      t('gre-peristeri', 'Peristeri'),
      t('gre-kolossos', 'Kolossos Rodos'),
    ],
  },
  {
    id: 'fra-basket',
    sport: 'basketball',
    name: 'French Pro Basket',
    games: 34,
    teams: [
      t('fbk-asvel', 'Lyon-Villo'),
      t('fbk-monaco', 'Monaco Roca'),
      t('fbk-paris', 'Paris Basket'),
      t('fbk-strasborg', 'Strasborg IG'),
      t('fbk-dijon', 'Dijon JDA'),
      t('fbk-lemans', 'Le Mans Sarthe'),
      t('fbk-cholet', 'Cholet Basket'),
    ],
  },
]

/** Which sport a special job is (or null if it isn't a league sport). */
export function jobSport(jobId: string | null): SportKind | null {
  if (jobId === 'basketball-player') return 'basketball'
  if (jobId === 'football-player') return 'football'
  return null
}

/** All leagues for a sport (used when drafting a newly-signed pro). */
export function leaguesForSport(sport: SportKind): League[] {
  return LEAGUES.filter((l) => l.sport === sport)
}

/** A representative league for a job's sport — used to detect sport jobs. */
export function leagueForJob(jobId: string | null): League | null {
  const sport = jobSport(jobId)
  return sport ? (leaguesForSport(sport)[0] ?? null) : null
}

export function getTeam(teamId: string | null): { team: Team; league: League } | null {
  if (!teamId) return null
  for (const league of LEAGUES) {
    const team = league.teams.find((t) => t.id === teamId)
    if (team) return { team, league }
  }
  return null
}

export function teamName(teamId: string | null): string {
  return getTeam(teamId)?.team.name ?? 'Free Agent'
}

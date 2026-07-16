/**
 * Sports leagues for the special (fame) sports careers. Team names are
 * original parodies to avoid trademarks. Each sports job maps to one
 * league; you're drafted onto a random team and play a season every year.
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

export const LEAGUES: League[] = [
  {
    id: 'nbb',
    sport: 'basketball',
    name: 'National Basketball Bureau',
    games: 82,
    teams: [
      { id: 'la-larkers', name: 'LA Larkers' },
      { id: 'boston-seltics', name: 'Boston Seltics' },
      { id: 'chicago-bows', name: 'Chicago Bows' },
      { id: 'miami-heatwave', name: 'Miami Heatwave' },
      { id: 'golden-warlords', name: 'Golden State Warlords' },
      { id: 'brooklyn-netz', name: 'Brooklyn Netz' },
      { id: 'dallas-mavs', name: 'Dallas Mavrix' },
      { id: 'toronto-rapture', name: 'Toronto Rapture' },
      { id: 'denver-nugs', name: 'Denver Golden Nugs' },
      { id: 'phoenix-blaze', name: 'Phoenix Blaze' },
    ],
  },
  {
    id: 'gfl',
    sport: 'football',
    name: 'Global Football League',
    games: 38,
    teams: [
      { id: 'manchester-red', name: 'Manchester Red' },
      { id: 'manchester-sky', name: 'Manchester Sky' },
      { id: 'london-gunners', name: 'London Gunners' },
      { id: 'liverpol', name: 'Liverpol FC' },
      { id: 'chelsee', name: 'Chelsee FC' },
      { id: 'real-madril', name: 'Real Madril' },
      { id: 'barcalona', name: 'Barcalona' },
      { id: 'bavaria-munch', name: 'Bavaria Munch' },
      { id: 'juventos', name: 'Juventos' },
      { id: 'paris-sg', name: 'Paris Saint-Jermaine' },
    ],
  },
]

/** Which sport a special job is (or null if it isn't a league sport). */
export function jobSport(jobId: string | null): SportKind | null {
  if (jobId === 'basketball-player') return 'basketball'
  if (jobId === 'football-player') return 'football'
  return null
}

export function leagueForJob(jobId: string | null): League | null {
  const sport = jobSport(jobId)
  return sport ? (LEAGUES.find((l) => l.sport === sport) ?? null) : null
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

export interface Team {
  id: string
  name: string
  abbreviation: string
  owner_name: string
  owner_email: string
  faab_budget: number
  faab_spent: number
}

export interface Standing {
  team_id: string
  week_number: number
  wins: number
  losses: number
  ties: number
  points_for: number
  points_against: number
  win_pct: number
  streak: string
  rank: number
  teams: Team
}

export interface Matchup {
  id: string
  week_number: number
  home_team_id: string
  away_team_id: string
  home_points: number
  away_points: number
  home_projected: number
  away_projected: number
  winner_team_id: string | null
  is_final: boolean
  week_start: string
  week_end: string
  home_team: Team
  away_team: Team
}

export interface RosterPlayer {
  id: string
  lineup_slot: string
  acquisition_type: string
  is_active: boolean
  mlb_players: {
    id: string
    mlb_id: number
    full_name: string
    primary_position: string
    mlb_team_abbr: string
    injury_status: string | null
  }
}

export interface StatLine {
  mlb_player_id: number
  game_date: string
  fantasy_points: number
  hits: number
  home_runs: number
  rbi: number
  stolen_bases: number
  innings_pitched: number
  pitcher_strikeouts: number
  saves: number
  holds: number
}

export interface WaiverClaim {
  id: string
  team_id: string
  bid_amount: number
  status: string
  process_date: string
  result_notes: string | null
  add_player: { full_name: string; primary_position: string; mlb_team_abbr: string }
  drop_player: { full_name: string } | null
  teams: { name: string; abbreviation: string }
}

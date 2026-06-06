import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const LEAGUE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const THRASHERS_NAME = 'Thrashers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamName = searchParams.get('team') || THRASHERS_NAME

  const { data: team } = await supabase
    .from('teams')
    .select('id, name, owner_name, faab_budget, faab_spent')
    .eq('league_id', LEAGUE_ID)
    .eq('name', teamName)
    .single()

  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

  const { data: roster, error } = await supabase
    .from('rosters')
    .select(`*, mlb_players(id, mlb_id, full_name, primary_position, mlb_team_abbr, mlb_team_name, injury_status)`)
    .eq('team_id', team.id)
    .eq('is_active', true)
    .order('lineup_slot')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get season stat totals for each player
  const mlbIds = (roster || []).map(r => (r.mlb_players as any)?.mlb_id).filter(Boolean)
  const { data: stats } = await supabase
    .from('stat_lines')
    .select('mlb_player_id, fantasy_points, hits, home_runs, rbi, stolen_bases, innings_pitched, pitcher_strikeouts, saves, holds')
    .in('mlb_player_id', mlbIds)
    .eq('season', 2026)

  // Aggregate per player
  const statMap: Record<number, any> = {}
  for (const s of stats || []) {
    if (!statMap[s.mlb_player_id]) {
      statMap[s.mlb_player_id] = { fantasy_points: 0, hits: 0, home_runs: 0, rbi: 0, stolen_bases: 0, innings_pitched: 0, pitcher_strikeouts: 0, saves: 0, holds: 0 }
    }
    const m = statMap[s.mlb_player_id]
    m.fantasy_points += s.fantasy_points || 0
    m.hits += s.hits || 0
    m.home_runs += s.home_runs || 0
    m.rbi += s.rbi || 0
    m.stolen_bases += s.stolen_bases || 0
    m.innings_pitched += s.innings_pitched || 0
    m.pitcher_strikeouts += s.pitcher_strikeouts || 0
    m.saves += s.saves || 0
    m.holds += s.holds || 0
  }

  const rosterWithStats = (roster || []).map(r => ({
    ...r,
    season_stats: statMap[(r.mlb_players as any)?.mlb_id] || null
  }))

  return NextResponse.json({ team, roster: rosterWithStats })
}

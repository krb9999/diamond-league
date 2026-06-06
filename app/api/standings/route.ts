import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LEAGUE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export async function GET() {
  // Get all teams with their roster counts and calculated stats
  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')
    .eq('league_id', LEAGUE_ID)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get matchup results to calculate W/L/pts
  const { data: matchups } = await supabase
    .from('matchups')
    .select('*')
    .eq('league_id', LEAGUE_ID)
    .eq('is_final', true)

  // Calculate standings from matchups
  const statsMap: Record<string, any> = {}
  for (const t of teams || []) {
    statsMap[t.id] = { wins: 0, losses: 0, ties: 0, points_for: 0, points_against: 0 }
  }

  for (const m of matchups || []) {
    if (!statsMap[m.home_team_id] || !statsMap[m.away_team_id]) continue
    const h = statsMap[m.home_team_id]
    const a = statsMap[m.away_team_id]
    h.points_for += m.home_points || 0
    h.points_against += m.away_points || 0
    a.points_for += m.away_points || 0
    a.points_against += m.home_points || 0
    if (m.home_points > m.away_points) { h.wins++; a.losses++ }
    else if (m.away_points > m.home_points) { a.wins++; h.losses++ }
    else { h.ties++; a.ties++ }
  }

  // Get current week roster totals (season points from stat_lines)
  const { data: seasonPts } = await supabase
    .from('stat_lines')
    .select('mlb_player_id, fantasy_points')
    .eq('season', 2026)

  const playerPts: Record<number, number> = {}
  for (const s of seasonPts || []) {
    playerPts[s.mlb_player_id] = (playerPts[s.mlb_player_id] || 0) + s.fantasy_points
  }

  // Get rosters to sum team season points
  const { data: rosters } = await supabase
    .from('rosters')
    .select('team_id, mlb_players(mlb_id)')
    .eq('league_id', LEAGUE_ID)
    .eq('is_active', true)

  const teamSeasonPts: Record<string, number> = {}
  for (const r of rosters || []) {
    const mid = (r.mlb_players as any)?.mlb_id
    if (!mid) continue
    teamSeasonPts[r.team_id] = (teamSeasonPts[r.team_id] || 0) + (playerPts[mid] || 0)
  }

  const standings = (teams || []).map(t => {
    const s = statsMap[t.id] || { wins: 0, losses: 0, ties: 0, points_for: 0, points_against: 0 }
    const gp = s.wins + s.losses + s.ties
    return {
      ...t,
      ...s,
      win_pct: gp > 0 ? s.wins / gp : 0,
      season_points: Math.round((teamSeasonPts[t.id] || 0) * 100) / 100,
      faab_remaining: t.faab_budget - t.faab_spent,
    }
  }).sort((a, b) => b.win_pct - a.win_pct || b.points_for - a.points_for)

  return NextResponse.json({ standings })
}

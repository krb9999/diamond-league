import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const LEAGUE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const week = searchParams.get('week')

  let query = supabase
    .from('matchups')
    .select(`*, home_team:teams!matchups_home_team_id_fkey(id,name,abbreviation,owner_name), away_team:teams!matchups_away_team_id_fkey(id,name,abbreviation,owner_name)`)
    .eq('league_id', LEAGUE_ID)
    .order('week_number', { ascending: false })

  if (week) query = query.eq('week_number', parseInt(week))
  else query = query.limit(12) // latest week

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ matchups: data || [] })
}

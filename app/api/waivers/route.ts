import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const LEAGUE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export async function GET() {
  const { data: claims, error } = await supabase
    .from('waiver_claims')
    .select(`*, teams(name, abbreviation), add_player:mlb_players!waiver_claims_add_player_id_fkey(full_name, primary_position, mlb_team_abbr), drop_player:mlb_players!waiver_claims_drop_player_id_fkey(full_name)`)
    .eq('league_id', LEAGUE_ID)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: ledger } = await supabase
    .from('faab_ledger')
    .select(`*, teams(name, abbreviation)`)
    .eq('league_id', LEAGUE_ID)
    .order('created_at', { ascending: false })
    .limit(30)

  return NextResponse.json({ claims: claims || [], ledger: ledger || [] })
}

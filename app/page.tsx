'use client'

import { useState, useEffect, useCallback } from 'react'

const LEAGUE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined, dec = 1) {
  if (n == null) return '—'
  return n.toFixed(dec)
}

function pct(n: number) {
  return (n * 100).toFixed(1) + '%'
}

function posColor(pos: string) {
  const map: Record<string, string> = {
    C:'#f59e0b', '1B':'#3b82f6', '2B':'#8b5cf6', '3B':'#ef4444',
    SS:'#10b981', MI:'#10b981', CI:'#3b82f6', OF:'#22c55e',
    U:'#6b7280', SP:'#f97316', RP:'#ec4899', bench:'#374151',
    IL:'#ef4444', Minors:'#6b7280',
  }
  return map[pos] || '#6b7280'
}

// ─── subcomponents ───────────────────────────────────────────────────────────

function Header({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  const tabs = [
    { id: 'standings', label: 'Standings' },
    { id: 'scores',    label: 'Scores' },
    { id: 'thrashers', label: 'Thrashers' },
    { id: 'waivers',  label: 'Waivers / FAAB' },
  ]
  return (
    <header style={{ background: '#0a0e0a', borderBottom: '1px solid #1f2e1f', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, height: 56 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#22c55e" strokeWidth="1.5"/>
              <path d="M4 14 Q14 6 24 14 Q14 22 4 14Z" fill="none" stroke="#22c55e" strokeWidth="1"/>
              <circle cx="14" cy="14" r="2" fill="#22c55e"/>
            </svg>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, letterSpacing: '0.08em', lineHeight: 1, color: '#f5f0e8' }}>Diamond League</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#4a5a4a', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Roto Queso · 2026</div>
            </div>
          </div>

          {/* Tabs */}
          <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
            {tabs.map(t => (
              <button key={t.id} className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
                style={{ background: 'none', border: 'none', fontFamily: "'DM Mono', monospace" }}>
                {t.label}
              </button>
            ))}
          </nav>

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span className="live-dot" />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#4a5a4a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Standings ───────────────────────────────────────────────────────────────

function StandingsView() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/standings').then(r => r.json()).then(d => {
      setData(d.standings || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <SectionHeader title="League Standings" sub="2026 Season · Roto Queso · H2H Points" />
      <div className="sb-card" style={{ overflow: 'hidden' }}>
        <table className="dl-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>Team</th>
              <th style={{ textAlign: 'right' }}>W</th>
              <th style={{ textAlign: 'right' }}>L</th>
              <th style={{ textAlign: 'right' }}>T</th>
              <th style={{ textAlign: 'right' }}>WIN%</th>
              <th style={{ textAlign: 'right' }}>PF</th>
              <th style={{ textAlign: 'right' }}>PA</th>
              <th style={{ textAlign: 'right' }}>DIFF</th>
              <th style={{ textAlign: 'right' }}>SZN PTS</th>
              <th style={{ textAlign: 'right' }}>FAAB</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t, i) => {
              const diff = t.points_for - t.points_against
              const isThrasher = t.name === 'Thrashers'
              return (
                <tr key={t.id} style={isThrasher ? { background: 'rgba(34,197,94,0.05)' } : {}}>
                  <td style={{ fontFamily: "'DM Mono', monospace", color: i < 6 ? '#22c55e' : '#4a5a4a', fontSize: 12 }}>
                    {i < 6 ? '★' : ''}{i + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500, color: isThrasher ? '#22c55e' : '#f5f0e8' }}>{t.name}</span>
                      <span style={{ fontSize: 11, color: '#4a5a4a', fontFamily: "'DM Mono', monospace" }}>{t.owner_name}</span>
                    </div>
                  </td>
                  <td className="stat-cell" style={{ textAlign: 'right', color: '#22c55e' }}>{t.wins}</td>
                  <td className="stat-cell" style={{ textAlign: 'right', color: '#ef4444' }}>{t.losses}</td>
                  <td className="stat-cell" style={{ textAlign: 'right', color: '#4a5a4a' }}>{t.ties}</td>
                  <td className="stat-cell" style={{ textAlign: 'right' }}>{pct(t.win_pct)}</td>
                  <td className="stat-cell" style={{ textAlign: 'right' }}>{fmt(t.points_for, 2)}</td>
                  <td className="stat-cell" style={{ textAlign: 'right' }}>{fmt(t.points_against, 2)}</td>
                  <td className="stat-cell" style={{ textAlign: 'right', color: diff >= 0 ? '#22c55e' : '#ef4444' }}>
                    {diff >= 0 ? '+' : ''}{fmt(diff, 2)}
                  </td>
                  <td className="score" style={{ textAlign: 'right', fontSize: 18 }}>{fmt(t.season_points, 1)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className="mono" style={{ fontSize: 12 }}>${t.faab_remaining}</span>
                      <div className="faab-bar" style={{ width: 60 }}>
                        <div className="faab-fill" style={{ width: `${(t.faab_remaining / t.faab_budget) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#4a5a4a', letterSpacing: '0.08em' }}>
        ★ Playoff position · Win% tiebreaker: Total Points For
      </div>
    </div>
  )
}

// ─── Scores ──────────────────────────────────────────────────────────────────

function ScoresView() {
  const [matchups, setMatchups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/matchups').then(r => r.json()).then(d => {
      setMatchups(d.matchups || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  if (matchups.length === 0) {
    return (
      <div>
        <SectionHeader title="Matchup Scores" sub="Current Week" />
        <div className="sb-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontFamily: "'DM Mono', monospace", color: '#4a5a4a', fontSize: 13 }}>
            No matchups scheduled yet. Set up the weekly schedule to see scores here.
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: '#4a5a4a' }}>
            Stats sync nightly at 10pm PT · Today's games will appear tomorrow
          </div>
        </div>
      </div>
    )
  }

  const weekNum = matchups[0]?.week_number
  return (
    <div>
      <SectionHeader title={`Week ${weekNum} Scores`} sub={matchups[0]?.week_start ? `${matchups[0].week_start} – ${matchups[0].week_end}` : 'Current Week'} />
      <div style={{ display: 'grid', gap: 12 }}>
        {matchups.map(m => <MatchupCard key={m.id} matchup={m} />)}
      </div>
    </div>
  )
}

function MatchupCard({ matchup: m }: { matchup: any }) {
  const homeWin = m.home_points > m.away_points
  const awayWin = m.away_points > m.home_points
  const isFinal = m.is_final

  return (
    <div className="sb-card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Away */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontWeight: 500, color: awayWin ? '#f5f0e8' : '#6b7280' }}>{m.away_team?.name}</div>
          <div style={{ fontSize: 11, color: '#4a5a4a', fontFamily: "'DM Mono', monospace" }}>{m.away_team?.owner_name}</div>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span className="score" style={{ fontSize: 32, color: awayWin ? '#22c55e' : '#6b7280', minWidth: 70, textAlign: 'right' }}>
            {fmt(m.away_points, 2)}
          </span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#4a5a4a', letterSpacing: '0.1em' }}>
              {isFinal ? 'FINAL' : 'LIVE'}
            </div>
            <div style={{ fontSize: 11, color: '#1f2e1f', lineHeight: 1 }}>vs</div>
          </div>
          <span className="score" style={{ fontSize: 32, color: homeWin ? '#22c55e' : '#6b7280', minWidth: 70, textAlign: 'left' }}>
            {fmt(m.home_points, 2)}
          </span>
        </div>

        {/* Home */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, color: homeWin ? '#f5f0e8' : '#6b7280' }}>{m.home_team?.name}</div>
          <div style={{ fontSize: 11, color: '#4a5a4a', fontFamily: "'DM Mono', monospace" }}>{m.home_team?.owner_name}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Thrashers Roster ─────────────────────────────────────────────────────────

function ThrasherView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'pitchers'>('all')

  useEffect(() => {
    fetch('/api/roster?team=Thrashers').then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />
  if (!data?.roster) return <div style={{ color: '#4a5a4a', padding: 48 }}>Roster not found</div>

  const { team, roster } = data
  const totalPts = roster.reduce((sum: number, r: any) => sum + (r.season_stats?.fantasy_points || 0), 0)
  const faabPct = ((team.faab_budget - team.faab_spent) / team.faab_budget) * 100

  const slotOrder = ['C','1B','2B','3B','SS','MI','CI','OF','U','SP','RP','bench','IL','Minors']
  const sorted = [...roster].sort((a, b) =>
    slotOrder.indexOf(a.lineup_slot) - slotOrder.indexOf(b.lineup_slot)
  )

  const filtered = filter === 'active'
    ? sorted.filter(r => !['bench','IL','Minors'].includes(r.lineup_slot))
    : filter === 'pitchers'
    ? sorted.filter(r => ['SP','RP'].includes(r.lineup_slot))
    : sorted

  const isPitcher = (r: any) => ['SP','RP','P'].includes(r.mlb_players?.primary_position)

  return (
    <div>
      <SectionHeader title="Thrashers" sub={`Keith Bockmier · ${roster.length} players`} />

      {/* Team summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Season Points" value={fmt(totalPts, 1)} accent="#22c55e" />
        <StatCard label="FAAB Remaining" value={`$${team.faab_budget - team.faab_spent}`} accent="#f59e0b"
          sub={<div className="faab-bar" style={{ width: '100%', marginTop: 8 }}>
            <div className="faab-fill" style={{ width: `${faabPct}%`, background: '#f59e0b' }} />
          </div>} />
        <StatCard label="Active Batters" value={String(filtered.filter((r: any) => !['SP','RP','bench','IL','Minors'].includes(r.lineup_slot)).length)} accent="#3b82f6" />
        <StatCard label="Active Pitchers" value={String(filtered.filter((r: any) => ['SP','RP'].includes(r.lineup_slot)).length)} accent="#f97316" />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['all','active','pitchers'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '5px 12px', border: `1px solid ${filter === f ? '#22c55e' : '#1f2e1f'}`,
              background: filter === f ? 'rgba(34,197,94,0.1)' : 'transparent',
              color: filter === f ? '#22c55e' : '#4a5a4a', borderRadius: 3, cursor: 'pointer' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="sb-card" style={{ overflow: 'hidden' }}>
        <table className="dl-table">
          <thead>
            <tr>
              <th>Slot</th>
              <th>Player</th>
              <th>Pos</th>
              <th>Team</th>
              <th style={{ textAlign: 'right' }}>FPTS</th>
              <th style={{ textAlign: 'right' }}>H</th>
              <th style={{ textAlign: 'right' }}>HR</th>
              <th style={{ textAlign: 'right' }}>RBI</th>
              <th style={{ textAlign: 'right' }}>SB</th>
              <th style={{ textAlign: 'right' }}>IP</th>
              <th style={{ textAlign: 'right' }}>K</th>
              <th style={{ textAlign: 'right' }}>SV</th>
              <th style={{ textAlign: 'right' }}>HD</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => {
              const p = r.mlb_players
              const s = r.season_stats
              const slotBg = r.lineup_slot === 'IL' ? 'rgba(239,68,68,0.07)' : r.lineup_slot === 'bench' ? 'rgba(0,0,0,0.3)' : 'transparent'
              return (
                <tr key={r.id} style={{ background: slotBg, opacity: ['bench','IL','Minors'].includes(r.lineup_slot) ? 0.6 : 1 }}>
                  <td>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '2px 7px', borderRadius: 3,
                      background: `${posColor(r.lineup_slot)}22`, color: posColor(r.lineup_slot), border: `1px solid ${posColor(r.lineup_slot)}44` }}>
                      {r.lineup_slot}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{p?.full_name}</span>
                    {p?.injury_status && <span style={{ marginLeft: 6, fontSize: 10, color: '#ef4444', fontFamily: "'DM Mono', monospace" }}>
                      {p.injury_status}
                    </span>}
                  </td>
                  <td><span className="pos-pill">{p?.primary_position}</span></td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#4a5a4a' }}>{p?.mlb_team_abbr}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="score" style={{ fontSize: 20, color: (s?.fantasy_points || 0) > 100 ? '#22c55e' : '#f5f0e8' }}>
                      {s ? fmt(s.fantasy_points, 1) : '—'}
                    </span>
                  </td>
                  <td className="stat-cell" style={{ textAlign: 'right', color: '#4a5a4a' }}>{s?.hits ?? '—'}</td>
                  <td className="stat-cell" style={{ textAlign: 'right' }}>{s?.home_runs ?? '—'}</td>
                  <td className="stat-cell" style={{ textAlign: 'right' }}>{s?.rbi ?? '—'}</td>
                  <td className="stat-cell" style={{ textAlign: 'right' }}>{s?.stolen_bases ?? '—'}</td>
                  <td className="stat-cell" style={{ textAlign: 'right' }}>{s?.innings_pitched ? fmt(s.innings_pitched, 1) : '—'}</td>
                  <td className="stat-cell" style={{ textAlign: 'right' }}>{s?.pitcher_strikeouts ?? '—'}</td>
                  <td className="stat-cell" style={{ textAlign: 'right' }}>{s?.saves ?? '—'}</td>
                  <td className="stat-cell" style={{ textAlign: 'right' }}>{s?.holds ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Waivers ─────────────────────────────────────────────────────────────────

function WaiversView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/waivers').then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  const { claims = [], ledger = [] } = data || {}

  const statusColor: Record<string, string> = {
    pending: '#f59e0b', processed: '#22c55e', rejected: '#ef4444', cancelled: '#6b7280'
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <SectionHeader title="Waiver Claims" sub="FAAB Auction Queue · Processes Saturday & Sunday night" />
        <div className="sb-card" style={{ overflow: 'hidden' }}>
          {claims.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#4a5a4a' }}>
              No waiver claims on file yet
            </div>
          ) : (
            <table className="dl-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Add</th>
                  <th>Drop</th>
                  <th style={{ textAlign: 'right' }}>Bid</th>
                  <th>Status</th>
                  <th>Process Date</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{c.teams?.abbreviation}</div>
                      <div style={{ fontSize: 11, color: '#4a5a4a' }}>{c.teams?.name}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.add_player?.full_name}</div>
                      <div style={{ fontSize: 11, color: '#4a5a4a' }}>
                        <span className="pos-pill">{c.add_player?.primary_position}</span> {c.add_player?.mlb_team_abbr}
                      </div>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>{c.drop_player?.full_name || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="score" style={{ fontSize: 22, color: '#f59e0b' }}>${c.bid_amount}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.08em',
                        padding: '3px 8px', borderRadius: 3,
                        background: `${statusColor[c.status] || '#6b7280'}22`,
                        color: statusColor[c.status] || '#6b7280',
                        border: `1px solid ${statusColor[c.status] || '#6b7280'}44`,
                        textTransform: 'uppercase' }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#4a5a4a' }}>
                      {c.process_date || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div>
        <SectionHeader title="FAAB Ledger" sub="Budget transaction history" />
        <div className="sb-card" style={{ overflow: 'hidden' }}>
          {ledger.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#4a5a4a' }}>
              No FAAB transactions yet
            </div>
          ) : (
            <table className="dl-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Balance After</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((l: any) => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{l.teams?.abbreviation}</td>
                    <td style={{ fontSize: 12, color: '#4a5a4a' }}>{l.description || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="score" style={{ fontSize: 18, color: l.amount < 0 ? '#ef4444' : '#22c55e' }}>
                        {l.amount > 0 ? '+' : ''}${l.amount}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                      ${l.balance_after}
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#4a5a4a' }}>
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="green-line" style={{ marginBottom: 16 }}>
      <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, letterSpacing: '0.05em', color: '#f5f0e8', lineHeight: 1 }}>{title}</h2>
      {sub && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#4a5a4a', letterSpacing: '0.08em', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function StatCard({ label, value, accent, sub }: { label: string; value: string; accent: string; sub?: React.ReactNode }) {
  return (
    <div className="sb-card" style={{ padding: '16px 20px' }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#4a5a4a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div className="score" style={{ fontSize: 36, color: accent, lineHeight: 1 }}>{value}</div>
      {sub}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#22c55e', letterSpacing: '0.15em' }}>
        LOADING…
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab] = useState('standings')

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'standings' && <StandingsView />}
        {activeTab === 'scores'    && <ScoresView />}
        {activeTab === 'thrashers' && <ThrasherView />}
        {activeTab === 'waivers'   && <WaiversView />}
      </main>
    </div>
  )
}

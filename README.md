# Diamond League

Fantasy baseball commissioner dashboard for Roto Queso League 2026.

## Stack
- **Next.js 15** + TypeScript + Tailwind CSS v4
- **Supabase** (diamond league project)
- **MLB Stats API** for live player/stat sync
- Deployed on **Vercel**

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase anon key
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://qbyiwxsgowraooddtgkd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Features
- **Standings** — Live W/L/PF/PA with FAAB bars
- **Scores** — Weekly H2H matchup scoreboard  
- **Thrashers** — Roster view with season stats
- **Waivers / FAAB** — Claim queue and ledger

## Data Sync

Stats auto-sync via Supabase Edge Functions:
- `mlb-sync-players` — Weekly (Monday noon UTC)
- `mlb-sync-stats-v2` — Nightly (2am + 5am UTC)

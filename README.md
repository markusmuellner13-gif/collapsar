# Collapsar — Merge to the Void

A physics-based merge game: drop celestial bodies, fuse matching tiers, and
chase the final Singularity. Built with Next.js 15 (App Router), TypeScript,
Matter.js, Tailwind, Framer Motion, Zustand, and a Turso (libSQL) leaderboard.

## Features

- Custom canvas-rendered physics engine (Matter.js) with procedural particle
  effects and fully synthesized WebAudio sound — no binary asset files.
- Daily Challenge with a deterministic seeded piece sequence (same board for
  every player each day) + Endless mode.
- Global leaderboards (daily + all-time) backed by Turso, with server-side
  score plausibility checks.
- Local profile (name + generated avatar), settings, pause/resume, share.
- Device-responsive canvas that adapts to any viewport via a single
  `useDeviceViewport` hook + `ResizeObserver`-driven scaling.
- PWA manifest + generated icons/OG image (via `next/og`, no external asset
  hosting required).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Turso credentials
npm run db:init              # creates the scores table
npm run dev
```

## Leaderboard setup (Turso)

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create collapsar
turso db show collapsar --url
turso db tokens create collapsar
```

Put the resulting URL/token into `.env.local` for local dev, and into the
Vercel project's Environment Variables (`TURSO_DATABASE_URL`,
`TURSO_AUTH_TOKEN`) for production. The app works without them — the
leaderboard just reports as unavailable until configured.

## Deployment

Deployed on Vercel with the GitHub integration enabled, so every push to
`main` triggers a new production deployment automatically.

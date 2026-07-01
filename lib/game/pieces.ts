export interface PieceDef {
  tier: number;
  name: string;
  radius: number;
  color: string;
  glow: string;
  score: number;
}

// Celestial-body merge chain: dust -> ... -> star -> singularity.
// Radii and score curve tuned so early merges feel frequent and satisfying,
// while later tiers require real board control (mirrors Suika-style pacing).
export const PIECES: PieceDef[] = [
  { tier: 0, name: "Dust", radius: 15, color: "#b8b3c9", glow: "#e5e2f0", score: 1 },
  { tier: 1, name: "Pebble", radius: 20, color: "#a89bd9", glow: "#cfc4f5", score: 3 },
  { tier: 2, name: "Moonlet", radius: 26, color: "#8f7ce0", glow: "#b9a6f7", score: 6 },
  { tier: 3, name: "Moon", radius: 34, color: "#7c5ce8", glow: "#a689f5", score: 10 },
  { tier: 4, name: "Asteroid", radius: 43, color: "#6b4de0", glow: "#9673f2", score: 15 },
  { tier: 5, name: "Planetoid", radius: 53, color: "#5f3fd6", glow: "#8a63ef", score: 21 },
  { tier: 6, name: "Planet", radius: 64, color: "#4f8ce8", glow: "#7fb3f5", score: 28 },
  { tier: 7, name: "Gas Giant", radius: 76, color: "#3fb3c9", glow: "#7fe0f0", score: 36 },
  { tier: 8, name: "Star", radius: 89, color: "#ffb84f", glow: "#ffe0a3", score: 45 },
  { tier: 9, name: "Supernova", radius: 103, color: "#ff7a3d", glow: "#ffc39e", score: 55 },
  { tier: 10, name: "Singularity", radius: 118, color: "#0a0714", glow: "#c99bff", score: 100 },
];

export const MAX_SPAWN_TIER = 4; // pieces spawn as tiers 0-4 only
export const SINGULARITY_TIER = PIECES.length - 1;

export function pieceFor(tier: number): PieceDef {
  const p = PIECES[Math.min(tier, PIECES.length - 1)];
  if (!p) throw new Error(`Unknown piece tier ${tier}`);
  return p;
}

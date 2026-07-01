"use client";

// Deterministic geometric avatar generated purely from a seed string — no
// external avatar service / image hosting dependency.
function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i) | 0;
  return Math.abs(h);
}

const PALETTES = [
  ["#7c4dff", "#ff6b3d"],
  ["#4f8ce8", "#7c5ce8"],
  ["#3fb3c9", "#7c4dff"],
  ["#ff8a5b", "#5f2eea"],
  ["#ffb84f", "#4820b8"],
];

export default function Avatar({ seed, size = 40 }: { seed: string; size?: number }) {
  const h = hashSeed(seed);
  const palette = PALETTES[h % PALETTES.length]!;
  const rotation = h % 360;
  const cells = Array.from({ length: 9 }, (_, i) => (h >> i) & 1);

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ width: size, height: size, background: `linear-gradient(${rotation}deg, ${palette[0]}, ${palette[1]})` }}
    >
      <svg width={size} height={size} viewBox="0 0 3 3">
        {cells.map((on, i) =>
          on ? <rect key={i} x={i % 3} y={Math.floor(i / 3)} width={1} height={1} fill="rgba(255,255,255,0.35)" /> : null
        )}
      </svg>
    </div>
  );
}

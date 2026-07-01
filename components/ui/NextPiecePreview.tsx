"use client";
import { PIECES } from "@/lib/game/pieces";

export default function NextPiecePreview({ tier }: { tier: number }) {
  const def = PIECES[Math.min(tier, PIECES.length - 1)]!;
  const size = 36;
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Next</span>
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 35%, ${def.glow}, ${def.color})`,
          boxShadow: `0 0 12px ${def.glow}55`,
        }}
      />
    </div>
  );
}

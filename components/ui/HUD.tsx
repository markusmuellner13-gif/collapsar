"use client";
import { useGameStore } from "@/store/useGameStore";
import NextPiecePreview from "./NextPiecePreview";

export default function HUD({ onPause }: { onPause: () => void }) {
  const score = useGameStore((s) => s.score);
  const best = useGameStore((s) => s.best);
  const nextTier = useGameStore((s) => s.nextTier);
  const danger = useGameStore((s) => s.danger);
  const mode = useGameStore((s) => s.mode);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 sm:p-4">
      <div className="pointer-events-auto flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          {mode === "daily" ? "Daily · Score" : "Score"}
        </span>
        <span className="font-display text-2xl font-bold tabular-nums text-white">{score.toLocaleString()}</span>
        {best > 0 && <span className="text-[10px] text-white/30">Best {best.toLocaleString()}</span>}
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <NextPiecePreview tier={nextTier} />
        <button
          onClick={onPause}
          aria-label="Pause"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/10 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
            <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
          </svg>
        </button>
      </div>

      {danger > 0 && (
        <div className="absolute left-0 right-0 top-0 h-1 bg-ember-500/20">
          <div className="h-full bg-ember-500 transition-all" style={{ width: `${danger * 100}%` }} />
        </div>
      )}
    </div>
  );
}

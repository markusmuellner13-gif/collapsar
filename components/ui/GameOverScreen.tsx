"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useProfileStore } from "@/store/useProfileStore";
import { todayUTCString } from "@/lib/game/rng";
import Button from "./Button";

async function submitScore(mode: "daily" | "endless", score: number, name: string, deviceId: string, elapsedSec: number) {
  try {
    await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        score,
        name,
        deviceId,
        elapsedSec,
        day: mode === "daily" ? todayUTCString() : undefined,
      }),
    });
  } catch {
    // best-effort — offline / DB not configured yet shouldn't block the player
  }
}

export default function GameOverScreen({ onRetry, onMenu }: { onRetry: () => void; onMenu: () => void }) {
  const finalScore = useGameStore((s) => s.finalScore);
  const mode = useGameStore((s) => s.mode);
  const best = useGameStore((s) => s.best);
  const runStartedAt = useGameStore((s) => s.runStartedAt);
  const { displayName, deviceId } = useProfileStore();
  const [submitted, setSubmitted] = useState(false);
  const [shared, setShared] = useState(false);
  const isNewBest = finalScore > best;

  if (!submitted) {
    setSubmitted(true);
    const elapsedSec = runStartedAt ? Math.max(1, Math.round((Date.now() - runStartedAt) / 1000)) : 60;
    void submitScore(mode, finalScore, displayName, deviceId, elapsedSec);
  }

  async function handleShare() {
    const text = `I scored ${finalScore.toLocaleString()} in ${mode === "daily" ? "today's Collapsar daily challenge" : "Collapsar"} 🌌\nCan you beat it?`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }
    } catch {
      // user cancelled share sheet — no-op
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-void/90 px-6 backdrop-blur-md">
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex w-full max-w-xs flex-col items-center gap-4">
        <p className="text-xs font-medium uppercase tracking-widest text-white/40">{isNewBest ? "New Best!" : "Collapsed"}</p>
        <p className="font-display text-6xl font-black text-white">{finalScore.toLocaleString()}</p>
        {isNewBest && <span className="rounded-full bg-nebula-500/20 px-3 py-1 text-xs font-semibold text-nebula-100">🏆 Personal Record</span>}

        <div className="mt-2 flex w-full flex-col gap-3">
          <Button onClick={handleShare}>{shared ? "Copied!" : "Share Result"}</Button>
          <Button variant="secondary" onClick={onRetry}>
            Play Again
          </Button>
          <Button variant="ghost" onClick={onMenu}>
            Main Menu
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

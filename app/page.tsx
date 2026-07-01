"use client";
import { useState } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import MainMenu from "@/components/ui/MainMenu";
import GameScreen from "@/components/game/GameScreen";
import { useGameStore, type GameMode } from "@/store/useGameStore";
import { useProfileStore } from "@/store/useProfileStore";

export default function Home() {
  const [ready, setReady] = useState(false);
  const status = useGameStore((s) => s.status);
  const setStatus = useGameStore((s) => s.setStatus);
  const startRun = useGameStore((s) => s.startRun);
  const bestEndless = useProfileStore((s) => s.bestEndless);
  const bestDailyByDate = useProfileStore((s) => s.bestDailyByDate);

  function handleStart(mode: GameMode) {
    const best = mode === "endless" ? bestEndless : Math.max(0, ...Object.values(bestDailyByDate));
    startRun(mode, best);
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-void">
      <div className="mx-auto h-full w-full max-w-2xl">
        {!ready && (
          <LoadingScreen
            onDone={() => {
              setReady(true);
              setStatus("menu");
            }}
          />
        )}
        {ready && status === "menu" && <MainMenu onStart={handleStart} />}
        {ready && (status === "playing" || status === "paused" || status === "gameover") && (
          <GameScreen onExit={() => setStatus("menu")} />
        )}
      </div>
    </main>
  );
}

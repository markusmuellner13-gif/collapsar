"use client";
import dynamic from "next/dynamic";
import { useGameStore } from "@/store/useGameStore";
import HUD from "@/components/ui/HUD";
import PauseOverlay from "@/components/ui/PauseOverlay";
import GameOverScreen from "@/components/ui/GameOverScreen";
import { sound } from "@/lib/game/sound";

const GameCanvas = dynamic(() => import("./GameCanvas"), { ssr: false });

export default function GameScreen({ onExit }: { onExit: () => void }) {
  const status = useGameStore((s) => s.status);
  const mode = useGameStore((s) => s.mode);
  const setStatus = useGameStore((s) => s.setStatus);
  const startRun = useGameStore((s) => s.startRun);
  const best = useGameStore((s) => s.best);

  return (
    <div className="relative h-full w-full">
      <GameCanvas mode={mode} />
      <HUD
        onPause={() => {
          sound.click();
          setStatus("paused");
        }}
      />
      {status === "paused" && (
        <PauseOverlay
          onResume={() => setStatus("playing")}
          onQuit={() => {
            setStatus("menu");
            onExit();
          }}
        />
      )}
      {status === "gameover" && (
        <GameOverScreen
          onRetry={() => startRun(mode, best)}
          onMenu={() => {
            setStatus("menu");
            onExit();
          }}
        />
      )}
    </div>
  );
}

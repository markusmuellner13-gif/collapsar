"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useGameStore, type GameMode } from "@/store/useGameStore";
import { useProfileStore } from "@/store/useProfileStore";
import Avatar from "./Avatar";
import Button from "./Button";
import SettingsModal from "./SettingsModal";
import ProfileModal from "./ProfileModal";
import Leaderboard from "./Leaderboard";
import { sound } from "@/lib/game/sound";

export default function MainMenu({ onStart }: { onStart: (mode: GameMode) => void }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBoard, setShowBoard] = useState<GameMode | null>(null);
  const displayName = useProfileStore((s) => s.displayName);
  const avatarSeed = useProfileStore((s) => s.avatarSeed);
  const bestEndless = useProfileStore((s) => s.bestEndless);
  const best = useGameStore((s) => s.best);
  void best;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between overflow-y-auto px-5 py-8 sm:py-10">
      <button
        onClick={() => setShowProfile(true)}
        className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md transition hover:bg-white/10"
      >
        <Avatar seed={avatarSeed} size={44} />
        <div className="text-left">
          <p className="text-sm font-semibold text-white">{displayName}</p>
          <p className="text-xs text-white/40">Best {bestEndless.toLocaleString()}</p>
        </div>
        <svg className="ml-auto text-white/30" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-1 py-6"
      >
        <div className="relative mb-4 h-20 w-20">
          <div className="absolute inset-0 animate-float rounded-full bg-gradient-to-br from-nebula-400 to-ember-500 shadow-glow-lg" />
        </div>
        <h1 className="font-display text-4xl font-black tracking-tight text-white sm:text-5xl">COLLAPSAR</h1>
        <p className="mt-1 text-sm text-white/40">drop. merge. collapse the void.</p>
      </motion.div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button
          onClick={() => {
            sound.click();
            onStart("daily");
          }}
          className="w-full"
        >
          <span>☄️ Daily Challenge</span>
        </Button>
        <button
          onClick={() => setShowBoard("daily")}
          className="text-center text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
        >
          view today&apos;s leaderboard
        </button>

        <Button
          variant="secondary"
          onClick={() => {
            sound.click();
            onStart("endless");
          }}
          className="mt-2 w-full"
        >
          <span>♾️ Endless Mode</span>
        </Button>
        <button
          onClick={() => setShowBoard("endless")}
          className="text-center text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
        >
          view all-time leaderboard
        </button>

        <Button variant="ghost" onClick={() => setShowSettings(true)} className="mt-2 w-full">
          Settings
        </Button>
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-white/25">
        Tap or drag to aim. Release to drop.
        <br />
        Merge two of the same body to fuse it into the next tier.
      </p>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showBoard && <Leaderboard mode={showBoard} onClose={() => setShowBoard(null)} />}
    </div>
  );
}

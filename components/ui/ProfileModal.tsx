"use client";
import { useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import Avatar from "./Avatar";
import Button from "./Button";
import Modal from "./Modal";

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { displayName, avatarSeed, setDisplayName, rerollAvatar, bestEndless, bestDailyByDate, gamesPlayed } = useProfileStore();
  const [name, setName] = useState(displayName);
  const bestDaily = Math.max(0, ...Object.values(bestDailyByDate));

  return (
    <Modal title="Profile" onClose={onClose}>
      <div className="flex flex-col items-center gap-3">
        <button onClick={rerollAvatar} className="relative">
          <Avatar seed={avatarSeed} size={72} />
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-nebula-500 text-xs">↻</span>
        </button>
        <input
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setDisplayName(name || displayName)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white outline-none focus:border-nebula-400"
        />
        <div className="grid w-full grid-cols-3 gap-2 pt-2">
          <Stat label="Endless best" value={bestEndless} />
          <Stat label="Daily best" value={bestDaily} />
          <Stat label="Games" value={gamesPlayed} />
        </div>
        <Button variant="secondary" className="mt-2 w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 py-3 text-center">
      <p className="font-display text-lg font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-[9px] uppercase tracking-wide text-white/40">{label}</p>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { todayUTCString } from "@/lib/game/rng";
import { useProfileStore } from "@/store/useProfileStore";
import Modal from "./Modal";

interface Entry {
  name: string;
  score: number;
  device_id: string;
  created_at: string;
}

export default function Leaderboard({ mode, onClose }: { mode: "daily" | "endless"; onClose: () => void }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState(false);
  const deviceId = useProfileStore((s) => s.deviceId);

  useEffect(() => {
    const params = new URLSearchParams({ mode });
    if (mode === "daily") params.set("day", todayUTCString());
    fetch(`/api/scores?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setError(true));
  }, [mode]);

  return (
    <Modal title={mode === "daily" ? "Today's Leaderboard" : "All-Time Leaderboard"} onClose={onClose}>
      {error && <p className="py-6 text-center text-sm text-white/40">Leaderboard is warming up — check back soon.</p>}
      {!error && entries === null && <p className="py-6 text-center text-sm text-white/40">Loading…</p>}
      {!error && entries && entries.length === 0 && (
        <p className="py-6 text-center text-sm text-white/40">No scores yet. Be the first to collapse the void.</p>
      )}
      {!error && entries && entries.length > 0 && (
        <ol className="flex flex-col gap-1.5">
          {entries.map((e, i) => (
            <li
              key={`${e.name}-${i}`}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                e.device_id === deviceId ? "border border-nebula-400/50 bg-nebula-500/10" : "bg-white/5"
              }`}
            >
              <span className="w-6 text-center text-xs font-bold text-white/40">{i + 1}</span>
              <span className="flex-1 truncate text-sm text-white">{e.name}</span>
              <span className="font-display text-sm font-bold tabular-nums text-white">{e.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}

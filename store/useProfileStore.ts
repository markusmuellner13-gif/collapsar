"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

const ADJECTIVES = ["Cosmic", "Stellar", "Lunar", "Void", "Nova", "Quantum", "Solar", "Orbital", "Astro", "Nebular"];
const NOUNS = ["Drifter", "Voyager", "Pilot", "Wanderer", "Collapser", "Cadet", "Rogue", "Comet", "Pulsar", "Nomad"];

function randomName() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${a}${n}${Math.floor(Math.random() * 900 + 100)}`;
}

interface ProfileState {
  deviceId: string;
  displayName: string;
  avatarSeed: string;
  bestEndless: number;
  bestDailyByDate: Record<string, number>;
  gamesPlayed: number;
  setDisplayName: (name: string) => void;
  rerollAvatar: () => void;
  recordEndless: (score: number) => void;
  recordDaily: (dateStr: string, score: number) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      deviceId: nanoid(12),
      displayName: randomName(),
      avatarSeed: nanoid(8),
      bestEndless: 0,
      bestDailyByDate: {},
      gamesPlayed: 0,
      setDisplayName: (name) => set({ displayName: name.slice(0, 20) }),
      rerollAvatar: () => set({ avatarSeed: nanoid(8) }),
      recordEndless: (score) =>
        set((s) => ({
          bestEndless: Math.max(s.bestEndless, score),
          gamesPlayed: s.gamesPlayed + 1,
        })),
      recordDaily: (dateStr, score) =>
        set((s) => ({
          bestDailyByDate: {
            ...s.bestDailyByDate,
            [dateStr]: Math.max(s.bestDailyByDate[dateStr] ?? 0, score),
          },
          gamesPlayed: s.gamesPlayed + 1,
        })),
    }),
    { name: "collapsar-profile" }
  )
);

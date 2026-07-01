"use client";
import { create } from "zustand";

export type GameStatus = "loading" | "menu" | "playing" | "paused" | "gameover";
export type GameMode = "daily" | "endless";

interface GameState {
  status: GameStatus;
  mode: GameMode;
  score: number;
  best: number;
  nextTier: number;
  danger: number;
  finalScore: number;
  runStartedAt: number | null;
  setStatus: (s: GameStatus) => void;
  startRun: (mode: GameMode, best: number) => void;
  setScore: (score: number) => void;
  setNextTier: (tier: number) => void;
  setDanger: (d: number) => void;
  endRun: (finalScore: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: "loading",
  mode: "endless",
  score: 0,
  best: 0,
  nextTier: 0,
  danger: 0,
  finalScore: 0,
  runStartedAt: null,
  setStatus: (status) => set({ status }),
  startRun: (mode, best) =>
    set({ mode, status: "playing", score: 0, danger: 0, best, runStartedAt: Date.now() }),
  setScore: (score) => set({ score }),
  setNextTier: (nextTier) => set({ nextTier }),
  setDanger: (danger) => set({ danger }),
  endRun: (finalScore) => set({ status: "gameover", finalScore }),
}));

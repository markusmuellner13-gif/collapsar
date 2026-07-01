"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  soundOn: boolean;
  hapticsOn: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundOn: true,
      hapticsOn: true,
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      toggleHaptics: () => set((s) => ({ hapticsOn: !s.hapticsOn })),
    }),
    { name: "collapsar-settings" }
  )
);

export function vibrate(pattern: number | number[]) {
  if (typeof window === "undefined") return;
  const { hapticsOn } = useSettingsStore.getState();
  if (!hapticsOn) return;
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

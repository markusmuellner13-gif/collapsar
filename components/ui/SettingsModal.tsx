"use client";
import { useSettingsStore } from "@/store/useSettingsStore";
import Modal from "./Modal";

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-white">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${value ? "bg-nebula-500" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { soundOn, hapticsOn, toggleSound, toggleHaptics } = useSettingsStore();
  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <Toggle label="Sound effects" value={soundOn} onChange={toggleSound} />
        <Toggle label="Haptic feedback" value={hapticsOn} onChange={toggleHaptics} />
      </div>
      <p className="mt-5 text-center text-xs text-white/30">Collapsar v1.0</p>
    </Modal>
  );
}

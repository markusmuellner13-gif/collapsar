"use client";
import { motion } from "framer-motion";
import Button from "./Button";

export default function PauseOverlay({ onResume, onQuit }: { onResume: () => void; onQuit: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-void/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-5">
        <h2 className="font-display text-3xl font-bold text-white">Paused</h2>
        <div className="flex w-56 flex-col gap-3">
          <Button onClick={onResume}>Resume</Button>
          <Button variant="secondary" onClick={onQuit}>
            Quit to Menu
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1100;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setProgress(Math.round(t * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onDone, 180);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mb-8 h-24 w-24"
      >
        <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-nebula-500/40" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-nebula-400 to-ember-500 shadow-glow-lg animate-pulse-slow" />
      </motion.div>
      <h1 className="font-display text-3xl font-bold tracking-wide text-white">COLLAPSAR</h1>
      <p className="mt-2 text-sm text-white/40">merge to the void</p>
      <div className="mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-nebula-500 to-ember-500 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 font-mono text-xs text-white/30">{progress}%</p>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

export interface Viewport {
  width: number;
  height: number;
  dpr: number;
  isTouch: boolean;
  isPortrait: boolean;
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl";
  safeAreaTop: number;
}

function computeBreakpoint(width: number): Viewport["breakpoint"] {
  if (width < 400) return "xs";
  if (width < 640) return "sm";
  if (width < 1024) return "md";
  if (width < 1440) return "lg";
  return "xl";
}

// Central "device screen checker": every screen-dependent component reads
// from this single hook so layout, canvas scaling, and touch affordances
// stay consistent across phones, foldables, tablets, and desktop.
export function useDeviceViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 390,
    height: typeof window !== "undefined" ? window.innerHeight : 844,
    dpr: typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 3) : 1,
    isTouch: typeof window !== "undefined" ? "ontouchstart" in window : false,
    isPortrait: typeof window !== "undefined" ? window.innerHeight >= window.innerWidth : true,
    breakpoint: "sm",
    safeAreaTop: 0,
  }));

  useEffect(() => {
    function measure() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setVp({
        width,
        height,
        dpr: Math.min(window.devicePixelRatio || 1, 3),
        isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        isPortrait: height >= width,
        breakpoint: computeBreakpoint(width),
        safeAreaTop: 0,
      });
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      ro.disconnect();
    };
  }, []);

  return vp;
}

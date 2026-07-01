"use client";
import { useEffect, useRef } from "react";
import { DANGER_LINE_Y, GAME_HEIGHT, GAME_WIDTH, MergeEngine } from "@/lib/game/engine";
import { PIECES } from "@/lib/game/pieces";
import { mulberry32, seedFromDateString, todayUTCString } from "@/lib/game/rng";
import { useGameStore } from "@/store/useGameStore";
import { useProfileStore } from "@/store/useProfileStore";
import { vibrate } from "@/store/useSettingsStore";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  r: number;
}

export default function GameCanvas({ mode }: { mode: "daily" | "endless" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MergeEngine | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });

  const setScore = useGameStore((s) => s.setScore);
  const setNextTier = useGameStore((s) => s.setNextTier);
  const setDanger = useGameStore((s) => s.setDanger);
  const endRun = useGameStore((s) => s.endRun);
  const status = useGameStore((s) => s.status);
  const recordEndless = useProfileStore((s) => s.recordEndless);
  const recordDaily = useProfileStore((s) => s.recordDaily);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;

    const rng = mode === "daily" ? mulberry32(seedFromDateString(todayUTCString())) : mulberry32(Date.now() ^ Math.floor(Math.random() * 1e9));

    const engine = new MergeEngine(
      rng,
      {
        onScore: (_delta, total) => setScore(total),
        onMerge: (tier, x, y) => spawnParticles(tier, x, y),
        onNextPiece: (tier) => setNextTier(tier),
        onGameOver: (finalScore) => {
          const today = todayUTCString();
          if (mode === "daily") recordDaily(today, finalScore);
          else recordEndless(finalScore);
          vibrate([40, 30, 60]);
          endRun(finalScore);
        },
        onDangerTick: (d) => setDanger(d),
      },
      mode === "daily"
    );
    engineRef.current = engine;

    function spawnParticles(tier: number, x: number, y: number) {
      const def = PIECES[Math.min(tier, PIECES.length - 1)]!;
      const count = 14 + tier * 2;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const speed = 1.5 + Math.random() * 3;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 30 + Math.random() * 20,
          color: def.glow,
          r: 2 + Math.random() * 3,
        });
      }
      if (particlesRef.current.length > 400) {
        particlesRef.current.splice(0, particlesRef.current.length - 400);
      }
    }

    function resize() {
      if (!wrap || !canvas) return;
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const scale = Math.min(rect.width / GAME_WIDTH, rect.height / GAME_HEIGHT);
      scaleRef.current = scale;
      offsetRef.current = {
        x: (rect.width - GAME_WIDTH * scale) / 2,
        y: (rect.height - GAME_HEIGHT * scale) / 2,
      };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    function toGameX(clientX: number) {
      const rect = canvas!.getBoundingClientRect();
      return (clientX - rect.left - offsetRef.current.x) / scaleRef.current;
    }

    function onPointerMove(e: PointerEvent) {
      engine.setAim(toGameX(e.clientX));
    }
    function onPointerUp(e: PointerEvent) {
      engine.setAim(toGameX(e.clientX));
      if (engine.drop()) vibrate(15);
    }
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);

    function draw() {
      const { width, height } = wrap!.getBoundingClientRect();
      if (!width || !height || !scaleRef.current) return; // not laid out yet
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(offsetRef.current.x, offsetRef.current.y);
      ctx.scale(scaleRef.current, scaleRef.current);

      // container backdrop
      const grd = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      grd.addColorStop(0, "rgba(24,18,41,0.55)");
      grd.addColorStop(1, "rgba(10,7,20,0.75)");
      ctx.fillStyle = grd;
      roundRect(ctx, 0, DANGER_LINE_Y - 40, GAME_WIDTH, GAME_HEIGHT - (DANGER_LINE_Y - 40), 28);
      ctx.fill();

      // danger line
      ctx.save();
      ctx.strokeStyle = "rgba(255,107,61,0.55)";
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, DANGER_LINE_Y);
      ctx.lineTo(GAME_WIDTH - 16, DANGER_LINE_Y);
      ctx.stroke();
      ctx.restore();

      // settled/falling pieces
      for (const p of engine.getSnapshot()) {
        const def = PIECES[Math.min(p.tier, PIECES.length - 1)]!;
        drawPiece(ctx, p.x, p.y, def.radius, def.color, def.glow, false);
      }

      // aim ghost — purely visual until the player drops it
      if (useGameStore.getState().status === "playing") {
        const aim = engine.getAimState();
        const aimDef = PIECES[Math.min(aim.tier, PIECES.length - 1)]!;
        drawPiece(ctx, aim.x, aim.y, aimDef.radius, aimDef.color, aimDef.glow, true);
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(aim.x, aim.y + aimDef.radius);
        ctx.lineTo(aim.x, DANGER_LINE_Y);
        ctx.stroke();
        ctx.restore();
      }

      // particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i]!;
        pt.life++;
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.05;
        if (pt.life > pt.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = 1 - pt.life / pt.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.restore();
    }

    let last = performance.now();
    function loop(now: number) {
      const dt = now - last;
      last = now;
      if (useGameStore.getState().status === "playing") {
        engine.update();
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
      void dt;
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      engine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    engineRef.current?.setPaused(status !== "playing");
  }, [status]);

  return (
    <div ref={wrapRef} className="relative h-full w-full touch-none select-none">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPiece(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, glow: string, active: boolean) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(r) || r <= 0) return;
  ctx.save();
  if (active) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 18;
  }
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, glow);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r - 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

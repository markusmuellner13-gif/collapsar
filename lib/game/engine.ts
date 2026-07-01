import Matter, { Bodies, Body, Engine, Events, World } from "matter-js";
import { MAX_SPAWN_TIER, PIECES, SINGULARITY_TIER, pieceFor } from "./pieces";
import { sound } from "./sound";

// Logical game-space units (device-independent). The rendering layer maps
// this fixed coordinate system onto whatever the real canvas pixel size is,
// so physics behaves identically on a phone and an ultrawide monitor.
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;
export const WALL_THICKNESS = 24;
export const DANGER_LINE_Y = 110;
const DANGER_GRACE_MS = 1600;
const DROP_COOLDOWN_MS = 220;

export interface EngineCallbacks {
  onScore: (delta: number, total: number) => void;
  onMerge: (tier: number, x: number, y: number) => void;
  onNextPiece: (tier: number) => void;
  onGameOver: (finalScore: number) => void;
  onDangerTick: (dangerFrac: number) => void;
}

interface PieceBody {
  body: Body;
  tier: number;
  mergingWith?: number;
  spawnedAt: number;
}

export interface AimState {
  x: number;
  y: number;
  tier: number;
}

export class MergeEngine {
  private engine: Engine;
  private world: World;
  private pieces = new Map<number, PieceBody>();
  private queue: number[] = [];
  private rng: () => number;
  private score = 0;
  private aimX = GAME_WIDTH / 2;
  private currentTier: number;
  private canDrop = true;
  private lastDropAt = 0;
  private dangerSince: number | null = null;
  private gameOver = false;
  private paused = false;
  private cb: EngineCallbacks;

  constructor(rng: () => number, cb: EngineCallbacks, _isDaily = false) {
    this.engine = Engine.create({ gravity: { x: 0, y: 1.05 } });
    this.world = this.engine.world;
    this.rng = rng;
    this.cb = cb;
    this.buildWalls();
    this.queue = [this.rollTier(), this.rollTier()];
    this.currentTier = this.queue.shift()!;
    this.queue.push(this.rollTier());
    this.cb.onNextPiece(this.queue[0]!);

    Events.on(this.engine, "collisionStart", (evt) => this.handleCollisions(evt));
    void _isDaily;
  }

  private rollTier(): number {
    return Math.floor(this.rng() * (MAX_SPAWN_TIER + 1));
  }

  private buildWalls() {
    const opts = { isStatic: true, friction: 0.4, restitution: 0.15, render: { visible: false } };
    const floor = Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + WALL_THICKNESS / 2, GAME_WIDTH, WALL_THICKNESS, opts);
    const left = Bodies.rectangle(-WALL_THICKNESS / 2, GAME_HEIGHT / 2, WALL_THICKNESS, GAME_HEIGHT * 2, opts);
    const right = Bodies.rectangle(GAME_WIDTH + WALL_THICKNESS / 2, GAME_HEIGHT / 2, WALL_THICKNESS, GAME_HEIGHT * 2, opts);
    World.add(this.world, [floor, left, right]);
  }

  // The piece the player is currently aiming is *not* a physics body — it's
  // pure UI state — so there is nothing to un-freeze (and no stale mass/
  // inertia snapshot) when it actually gets dropped into the simulation.
  setAim(x: number) {
    const def = pieceFor(this.currentTier);
    const clamped = Math.max(def.radius + 4, Math.min(GAME_WIDTH - def.radius - 4, x));
    this.aimX = clamped;
  }

  getAimState(): AimState {
    const def = pieceFor(this.currentTier);
    return { x: this.aimX, y: DANGER_LINE_Y - def.radius - 10, tier: this.currentTier };
  }

  drop(): boolean {
    if (this.gameOver || this.paused) return false;
    const now = performance.now();
    if (!this.canDrop || now - this.lastDropAt < DROP_COOLDOWN_MS) return false;

    const def = pieceFor(this.currentTier);
    const body = Bodies.circle(this.aimX, DANGER_LINE_Y - def.radius - 10, def.radius, {
      restitution: 0.15,
      friction: 0.35,
      frictionAir: 0.0005,
      density: 0.0016,
    });
    Body.setVelocity(body, { x: 0, y: 2 });
    this.pieces.set(body.id, { body, tier: this.currentTier, spawnedAt: now });
    World.add(this.world, body);

    this.lastDropAt = now;
    this.canDrop = false;
    sound.drop();

    // brief cooldown before the next piece becomes droppable
    setTimeout(() => {
      this.currentTier = this.queue.shift()!;
      this.queue.push(this.rollTier());
      this.cb.onNextPiece(this.queue[0]!);
      this.canDrop = true;
    }, DROP_COOLDOWN_MS);

    return true;
  }

  private handleCollisions(evt: Matter.IEventCollision<Engine>) {
    for (const pair of evt.pairs) {
      const a = this.pieces.get(pair.bodyA.id);
      const b = this.pieces.get(pair.bodyB.id);
      if (!a || !b) continue;
      if (a.tier !== b.tier) continue;
      if (a.tier >= SINGULARITY_TIER) continue;
      if (a.mergingWith != null || b.mergingWith != null) continue;

      a.mergingWith = b.body.id;
      b.mergingWith = a.body.id;
      this.mergeBodies(a, b);
    }
  }

  private mergeBodies(a: PieceBody, b: PieceBody) {
    const midX = (a.body.position.x + b.body.position.x) / 2;
    const midY = (a.body.position.y + b.body.position.y) / 2;
    const newTier = a.tier + 1;
    const def = pieceFor(newTier);

    World.remove(this.world, a.body);
    World.remove(this.world, b.body);
    this.pieces.delete(a.body.id);
    this.pieces.delete(b.body.id);

    const newBody = Bodies.circle(midX, midY, def.radius, {
      restitution: 0.15,
      friction: 0.35,
      frictionAir: 0.0005,
      density: 0.0016,
    });
    World.add(this.world, newBody);
    this.pieces.set(newBody.id, { body: newBody, tier: newTier, spawnedAt: performance.now() });

    this.score += def.score;
    this.cb.onScore(def.score, this.score);
    this.cb.onMerge(newTier, midX, midY);
    if (newTier >= SINGULARITY_TIER) {
      sound.singularity();
      // Singularity briefly pulls nearby bodies inward then evaporates —
      // a payoff mechanic that also clears board space.
      this.collapseAround(newBody);
    } else {
      sound.merge(newTier);
    }
  }

  private collapseAround(center: Body) {
    const pullRadius = 220;
    for (const [, pb] of this.pieces) {
      if (pb.body.id === center.id) continue;
      const dx = center.position.x - pb.body.position.x;
      const dy = center.position.y - pb.body.position.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < pullRadius) {
        const force = ((pullRadius - dist) / pullRadius) * 0.0009 * pb.body.mass;
        Body.applyForce(pb.body, pb.body.position, { x: (dx / dist) * force, y: (dy / dist) * force });
      }
    }
    setTimeout(() => {
      World.remove(this.world, center);
      this.pieces.delete(center.id);
    }, 900);
  }

  update() {
    if (this.paused || this.gameOver) return;
    Engine.update(this.engine, 1000 / 60);
    this.checkDanger();
  }

  private checkDanger() {
    const now = performance.now();
    let worst = 0;
    for (const [, pb] of this.pieces) {
      const settled = now - pb.spawnedAt > 500;
      if (!settled) continue;
      const topY = pb.body.position.y - pieceFor(pb.tier).radius;
      if (topY < DANGER_LINE_Y) {
        worst = Math.max(worst, DANGER_LINE_Y - topY);
      }
    }

    if (worst > 2) {
      if (this.dangerSince == null) this.dangerSince = now;
      const elapsed = now - this.dangerSince;
      this.cb.onDangerTick(Math.min(1, elapsed / DANGER_GRACE_MS));
      if (elapsed > DANGER_GRACE_MS) {
        this.triggerGameOver();
      }
    } else {
      this.dangerSince = null;
      this.cb.onDangerTick(0);
    }
  }

  private triggerGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    sound.gameOver();
    this.cb.onGameOver(this.score);
  }

  setPaused(paused: boolean) {
    this.paused = paused;
  }

  getSnapshot() {
    return Array.from(this.pieces.values()).map((pb) => ({
      id: pb.body.id,
      x: pb.body.position.x,
      y: pb.body.position.y,
      angle: pb.body.angle,
      tier: pb.tier,
    }));
  }

  getNextTier(): number {
    return this.queue[0] ?? 0;
  }

  getScore() {
    return this.score;
  }

  destroy() {
    World.clear(this.world, false);
    Engine.clear(this.engine);
  }
}

export { PIECES };

import { assets, dialogues } from "../data/assets";
import type { LainState } from "../types/LainState";
import {
  add,
  magnitude,
  scale,
  subtract,
  type Vector2,
} from "../types/Vector2";
import type {
  DialogueSnapshot,
  ExpressionSnapshot,
  LainPetOptions,
  LainPetSnapshot,
  RandomSource,
  Viewport,
} from "../types/LainPetSnapshot";
import {
  parabolaFunction,
  rotateFunction,
  sineFunction,
  type ParametricFunction,
} from "../types/ParametricCurve";

const SPRITE_SIZE = 100;
const IDLE_DURATION = 5000;
const MOVEMENT_TIMEOUT = 10000;
const WALK_RADIUS = 1000;
const WALK_MIN_DISTANCE = 100;
const TARGET_RADIUS = 5;
const TARGET_TOLERANCE = 1e-6;
const FRAME_DURATION = 30;
const MAX_ELAPSED = 100;
const WAVE_AMPLITUDE = 40;
const WAVE_CYCLES = 1.5;
const PARABOLA_HEIGHT = 80;
const AUTONOMOUS_WALK_CHANCE = 0.005;
const AUTONOMOUS_SINE_CHANCE = 0.15;
const AUTONOMOUS_PARABOLA_CHANCE = 0.15;

type TimedState = {
  remaining: number;
  invocation: number;
};


type MovementPath = "direct" | "sine" | "parabola";
export class LainPet {
  private running = false;
  private random: RandomSource;
  private movementTarget: Vector2 | null = null;
  private movementStart: Vector2 | null = null;
  private movementProgress = 0;
  private movementDistance = 0;
  private movementCurve: ParametricFunction | null = null;
  private movementPath: MovementPath = "direct";
  private movementPathHeight = 0;
  private movementRemaining = 0;
  private movementTimedOut = false;
  private idleRemaining = 0;
  private expression: TimedState = { remaining: 0, invocation: 0 };
  private dialogue: TimedState = { remaining: 0, invocation: 0 };
  private dialogueText: string | null = null;
  private expressionAsset: string | null = null;
  private facing: "left" | "right" = "right";

  private state: LainState = {
    position: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    target: { x: 100, y: 100 },
    speed: 3,
    outfit: "default",
    mode: "idle",
    isDragging: false,
  };

  public constructor(options: LainPetOptions | RandomSource = {}) {
    this.random =
      typeof options === "function" ? options : options.random ?? (() => 0.5);
  }

  public start(): void {
    this.running = true;
  }

  public stop(): void {
    this.running = false;
    this.resetMovement();
    this.state.position = { x: 100, y: 100 };
    this.state.velocity = { x: 0, y: 0 };
    this.state.target = { x: 100, y: 100 };
    this.state.mode = "idle";
    this.state.isDragging = false;
    this.idleRemaining = 0;
    this.expression = { remaining: 0, invocation: this.expression.invocation + 1 };
    this.dialogue = { remaining: 0, invocation: this.dialogue.invocation + 1 };
    this.dialogueText = null;
    this.expressionAsset = null;
    this.facing = "right";
  }

  public isRunning(): boolean {
    return this.running;
  }

  public wear(outfit: LainState["outfit"]): void {
    this.state.outfit = outfit;
  }

  public express(): void {
    this.triggerExpression();
  }

  public speak(text?: string): void {
    this.showDialogue(text);
  }

  public getPosition(): Vector2 | null {
    if (!this.running) return null;
    return { ...this.state.position };
  }

  public snapshot(): LainPetSnapshot {
    const dialogue: DialogueSnapshot = {
      visible: this.dialogue.remaining > 0,
      text: this.dialogueText,
    };
    const expression: ExpressionSnapshot = {
      visible: this.expression.remaining > 0,
      asset: this.expressionAsset,
    };

    return {
      ...this.state,
      position: { ...this.state.position },
      velocity: { ...this.state.velocity },
      target: { ...this.state.target },
      facing: this.facing,
      dialogue,
      expression,
    };
  }

  public getSnapshot(): LainPetSnapshot {
    return this.snapshot();
  }

  public beginDrag(position?: Vector2): void {
    if (!this.running) return;

    this.cancelMovement();
    if (position) {
      this.state.position = { ...position };
      this.state.target = { ...position };
    }
    this.state.isDragging = true;
  }

  public updateDrag(position: Vector2): void {
    if (!this.running || !this.state.isDragging) return;

    this.state.position = { ...position };
    this.state.target = { ...position };
    this.state.velocity = { x: 0, y: 0 };
  }

  public endDrag(): void {
    if (!this.running) return;

    this.state.isDragging = false;
    this.cancelMovement();
  }

  public moveTo(target: Vector2): void {
    this.requestMovement(target, "direct");
  }

  public sineMoveTo(target: Vector2): void {
    this.requestMovement(target, "sine");
  }

  public parabolicMoveTo(
    target: Vector2,
    height = PARABOLA_HEIGHT,
  ): void {
    this.requestMovement(target, "parabola", height);
  }

  private requestMovement(
    target: Vector2,
    path: MovementPath,
    height = PARABOLA_HEIGHT,
  ): void {
    if (!this.running) return;

    this.state.target = { ...target };
    if (this.isWithinTargetRadius(target)) {
      this.finishMovement();
      return;
    }

    this.startMovement(target, MOVEMENT_TIMEOUT, path, height);
  }

  /** Advance behavior by at most 100ms; the host owns the frame clock. */
  public advance(
    elapsedMs: number,
    viewport: Viewport,
    random: RandomSource = this.random,
  ): LainPetSnapshot {
    if (!this.running) return this.snapshot();
    const previousRandom = this.random;
    this.random = random;
    try {
      const elapsed = Number.isFinite(elapsedMs)
        ? Math.max(0, Math.min(MAX_ELAPSED, elapsedMs))
        : 0;
      this.expireTimedStates(elapsed);
      if (this.state.isDragging) return this.snapshot();

      if (this.state.mode === "walk") {
        this.moveTowardTarget(elapsed);
      } else {
        this.tryToStartWalking(viewport, elapsed);
      }

      return this.snapshot();
    } finally {
      this.random = previousRandom;
    }
  }

  private expireTimedStates(elapsed: number): void {
    if (this.idleRemaining > 0) {
      this.idleRemaining = Math.max(0, this.idleRemaining - elapsed);
    }

    if (this.movementRemaining > 0) {
      this.movementRemaining -= elapsed;
      if (this.movementRemaining <= 0) {
        this.movementRemaining = 0;
        this.movementTimedOut = true;
        this.state.mode = "idle";
        this.state.velocity = { x: 0, y: 0 };
        this.idleRemaining = IDLE_DURATION;
      }
    }

    if (this.expression.remaining > 0) {
      this.expression.remaining = Math.max(0, this.expression.remaining - elapsed);
      if (this.expression.remaining === 0) this.expressionAsset = null;
    }
    if (this.dialogue.remaining > 0) {
      this.dialogue.remaining = Math.max(0, this.dialogue.remaining - elapsed);
      if (this.dialogue.remaining === 0) this.dialogueText = null;
    }
  }

  private isWithinTargetRadius(target: Vector2): boolean {
    return (
      magnitude(subtract(target, this.state.position)) <=
      TARGET_RADIUS + TARGET_TOLERANCE
    );
  }

  private startMovement(
    target: Vector2,
    timeout = MOVEMENT_TIMEOUT,
    path: MovementPath = "direct",
    pathHeight = PARABOLA_HEIGHT,
  ): boolean {
    const sameTarget =
      this.movementTarget?.x === target.x &&
      this.movementTarget?.y === target.y;
    const samePath =
      this.movementPath === path &&
      (path !== "parabola" || this.movementPathHeight === pathHeight);

    if (sameTarget && this.state.mode === "walk" && samePath) return true;
    if (sameTarget && this.movementTimedOut && this.idleRemaining > 0) {
      return false;
    }

    this.movementTarget = { ...target };
    this.movementTimedOut = false;
    this.movementRemaining = timeout;
    this.state.target = { ...target };
    this.state.mode = "walk";

    if (path === "direct") {
      this.clearMovementPath();
      return true;
    }

    const start = { ...this.state.position };
    const displacement = subtract(target, start);
    const distance = magnitude(displacement);
    if (distance === 0) return false;

    const directionDegrees =
      (Math.atan2(displacement.y, displacement.x) * 180) / Math.PI;
    const localCurve =
      path === "sine"
        ? sineFunction(WAVE_AMPLITUDE, WAVE_CYCLES)
        : parabolaFunction(pathHeight);

    this.movementStart = start;
    this.movementProgress = 0;
    this.movementDistance = distance;
    this.movementPath = path;
    this.movementPathHeight = pathHeight;
    this.movementCurve = rotateFunction(
      (progress) => {
        const point = localCurve(progress);
        return {
          x: point.x * distance,
          y: point.y,
        };
      },
      directionDegrees,
    );
    return true;
  }

  private clearMovementPath(): void {
    this.movementStart = null;
    this.movementProgress = 0;
    this.movementDistance = 0;
    this.movementCurve = null;
    this.movementPath = "direct";
    this.movementPathHeight = 0;
  }

  private cancelMovement(): void {
    this.movementRemaining = 0;
    this.movementTarget = null;
    this.clearMovementPath();
    this.movementTimedOut = false;
    this.state.mode = "idle";
    this.state.velocity = { x: 0, y: 0 };
    this.state.target = { ...this.state.position };
  }

  private finishMovement(): void {
    this.movementRemaining = 0;
    this.movementTarget = null;
    this.clearMovementPath();
    this.movementTimedOut = false;
    this.state.mode = "idle";
    this.state.velocity = { x: 0, y: 0 };
    this.idleRemaining = IDLE_DURATION;
  }

  private resetMovement(): void {
    this.movementRemaining = 0;
    this.movementTarget = null;
    this.clearMovementPath();
    this.movementTimedOut = false;
  }


  private moveTowardTarget(elapsed: number): void {
    this.moveToward(this.state.target, elapsed);
  }

  private moveToward(target: Vector2, elapsed: number): void {
    if (!this.movementCurve) {
      if (this.isWithinTargetRadius(target)) {
        this.finishMovement();
        return;
      }

      const displacement = subtract(target, this.state.position);
      const distance = magnitude(displacement);
      if (distance === 0) {
        this.finishMovement();
        return;
      }

      const step = scale(
        scale(displacement, 1.0 / distance),
        Math.min(
          this.state.speed * (elapsed / FRAME_DURATION),
          distance - TARGET_RADIUS,
        ),
      );

      this.state.velocity = step;
      this.state.position = add(this.state.position, step);

      if (step.x < 0) this.facing = "left";
      else if (step.x > 0) this.facing = "right";

      if (this.isWithinTargetRadius(target)) this.finishMovement();
      return;
    }

    if (!this.movementStart || this.movementDistance <= 0) {
      this.finishMovement();
      return;
    }

    const previousPosition = { ...this.state.position };
    const progressDelta =
      (this.state.speed * (elapsed / FRAME_DURATION)) /
      this.movementDistance;
    this.movementProgress = Math.min(
      1,
      this.movementProgress + progressDelta,
    );

    const nextPosition =
      this.movementProgress >= 1
        ? { ...target }
        : add(this.movementStart, this.movementCurve(this.movementProgress));
    const step = subtract(nextPosition, previousPosition);

    this.state.velocity = step;
    this.state.position = nextPosition;

    if (step.x < 0) this.facing = "left";
    else if (step.x > 0) this.facing = "right";

    if (this.movementProgress >= 1) this.finishMovement();
  }

  private tryToStartWalking(viewport: Viewport, elapsed: number): void {
    if (this.idleRemaining > 0 || elapsed <= 0) return;

    const probability =
      1 -
      Math.pow(
        1 - AUTONOMOUS_WALK_CHANCE,
        elapsed / FRAME_DURATION,
      );
    if (this.nextRandom() >= probability) return;

    const angle = this.nextRandom() * Math.PI * 2;
    const distance =
      WALK_MIN_DISTANCE +
      this.nextRandom() * (WALK_RADIUS - WALK_MIN_DISTANCE);
    const maxX = Math.max(0, viewport.width - SPRITE_SIZE);
    const maxY = Math.max(0, viewport.height - SPRITE_SIZE);
    const unclampedTarget = {
      x: this.state.position.x + Math.cos(angle) * distance,
      y: this.state.position.y + Math.sin(angle) * distance,
    };
    const target = {
      x: Math.max(0, Math.min(unclampedTarget.x, maxX)),
      y: Math.max(0, Math.min(unclampedTarget.y, maxY)),
    };
    const targetDistance = magnitude(subtract(target, this.state.position));

    if (targetDistance <= TARGET_RADIUS || targetDistance > WALK_RADIUS) return;
    const pathRoll = this.nextRandom();
    const path: MovementPath =
      pathRoll < AUTONOMOUS_SINE_CHANCE
        ? "sine"
        : pathRoll <
            AUTONOMOUS_SINE_CHANCE + AUTONOMOUS_PARABOLA_CHANCE
          ? "parabola"
          : "direct";

    this.startMovement(target, MOVEMENT_TIMEOUT, path);
  }

  private triggerExpression(): void {
    if (!this.running) return;

    this.expressionAsset =
      this.state.outfit === "bear" ? assets.misc.exp2 : assets.misc.exp1;
    this.expression = {
      remaining: 3000,
      invocation: this.expression.invocation + 1,
    };
  }

  private showDialogue(text?: string): void {
    if (!this.running) return;

    const message = text ?? dialogues[Math.floor(this.nextRandom() * dialogues.length)];
    this.dialogueText = message ?? "";
    this.dialogue = {
      remaining: 4000,
      invocation: this.dialogue.invocation + 1,
    };
  }

  private nextRandom(): number {
    const value = this.random();
    if (!Number.isFinite(value)) return 0.5;
    return Math.max(0, Math.min(0.999999999, value));
  }
}

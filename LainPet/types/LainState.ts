import type { Vector2 } from "./Vector2";

export type LainState = {
  position: Vector2;
  velocity: Vector2;
  target: Vector2;
  speed: number;
  outfit: "default" | "school" | "pink" | "bear" | "home";
  mode: "idle" | "walk";
  isDragging: boolean;
  eventActive: boolean;
  sugarRush: boolean;
};

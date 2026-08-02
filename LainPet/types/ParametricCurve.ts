import type { Vector2 } from "./Vector2";

export type ParametricFunction = (progress: number) => Vector2;

export function rotateFunction(
  curve: ParametricFunction,
  degrees: number,
): ParametricFunction {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);

  return (progress) => {
    const point = curve(progress);

    return {
      x: point.x * cosine - point.y * sine,
      y: point.x * sine + point.y * cosine,
    };
  };
}

export function sineFunction(
  amplitude: number,
  cycles = 1,
): ParametricFunction {
  return (progress) => ({
    x: progress,
    y: Math.sin(progress * Math.PI * 2 * cycles) * amplitude,
  });
}

export function parabolaFunction(height: number): ParametricFunction {
  return (progress) => ({
    x: progress,
    y: 4 * height * progress * (1 - progress),
  });
}

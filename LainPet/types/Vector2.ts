export type Vector2 = {
  x: number;
  y: number;
};

export function add(a: Vector2, b: Vector2): Vector2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function subtract(a: Vector2, b: Vector2): Vector2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function scale(a: Vector2, scalar: number): Vector2 {
  return {
    x: a.x * scalar,
    y: a.y * scalar,
  };
}

export function magnitude(vector: Vector2): number {
  return Math.hypot(vector.x, vector.y);
}

export function normalize(vector: Vector2): Vector2 {
  const size = magnitude(vector);

  if (size === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / size,
    y: vector.y / size,
  };
}

export function dot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

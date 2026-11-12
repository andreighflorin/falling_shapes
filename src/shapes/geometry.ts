/** A 2D point. */
export interface Point {
  x: number;
  y: number;
}

/**
 * Shoelace formula: exact area of a simple polygon from its ordered vertices.
 * Works for convex, concave (e.g. stars) and irregular polygons alike.
 */
export function polygonArea(points: readonly Point[]): number {
  let sum = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/**
 * Vertices of a regular polygon with `sides` sides inscribed in a circle of
 * the given radius, centred on the origin. The first vertex points up.
 */
export function regularPolygonPoints(sides: number, radius: number): Point[] {
  const points: Point[] = [];
  const offset = -Math.PI / 2; // point upwards
  for (let i = 0; i < sides; i++) {
    const angle = offset + (i / sides) * Math.PI * 2;
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
  return points;
}

/**
 * Vertices of a star polygon alternating between an outer and inner radius.
 */
export function starPoints(spikes: number, outerRadius: number, innerRadius: number): Point[] {
  const points: Point[] = [];
  const step = Math.PI / spikes;
  let angle = -Math.PI / 2;
  for (let i = 0; i < spikes; i++) {
    points.push({ x: Math.cos(angle) * outerRadius, y: Math.sin(angle) * outerRadius });
    angle += step;
    points.push({ x: Math.cos(angle) * innerRadius, y: Math.sin(angle) * innerRadius });
    angle += step;
  }
  return points;
}

/** Flatten points into the [x0, y0, x1, y1, ...] form PIXI's poly() expects. */
export function flatten(points: readonly Point[]): number[] {
  const out: number[] = [];
  for (const p of points) {
    out.push(p.x, p.y);
  }
  return out;
}

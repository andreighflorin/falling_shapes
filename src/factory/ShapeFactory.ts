import type { Shape } from "../shapes/Shape";
import { CircleShape } from "../shapes/CircleShape";
import { EllipseShape } from "../shapes/EllipseShape";
import { IrregularShape } from "../shapes/IrregularShape";
import { PolygonShape } from "../shapes/PolygonShape";
import { StarShape } from "../shapes/StarShape";
import { RANDOM_SHAPE_TYPES, ShapeType } from "../shapes/ShapeType";
import { ShapePool, type ShapeConstructor } from "../pool/ShapePool";
import { CONFIG } from "../core/config";

/** A shape together with the pool key needed to recycle it later. */
export interface SpawnedShape {
  type: ShapeType;
  shape: Shape;
}

/**
 * Factory (design pattern) for creating shapes, backed by the Object Pool.
 *
 * It maps every {@link ShapeType} to a constructor, hands those constructors
 * to the pool, and exposes convenience creators for the three spawn paths:
 * a specific type, a random standard type (auto-generation), and a random
 * irregular shape (click to spawn).
 */
export class ShapeFactory {
  private readonly pool: ShapePool;

  public constructor() {
    const constructors = new Map<ShapeType, ShapeConstructor>([
      [ShapeType.Triangle, () => new PolygonShape(3)],
      [ShapeType.Square, () => new PolygonShape(4)],
      [ShapeType.Pentagon, () => new PolygonShape(5)],
      [ShapeType.Hexagon, () => new PolygonShape(6)],
      [ShapeType.Circle, () => new CircleShape()],
      [ShapeType.Ellipse, () => new EllipseShape()],
      [ShapeType.Star, () => new StarShape()],
      [ShapeType.Irregular, () => new IrregularShape()],
    ]);
    this.pool = new ShapePool(constructors);
  }

  /** Create (or recycle) a shape of a specific type at a position. */
  public create(type: ShapeType, x: number, y: number): SpawnedShape {
    const shape = this.pool.acquire(type);
    const radius = this.randomRadius();
    const color = this.randomColor();
    shape.init(x, y, radius, color, CONFIG.initialFallSpeed);
    return { type, shape };
  }

  /** Auto-generation path: random standard type + random colour (req 2h). */
  public createRandom(x: number, y: number): SpawnedShape {
    const type = RANDOM_SHAPE_TYPES[Math.floor(Math.random() * RANDOM_SHAPE_TYPES.length)];
    return this.create(type, x, y);
  }

  /** Click-to-spawn path: a random irregular polygon (BONUS 3a). */
  public createIrregular(x: number, y: number): SpawnedShape {
    return this.create(ShapeType.Irregular, x, y);
  }

  /** Return a shape to the pool. */
  public recycle(spawned: SpawnedShape): void {
    this.pool.release(spawned.type, spawned.shape);
  }

  private randomRadius(): number {
    const { minShapeRadius, maxShapeRadius } = CONFIG;
    return minShapeRadius + Math.random() * (maxShapeRadius - minShapeRadius);
  }

  private randomColor(): number {
    // Bright, well-saturated colours read clearly against the dark stage.
    const hue = Math.random() * 360;
    return hslToHex(hue, 70, 60);
  }
}

/** Convert HSL to a 0xRRGGBB integer suitable for PIXI fills. */
function hslToHex(h: number, s: number, l: number): number {
  const sat = s / 100;
  const lig = l / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lig - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const ri = Math.round((r + m) * 255);
  const gi = Math.round((g + m) * 255);
  const bi = Math.round((b + m) * 255);
  return (ri << 16) | (gi << 8) | bi;
}

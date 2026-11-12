import { Shape } from "./Shape";
import { flatten, polygonArea, type Point } from "./geometry";

/**
 * A genuinely random irregular polygon (BONUS 3a).
 *
 * Vertices are placed at a random number of angular steps around the centre,
 * each at a random radius. Angles are jittered and sorted so the resulting
 * polygon is simple (non self-intersecting), which keeps the shoelace area
 * correct. The shape is regenerated each time it is drawn so every spawned
 * instance is unique — including recycled ones from the pool.
 */
export class IrregularShape extends Shape {
  private static readonly MIN_VERTICES = 5;
  private static readonly MAX_VERTICES = 10;
  private points: Point[] = [];

  public constructor() {
    super();
  }

  private generatePoints(): Point[] {
    const range = IrregularShape.MAX_VERTICES - IrregularShape.MIN_VERTICES;
    const count = IrregularShape.MIN_VERTICES + Math.floor(Math.random() * (range + 1));
    const pts: Point[] = [];
    for (let i = 0; i < count; i++) {
      // Even angular slice plus jitter keeps vertices ordered => simple polygon.
      const base = (i / count) * Math.PI * 2;
      const jitter = ((Math.random() - 0.5) * (Math.PI * 2)) / count / 1.4;
      const angle = base + jitter;
      const r = this.radius * (0.45 + Math.random() * 0.55);
      pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    return pts;
  }

  protected override redraw(): void {
    this.points = this.generatePoints();
    this.gfx.clear();
    this.gfx.poly(flatten(this.points)).fill({ color: this.color });
  }

  public override getArea(): number {
    return polygonArea(this.points);
  }
}

import { Shape } from "./Shape";
import { flatten, polygonArea, regularPolygonPoints, type Point } from "./geometry";

/**
 * A regular polygon with N sides (triangle, square, pentagon, hexagon, ...).
 * Computes its exact area via the shoelace formula over its own vertices,
 * which keeps all polygon types using a single, correct code path.
 */
export class PolygonShape extends Shape {
  private readonly sides: number;
  private points: Point[] = [];

  public constructor(sides: number) {
    super();
    if (sides < 3) {
      throw new Error(`A polygon needs at least 3 sides, received ${sides}.`);
    }
    this.sides = sides;
  }

  protected override redraw(): void {
    this.points = regularPolygonPoints(this.sides, this.radius);
    this.gfx.clear();
    this.gfx.poly(flatten(this.points)).fill({ color: this.color });
  }

  public override getArea(): number {
    return polygonArea(this.points);
  }
}

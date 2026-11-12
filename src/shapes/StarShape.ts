import { Shape } from "./Shape";
import { flatten, polygonArea, starPoints, type Point } from "./geometry";

/** A 5-pointed star. Area is computed exactly via the shoelace formula. */
export class StarShape extends Shape {
  private static readonly SPIKES = 5;
  private static readonly INNER_RATIO = 0.5;
  private points: Point[] = [];

  public constructor() {
    super();
  }

  protected override redraw(): void {
    this.points = starPoints(StarShape.SPIKES, this.radius, this.radius * StarShape.INNER_RATIO);
    this.gfx.clear();
    this.gfx.poly(flatten(this.points)).fill({ color: this.color });
  }

  public override getArea(): number {
    return polygonArea(this.points);
  }
}

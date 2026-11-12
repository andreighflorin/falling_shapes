import { Shape } from "./Shape";

/**
 * An ellipse. The bounding `radius` is used as the semi-major axis (a); the
 * semi-minor axis (b) is a fixed fraction of it. Area = πab.
 */
export class EllipseShape extends Shape {
  private static readonly MINOR_RATIO = 0.6;

  public constructor() {
    super();
  }

  private get semiMajor(): number {
    return this.radius;
  }

  private get semiMinor(): number {
    return this.radius * EllipseShape.MINOR_RATIO;
  }

  protected override redraw(): void {
    this.gfx.clear();
    this.gfx.ellipse(0, 0, this.semiMajor, this.semiMinor).fill({ color: this.color });
  }

  public override getArea(): number {
    return Math.PI * this.semiMajor * this.semiMinor;
  }
}

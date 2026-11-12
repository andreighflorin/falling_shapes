import { Shape } from "./Shape";

/** A circle. Area = πr². */
export class CircleShape extends Shape {
  public constructor() {
    super();
  }

  protected override redraw(): void {
    this.gfx.clear();
    this.gfx.circle(0, 0, this.radius).fill({ color: this.color });
  }

  public override getArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

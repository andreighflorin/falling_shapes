import { Container, Graphics } from "pixi.js";

/**
 * Abstract base class for every falling shape.
 *
 * Design pattern: Template Method + polymorphism. The base owns the common
 * lifecycle (physics integration, bounds reporting, reset for pooling) while
 * each subclass is responsible only for how it draws itself and how it
 * computes its own exact geometric area.
 *
 * Each Shape IS-A PIXI Container, so it can be added straight to the scene
 * graph and masked by the stage.
 */
export abstract class Shape extends Container {
  /** The reusable Graphics object this shape draws into. */
  protected readonly gfx: Graphics;

  /** Current radius (bounding) used to size the geometry. */
  protected radius = 0;

  /** Current fill colour. */
  protected color = 0xffffff;

  /** Vertical velocity in px/second. */
  public velocityY = 0;

  /** Whether this shape is currently live in the simulation. */
  public active = false;

  protected constructor() {
    super();
    this.gfx = new Graphics();
    this.addChild(this.gfx);
    this.eventMode = "static";
    this.cursor = "pointer";
  }

  /**
   * (Re)initialise this shape for use. Called by the pool/factory so that a
   * recycled instance behaves exactly like a fresh one.
   */
  public init(x: number, y: number, radius: number, color: number, velocityY: number): void {
    this.position.set(x, y);
    this.radius = radius;
    this.color = color;
    this.velocityY = velocityY;
    this.active = true;
    this.visible = true;
    this.renderable = true;
    this.redraw();
  }

  /** Advance physics. `gravityAccel` is px/s², `dt` is seconds. */
  public update(dt: number, gravityAccel: number): void {
    this.velocityY += gravityAccel * dt;
    this.y += this.velocityY * dt;
  }

  /** Top-most Y of the shape in its parent's coordinate space. */
  public get topEdge(): number {
    return this.y - this.radius;
  }

  /** Bottom-most Y of the shape in its parent's coordinate space. */
  public get bottomEdge(): number {
    return this.y + this.radius;
  }

  /**
   * Reset to a dormant state so the pool can hold it without it being drawn
   * or hit-tested. Clearing the Graphics frees its GPU geometry.
   */
  public deactivate(): void {
    this.active = false;
    this.visible = false;
    this.renderable = false;
    this.velocityY = 0;
    this.gfx.clear();
  }

  /** Each subclass draws itself from `this.radius` / `this.color`. */
  protected abstract redraw(): void;

  /** Each subclass returns its own exact geometric area in px². */
  public abstract getArea(): number;
}

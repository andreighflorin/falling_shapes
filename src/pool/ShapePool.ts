import type { Shape } from "../shapes/Shape";
import { ShapeType } from "../shapes/ShapeType";

/** A factory function that produces a brand-new instance of a given type. */
export type ShapeConstructor = () => Shape;

/**
 * Object Pool (design pattern) keyed by shape type.
 *
 * Recycling instances avoids churning the garbage collector every time a
 * shape falls off the bottom or is clicked away — important for memory
 * management and smoothness on low-end mobile devices.
 */
export class ShapePool {
  private readonly free = new Map<ShapeType, Shape[]>();
  private readonly constructors: Map<ShapeType, ShapeConstructor>;

  public constructor(constructors: Map<ShapeType, ShapeConstructor>) {
    this.constructors = constructors;
  }

  /** Acquire a dormant instance of `type`, reusing one when available. */
  public acquire(type: ShapeType): Shape {
    const bucket = this.free.get(type);
    const recycled = bucket?.pop();
    if (recycled) {
      return recycled;
    }
    const create = this.constructors.get(type);
    if (!create) {
      throw new Error(`No constructor registered for shape type "${type}".`);
    }
    return create();
  }

  /** Return a shape to the pool for later reuse. */
  public release(type: ShapeType, shape: Shape): void {
    shape.deactivate();
    let bucket = this.free.get(type);
    if (!bucket) {
      bucket = [];
      this.free.set(type, bucket);
    }
    bucket.push(shape);
  }
}

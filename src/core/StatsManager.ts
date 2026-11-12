import type { EventBus } from "./EventBus";

/**
 * Tracks the live shape count and the total surface area.
 *
 * It keeps a running total rather than recomputing from scratch each frame:
 * areas are added on spawn and subtracted on removal. Every mutation emits a
 * "stats:changed" event (Observer pattern) which the UI listens to.
 */
export class StatsManager {
  private count = 0;
  private area = 0;

  public constructor(private readonly bus: EventBus) {}

  public add(area: number): void {
    this.count += 1;
    this.area += area;
    this.publish();
  }

  public remove(area: number): void {
    this.count = Math.max(0, this.count - 1);
    this.area = Math.max(0, this.area - area);
    this.publish();
  }

  public get currentCount(): number {
    return this.count;
  }

  private publish(): void {
    this.bus.emit("stats:changed", { count: this.count, area: this.area });
  }
}

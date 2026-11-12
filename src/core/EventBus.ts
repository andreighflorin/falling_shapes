/**
 * A tiny strongly-typed publish/subscribe event bus.
 *
 * Design pattern: Observer / pub-sub. The stats UI subscribes to changes
 * without the simulation needing to know anything about the DOM.
 */
export type EventMap = {
  "stats:changed": { count: number; area: number };
  "rate:changed": { shapesPerSecond: number };
  "gravity:changed": { gravity: number };
};

type Handler<T> = (payload: T) => void;

export class EventBus {
  private readonly handlers = new Map<keyof EventMap, Set<Handler<unknown>>>();

  public on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as Handler<unknown>);
    return () => this.off(event, handler);
  }

  public off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
    this.handlers.get(event)?.delete(handler as Handler<unknown>);
  }

  public emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      (handler as Handler<EventMap[K]>)(payload);
    }
  }
}

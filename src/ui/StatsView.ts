import type { EventBus } from "../core/EventBus";

/**
 * Renders the live count and total surface area into the top-left HTML overlay
 * (BONUS 5c). It is a pure Observer of the stats events — it never touches the
 * simulation directly.
 */
export class StatsView {
  private readonly countEl: HTMLElement;
  private readonly areaEl: HTMLElement;

  public constructor(bus: EventBus) {
    this.countEl = requireEl("stat-count");
    this.areaEl = requireEl("stat-area");

    bus.on("stats:changed", ({ count, area }) => {
      this.countEl.textContent = String(count);
      this.areaEl.textContent = `${Math.round(area).toLocaleString()} px²`;
    });
  }
}

function requireEl(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing required element #${id}.`);
  return el;
}

import {CONFIG} from "../core/config";

/** Callbacks the controls invoke when the user changes a value. */
export interface ControlsCallbacks {
    onRateChange: (shapesPerSecond: number) => void;
    onGravityChange: (gravity: number) => void;
}

/**
 * Wires the bottom HTML control groups (BONUS 6): +/- steppers for the
 * shapes-per-second rate and the gravity value, each with a live read-out.
 * The view owns its own numeric state and clamps to the configured bounds.
 */
export class ControlsView {
    private rate: number = CONFIG.defaultShapesPerSecond;
    private gravity: number = CONFIG.defaultGravity;

    private readonly rateValueEl: HTMLElement;
    private readonly gravityValueEl: HTMLElement;

    public constructor(private readonly callbacks: ControlsCallbacks) {
        this.rateValueEl = requireEl("rate-value");
        this.gravityValueEl = requireEl("gravity-value");

        bindButton("rate-dec", () => this.changeRate(-CONFIG.shapesPerSecondStep));
        bindButton("rate-inc", () => this.changeRate(CONFIG.shapesPerSecondStep));
        bindButton("gravity-dec", () => this.changeGravity(-CONFIG.gravityStep));
        bindButton("gravity-inc", () => this.changeGravity(CONFIG.gravityStep));

        this.render();
    }

    private changeRate(delta: number): void {
        this.rate = clamp(this.rate + delta, CONFIG.minShapesPerSecond, CONFIG.maxShapesPerSecond);
        this.callbacks.onRateChange(this.rate);
        this.render();
    }

    private changeGravity(delta: number): void {
        this.gravity = clamp(this.gravity + delta, CONFIG.minGravity, CONFIG.maxGravity);
        this.callbacks.onGravityChange(this.gravity);
        this.render();
    }

    private render(): void {
        this.rateValueEl.textContent = String(this.rate);
        this.gravityValueEl.textContent = String(this.gravity);
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function bindButton(id: string, handler: () => void): void {
    const el = requireEl(id);
    el.addEventListener("click", handler);
}

function requireEl(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing required element #${id}.`);
    return el;
}

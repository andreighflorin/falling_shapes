import type {Ticker} from "pixi.js";
import {Stage, type StagePoint} from "./Stage";
import {ShapeFactory} from "./factory/ShapeFactory";
import {EventBus} from "./core/EventBus";
import {StatsManager} from "./core/StatsManager";
import {Simulation} from "./core/Simulation";
import {StatsView} from "./ui/StatsView";
import {ControlsView} from "./ui/ControlsView";

/**
 * Top-level orchestrator. It wires the independent pieces together — Stage,
 * factory/pool, stats, simulation and the HTML views — and owns the game
 * loop. Each collaborator stays decoupled: the simulation knows nothing about
 * the DOM, and the views know nothing about PIXI.
 */
export class App {
    private readonly simulation: Simulation;

    private constructor(stage: Stage) {
        const bus = new EventBus();
        const stats = new StatsManager(bus);
        const factory = new ShapeFactory();
        this.simulation = new Simulation(stage, factory, stats);

        // HTML views (Observer of the bus + command source for controls).
        new StatsView(bus);
        new ControlsView({
            onRateChange: rate => this.simulation.setShapesPerSecond(rate),
            onGravityChange: gravity => this.simulation.setGravity(gravity)
        });

        // Click/tap: removing a hit shape takes precedence over spawning (req 3a/4).
        stage.setPointerHandler((point: StagePoint, hitShape) => {
            if (hitShape && this.simulation.removeShape(hitShape)) {
                return;
            }
            this.simulation.spawnAtPoint(point.x, point.y);
        });

        stage.app.ticker.add(this.onTick);
    }

    public static async bootstrap(host: HTMLElement): Promise<App> {
        const stage = await Stage.create(host);
        return new App(stage);
    }

    private onTick = (ticker: Ticker): void => {
        // deltaMS is frame time in ms; convert to seconds for frame-rate-independent
        // physics. Clamp to guard against huge steps after a tab is backgrounded.
        const dt = Math.min(ticker.deltaMS / 1000, 1 / 20);
        this.simulation.update(dt);
    };
}

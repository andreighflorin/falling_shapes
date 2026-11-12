import type {Container} from "pixi.js";
import type {Stage} from "../Stage";
import type {ShapeFactory, SpawnedShape} from "../factory/ShapeFactory";
import type {StatsManager} from "./StatsManager";
import type {Shape} from "../shapes/Shape";
import {CONFIG} from "./config";

/**
 * Drives the falling-shapes world: spawning (auto + on click), per-frame
 * physics, off-screen removal, and click-to-remove. It owns the list of live
 * shapes and keeps {@link StatsManager} in sync on every add/remove.
 */
export class Simulation {
    /** Live shapes, parallel to the Stage's shapeLayer children. */
    private readonly live: SpawnedShape[] = [];
    /** Fast lookup from a PIXI display object to its spawn record. */
    private readonly byDisplay = new Map<Container, SpawnedShape>();

    private shapesPerSecond: number = CONFIG.defaultShapesPerSecond;
    private gravity: number = CONFIG.defaultGravity;
    private spawnAccumulator = 0;

    public constructor(
        private readonly stage: Stage,
        private readonly factory: ShapeFactory,
        private readonly stats: StatsManager
    ) {}

    public setShapesPerSecond(value: number): void {
        this.shapesPerSecond = Math.max(CONFIG.minShapesPerSecond, value);
    }

    public setGravity(value: number): void {
        this.gravity = Math.max(CONFIG.minGravity, value);
    }

    /** Advance the whole simulation by `dt` seconds. */
    public update(dt: number): void {
        this.autoSpawn(dt);
        this.step(dt);
    }

    /** Spawn a random standard shape above a random X across the top. */
    private autoSpawn(dt: number): void {
        if (this.shapesPerSecond <= 0) {
            this.spawnAccumulator = 0;
            return;
        }
        this.spawnAccumulator += dt * this.shapesPerSecond;
        // Emit as many shapes as the accumulated fractional count allows.
        while (this.spawnAccumulator >= 1) {
            this.spawnAccumulator -= 1;
            if (this.live.length >= CONFIG.maxLiveShapes) {
                this.spawnAccumulator = 0;
                break;
            }
            const radius = CONFIG.maxShapeRadius;
            const x = radius + Math.random() * Math.max(0, this.stage.width - radius * 2);
            const y = -radius; // start fully above the top edge (req 2b)
            this.add(this.factory.createRandom(x, y));
        }
    }

    /** Integrate physics and recycle anything fully below the bottom edge. */
    private step(dt: number): void {
        const gravityAccel = this.gravity * CONFIG.gravityScale;
        const bottom = this.stage.height;
        // Iterate backwards so in-place removal is safe and allocation-free.
        for (let i = this.live.length - 1; i >= 0; i--) {
            const entry = this.live[i];
            const shape = entry.shape as Shape;
            shape.update(dt, gravityAccel);
            if (shape.topEdge > bottom) {
                this.removeAt(i);
            }
        }
    }

    /** Spawn a random irregular shape at a clicked empty point (BONUS 3a). */
    public spawnAtPoint(x: number, y: number): void {
        if (this.live.length >= CONFIG.maxLiveShapes) return;
        this.add(this.factory.createIrregular(x, y));
    }

    /** Remove a specific shape that was clicked (requirement 4). */
    public removeShape(display: Container): boolean {
        const entry = this.byDisplay.get(display);
        if (!entry) return false;
        const index = this.live.indexOf(entry);
        if (index === -1) return false;
        this.removeAt(index);
        return true;
    }

    private add(entry: SpawnedShape): void {
        this.live.push(entry);
        this.byDisplay.set(entry.shape, entry);
        this.stage.shapeLayer.addChild(entry.shape);
        this.stats.add(entry.shape.getArea());
    }

    private removeAt(index: number): void {
        const entry = this.live[index];
        this.stats.remove(entry.shape.getArea());
        this.stage.shapeLayer.removeChild(entry.shape);
        this.byDisplay.delete(entry.shape);
        // Swap-remove to avoid shifting the whole array.
        const last = this.live.pop();
        if (last && last !== entry) {
            this.live[index] = last;
        }
        this.factory.recycle(entry);
    }
}

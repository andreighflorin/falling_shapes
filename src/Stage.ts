import { Application, Container, Graphics, type FederatedPointerEvent } from "pixi.js";

/** A point reported back to listeners when the stage is clicked/tapped. */
export interface StagePoint {
  x: number;
  y: number;
}

/**
 * Owns the PIXI Application and the rectangular play area.
 *
 * Responsibilities:
 *  - create and size the renderer to its host element (responsive / mobile);
 *  - draw the visible rectangle (border + background);
 *  - provide a masked `shapeLayer` so shapes overflowing the rectangle are
 *    clipped at its edges (requirement 2e);
 *  - translate pointer events into stage-local coordinates.
 */
export class Stage {
  public readonly app: Application;
  /** Shapes are added here; it is clipped to the rectangle via a mask. */
  public readonly shapeLayer: Container;

  private readonly host: HTMLElement;
  private readonly background: Graphics;
  private readonly border: Graphics;
  private readonly mask: Graphics;

  private onPointer?: (point: StagePoint, hitShape: Container | null) => void;
  private readonly resizeObserver: ResizeObserver;

  private constructor(app: Application, host: HTMLElement) {
    this.app = app;
    this.host = host;

    this.background = new Graphics();
    this.border = new Graphics();
    this.mask = new Graphics();
    this.shapeLayer = new Container();

    // Draw order: background, then clipped shapes, then the border on top.
    this.app.stage.addChild(this.background);
    this.app.stage.addChild(this.shapeLayer);
    this.app.stage.addChild(this.mask);
    this.app.stage.addChild(this.border);

    this.shapeLayer.mask = this.mask;

    // The whole stage is interactive so empty-space clicks spawn shapes.
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on("pointertap", this.handlePointerTap);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);

    this.resize();
  }

  /** Async factory because PIXI v8 initialises its renderer asynchronously. */
  public static async create(host: HTMLElement): Promise<Stage> {
    const app = new Application();
    await app.init({
      resizeTo: host,
      antialias: true,
      backgroundAlpha: 0,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });
    host.appendChild(app.canvas);
    return new Stage(app, host);
  }

  public get width(): number {
    return this.app.screen.width;
  }

  public get height(): number {
    return this.app.screen.height;
  }

  /** Register a single pointer listener. */
  public setPointerHandler(
    handler: (point: StagePoint, hitShape: Container | null) => void,
  ): void {
    this.onPointer = handler;
  }

  private handlePointerTap = (event: FederatedPointerEvent): void => {
    const local = this.app.stage.toLocal(event.global);
    // Which display object (if any) sits under the pointer, ignoring the
    // non-shape layers so border/background never count as a hit.
    const target = event.target;
    let hitShape: Container | null = null;
    if (target && target !== this.app.stage && this.shapeLayer.children.includes(target as Container)) {
      hitShape = target as Container;
    } else if (target && (target as Container).parent === this.shapeLayer) {
      hitShape = (target as Container).parent as Container;
    }
    this.onPointer?.({ x: local.x, y: local.y }, hitShape);
  };

  private resize(): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    this.background.clear();
    this.background.rect(0, 0, w, h).fill({ color: 0x11151f });

    this.border.clear();
    this.border.rect(1, 1, w - 2, h - 2).stroke({ color: 0x3d5afe, width: 2, alpha: 0.9 });

    this.mask.clear();
    this.mask.rect(0, 0, w, h).fill({ color: 0xffffff });
  }

  public destroy(): void {
    this.resizeObserver.disconnect();
    this.app.stage.off("pointertap", this.handlePointerTap);
    this.app.destroy(true, { children: true });
  }
}

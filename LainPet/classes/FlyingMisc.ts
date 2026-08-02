import { TimeoutRegistry } from "./TimeoutRegistry";
type FlyingMiscType = "crow" | "girl";
type FlyingMiscAssets = Record<FlyingMiscType, string>;

const MISC_SIZE: Record<FlyingMiscType, number> = {
  crow: 120,
  girl: 100,
};

export class FlyingMisc {
  private items = new Set<HTMLImageElement>();
  private timeouts = new TimeoutRegistry();

  public constructor(private readonly assets: FlyingMiscAssets) {}

  public spawn(type: FlyingMiscType): boolean {
    const asset = this.assets[type];
    if (!asset) return false;

    const size = MISC_SIZE[type];
    const item = document.createElement("img");
    item.src = asset;
    item.style.cssText = `
      position: fixed;
      width: ${size}px;
      z-index: 9998;
      pointer-events: none;
      transition: left 8s linear;
      top: ${Math.random() * Math.max(0, window.innerHeight - size)}px;
    `;

    const startX = Math.random() < 0.5 ? -size : window.innerWidth + size;
    const movingRight = startX < 0;

    item.style.left = `${startX}px`;
    item.style.transform =
      type === "crow"
        ? movingRight
          ? "scaleX(1)"
          : "scaleX(-1)"
        : movingRight
          ? "scaleX(-1)"
          : "scaleX(1)";

    document.body.appendChild(item);
    this.items.add(item);

    this.schedule(() => {
      if (!this.items.has(item)) return;

      item.style.left = `${
        movingRight ? window.innerWidth + size : -size
      }px`;
    }, 100);

    this.schedule(() => {
      this.items.delete(item);
      item.remove();
    }, 9000);

    return true;
  }

  public stop(): void {
    this.clearTimeouts();

    for (const item of this.items) {
      item.remove();
    }

    this.items.clear();
  }

  private schedule(callback: () => void, delay: number): void {
    this.timeouts.schedule(callback, delay);
  }

  private clearTimeouts(): void {
    this.timeouts.clear();
  }
}

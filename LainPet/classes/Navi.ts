import type { Vector2 } from "../types/Vector2";
import { TimeoutRegistry } from "./TimeoutRegistry";
const NAVI_SIZE = 120;
const NAVI_LANDED_TOP_OFFSET = 150;

export class Navi {
  private item: HTMLImageElement | null = null;
  private landed = false;
  private timeouts = new TimeoutRegistry();

  public constructor(private readonly assetUrls: readonly string[]) {}

  public drop(): boolean {
    if (this.item || this.assetUrls.length === 0) {
      return false;
    }

    const item = document.createElement("img");
    item.src =
      this.assetUrls[Math.floor(Math.random() * this.assetUrls.length)];

    item.style.cssText = `
      position: fixed;
      width: ${NAVI_SIZE}px;
      z-index: 9997;
      pointer-events: none;
      transition: top 6s linear;
      top: -150px;
    `;

    item.style.left = `${Math.random() * (window.innerWidth - NAVI_SIZE)}px`;

    document.body.appendChild(item);

    this.item = item;
    this.landed = false;

    this.schedule(() => {
      if (this.item !== item) return;

      item.style.top = `${window.innerHeight - NAVI_LANDED_TOP_OFFSET}px`;
    }, 100);

    this.schedule(() => {
      if (this.item !== item) return;

      this.landed = true;
    }, 6000);

    this.schedule(() => {
      if (this.item !== item) return;

      this.removeItem();
    }, 15000);

    return true;
  }

  public isLanded(): boolean {
    return this.item !== null && this.landed;
  }

  public getPosition(): Vector2 | null {
    if (!this.item) {
      return null;
    }

    const x = Number.parseFloat(this.item.style.left);
    const y = Number.parseFloat(this.item.style.top);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return null;
    }

    return { x, y };
  }

  public collect(): boolean {
    if (!this.item) {
      return false;
    }

    this.clearTimeouts();
    this.removeItem();
    return true;
  }

  public stop(): void {
    this.clearTimeouts();
    this.removeItem();
  }

  private schedule(callback: () => void, delay: number): void {
    this.timeouts.schedule(callback, delay);
  }

  private clearTimeouts(): void {
    this.timeouts.clear();
  }

  private removeItem(): void {
    this.item?.remove();
    this.item = null;
    this.landed = false;
  }
}

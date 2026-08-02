import { assets } from "../data/assets";
import type { LainPetSnapshot } from "../types/LainPetSnapshot";

const NORMAL_SIZE = 100;
const EVENT_SIZE = 200;

export class LainPetRenderer {
  private container: HTMLDivElement | null = null;
  private lainSprite: HTMLImageElement | null = null;
  private bubble: HTMLDivElement | null = null;
  private expression: HTMLImageElement | null = null;

  public mount(): void {
    if (this.container) return;

    const container = document.createElement("div");
    const lainSprite = document.createElement("img");
    const bubble = document.createElement("div");
    const expression = document.createElement("img");

    container.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
    `;
    lainSprite.style.cssText = `
      position: absolute;
      width: ${NORMAL_SIZE}px;
      pointer-events: auto;
      cursor: grab;
      transition: filter 0.2s;
      object-fit: contain;
    `;
    bubble.style.cssText = `
      position: absolute;
      background: white;
      color: black;
      border: 2px solid black;
      padding: 8px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.5s;
      width: 150px;
      text-align: center;
      z-index: 10000;
      pointer-events: none;
    `;
    expression.style.cssText = `
      position: absolute;
      width: 50px;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 10001;
      pointer-events: none;
    `;

    container.append(lainSprite, bubble, expression);
    document.body.appendChild(container);

    this.container = container;
    this.lainSprite = lainSprite;
    this.bubble = bubble;
    this.expression = expression;
  }

  public unmount(): void {
    this.container?.remove();
    this.container = null;
    this.lainSprite = null;
    this.bubble = null;
    this.expression = null;
  }

  public getInteractiveElement(): HTMLImageElement | null {
    return this.lainSprite;
  }

  public render(snapshot: LainPetSnapshot, timestamp = 0): void {
    if (!this.container || !this.lainSprite || !this.bubble || !this.expression) {
      return;
    }

    const size = snapshot.eventActive ? EVENT_SIZE : NORMAL_SIZE;
    const { position } = snapshot;
    const eventAssets = assets[snapshot.eventOutfit ?? snapshot.outfit];
    const outfitAssets = assets[snapshot.outfit];
    const isMoving = snapshot.mode === "walk" || snapshot.sugarRush;
    const spriteUrl = snapshot.eventActive
      ? eventAssets.event ?? eventAssets.idle
      : isMoving
        ? snapshot.facing === "right"
          ? outfitAssets.right
          : outfitAssets.left
        : outfitAssets.idle;

    this.lainSprite.style.width = `${size}px`;
    this.lainSprite.style.left = `${position.x}px`;
    this.lainSprite.style.top = `${position.y}px`;
    this.bubble.style.left = `${position.x + size / 2 - 75}px`;
    this.bubble.style.top = `${position.y - 50}px`;
    this.expression.style.left = `${position.x + size / 2 - 25}px`;
    this.expression.style.top = `${position.y - 40}px`;
    this.lainSprite.style.cursor = snapshot.isDragging ? "grabbing" : "grab";

    const resolvedSpriteUrl = new URL(spriteUrl, document.baseURI).href;
    if (this.lainSprite.src !== resolvedSpriteUrl) {
      this.lainSprite.src = spriteUrl;
    }

    this.lainSprite.style.filter = snapshot.sugarRush
      ? `hue-rotate(${timestamp % 360}deg) brightness(1.2)`
      : "";

    const dialogue = snapshot.dialogue;
    this.bubble.textContent = dialogue.text ?? "";
    this.bubble.style.opacity = dialogue.visible ? "1" : "0";

    const expressionState = snapshot.expression;
    if (expressionState.asset && this.expression.src !== expressionState.asset) {
      this.expression.src = expressionState.asset;
    }
    this.expression.style.opacity = expressionState.visible ? "1" : "0";
  }
}

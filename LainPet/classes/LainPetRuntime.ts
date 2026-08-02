import { LainPet } from "./LainPet";
import { LainPetPointerInput } from "./LainPetPointerInput";
import { LainPetRenderer } from "./LainPetRenderer";
import type {
  LainPetSnapshot,
  Viewport,
} from "../types/LainPetSnapshot";

const MAX_ELAPSED_MS = 100;

export class LainPetRuntime {
  private readonly renderer: LainPetRenderer;
  private readonly pointerInput: LainPetPointerInput;
  private frameId: number | null = null;
  private lastTimestamp: number | null = null;
  private running = false;

  public constructor(
    private readonly pet: LainPet = new LainPet(Math.random),
    renderer = new LainPetRenderer(),
    pointerInput = new LainPetPointerInput(),
  ) {
    this.renderer = renderer;
    this.pointerInput = pointerInput;
  }

  public start(): void {
    if (this.running) return;

    this.pet.start();
    this.renderer.mount();
    this.renderer.render(this.pet.snapshot());
    const element = this.renderer.getInteractiveElement();
    if (element) this.pointerInput.attach(element, this.pet);

    this.running = true;
    this.lastTimestamp = null;
    this.frameId = window.requestAnimationFrame(this.onFrame);
  }

  public stop(): void {
    if (!this.running && this.frameId === null) return;

    this.running = false;
    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.lastTimestamp = null;
    this.pointerInput.detach();
    this.renderer.unmount();
    this.pet.stop();
  }

  public isRunning(): boolean {
    return this.running;
  }

  public snapshot(): LainPetSnapshot {
    return this.pet.snapshot();
  }

  public getPet(): LainPet {
    return this.pet;
  }

  private onFrame = (timestamp: number): void => {
    if (!this.running) return;

    const elapsed = this.lastTimestamp === null
      ? 0
      : Math.min(MAX_ELAPSED_MS, Math.max(0, timestamp - this.lastTimestamp));
    this.lastTimestamp = timestamp;

    const viewport: Viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const snapshot = this.pet.advance(elapsed, viewport, Math.random);
    this.renderer.render(snapshot, timestamp);
    this.frameId = window.requestAnimationFrame(this.onFrame);
  };
}

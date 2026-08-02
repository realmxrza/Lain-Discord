import type { LainPet } from "./LainPet";

export class LainPetPointerInput {
  private element: HTMLImageElement | null = null;
  private moveHandler: ((event: PointerEvent) => void) | null = null;
  private endHandler: ((event: PointerEvent) => void) | null = null;

  public attach(element: HTMLImageElement, pet: LainPet): void {
    this.detach();
    this.element = element;

    const onPointerMove = (event: PointerEvent) => {
      if (!pet.snapshot().isDragging) return;
      event.preventDefault();
      pet.updateDrag({ x: event.clientX - 50, y: event.clientY - 50 });
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (!pet.snapshot().isDragging) return;
      event.preventDefault();
      pet.endDrag();
      if (this.element?.hasPointerCapture(event.pointerId)) {
        this.element.releasePointerCapture(event.pointerId);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      this.element?.setPointerCapture(event.pointerId);
      pet.beginDrag();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerEnd, { passive: false });
    window.addEventListener("pointercancel", onPointerEnd, { passive: false });

    this.moveHandler = onPointerMove;
    this.endHandler = onPointerEnd;
    element.onpointerdown = onPointerDown;
  }

  public detach(): void {
    if (this.element?.onpointerdown) this.element.onpointerdown = null;
    if (this.moveHandler) {
      window.removeEventListener("pointermove", this.moveHandler);
      this.moveHandler = null;
    }
    if (this.endHandler) {
      window.removeEventListener("pointerup", this.endHandler);
      window.removeEventListener("pointercancel", this.endHandler);
      this.endHandler = null;
    }
    this.element = null;
  }

}

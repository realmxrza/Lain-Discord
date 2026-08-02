export class TimeoutRegistry {
  private timeouts = new Set<number>();

  public schedule(callback: () => void, delay: number): number {
    const timeoutId = window.setTimeout(() => {
      this.timeouts.delete(timeoutId);
      callback();
    }, delay);

    this.timeouts.add(timeoutId);
    return timeoutId;
  }

  public cancel(timeoutId: number | null): void {
    if (timeoutId === null) return;

    window.clearTimeout(timeoutId);
    this.timeouts.delete(timeoutId);
  }

  public clear(): void {
    for (const timeout of this.timeouts) {
      window.clearTimeout(timeout);
    }

    this.timeouts.clear();
  }
}

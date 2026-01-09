export class RateLimiter {
  private readonly delayMs: number;
  private lastRequestAt = 0;
  private backoffFactor = 1.0;
  private readonly maxBackoff: number;

  constructor(opts?: { requestsPerMinute?: number; maxBackoff?: number }) {
    const rpm = opts?.requestsPerMinute ?? 30;
    this.delayMs = Math.ceil((60_000 / rpm) * 1.0);
    this.maxBackoff = opts?.maxBackoff ?? 5.0;
  }

  async wait() {
    const now = Date.now();
    const sinceLast = now - this.lastRequestAt;
    const minDelay = this.delayMs * this.backoffFactor;
    if (sinceLast < minDelay) {
      const jitter = 0.8 + Math.random() * 0.4;
      const waitMs = Math.ceil((minDelay - sinceLast) * jitter);
      await new Promise((r) => setTimeout(r, waitMs));
    }
    this.lastRequestAt = Date.now();
  }

  increaseBackoff() {
    this.backoffFactor = Math.min(this.backoffFactor * 1.5, this.maxBackoff);
  }

  resetBackoff() {
    this.backoffFactor = 1.0;
  }
}


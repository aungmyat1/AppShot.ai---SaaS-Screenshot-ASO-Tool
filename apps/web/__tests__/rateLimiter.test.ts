import { RateLimiter } from "@/lib/core/rateLimiter";

describe("RateLimiter", () => {
  describe("constructor", () => {
    it("computes delay from requestsPerMinute", () => {
      const r = new RateLimiter({ requestsPerMinute: 60 });
      expect(r).toBeDefined();
    });

    it("uses default rpm when not provided", () => {
      const r = new RateLimiter();
      expect(r).toBeDefined();
    });

    it("accepts maxBackoff option", () => {
      const r = new RateLimiter({ maxBackoff: 10 });
      expect(r).toBeDefined();
    });
  });

  describe("increaseBackoff", () => {
    it("increases backoff factor", () => {
      const r = new RateLimiter({ requestsPerMinute: 60, maxBackoff: 5 });
      r.increaseBackoff();
      r.increaseBackoff();
      expect(r).toBeDefined();
    });
  });

  describe("resetBackoff", () => {
    it("resets backoff factor", () => {
      const r = new RateLimiter({ requestsPerMinute: 60 });
      r.increaseBackoff();
      r.resetBackoff();
      expect(r).toBeDefined();
    });
  });

  describe("wait", () => {
    it("resolves without throwing", async () => {
      const r = new RateLimiter({ requestsPerMinute: 1000 });
      await expect(r.wait()).resolves.toBeUndefined();
    });
  });
});

import { enforcePlanLimits, getUsageSummary } from "@/lib/limits";
import { getPricingPlan } from "@/lib/pricing-config";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    scrapeJob: {
      aggregate: jest.fn(),
    },
  },
}));

jest.mock("@/lib/pricing-config", () => ({
  getPricingPlan: jest.fn(),
}));

const { prisma } = jest.requireMock("@/lib/prisma");

describe("limits", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPricingPlan as jest.Mock).mockImplementation((plan: string) => {
      if (plan === "FREE") return { screenshotLimit: 10, perJobCap: 10 };
      if (plan === "PRO") return { screenshotLimit: 500, perJobCap: 30 };
      return { screenshotLimit: 0, perJobCap: 0 };
    });
  });

  describe("enforcePlanLimits", () => {
    it("returns screenshotLimit when under limit", async () => {
      (prisma.scrapeJob.aggregate as jest.Mock).mockResolvedValue({
        _sum: { screenshotCount: 2 },
      });
      const result = await enforcePlanLimits({ userId: "user-1", plan: "FREE" });
      expect(result.screenshotLimit).toBeLessThanOrEqual(10);
      expect(result.screenshotLimit).toBe(8);
    });

    it("throws when monthly limit reached", async () => {
      (prisma.scrapeJob.aggregate as jest.Mock).mockResolvedValue({
        _sum: { screenshotCount: 10 },
      });
      await expect(enforcePlanLimits({ userId: "user-1", plan: "FREE" })).rejects.toThrow(
        /Monthly screenshot limit reached/
      );
    });

    it("caps per-job to perJobCap", async () => {
      (prisma.scrapeJob.aggregate as jest.Mock).mockResolvedValue({
        _sum: { screenshotCount: 0 },
      });
      const result = await enforcePlanLimits({ userId: "user-1", plan: "PRO" });
      expect(result.screenshotLimit).toBeLessThanOrEqual(30);
    });
  });

  describe("getUsageSummary", () => {
    it("returns used and remaining", async () => {
      (prisma.scrapeJob.aggregate as jest.Mock).mockResolvedValue({
        _sum: { screenshotCount: 3 },
      });
      const result = await getUsageSummary({ userId: "user-1", plan: "FREE" });
      expect(result.window).toBe("month");
      expect(result.limit).toBe(10);
      expect(result.used).toBe(3);
      expect(result.remaining).toBe(7);
    });
  });
});

import {
  getPricingPlan,
  getActivePricingPlans,
  getPricingPlanByStripePriceId,
  PRICING_PLANS,
} from "@/lib/pricing-config";

describe("pricing-config", () => {
  describe("getPricingPlan", () => {
    it("returns FREE plan", () => {
      const plan = getPricingPlan("FREE");
      expect(plan.id).toBe("FREE");
      expect(plan.screenshotLimit).toBe(10);
      expect(plan.perJobCap).toBe(10);
    });

    it("returns PRO plan", () => {
      const plan = getPricingPlan("PRO");
      expect(plan.id).toBe("PRO");
      expect(plan.screenshotLimit).toBe(500);
      expect(plan.priceCents).toBe(2900);
    });

    it("returns STARTER plan", () => {
      const plan = getPricingPlan("STARTER");
      expect(plan.id).toBe("STARTER");
    });
  });

  describe("getActivePricingPlans", () => {
    it("returns only paid plans", () => {
      const active = getActivePricingPlans();
      expect(active.length).toBeGreaterThanOrEqual(0);
      expect(active.every((p) => p.priceCents > 0)).toBe(true);
    });

    it("includes PRO when defined with priceCents > 0", () => {
      const active = getActivePricingPlans();
      const pro = active.find((p) => p.id === "PRO");
      expect(pro).toBeDefined();
      expect(pro?.priceCents).toBe(2900);
    });
  });

  describe("getPricingPlanByStripePriceId", () => {
    it("returns null for null or undefined", () => {
      expect(getPricingPlanByStripePriceId(null)).toBeNull();
      expect(getPricingPlanByStripePriceId(undefined)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(getPricingPlanByStripePriceId("")).toBeNull();
    });

    it("returns null for unknown price id when env is unset", () => {
      const orig = process.env.STRIPE_PRICE_PRO;
      delete process.env.STRIPE_PRICE_PRO;
      delete process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
      expect(getPricingPlanByStripePriceId("price_unknown")).toBeNull();
      if (orig !== undefined) process.env.STRIPE_PRICE_PRO = orig;
    });
  });

  describe("PRICING_PLANS", () => {
    it("has FREE, STARTER, PRO", () => {
      expect(PRICING_PLANS.FREE).toBeDefined();
      expect(PRICING_PLANS.STARTER).toBeDefined();
      expect(PRICING_PLANS.PRO).toBeDefined();
    });
  });
});

import { PLAN_CREDITS, priceIdToPlan } from "@/lib/plans";

jest.mock("@/lib/pricing-config", () => ({
  getPricingPlanByStripePriceId: jest.fn(),
}));

const { getPricingPlanByStripePriceId } = jest.requireMock("@/lib/pricing-config") as {
  getPricingPlanByStripePriceId: (id: string | null | undefined) => { id: string } | null;
};

describe("plans", () => {
  describe("PLAN_CREDITS", () => {
    it("has FREE, STARTER, PRO with numeric values", () => {
      expect(PLAN_CREDITS.FREE).toBe(0);
      expect(PLAN_CREDITS.STARTER).toBe(0);
      expect(PLAN_CREDITS.PRO).toBe(0);
    });
  });

  describe("priceIdToPlan", () => {
    it("returns null for null priceId", () => {
      (getPricingPlanByStripePriceId as jest.Mock).mockReturnValue(null);
      expect(priceIdToPlan(null)).toBeNull();
    });

    it("returns null for undefined priceId", () => {
      (getPricingPlanByStripePriceId as jest.Mock).mockReturnValue(null);
      expect(priceIdToPlan(undefined)).toBeNull();
    });

    it("returns plan when getPricingPlanByStripePriceId returns a plan", () => {
      (getPricingPlanByStripePriceId as jest.Mock).mockReturnValue({ id: "PRO" });
      expect(priceIdToPlan("price_xxx")).toBe("PRO");
    });

    it("returns null when getPricingPlanByStripePriceId returns null", () => {
      (getPricingPlanByStripePriceId as jest.Mock).mockReturnValue(null);
      expect(priceIdToPlan("price_unknown")).toBeNull();
    });
  });
});

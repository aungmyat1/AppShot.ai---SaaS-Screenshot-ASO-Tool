import { PRICING_PLANS } from "@/lib/pricing-config";

export const metadata = {
  title: "Pricing • GetAppShots",
};

export default function PricingPage() {
  const freePlan = PRICING_PLANS.FREE;
  const proPlan = PRICING_PLANS.PRO;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
      <p className="text-muted-foreground">Choose the plan that matches your screenshot needs.</p>

      <div className="overflow-auto">
        <table className="w-full border text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">Feature</th>
              <th className="p-3 text-left">{freePlan.name}</th>
              <th className="p-3 text-left">{proPlan.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">Screenshots / month</td>
              <td className="p-3">{freePlan.screenshotLimit}</td>
              <td className="p-3">{proPlan.screenshotLimit}</td>
            </tr>
            <tr className="border-t">
              <td className="p-3">Support</td>
              <td className="p-3">Basic</td>
              <td className="p-3">Priority</td>
            </tr>
            <tr className="border-t">
              <td className="p-3">ZIP export</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Yes</td>
            </tr>
            <tr className="border-t">
              <td className="p-3">Price</td>
              <td className="p-3">${freePlan.priceDollars}</td>
              <td className="p-3">${proPlan.priceDollars} / month</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


import { GET } from "@/app/api/health/route";

describe("API /api/health", () => {
  it("GET returns ok and service", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.service).toBe("web");
    expect(typeof data.ts).toBe("string");
  });
});

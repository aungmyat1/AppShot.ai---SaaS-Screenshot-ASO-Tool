jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

// Avoid loading lib/zip (p-limit/yocto-queue ESM) when importing the scrape route
jest.mock("@/lib/core/process-scrape-job", () => ({
  processScrapeJob: jest.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { POST } from "@/app/api/scrape/route";

function request(body: object): Request {
  return new Request("http://localhost/api/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("API /api/scrape", () => {
  it("POST returns 401 when unauthenticated", async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: null });
    const res = await POST(request({ url: "https://apps.apple.com/us/app/foo/id123" }));
    expect(res.status).toBe(401);
  });

  it("POST returns 400 for invalid body when authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: "user_123" });
    const res = await POST(request({ url: "not-a-url" }));
    expect(res.status).toBe(400);
  });
});

import { POST } from "@/app/api/validate-url/route";

function request(body: object): Request {
  return new Request("http://localhost/api/validate-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("API /api/validate-url", () => {
  it("POST returns store and identifier for valid App Store URL", async () => {
    const res = await POST(
      request({ url: "https://apps.apple.com/us/app/foo/id123456789" }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.store).toBe("APP_STORE");
    expect(data.identifier).toBe("123456789");
  });

  it("POST returns store and identifier for valid Play Store URL", async () => {
    const res = await POST(
      request({
        url: "https://play.google.com/store/apps/details?id=com.example.app",
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.store).toBe("PLAY_STORE");
    expect(data.identifier).toBe("com.example.app");
  });

  it("POST returns 400 for invalid URL", async () => {
    const res = await POST(request({ url: "not-a-url" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("POST returns 400 for missing url", async () => {
    const res = await POST(request({}));
    expect(res.status).toBe(400);
  });
});

import {
  detectStore,
  parseAppStoreId,
  parsePlayPackageName,
  scrapeRequestSchema,
} from "@/lib/app-url";

describe("app-url helpers", () => {
  test("scrapeRequestSchema accepts valid URL", () => {
    const result = scrapeRequestSchema.safeParse({
      url: "https://apps.apple.com/us/app/foo/id123",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.url).toBe("https://apps.apple.com/us/app/foo/id123");
  });

  test("scrapeRequestSchema rejects invalid URL", () => {
    expect(scrapeRequestSchema.safeParse({ url: "not-a-url" }).success).toBe(false);
    expect(scrapeRequestSchema.safeParse({ url: "" }).success).toBe(false);
  });

  test("detectStore detects Apple and Google hosts", () => {
    expect(detectStore("https://apps.apple.com/us/app/foo/id123456789")).toBe("APP_STORE");
    expect(detectStore("https://play.google.com/store/apps/details?id=com.example.app")).toBe("PLAY_STORE");
  });

  test("parseAppStoreId parses id from path", () => {
    expect(parseAppStoreId("https://apps.apple.com/us/app/foo/id987654321")).toBe("987654321");
  });

  test("parsePlayPackageName parses id param", () => {
    expect(parsePlayPackageName("https://play.google.com/store/apps/details?id=com.example.app")).toBe("com.example.app");
  });
});


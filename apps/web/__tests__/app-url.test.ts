import { detectStore, parseAppStoreId, parsePlayPackageName } from "@/lib/app-url";

describe("app-url helpers", () => {
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


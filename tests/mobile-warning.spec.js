import { test, expect, devices } from "@playwright/test";

test.describe("on a touch device without a physical keyboard", () => {
  const { defaultBrowserType, ...iPhone13 } = devices["iPhone 13"];
  test.use({ ...iPhone13 });

  test("shows a dismissable warning", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", e => pageErrors.push(e.message));

    await page.goto("/");
    await expect(page.locator("canvas.game-canvas")).toBeVisible();

    await expect(page.locator(".MobileWarning")).toBeVisible();
    await expect(page.locator(".MobileWarning_text")).toContainText("teclado");

    await page.locator(".MobileWarning_button").click();
    await expect(page.locator(".MobileWarning")).toHaveCount(0);

    expect(pageErrors).toEqual([]);
  });
});

test("does not show the warning on desktop viewports with a mouse", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas.game-canvas")).toBeVisible();
  await expect(page.locator(".MobileWarning")).toHaveCount(0);
});

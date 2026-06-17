import { test, expect } from "@playwright/test";

test("hero can challenge npcC and win a battle with a super-effective move", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", e => pageErrors.push(e.message));

  await page.goto("/");
  await expect(page.locator("canvas.game-canvas")).toBeVisible();

  // Walk the hero down until blocked by npcC's tile, then talk to it.
  await page.keyboard.down("ArrowDown");
  await page.waitForTimeout(1200);
  await page.keyboard.up("ArrowDown");

  await page.keyboard.press("Enter");
  await expect(page.locator(".TextMessage_p")).toContainText("challenge");

  // Advance the dialog into the battle.
  await page.keyboard.press("Enter");
  await expect(page.locator(".Battle")).toBeVisible();
  await expect(page.locator(".Battle_move_button")).toHaveCount(2, { timeout: 5000 });

  await expect(page.locator(".Battle_hud_enemy .Battle_name")).toHaveText("Diabla");
  await expect(page.locator(".Battle_hud_player .Battle_name")).toHaveText("Margherita");

  const enemyHpFill = page.locator(".Battle_hud_enemy .Battle_hpBar_fill");
  const moveButtons = page.locator(".Battle_move_button");
  await expect(moveButtons.nth(0)).toHaveText("Veggie Whip");

  // Veggie Whip is super-effective (2x) against the spicy-type enemy: 12*2=24 dmg -> 20% hp left.
  await moveButtons.nth(0).click();
  await expect.poll(() => enemyHpFill.evaluate(el => el.style.width), { timeout: 3000 }).toBe("20%");

  // Wait out the enemy's counter-turn and finish it off with a second hit.
  await expect(page.locator(".Battle_move_button")).toHaveCount(2, { timeout: 5000 });
  await page.locator(".Battle_move_button").nth(0).click();
  await expect(page.locator(".Battle_message")).toContainText("fainted", { timeout: 3000 });

  await expect(page.locator(".Battle")).toBeHidden({ timeout: 4000 });
  await expect(page.locator(".TextMessage_p")).toContainText("Until next time");

  await page.keyboard.press("Enter");
  await expect(page.locator(".TextMessage")).toHaveCount(0);

  expect(pageErrors).toEqual([]);
});

test("persists hero position and defeated enemies across a reload", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", e => pageErrors.push(e.message));

  await page.goto("/");
  await expect(page.locator("canvas.game-canvas")).toBeVisible();

  await page.keyboard.down("ArrowDown");
  await page.waitForTimeout(1200);
  await page.keyboard.up("ArrowDown");

  await page.keyboard.press("Enter");
  await expect(page.locator(".TextMessage_p")).toContainText("challenge");
  await page.keyboard.press("Enter");
  await expect(page.locator(".Battle")).toBeVisible();

  // Win the battle the same way as the other test.
  await expect(page.locator(".Battle_move_button")).toHaveCount(2, { timeout: 5000 });
  await page.locator(".Battle_move_button").nth(0).click();
  await expect(page.locator(".Battle_move_button")).toHaveCount(2, { timeout: 5000 });
  await page.locator(".Battle_move_button").nth(0).click();
  await expect(page.locator(".Battle_message")).toContainText("fainted", { timeout: 3000 });
  await expect(page.locator(".Battle")).toBeHidden({ timeout: 4000 });
  await page.keyboard.press("Enter");
  await expect(page.locator(".TextMessage")).toHaveCount(0);

  const savedData = await page.evaluate(() => JSON.parse(localStorage.getItem("pizzaLegendsSave")));
  expect(savedData.defeatedEnemies).toContain("npcC");
  expect(savedData.heroPosition).toBeTruthy();

  await page.reload();
  await expect(page.locator("canvas.game-canvas")).toBeVisible();

  // The hero spawns already facing npcC from the saved position, so talking
  // to it again skips straight past the battle since it's already won.
  await page.keyboard.press("Enter");
  await expect(page.locator(".TextMessage_p")).toContainText("challenge");
  await page.keyboard.press("Enter");
  await expect(page.locator(".Battle")).toHaveCount(0);
  await expect(page.locator(".TextMessage_p")).toContainText("Until next time");
  await page.keyboard.press("Enter");
  await expect(page.locator(".TextMessage")).toHaveCount(0);

  expect(pageErrors).toEqual([]);
});

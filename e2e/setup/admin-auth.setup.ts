import { test as setup } from "@playwright/test";
import path from "path";

export const ADMIN_AUTH_FILE = path.join(__dirname, "../.auth/admin.json");

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("admin@workfitai.com");
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("admin123");
  await page.getByRole("button", { name: "Login →" }).click();

  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

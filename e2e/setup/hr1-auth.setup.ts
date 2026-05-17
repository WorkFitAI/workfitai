import { test as setup } from "@playwright/test";
import path from "path";

export const HR1_AUTH_FILE = path.join(__dirname, "../.auth/hr1.json");

setup("authenticate as hr1", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("hrtest1@gmail.com");
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("password@123");
  await page.getByRole("button", { name: "Login →" }).click();

  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });

  await page.context().storageState({ path: HR1_AUTH_FILE });
});

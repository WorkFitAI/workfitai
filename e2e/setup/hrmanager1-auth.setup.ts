import { test as setup } from "@playwright/test";
import path from "path";

export const HRMANAGER1_AUTH_FILE = path.join(
  __dirname,
  "../.auth/hrmanager1.json",
);

setup("authenticate as hrmanager1", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("hrmanager1@gmail.com");
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("password@123");
  await page.getByRole("button", { name: "Login →" }).click();

  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });

  await page.context().storageState({ path: HRMANAGER1_AUTH_FILE });
});

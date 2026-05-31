import { test as setup } from "@playwright/test";
import path from "path";

export const HRMANAGER1_AUTH_FILE = path.join(
  __dirname,
  "../.auth/hrmanager1.json",
);

setup("authenticate as hrmanager1", async ({ page }) => {
  const email = process.env.TEST_HRMANAGER1_EMAIL!;
  const password = process.env.TEST_HRMANAGER1_PASSWORD!;
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Login →" }).click();

  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });

  await page.context().storageState({ path: HRMANAGER1_AUTH_FILE });
});

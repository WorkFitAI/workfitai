import { test as setup } from "@playwright/test";
import path from "path";

export const CANDIDATE1_AUTH_FILE = path.join(
  __dirname,
  "../.auth/candidate1.json",
);

setup("authenticate as candidate1", async ({ page }) => {
  const email = process.env.TEST_CANDIDATE1_EMAIL!;
  const password = process.env.TEST_CANDIDATE1_PASSWORD!;
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Login →" }).click();

  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });

  await page.context().storageState({ path: CANDIDATE1_AUTH_FILE });
});

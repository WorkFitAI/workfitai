import { test as setup } from "@playwright/test";
import path from "path";

export const CANDIDATE_AUTH_FILE = path.join(
  __dirname,
  "../.auth/candidate.json",
);

setup("authenticate as candidate", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("candidate1@gmail.com");
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("password@123");
  await page.getByRole("button", { name: "Login →" }).click();

  // Wait for redirect to home or dashboard after successful login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });

  await page.context().storageState({ path: CANDIDATE_AUTH_FILE });
});

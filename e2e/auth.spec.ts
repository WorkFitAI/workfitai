import { test, expect } from "@playwright/test";

// Run all auth page tests unauthenticated — project storageState is candidate-authed
// which the middleware redirects away from /login, /register, /forgot-password.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Auth flows", () => {
  test("login page renders form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email|username/i)).toBeVisible();
    // Use role+name to avoid matching the "Show password" aria-label button
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
  });

  test("login shows validation error for empty form submission", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /login/i }).click();
    // Zod validation — required error should appear
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test("login shows error for wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|username/i).fill("wrong@example.com");
    await page.getByRole("textbox", { name: "Password" }).fill("WrongPass123");
    await page.getByRole("button", { name: /login/i }).click();
    // API error toast or inline error
    await expect(
      page
        .getByRole("alert")
        .or(page.getByText(/invalid|unauthorized|failed/i))
        .first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("forgot password page renders email input", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /reset|send/i }),
    ).toBeVisible();
  });
});

// ── Register Full Flow E2E ──────────────────────────────────────────────────

test.describe("Register — Candidate flow (E2E)", () => {
  test("E-R1 — register page renders all required form fields", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(page.getByPlaceholder(/full name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email address/i)).toBeVisible();
    await expect(page.getByPlaceholder(/phone number/i)).toBeVisible();
    // Password fields
    await expect(page.getByPlaceholder(/^password$/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password confirmation/i)).toBeVisible();
    // Terms checkbox
    await expect(page.getByRole("checkbox")).toBeVisible();
    // Submit button
    await expect(page.getByRole("button", { name: /register/i })).toBeVisible();
  });

  test("E-R2 — empty register form submit shows Zod validation errors", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /register/i }).click();
    // At least one validation error should appear
    await expect(
      page.getByText(/required|at least|invalid/i).first(),
    ).toBeVisible({ timeout: 3000 });
  });

  test('E-R3 — register page has "Is Employer?" link to employer route', async ({
    page,
  }) => {
    await page.goto("/register");
    const employerLink = page.getByRole("link", { name: /employer/i });
    await expect(employerLink).toBeVisible();
    const href = await employerLink.getAttribute("href");
    expect(href).toContain("type=employer");
  });

  test("E-R4 — verify-otp page with email param shows the email in description", async ({
    page,
  }) => {
    await page.goto(
      "/register/verify-otp?email=test%40example.com&role=CANDIDATE",
    );
    await expect(page.getByText(/test@example\.com/i)).toBeVisible();
    // 6 OTP digit inputs should be rendered
    const otpInputs = page.getByLabel(/otp digit/i);
    await expect(otpInputs).toHaveCount(6);
  });

  test("E-R5 — verify-otp page without email param redirects to /register", async ({
    page,
  }) => {
    await page.goto("/register/verify-otp");
    // Should redirect back to /register
    await expect(page).toHaveURL(/\/register$/, { timeout: 5000 });
  });
});

import { test as setup, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(__dirname, "../.data");
const TEST_JOB_FILE = path.join(DATA_DIR, "test-job.json");
const FIXTURE_FILE = path.join(__dirname, "../fixtures/single-job-definition.json");

setup("create and publish test job as HRM1", async ({ page }) => {
  setup.setTimeout(60_000);

  const jobDef = JSON.parse(fs.readFileSync(FIXTURE_FILE, "utf-8")) as {
    title: string
    shortDescription: string
    fullDescription: string
    location: string
    educationLevel: string
    requiredExperience: string
    skillFallbacks: string[]
    salaryMin: number
    salaryMax: number
    quantity: number
    categoryName: string
  }

  // storageState restores cookies (auth_session) and localStorage (including wfa_access_token).
  // Do a fresh login to guarantee a non-expired token — backend binds tokens to device IDs
  // via X-Device-Id header, so we read the persisted device ID from the auth storageState.
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9085";
  const hrmanager1Email = process.env.TEST_HRMANAGER1_EMAIL!;
  const hrmanager1Password = process.env.TEST_HRMANAGER1_PASSWORD!;

  const AUTH_FILE = path.join(__dirname, "../.auth/hrmanager1.json");
  let accessToken: string | null = null;
  let deviceId = "playwright-e2e-hrm1";

  try {
    // Read the device ID persisted by hrmanager1-auth.setup.ts
    const storageState = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
    deviceId =
      storageState.origins
        ?.find((o: { origin: string }) => o.origin === "http://localhost:3000")
        ?.localStorage?.find((item: { name: string }) => item.name === "wfa_device_id")
        ?.value ?? "playwright-e2e-hrm1";

    const loginRes = await page.request.post(`${API_BASE}/auth/login`, {
      data: { usernameOrEmail: hrmanager1Email, password: hrmanager1Password },
      headers: { "Content-Type": "application/json", "X-Device-Id": deviceId },
    });
    if (loginRes.ok()) {
      const json = await loginRes.json();
      const { accessToken: token, expiryInMs } = json?.data ?? {};
      if (token) {
        accessToken = token;
        const expiresAt = String(Date.now() + (expiryInMs ?? 900_000));
        await page.addInitScript(
          ({ t, expiry }: { t: string; expiry: string }) => {
            localStorage.setItem("wfa_access_token", t);
            localStorage.setItem("wfa_token_expiry", expiry);
          },
          { t: token, expiry: expiresAt },
        );
      }
    }
  } catch {
    // login pre-injection failed — page will attempt cookie-based refresh on first 401
  }

  await page.goto("/job-posts");
  await expect(page).toHaveURL(/job-posts/, { timeout: 15_000 });

  // Wait for the page to be interactive (the Create New Job button is ready)
  const createBtn = page.getByRole("button", { name: /create new job/i });
  await expect(createBtn).toBeVisible({ timeout: 20_000 });

  // Open the "Create New Job" full-screen dialog
  await createBtn.click();
  // Use named dialog to avoid strict-mode conflicts with Radix Popover (also role="dialog")
  const dialog = page.getByRole("dialog", { name: /add new job/i });
  await expect(dialog).toBeVisible({ timeout: 8_000 });

  // ── Fill required fields ────────────────────────────────────────────────
  await page.getByLabel("Job Title").fill(jobDef.title);
  await page.getByPlaceholder("Brief overview for job listing...").fill(jobDef.shortDescription);
  await page.locator("label:has-text('Full Description') ~ textarea").fill(jobDef.fullDescription);
  await page.getByPlaceholder("City, Country").fill(jobDef.location);
  await page.getByPlaceholder("e.g. Bachelor in CS").fill(jobDef.educationLevel);
  await page.getByPlaceholder("e.g. 3-5 years").fill(jobDef.requiredExperience);

  // ── Add skills (backend requires skillIds to be non-empty) ────────────────
  // Fetch real skill names so they match what the job-post-client has in its dropdown state.
  const skillFallbacks = jobDef.skillFallbacks;
  let availableSkills: string[] = skillFallbacks;
  try {
    const skillsRes = await page.request.get(`${API_BASE}/job/public/skills`);
    if (skillsRes.ok()) {
      const json = await skillsRes.json();
      const list: Array<{ name: string }> = json?.data?.result ?? json?.result ?? [];
      if (list.length > 0) availableSkills = list.map((s) => s.name);
    }
  } catch {
    // use fallback skill names
  }

  // Helper: add one skill by name
  async function addSkill(name: string): Promise<void> {
    const skillInput = page.getByPlaceholder("Type skill and press Enter...");
    await skillInput.fill(name);
    await page.waitForTimeout(700);
    const skillDropdown = dialog.locator('.absolute.z-50');
    const suggestion = skillDropdown.locator('.cursor-pointer').filter({ hasText: name }).first();
    if (await suggestion.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await suggestion.click();
    } else {
      await skillInput.press("Enter");
    }
    await page.waitForTimeout(300);
  }

  // Add up to 3 diverse skills from the available list
  const skillsToAdd = availableSkills.slice(0, Math.min(3, availableSkills.length));
  for (const skill of skillsToAdd) {
    console.log(`Adding skill: "${skill}"`);
    await addSkill(skill);
  }

  // Salary range — [0]=salaryMin, [1]=salaryMax, [2]=quantity
  await page.locator('input[type="number"]').nth(0).fill(String(jobDef.salaryMin));
  await page.locator('input[type="number"]').nth(1).fill(String(jobDef.salaryMax));
  await page.locator('input[type="number"]').nth(2).fill(String(jobDef.quantity)).catch(() => {/* field may not exist */});

  // ── Select job category ─────────────────────────────────────────────────
  const categoryTrigger = dialog.locator('button[role="combobox"]').filter({ hasText: /select job category/i }).first();
  if (await categoryTrigger.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await categoryTrigger.click();
    const categoryOption = page.getByRole("option", { name: jobDef.categoryName }).first();
    if (await categoryOption.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await categoryOption.click();
    }
    await page.waitForTimeout(300);
  }

  // ── Set expiration date (must be in the future) ─────────────────────────
  const calTrigger = page
    .getByRole("button")
    .filter({ hasText: /\d+\/\d+\/\d+/ })
    .first();

  if (await calTrigger.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await calTrigger.click();

    const nextMonthBtn = page.getByRole("button", { name: "Go to the Next Month" });
    if (await nextMonthBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await nextMonthBtn.click();

      // react-day-picker v9: day cells render visible text "20" (aria-label is "20th", so /\b20\b/ won't match)
      const day20Btn = page.locator('[role="grid"] button').filter({ hasText: /^20$/ }).first();
      if (await day20Btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await day20Btn.click({ timeout: 3_000 });
      }
    }

    // Close the calendar popover (Escape closes Popover without closing the outer Dialog)
    await page.keyboard.press("Escape");
  }

  // ── Submit the form ─────────────────────────────────────────────────────
  // Register listener BEFORE clicking — capture ALL POST responses to pick the successful one
  const capturedResponses: import("@playwright/test").Response[] = [];
  const responseListener = (res: import("@playwright/test").Response) => {
    if (res.url().includes("/job/hr/jobs") && res.request().method() === "POST") {
      capturedResponses.push(res);
    }
  };
  page.on("response", responseListener);

  await page.getByRole("button", { name: /save job post/i }).click();

  // Dialog closes SYNCHRONOUSLY (JobDialog's onSubmit calls onOpenChange(false) immediately)
  await expect(dialog).not.toBeVisible({ timeout: 5_000 });

  // Wait for the async API call to complete (up to 10s)
  await page.waitForTimeout(10_000);
  page.off("response", responseListener);

  const jobCreationResponse = capturedResponses.find((r) => r.ok()) ?? capturedResponses[0];

  if (!jobCreationResponse) {
    throw new Error("No POST response to /job/hr/jobs captured in 10s after button click");
  }

  if (!jobCreationResponse.ok()) {
    const body = await jobCreationResponse.text().catch(() => "");
    throw new Error(
      `Job creation API failed (${jobCreationResponse.status()}): ${body.substring(0, 300)}`,
    );
  }

  // ── Extract created job ID ──────────────────────────────────────────────
  let createdJobId: string | null = null;
  try {
    const json = await jobCreationResponse.json();
    createdJobId =
      json?.result?.postId ??
      json?.data?.postId ??
      json?.postId ??
      json?.result?.id ??
      json?.id ??
      null;
  } catch {
    // ignore JSON parse errors — fallback below
  }

  // Fallback: get job ID from the first card link (sorted newest first)
  if (!createdJobId) {
    const firstLink = page.locator('a[href*="/jobs/"]').first();
    if (await firstLink.isVisible({ timeout: 12_000 }).catch(() => false)) {
      const href = await firstLink.getAttribute("href");
      const match = href?.match(/\/jobs\/([^/\?#]+)/);
      createdJobId = match ? match[1] : null;
    }
  }

  if (!createdJobId) {
    throw new Error("Job was created but could not determine its ID");
  }

  // ── Publish the job via API (more reliable than UI toggle) ──────────────
  // PUT /job/hr/jobs/{id}/PUBLISHED requires the HRM access token
  if (accessToken) {
    try {
      const publishRes = await page.request.put(
        `${API_BASE}/job/hr/jobs/${createdJobId}/PUBLISHED`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "X-Device-Id": deviceId,
          },
        },
      );
      if (publishRes.ok()) {
        console.log(`Job published via API: ${createdJobId}`);
      } else {
        const body = await publishRes.text().catch(() => "");
        console.warn(`Publish API returned ${publishRes.status()}: ${body.substring(0, 200)}`);
      }
    } catch (err) {
      console.warn(`Publish API call failed: ${err}`);
    }
  } else {
    console.warn("No access token available — skipping API publish, job may remain as DRAFT");
  }

  // ── Persist test job data ───────────────────────────────────────────────
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(
    TEST_JOB_FILE,
    JSON.stringify(
      {
        jobId: createdJobId,
        jobTitle: jobDef.title,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  console.log(`Test job created and published: ${createdJobId}`);
});

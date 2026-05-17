/**
 * Integration tests — OTP Verification Page (VerifyOtpContent)
 * Tests: V1-V9
 * Uses MSW to mock POST /auth/verify-otp and POST /auth/resend-otp
 */
import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Suspense } from "react";
import { server } from "../mocks/server";
import { apiError } from "../mocks/handlers";

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: mockToastSuccess, error: mockToastError },
}));

// Per-test mutable router mocks
const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParamsEmail = "john@example.com";
let mockSearchParamsRole = "CANDIDATE";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () =>
    new URLSearchParams(
      `email=${encodeURIComponent(mockSearchParamsEmail)}&role=${mockSearchParamsRole}`,
    ),
}));

// Import after mocks are set up
const { default: VerifyOtpPage } =
  await import("@/app/(auth)/register/verify-otp/page");

/** Helper: render the page and fill the 6 OTP digit inputs */
async function renderAndFillOtp(otp: string) {
  const user = userEvent.setup();
  render(
    <Suspense>
      <VerifyOtpPage />
    </Suspense>,
  );
  // Each digit cell has aria-label "OTP digit N"
  const inputs = await screen.findAllByRole("textbox");
  for (let i = 0; i < otp.length && i < 6; i++) {
    await user.type(inputs[i], otp[i]);
  }
  return user;
}

describe("[V] OTP Verification", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockSearchParamsEmail = "john@example.com";
    mockSearchParamsRole = "CANDIDATE";
  });

  it('V1 — missing email param → router.replace("/register") called', async () => {
    mockSearchParamsEmail = "";
    render(
      <Suspense>
        <VerifyOtpPage />
      </Suspense>,
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/register");
    });
  });

  it('V2 — CANDIDATE verifies valid OTP → success toast → router.push("/login")', async () => {
    mockSearchParamsRole = "CANDIDATE";
    const user = await renderAndFillOtp("123456");
    await user.click(screen.getByRole("button", { name: /verify/i }));
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/verified|welcome/i),
      );
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("V3 — HR verifies valid OTP → success toast → redirect to /pending-approval?role=HR", async () => {
    mockSearchParamsRole = "HR";
    server.use(
      http.post("https://be.workfitai.uk/auth/verify-otp", () =>
        HttpResponse.json({ success: true, data: { status: "WAIT_APPROVED" } }),
      ),
    );
    const user = await renderAndFillOtp("654321");
    await user.click(screen.getByRole("button", { name: /verify/i }));
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/pending|approval/i),
      );
      expect(mockPush).toHaveBeenCalledWith("/pending-approval?role=HR");
    });
  });

  it("V4 — HR_MANAGER verifies valid OTP → redirect to /pending-approval?role=HR_MANAGER", async () => {
    mockSearchParamsRole = "HR_MANAGER";
    server.use(
      http.post("https://be.workfitai.uk/auth/verify-otp", () =>
        HttpResponse.json({ success: true, data: { status: "WAIT_APPROVED" } }),
      ),
    );
    const user = await renderAndFillOtp("654321");
    await user.click(screen.getByRole("button", { name: /verify/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/pending-approval?role=HR_MANAGER",
      );
    });
  });

  it("V5 — invalid OTP (400) → error toast", async () => {
    server.use(
      http.post("https://be.workfitai.uk/auth/verify-otp", () =>
        apiError("Invalid or expired OTP", 400),
      ),
    );
    const user = await renderAndFillOtp("000000");
    await user.click(screen.getByRole("button", { name: /verify/i }));
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/invalid|expired/i),
      );
    });
  });

  it("V6 — OTP shorter than 6 digits → Verify button is disabled", async () => {
    render(
      <Suspense>
        <VerifyOtpPage />
      </Suspense>,
    );
    const verifyBtn = await screen.findByRole("button", { name: /verify/i });
    // Initially OTP is empty — button should be disabled
    expect(verifyBtn).toBeDisabled();
    // Fill only 3 digits
    const user = userEvent.setup();
    const inputs = await screen.findAllByRole("textbox");
    await user.type(inputs[0], "1");
    await user.type(inputs[1], "2");
    await user.type(inputs[2], "3");
    expect(verifyBtn).toBeDisabled();
  });

  it('V7 — Resend OTP → success toast + cooldown shows "Resend OTP in 60s"', async () => {
    render(
      <Suspense>
        <VerifyOtpPage />
      </Suspense>,
    );
    const user = userEvent.setup();
    const resendBtn = await screen.findByRole("button", {
      name: /resend otp/i,
    });
    await user.click(resendBtn);
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/resent|OTP/i),
      );
      expect(
        screen.getByRole("button", { name: /resend otp in/i }),
      ).toBeDisabled();
    });
  });

  it("V8 — Resend OTP failure (500) → error toast", async () => {
    server.use(
      http.post("https://be.workfitai.uk/auth/resend-otp", () =>
        apiError("Failed to resend OTP", 500),
      ),
    );
    render(
      <Suspense>
        <VerifyOtpPage />
      </Suspense>,
    );
    const user = userEvent.setup();
    const resendBtn = await screen.findByRole("button", {
      name: /resend otp/i,
    });
    await user.click(resendBtn);
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/failed|resend/i),
      );
    });
  });

  it("V9 — Resend button is disabled during cooldown", async () => {
    render(
      <Suspense>
        <VerifyOtpPage />
      </Suspense>,
    );
    const user = userEvent.setup();
    const resendBtn = await screen.findByRole("button", {
      name: /resend otp/i,
    });
    // Trigger cooldown
    await user.click(resendBtn);
    await waitFor(() => {
      const updatedBtn = screen.getByRole("button", { name: /resend otp in/i });
      expect(updatedBtn).toBeDisabled();
    });
  });
});

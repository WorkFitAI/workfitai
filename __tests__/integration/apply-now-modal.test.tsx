/**
 * Integration tests — ApplyNowModal
 * MSW intercepts checkApplied + submitApplication calls.
 * useAuth is mocked to provide a logged-in candidate.
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
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http } from "msw";
import { server } from "../mocks/server";
import { apiSuccess, apiError } from "../mocks/handlers";
import ApplyNowModal from "@/components/applications/apply-now-modal";

const API = "https://be.workfitai.uk";

// Stable references — must be hoisted so vi.mock factory can close over them
const { mockUser, mockToastSuccess, mockToastError, mockToastInfo } =
  vi.hoisted(() => ({
    mockUser: {
      username: "candidate1",
      email: "candidate1@example.com",
      roles: ["CANDIDATE"],
    },
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
    mockToastInfo: vi.fn(),
  }));

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Stable user reference prevents the reset useEffect from re-firing on every render
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

function defaultProps(
  overrides: Partial<{
    isOpen: boolean;
    jobId: string;
    jobTitle: string;
    onClose: () => void;
  }> = {},
) {
  return {
    isOpen: true,
    jobId: "job-001",
    jobTitle: "Frontend Developer",
    onClose: vi.fn(),
    ...overrides,
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe("ApplyNowModal", () => {
  it("renders the modal with job title in the header", async () => {
    render(<ApplyNowModal {...defaultProps()} />);

    await waitFor(() =>
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument(),
    );
  });

  it("pre-fills email from auth context", async () => {
    render(<ApplyNowModal {...defaultProps()} />);

    await waitFor(() =>
      expect(
        screen.getByDisplayValue("candidate1@example.com"),
      ).toBeInTheDocument(),
    );
  });

  it("shows already-applied state when checkApplied returns true", async () => {
    server.use(
      http.get(`${API}/application/check`, () => apiSuccess({ applied: true })),
    );

    render(<ApplyNowModal {...defaultProps()} />);

    await waitFor(() =>
      expect(screen.getByText("Already Applied")).toBeInTheDocument(),
    );
  });

  it("shows apply form when checkApplied returns false", async () => {
    server.use(
      http.get(`${API}/application/check`, () =>
        apiSuccess({ applied: false }),
      ),
    );

    render(<ApplyNowModal {...defaultProps()} />);

    await waitFor(() =>
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText("Already Applied")).not.toBeInTheDocument();
  });

  it("submit button is disabled when no CV is selected", async () => {
    render(<ApplyNowModal {...defaultProps()} />);

    await waitFor(() =>
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument(),
    );

    // Button is always disabled when cvFile is null (enforced by disabled prop)
    expect(
      screen.getByRole("button", { name: /submit application/i }),
    ).toBeDisabled();
  });

  it("rejects non-PDF files with a file error", async () => {
    const user = userEvent.setup();
    render(<ApplyNowModal {...defaultProps()} />);

    await waitFor(() =>
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument(),
    );

    const input = document.querySelector<HTMLInputElement>("#cv-upload")!;
    expect(input).not.toBeNull();

    const textFile = new File(["hello"], "resume.txt", { type: "text/plain" });
    // #cv-upload is sr-only so userEvent pointer simulation doesn't fire onChange.
    // Set files directly and dispatch change to let the component's own type check run.
    Object.defineProperty(input, "files", {
      value: [textFile],
      writable: false,
      configurable: true,
    });
    fireEvent.change(input);

    await waitFor(() =>
      expect(
        screen.getByText("Only PDF files are accepted."),
      ).toBeInTheDocument(),
    );
  });

  it("submits successfully and calls onClose + toast.success", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ApplyNowModal {...defaultProps({ onClose })} />);

    await waitFor(() =>
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument(),
    );

    // Attach a valid PDF
    const input = document.querySelector<HTMLInputElement>("#cv-upload")!;
    const pdf = new File(["pdf content"], "resume.pdf", {
      type: "application/pdf",
    });
    await user.upload(input, pdf);

    // Submit button should become enabled after attaching PDF
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /submit application/i }),
      ).not.toBeDisabled(),
    );

    await user.click(
      screen.getByRole("button", { name: /submit application/i }),
    );

    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it("shows 409 conflict as already-applied state", async () => {
    server.use(
      http.post(`${API}/application`, () => apiError("Already applied", 409)),
    );

    const user = userEvent.setup();
    render(<ApplyNowModal {...defaultProps()} />);

    await waitFor(() =>
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument(),
    );

    const input = document.querySelector<HTMLInputElement>("#cv-upload")!;
    const pdf = new File(["pdf"], "resume.pdf", { type: "application/pdf" });
    await user.upload(input, pdf);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /submit application/i }),
      ).not.toBeDisabled(),
    );

    await user.click(
      screen.getByRole("button", { name: /submit application/i }),
    );

    await waitFor(() =>
      expect(screen.getByText("Already Applied")).toBeInTheDocument(),
    );
    expect(mockToastInfo).toHaveBeenCalledWith(
      expect.stringContaining("already applied"),
    );
  });

  it("close button calls onClose", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ApplyNowModal {...defaultProps({ onClose })} />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

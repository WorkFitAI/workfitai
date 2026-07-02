import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FilterSkills from "@/components/jobs/filters/filter-skills";
import { jobService } from "@/lib/job/job-service";
import { toast } from "sonner";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/job/job-service", () => ({
  jobService: {
    getAllSkills: vi.fn(),
    createSkill: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockedJobService = vi.mocked(jobService);
const mockedToast = vi.mocked(toast);

describe("FilterSkills", () => {
  const user = userEvent.setup();
  const skillResponseMeta = {
    page: 1,
    pages: 1,
    total: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches skills and shows only the first five with a show more toggle", async () => {
    mockedJobService.getAllSkills.mockResolvedValue({
      data: {
        result: [
          { skillId: 1, name: "React" },
          { skillId: 2, name: "Next.js" },
          { skillId: 3, name: "TypeScript" },
          { skillId: 4, name: "Tailwind CSS" },
          { skillId: 5, name: "Node.js" },
          { skillId: 6, name: "PostgreSQL" },
        ],
        meta: skillResponseMeta,
      },
    });

    render(<FilterSkills />);

    expect(await screen.findByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.queryByText("PostgreSQL")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /show more/i }));

    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });

  it("updates the skillNames query when a skill is checked", async () => {
    mockedJobService.getAllSkills.mockResolvedValue({
      data: {
        result: [
          { skillId: 1, name: "React" },
          { skillId: 2, name: "Next.js" },
        ],
        meta: skillResponseMeta,
      },
    });

    render(<FilterSkills />);

    await screen.findByText("React");

    await user.click(screen.getByLabelText("React"));

    expect(mockPush).toHaveBeenCalledWith("?skillNames=React");
  });

  it("allows adding a skill when no result matches the search", async () => {
    mockedJobService.getAllSkills.mockResolvedValue({
      data: {
        result: [],
        meta: skillResponseMeta,
      },
    });
    mockedJobService.createSkill.mockResolvedValue({
      data: { skillId: 99, name: "Kubernetes" },
    });

    render(<FilterSkills />);

    const input = screen.getByPlaceholderText("Search skill...");
    await user.type(input, "Kubernetes");

    expect(await screen.findByRole("button", { name: /\+ add "kubernetes"/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /\+ add "kubernetes"/i }));

    await waitFor(() => {
      expect(mockedJobService.createSkill).toHaveBeenCalledWith({ name: "Kubernetes" });
    });

    expect(await screen.findByText("Kubernetes")).toBeInTheDocument();
    expect(mockedToast.success).toHaveBeenCalledWith("Skill added successfully!");
  });
});
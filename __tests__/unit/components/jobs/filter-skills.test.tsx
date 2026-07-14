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

  it("fetches skills page by page and appends the next page on show more", async () => {
    mockedJobService.getAllSkills.mockImplementation(async (page = 0) => {
      if (page === 0) {
        return {
          data: {
            result: [
              { skillId: 1, name: "React" },
              { skillId: 2, name: "Next.js" },
            ],
            meta: { page: 0, pages: 2, total: 3 },
          },
        };
      }
      return {
        data: {
          result: [{ skillId: 3, name: "PostgreSQL" }],
          meta: { page: 1, pages: 2, total: 3 },
        },
      };
    });

    render(<FilterSkills />);

    expect(await screen.findByText("React")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.queryByText("PostgreSQL")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /show more/i }));

    expect(await screen.findByText("PostgreSQL")).toBeInTheDocument();
    expect(mockedJobService.getAllSkills).toHaveBeenLastCalledWith(1, 10, undefined);
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
    // Model eventual consistency: once created, a Kubernetes skill exists
    // server-side, so any later unfiltered refetch (e.g. triggered by the
    // search box clearing after add) must include it too.
    let createdSkill: { skillId: number; name: string } | null = null;
    mockedJobService.getAllSkills.mockImplementation(async () => ({
      data: {
        result: createdSkill ? [createdSkill] : [],
        meta: skillResponseMeta,
      },
    }));
    mockedJobService.createSkill.mockImplementation(async () => {
      createdSkill = { skillId: 99, name: "Kubernetes" };
      return { data: createdSkill };
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
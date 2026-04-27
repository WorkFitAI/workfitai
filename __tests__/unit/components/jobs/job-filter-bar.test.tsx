import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import JobFilterBar from "@/components/jobs/job-filter-bar";

const navigationMocks = vi.hoisted(() => {
  const replace = vi.fn();
  const router = {
    replace,
    push: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  };

  let search = "";

  return {
    replace,
    router,
    setSearch: (value: string) => {
      search = value;
    },
    getSearch: () => search,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => navigationMocks.router,
  useSearchParams: () => new URLSearchParams(navigationMocks.getSearch()),
}));

vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

vi.mock("lucide-react", () => ({
  RotateCcw: () => <svg data-testid="rotate-icon" />, 
  Search: () => <svg data-testid="search-icon" />,
}));

describe("JobFilterBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationMocks.setSearch("");
  });

  it("should initialize search input from title query param", () => {
    navigationMocks.setSearch("title=Frontend");

    render(<JobFilterBar />);

    const input = screen.getByPlaceholderText("Search jobs...") as HTMLInputElement;
    expect(input.value).toBe("Frontend");
  });

  it("should update title query param when typing in search", async () => {
    render(<JobFilterBar />);

    const input = screen.getByPlaceholderText("Search jobs...");
    fireEvent.change(input, { target: { value: "React" } });

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("?title=React&page=1&size=12");
    });
  });

  it("should update status query param when selecting status", async () => {
    navigationMocks.setSearch("title=Frontend");
    render(<JobFilterBar />);

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "PUBLISHED" } });

    await waitFor(() => {
      const calls = navigationMocks.replace.mock.calls.map((call) => call[0]);
      expect(calls).toContain("?title=Frontend&status=PUBLISHED&page=1&size=12");
    });
  });

  it("should reset filters when clicking reset button", async () => {
    navigationMocks.setSearch("title=Backend&status=CLOSED");
    render(<JobFilterBar />);

    const resetButton = screen.getByRole("button");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("?");
    });

    const input = screen.getByPlaceholderText("Search jobs...") as HTMLInputElement;
    expect(input.value).toBe("");
  });
});

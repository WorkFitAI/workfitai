import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HomeHeroSearch } from "@/components/home/home-hero-search";

// mock router
const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(""),
}));

// mock useJobFilters
vi.mock("@/hooks/useJobFilters", () => ({
  useJobFilters: () => ({
    page: 1,
  }),
}));

// mock debounce
vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

// mock locations
vi.mock("@/lib/location", () => ({
  locations: [
    { value: "hcm", label: "Tp. Hồ Chí Minh" },
    { value: "hn", label: "Hà Nội" },
  ],
}));

describe("HomeHeroSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should render all input", () => {
    render(<HomeHeroSearch />);

    expect(screen.getByPlaceholderText(/Keyword/i)).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("Should update keyword when user types", () => {
    render(<HomeHeroSearch />);

    const input = screen.getByPlaceholderText(/Keyword/i) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "react dev" } });

    expect(input.value).toBe("react dev");
  });

  it("Should redirect to /jobs when clicking Search", () => {
    render(<HomeHeroSearch />);

    const input = screen.getByPlaceholderText(/Keyword/i);

    fireEvent.change(input, { target: { value: "java" } });

    fireEvent.click(screen.getByText(/Search/i));

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("/jobs")
    );

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("title=java")
    );
  });

  it("Should call replace when selecting a location", () => {
    render(<HomeHeroSearch />);

    const select = screen.getByRole("combobox");

    fireEvent.change(select, { target: { value: "hcm" } });

    expect(replaceMock).toHaveBeenCalled();
  });

  it("Should show a fixed Technology label instead of an industry combobox", () => {
    render(<HomeHeroSearch />);

    expect(screen.queryByText("Technology")).not.toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    expect(screen.getByLabelText(/Filter by location/i)).toBeInTheDocument();
  });

  it("Should trigger search when blurring the input", () => {
    render(<HomeHeroSearch />);

    const input = screen.getByPlaceholderText(/Keyword/i);

    fireEvent.change(input, { target: { value: "nodejs" } });

    fireEvent.blur(input);

    expect(pushMock).toHaveBeenCalled();
  });
});
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import Pagination from "@/components/report/Pagination";

describe("Pagination", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================
     RENDER
  ========================= */
  it("renders pagination with page numbers", () => {
    render(
      <Pagination page={1} totalPages={5} onChange={mockOnChange} />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  /* =========================
     NAVIGATION BUTTONS
  ========================= */
  it("renders previous and next buttons", () => {
    render(
      <Pagination page={2} totalPages={5} onChange={mockOnChange} />
    );

    expect(screen.getByText("← Previous")).toBeInTheDocument();
    expect(screen.getByText("Next →")).toBeInTheDocument();
  });

  /* =========================
     PREVIOUS BUTTON
  ========================= */
  it("disables previous button on first page", () => {
    render(
      <Pagination page={1} totalPages={5} onChange={mockOnChange} />
    );

    const prevButton = screen.getByRole("button", { name: /← Previous/i });
    expect(prevButton).toBeDisabled();
  });

  it("enables previous button when not on first page", () => {
    render(
      <Pagination page={2} totalPages={5} onChange={mockOnChange} />
    );

    const prevButton = screen.getByRole("button", { name: /← Previous/i });
    expect(prevButton).not.toBeDisabled();
  });

  it("calls onChange with previous page when previous button clicked", () => {
    render(
      <Pagination page={3} totalPages={5} onChange={mockOnChange} />
    );

    const prevButton = screen.getByRole("button", { name: /← Previous/i });
    fireEvent.click(prevButton);

    expect(mockOnChange).toHaveBeenCalledWith(2);
  });

  /* =========================
     NEXT BUTTON
  ========================= */
  it("disables next button on last page", () => {
    render(
      <Pagination page={5} totalPages={5} onChange={mockOnChange} />
    );

    const nextButton = screen.getByRole("button", { name: /Next →/i });
    expect(nextButton).toBeDisabled();
  });

  it("enables next button when not on last page", () => {
    render(
      <Pagination page={4} totalPages={5} onChange={mockOnChange} />
    );

    const nextButton = screen.getByRole("button", { name: /Next →/i });
    expect(nextButton).not.toBeDisabled();
  });

  it("calls onChange with next page when next button clicked", () => {
    render(
      <Pagination page={2} totalPages={5} onChange={mockOnChange} />
    );

    const nextButton = screen.getByRole("button", { name: /Next →/i });
    fireEvent.click(nextButton);

    expect(mockOnChange).toHaveBeenCalledWith(3);
  });

  /* =========================
     PAGE NUMBERS
  ========================= */
  it("highlights current page", () => {
    render(
      <Pagination page={3} totalPages={5} onChange={mockOnChange} />
    );

    const currentPageButton = screen.getByRole("button", { name: "3" });
    expect(currentPageButton).toHaveClass("bg-blue-600");
  });

  it("does not highlight other pages", () => {
    render(
      <Pagination page={3} totalPages={5} onChange={mockOnChange} />
    );

    const otherPageButton = screen.getByRole("button", { name: "1" });
    expect(otherPageButton).not.toHaveClass("bg-blue-600");
  });

  it("calls onChange with clicked page number", () => {
    render(
      <Pagination page={1} totalPages={5} onChange={mockOnChange} />
    );

    const pageButton = screen.getByRole("button", { name: "4" });
    fireEvent.click(pageButton);

    expect(mockOnChange).toHaveBeenCalledWith(4);
  });

  /* =========================
     SINGLE PAGE
  ========================= */
  it("renders correctly with single page", () => {
    render(
      <Pagination page={1} totalPages={1} onChange={mockOnChange} />
    );

    const prevButton = screen.getByRole("button", { name: /← Previous/i });
    const nextButton = screen.getByRole("button", { name: /Next →/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  /* =========================
     MANY PAGES
  ========================= */
  it("renders all page numbers for many pages", () => {
    render(
      <Pagination page={1} totalPages={10} onChange={mockOnChange} />
    );

    for (let i = 1; i <= 10; i++) {
      expect(screen.getByRole("button", { name: i.toString() })).toBeInTheDocument();
    }
  });

  /* =========================
     STYLING
  ========================= */
  it("has proper styling classes", () => {
    const { container } = render(
      <Pagination page={2} totalPages={5} onChange={mockOnChange} />
    );

    const paginationContainer = container.querySelector(".rounded-full");
    expect(paginationContainer).toBeInTheDocument();
  });
});

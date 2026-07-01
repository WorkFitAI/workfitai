import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import CompanyDetail from "@/components/companies/company-detail";
import { companyService } from "@/lib/company/company-service";
import type { Company } from "@/types/company";

vi.mock("@/lib/company/company-service");
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockedCompanyService = vi.mocked(companyService);

function mockCompany(overrides: Partial<Company> = {}): Company {
  return {
    companyNo: "COMP-001",
    name: "Acme Corp",
    description: "We build useful products.",
    address: "123 Market Street",
    websiteUrl: "https://acme.example.com",
    logoUrl: "https://acme.example.com/logo.png",
    size: 120,
    ...overrides,
  };
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [
      key,
      value instanceof File ? value.name : value,
    ])
  );
}

describe("CompanyDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when company is null", () => {
    const { container } = render(<CompanyDetail company={null} />);

    expect(container.firstChild).toBeNull();
  });

  it("shows company details in view mode", () => {
    render(<CompanyDetail company={mockCompany()} />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("We build useful products.")).toBeInTheDocument();
    expect(screen.getByText("123 Market Street")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://acme.example.com" })).toHaveAttribute(
      "href",
      "https://acme.example.com"
    );
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
  });

  it("allows editing, saving, and canceling changes", async () => {
    mockedCompanyService.updateCompany.mockResolvedValue({
      status: 200,
      message: "Updated",
      data: mockCompany({
        description: "Updated description.",
        address: "456 New Street",
        websiteUrl: "https://acme.example.com/about",
        size: 250,
        logoUrl: "https://acme.example.com/new-logo.png",
      }),
    } as never);

    render(<CompanyDetail company={mockCompany()} canEdit />);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const descriptionInput = screen.getByDisplayValue("We build useful products.");
    const addressInput = screen.getByDisplayValue("123 Market Street");
    const websiteInput = screen.getByDisplayValue("https://acme.example.com");
    const sizeInput = screen.getByDisplayValue("120");
    const fileInput = document.getElementById("logo-upload") as HTMLInputElement;

    fireEvent.change(descriptionInput, { target: { value: "Updated description." } });
    fireEvent.change(addressInput, { target: { value: "456 New Street" } });
    fireEvent.change(websiteInput, { target: { value: "https://acme.example.com/about" } });
    fireEvent.change(sizeInput, { target: { value: "250" } });

    const logoFile = new File(["logo"], "new-logo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [logoFile] } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockedCompanyService.updateCompany).toHaveBeenCalledTimes(1);
    });

    const formData = mockedCompanyService.updateCompany.mock.calls[0][0] as FormData;
    expect(formDataToObject(formData)).toEqual({
      companyNo: "COMP-001",
      description: "Updated description.",
      address: "456 New Street",
      websiteUrl: "https://acme.example.com/about",
      size: "250",
      logoFile: "new-logo.png",
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText("We build useful products.")).toBeInTheDocument();
    expect(screen.getByText("123 Market Street")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
  });
});
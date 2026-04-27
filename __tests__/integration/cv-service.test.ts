/**
 * Integration tests for lib/cv/cv-service.ts
 * Tests: listMyCVs, uploadCV, updateCV, deleteCV with mocked api-client
 * Schema aligned with actual API response (objectName, headline, pdfUrl, meta.result, etc.)
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import type { CVListResponse, CVUploadResponse, CVMetadata } from "@/types/cv";

const mockGet = vi.hoisted(() => vi.fn());
const mockPost = vi.hoisted(() => vi.fn());
const mockPatch = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());
const mockUpload = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
    upload: mockUpload,
  },
  ApiError: class ApiError extends Error {
    constructor(
      public message: string,
      public status: number,
    ) {
      super(message);
      this.name = "ApiError";
    }
  },
  AuthError: class AuthError extends Error {
    constructor(
      public message: string,
      public status: number,
    ) {
      super(message);
      this.name = "AuthError";
    }
  },
}));

vi.mock("@/lib/auth/token-store", () => ({
  getAccessToken: vi.fn(() => "test-token"),
}));

vi.mock("@/lib/auth/device-fingerprint", () => ({
  getDeviceId: vi.fn(() => "test-device-id"),
}));

const { cvService } = await import("@/lib/cv/cv-service");

function mockCVMetadata(overrides: Partial<CVMetadata> = {}): CVMetadata {
  return {
    cvId: "cv-001",
    objectName: "dae8124e-9878-4582-9497-ac4ff22258b9-resume.pdf",
    headline: null,
    summary: "",
    pdfUrl: "http://minio:9000/cvs-files/dae8124e-9878-4582-9497-ac4ff22258b9-resume.pdf",
    belongTo: "testuser",
    templateType: "UPLOAD",
    sections: { skills: [], projects: [], education: [], languages: [], experience: [] },
    createdAt: "2026-01-15 08:00:00 AM",
    createdBy: "testuser@example.com",
    updatedAt: "2026-01-15 08:00:00 AM",
    updatedBy: "testuser@example.com",
    exist: true,
    ...overrides,
  };
}

function mockListResponse(overrides: Partial<CVListResponse> = {}): CVListResponse {
  return {
    meta: { page: 1, pageSize: 10, pages: 1, total: 1 },
    result: [mockCVMetadata()],
    ...overrides,
  };
}

function mockUploadResponse(overrides: Partial<CVUploadResponse> = {}): CVUploadResponse {
  return {
    cvId: "cv-002",
    objectName: "aaaabbbb-cccc-dddd-eeee-ffffffffffff-resume-2.pdf",
    pdfUrl: "http://minio:9000/cvs-files/aaaabbbb-cccc-dddd-eeee-ffffffffffff-resume-2.pdf",
    templateType: "UPLOAD",
    createdAt: "2026-01-15 09:00:00 AM",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("[C1] listMyCVs", () => {
  it("fetches CVs with correct endpoint and pagination", async () => {
    const response = mockListResponse({ result: [mockCVMetadata()] });
    mockGet.mockResolvedValueOnce({ data: response });

    const result = await cvService.listMyCVs("testuser", 1, 10);

    expect(mockGet).toHaveBeenCalledWith("/cv/candidate/testuser?page=1&size=10");
    expect(result.data.result).toHaveLength(1);
    expect(result.data.result[0].cvId).toBe("cv-001");
  });

  it("handles custom page and size parameters", async () => {
    const response = mockListResponse({ meta: { page: 2, pageSize: 5, pages: 4, total: 20 } });
    mockGet.mockResolvedValueOnce({ data: response });

    await cvService.listMyCVs("candidate2", 2, 5);

    expect(mockGet).toHaveBeenCalledWith("/cv/candidate/candidate2?page=2&size=5");
  });

  it("returns empty list when no CVs exist", async () => {
    const response = mockListResponse({
      meta: { page: 1, pageSize: 10, pages: 0, total: 0 },
      result: [],
    });
    mockGet.mockResolvedValueOnce({ data: response });

    const result = await cvService.listMyCVs("testuser", 1, 10);

    expect(result.data.result).toHaveLength(0);
    expect(result.data.meta.total).toBe(0);
  });

  it("throws ApiError on 401 (unauthorized)", async () => {
    mockGet.mockRejectedValueOnce(new ApiError("Unauthorized", 401));

    await expect(cvService.listMyCVs("testuser", 1, 10)).rejects.toThrow("Unauthorized");
  });

  it("throws ApiError on 500 (server error)", async () => {
    mockGet.mockRejectedValueOnce(new ApiError("Server error", 500));

    await expect(cvService.listMyCVs("testuser", 1, 10)).rejects.toThrow("Server error");
  });
});

describe("[C2] uploadCV", () => {
  it("uploads file with correct FormData and endpoint", async () => {
    const file = new File(["pdf content"], "resume.pdf", { type: "application/pdf" });
    const response = mockUploadResponse();
    mockUpload.mockResolvedValueOnce({ data: response });

    const result = await cvService.uploadCV(file);

    expect(mockUpload).toHaveBeenCalled();
    const callArgs = mockUpload.mock.calls[0];
    expect(callArgs[0]).toBe("/cv/candidate/upload");
    expect(callArgs[1]).toBeInstanceOf(FormData);
    expect(result.data.cvId).toBe("cv-002");
  });

  it("sets templateType to UPLOAD in FormData", async () => {
    const file = new File(["pdf content"], "resume.pdf", { type: "application/pdf" });
    mockUpload.mockResolvedValueOnce({ data: mockUploadResponse() });

    await cvService.uploadCV(file);

    const formData = mockUpload.mock.calls[0][1];
    expect(formData.get("templateType")).toBe("UPLOAD");
    expect(formData.get("file")).toBe(file);
  });

  it("throws ApiError on 413 (file too large)", async () => {
    const file = new File(["x".repeat(6 * 1024 * 1024)], "large.pdf", { type: "application/pdf" });
    mockUpload.mockRejectedValueOnce(new ApiError("File size exceeds 5MB limit", 413));

    await expect(cvService.uploadCV(file)).rejects.toThrow("File size exceeds 5MB limit");
  });

  it("throws ApiError on 400 (invalid file type)", async () => {
    const file = new File(["content"], "doc.txt", { type: "text/plain" });
    mockUpload.mockRejectedValueOnce(new ApiError("Only PDF files are allowed", 400));

    await expect(cvService.uploadCV(file)).rejects.toThrow("Only PDF files are allowed");
  });

  it("throws ApiError on 401 (unauthorized)", async () => {
    const file = new File(["pdf"], "resume.pdf", { type: "application/pdf" });
    mockUpload.mockRejectedValueOnce(new ApiError("Unauthorized", 401));

    await expect(cvService.uploadCV(file)).rejects.toThrow("Unauthorized");
  });
});

describe("[C3] updateCV", () => {
  it("patches CV with templateType via correct endpoint", async () => {
    const updated = mockCVMetadata({ templateType: "TECH" });
    mockPatch.mockResolvedValueOnce({ data: updated });

    const result = await cvService.updateCV("cv-001", { templateType: "TECH" });

    expect(mockPatch).toHaveBeenCalledWith("/cv/candidate/cv-001", { templateType: "TECH" });
    expect(result.data.templateType).toBe("TECH");
  });

  it("throws ApiError on 404 (CV not found)", async () => {
    mockPatch.mockRejectedValueOnce(new ApiError("CV not found", 404));

    await expect(cvService.updateCV("invalid-id", { templateType: "GENERAL" })).rejects.toThrow(
      "CV not found",
    );
  });

  it("throws ApiError on 403 (not owner)", async () => {
    mockPatch.mockRejectedValueOnce(new ApiError("You do not own this CV", 403));

    await expect(
      cvService.updateCV("other-users-cv", { templateType: "CREATIVE" }),
    ).rejects.toThrow("You do not own this CV");
  });
});

describe("[C4] deleteCV", () => {
  it("deletes CV with correct endpoint", async () => {
    mockDelete.mockResolvedValueOnce(undefined);

    await cvService.deleteCV("cv-001");

    expect(mockDelete).toHaveBeenCalledWith("/cv/candidate/cv-001");
  });

  it("returns void on successful deletion", async () => {
    mockDelete.mockResolvedValueOnce(undefined);

    const result = await cvService.deleteCV("cv-001");

    expect(result).toBeUndefined();
  });

  it("throws ApiError on 404 (CV not found)", async () => {
    mockDelete.mockRejectedValueOnce(new ApiError("CV not found", 404));

    await expect(cvService.deleteCV("invalid-id")).rejects.toThrow("CV not found");
  });

  it("throws ApiError on 403 (not owner)", async () => {
    mockDelete.mockRejectedValueOnce(new ApiError("You do not own this CV", 403));

    await expect(cvService.deleteCV("other-users-cv")).rejects.toThrow("You do not own this CV");
  });

  it("throws ApiError on 500 (server error)", async () => {
    mockDelete.mockRejectedValueOnce(new ApiError("Server error", 500));

    await expect(cvService.deleteCV("cv-001")).rejects.toThrow("Server error");
  });
});

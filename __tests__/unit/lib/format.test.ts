/**
 * Unit tests for lib/format.ts
 * Tests: formatFileSize edge cases (0 bytes, 1023 B, 1 KB, 1 MB, 5 MB)
 */
import { describe, it, expect } from "vitest";
import { formatFileSize } from "@/lib/format";

describe("formatFileSize", () => {
  describe("bytes (< 1024)", () => {
    it("formats 0 bytes as '0 B'", () => {
      expect(formatFileSize(0)).toBe("0 B");
    });

    it("formats 1 byte as '1 B'", () => {
      expect(formatFileSize(1)).toBe("1 B");
    });

    it("formats 512 bytes as '512 B'", () => {
      expect(formatFileSize(512)).toBe("512 B");
    });

    it("formats 1023 bytes as '1023 B'", () => {
      expect(formatFileSize(1023)).toBe("1023 B");
    });
  });

  describe("kilobytes (1024 - 1048575)", () => {
    it("formats 1024 bytes as '1.0 KB'", () => {
      expect(formatFileSize(1024)).toBe("1.0 KB");
    });

    it("formats 1536 bytes as '1.5 KB'", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });

    it("formats 512 KB as '512.0 KB'", () => {
      expect(formatFileSize(512 * 1024)).toBe("512.0 KB");
    });

    it("formats 1048575 bytes as '1024.0 KB'", () => {
      expect(formatFileSize(1048575)).toBe("1024.0 KB");
    });
  });

  describe("megabytes (>= 1048576)", () => {
    it("formats 1 MB (1048576 bytes) as '1.0 MB'", () => {
      expect(formatFileSize(1048576)).toBe("1.0 MB");
    });

    it("formats 5 MB as '5.0 MB'", () => {
      expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
    });

    it("formats 5.5 MB with decimal precision", () => {
      expect(formatFileSize(5.5 * 1024 * 1024)).toBe("5.5 MB");
    });

    it("formats 100 MB as '100.0 MB'", () => {
      expect(formatFileSize(100 * 1024 * 1024)).toBe("100.0 MB");
    });
  });

  describe("edge cases", () => {
    it("handles negative numbers (boundary check)", () => {
      // Negative numbers should still format with "B" suffix
      expect(formatFileSize(-100)).toBe("-100 B");
    });

    it("handles very large numbers", () => {
      const gigabyte = 1024 * 1024 * 1024;
      expect(formatFileSize(gigabyte)).toBe("1024.0 MB");
    });

    it("handles float precision correctly for KB boundary", () => {
      expect(formatFileSize(1024.5)).toBe("1.0 KB");
    });

    it("handles float precision correctly for MB boundary", () => {
      expect(formatFileSize(1048576.5)).toBe("1.0 MB");
    });
  });
});

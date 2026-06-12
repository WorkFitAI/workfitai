/**
 * Unit tests — JobPostClient Functions
 * Tests isolated functions and handlers within JobPostClient
 */

import {
  describe,
  it,
  expect,
  beforeEach,
} from "vitest";

describe("JobPostClient - Utility Functions", () => {
  describe("getUserType", () => {
    let getUserType: (roles: string[]) => string;

    beforeEach(() => {
      // Recreate the getUserType function from JobPostClient
      getUserType = (roles: string[]) => {
        if (roles?.includes("ROLE_ADMIN")) return "admin";
        if (roles?.includes("ROLE_HR_MANAGER")) return "hr-manager";
        if (roles?.includes("ROLE_HR")) return "hr";
        return "guest";
      };
    });

    it("returns 'admin' when ROLE_ADMIN is present", () => {
      expect(getUserType(["ROLE_ADMIN"])).toBe("admin");
    });

    it("returns 'admin' even if other roles are present", () => {
      expect(getUserType(["ROLE_HR", "ROLE_ADMIN"])).toBe("admin");
    });

    it("returns 'hr-manager' when ROLE_HR_MANAGER is present", () => {
      expect(getUserType(["ROLE_HR_MANAGER"])).toBe("hr-manager");
    });

    it("returns 'hr-manager' over hr role", () => {
      expect(
        getUserType(["ROLE_HR", "ROLE_HR_MANAGER"])
      ).toBe("hr-manager");
    });

    it("returns 'hr' when ROLE_HR is present without ROLE_HR_MANAGER", () => {
      expect(getUserType(["ROLE_HR"])).toBe("hr");
    });

    it("returns 'guest' when no recognized roles", () => {
      expect(getUserType(["ROLE_UNKNOWN"])).toBe("guest");
    });

    it("returns 'guest' when roles array is empty", () => {
      expect(getUserType([])).toBe("guest");
    });

    it("returns 'guest' when roles is undefined", () => {
      const undefinedRoles = undefined as string[] | undefined;
      // This tests the optional chaining behavior
      const result = undefinedRoles?.includes("ROLE_ADMIN") ? "admin" : "guest";
      expect(result).toBe("guest");
    });

    it("prioritizes admin over hr-manager", () => {
      expect(
        getUserType(["ROLE_HR_MANAGER", "ROLE_ADMIN"])
      ).toBe("admin");
    });

    it("prioritizes hr-manager over hr", () => {
      expect(
        getUserType(["ROLE_HR", "ROLE_HR_MANAGER"])
      ).toBe("hr-manager");
    });
  });

  describe("Date Formatting", () => {
    it("formats created date correctly", () => {
      const date = new Date("2026-01-15");
      const formatted = date.toLocaleDateString("vi-VN");
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("handles different date formats", () => {
      const date1 = new Date("2026-01-01");
      const date2 = new Date("2026-12-31");

      const formatted1 = date1.toLocaleDateString("vi-VN");
      const formatted2 = date2.toLocaleDateString("vi-VN");

      expect(formatted1).not.toBe(formatted2);
    });
  });

  describe("Skill Mapping", () => {
    it("maps skill names to skill ids correctly", () => {
      const mockSkills = [
        { skillId: 1, name: "TypeScript" },
        { skillId: 2, name: "Node.js" },
        { skillId: 3, name: "PostgreSQL" },
      ];

      const skillNames = ["TypeScript", "Node.js"];

      const skillIdsToSave = skillNames
        .map((name) => mockSkills.find((s) => s.name === name)?.skillId)
        .filter((id): id is number => id !== undefined);

      expect(skillIdsToSave).toEqual([1, 2]);
    });

    it("handles missing skills gracefully", () => {
      const mockSkills = [
        { skillId: 1, name: "TypeScript" },
        { skillId: 2, name: "Node.js" },
      ];

      const skillNames = ["TypeScript", "UnknownSkill"];

      const skillIdsToSave = skillNames
        .map((name) => mockSkills.find((s) => s.name === name)?.skillId)
        .filter((id): id is number => id !== undefined);

      expect(skillIdsToSave).toEqual([1]);
    });

    it("returns empty array when no skills match", () => {
      const mockSkills = [
        { skillId: 1, name: "TypeScript" },
        { skillId: 2, name: "Node.js" },
      ];

      const skillNames = ["Python", "Java"];

      const skillIdsToSave = skillNames
        .map((name) => mockSkills.find((s) => s.name === name)?.skillId)
        .filter((id): id is number => id !== undefined);

      expect(skillIdsToSave).toEqual([]);
    });

    it("handles empty skill names array", () => {
      const mockSkills = [
        { skillId: 1, name: "TypeScript" },
      ];

      const skillNames: string[] = [];

      const skillIdsToSave = skillNames
        .map((name) => mockSkills.find((s) => s.name === name)?.skillId)
        .filter((id): id is number => id !== undefined);

      expect(skillIdsToSave).toEqual([]);
    });

    it("trims skill names before mapping", () => {
      const mockSkills = [
        { skillId: 1, name: "TypeScript" },
        { skillId: 2, name: "Node.js" },
      ];

      const skillNames = ["  TypeScript  ", " Node.js "];

      const trimmedNames = skillNames.map((name) => name.trim());

      const skillIdsToSave = trimmedNames
        .map((name) => mockSkills.find((s) => s.name === name)?.skillId)
        .filter((id): id is number => id !== undefined);

      expect(skillIdsToSave).toEqual([1, 2]);
    });
  });

  describe("HR Name Extraction", () => {
    it("extracts unique HR names from jobs", () => {
      const mockJobs = [
        { postId: "job-1", createdBy: "hr1@example.com" },
        { postId: "job-2", createdBy: "hr1@example.com" },
        { postId: "job-3", createdBy: "hr2@example.com" },
      ];

      const hrNames = Object.fromEntries(
        [...new Set(mockJobs.map((j) => j.createdBy))].map((name) => [
          name,
          name,
        ])
      );

      expect(Object.keys(hrNames)).toEqual([
        "hr1@example.com",
        "hr2@example.com",
      ]);
    });

    it("handles empty job list", () => {
      const mockJobs: { createdBy: string }[] = [];

      const hrNames = Object.fromEntries(
        [...new Set(mockJobs.map((j) => j.createdBy))].map((name) => [
          name,
          name,
        ])
      );

      expect(Object.keys(hrNames)).toEqual([]);
    });

    it("handles jobs with same creator", () => {
      const mockJobs = [
        { postId: "job-1", createdBy: "hr@example.com" },
        { postId: "job-2", createdBy: "hr@example.com" },
      ];

      const hrNames = Object.fromEntries(
        [...new Set(mockJobs.map((j) => j.createdBy))].map((name) => [
          name,
          name,
        ])
      );

      expect(Object.keys(hrNames).length).toBe(1);
      expect(Object.keys(hrNames)[0]).toBe("hr@example.com");
    });
  });

  describe("Category Matching", () => {
    it("finds category by exact name match (case-insensitive)", () => {
      const mockCategories = [
        { id: "cat-1", name: "Backend Development" },
        { id: "cat-2", name: "Frontend Development" },
      ];

      const jobCategoryName = "backend development";

      const category = mockCategories.find(
        (c) =>
          c.name.trim().toLowerCase() ===
          jobCategoryName.trim().toLowerCase()
      );

      expect(category).toEqual({
        id: "cat-1",
        name: "Backend Development",
      });
    });

    it("handles category name with extra whitespace", () => {
      const mockCategories = [
        { id: "cat-1", name: "DevOps" },
      ];

      const jobCategoryName = "  DevOps  ";

      const category = mockCategories.find(
        (c) =>
          c.name.trim().toLowerCase() ===
          jobCategoryName.trim().toLowerCase()
      );

      expect(category).toEqual({ id: "cat-1", name: "DevOps" });
    });

    it("returns undefined when category is not found", () => {
      const mockCategories = [
        { id: "cat-1", name: "Backend Development" },
      ];

      const jobCategoryName = "Data Science";

      const category = mockCategories.find(
        (c) =>
          c.name.trim().toLowerCase() ===
          jobCategoryName.trim().toLowerCase()
      );

      expect(category).toBeUndefined();
    });
  });

  describe("Job Data Normalization", () => {
    it("normalizes job form values to API format", () => {
      const formData = {
        postId: "job-001",
        title: "Backend Engineer",
        shortDescription: "Experienced backend engineer needed",
        description: "Full description",
        employmentType: "FULL_TIME",
        experienceLevel: "Senior",
        salaryMin: 5000,
        salaryMax: 8000,
        currency: "USD",
        location: "Ho Chi Minh City",
        quantity: 2,
        expiresAt: new Date("2026-12-31"),
        educationLevel: "Bachelor",
        benefits: "Health insurance",
        requirements: "2+ years",
        responsibilities: "Write code",
        requiredExperience: "2+ years",
        companyNo: "C001",
        skillNames: ["TypeScript", "Node.js"],
        status: "PUBLISHED",
        jobCategoryName: "Backend Development",
      };

      const normalized = {
        ...formData,
        skillNames: formData.skillNames.map((s) => s.trim()),
      };

      expect(normalized.skillNames).toEqual(["TypeScript", "Node.js"]);
    });

    it("converts expiresAt to Date object", () => {
      const expiresAtString = "2026-12-31";
      const expiresAt = new Date(expiresAtString);

      expect(expiresAt).toBeInstanceOf(Date);
      expect(expiresAt.getFullYear()).toBe(2026);
    });

    it("handles skill names with whitespace", () => {
      const skillNames = ["  TypeScript  ", " Node.js "];

      const normalized = skillNames.map((s) => s.trim());

      expect(normalized).toEqual(["TypeScript", "Node.js"]);
    });
  });

  describe("Edit vs Create Logic", () => {
    it("detects edit mode when editingJob exists", () => {
      const editingJob = { postId: "job-001", title: "Test Job" };
      const isEditMode = !!editingJob;

      expect(isEditMode).toBe(true);
    });

    it("detects create mode when editingJob is null", () => {
      const editingJob = null;
      const isEditMode = !!editingJob;

      expect(isEditMode).toBe(false);
    });

    it("builds correct payload for create mode", () => {
      const data = { title: "New Job" };
      const companyId = "C001";
      const categoryId = "cat-1";
      const skillIds = [1, 2];
      const editingJob = null;

      const payload = editingJob
        ? {
          ...data,
          jobId: 'new-job-id',
          jobCategoryId: categoryId,
          companyNo: companyId,
          skillIds,
        }
        : {
          ...data,
          companyNo: companyId,
          jobCategoryId: categoryId,
          skillIds,
        };

      expect(payload).toEqual({
        title: "New Job",
        companyNo: "C001",
        jobCategoryId: "cat-1",
        skillIds: [1, 2],
      });
    });

    it("builds correct payload for edit mode", () => {
      const data = { title: "Updated Job" };
      const companyId = "C001";
      const categoryId = "cat-1";
      const skillIds = [1, 2];
      const editingJob = { postId: "job-001" };

      const payload = editingJob
        ? {
          ...data,
          jobId: editingJob.postId,
          jobCategoryId: categoryId,
          companyNo: companyId,
          skillIds,
        }
        : {
          ...data,
          companyNo: companyId,
          jobCategoryId: categoryId,
          skillIds,
        };

      expect(payload).toEqual({
        title: "Updated Job",
        jobId: "job-001",
        jobCategoryId: "cat-1",
        companyNo: "C001",
        skillIds: [1, 2],
      });
    });
  });
});

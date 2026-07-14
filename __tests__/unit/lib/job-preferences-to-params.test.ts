import { describe, it, expect } from "vitest";
import {
  applyPreferencesToParams,
  hasAnyFilterParams,
} from "@/lib/job/job-preferences-to-params";
import { JobPreferences } from "@/types/job-preferences";

describe("applyPreferencesToParams", () => {
  it("comma-joins multi-value fields and sets category/salary/currency", () => {
    const prefs: JobPreferences = {
      experienceLevel: ["SENIOR", "MID"],
      employmentType: ["FULL_TIME"],
      skillNames: ["React", "Node.js"],
      categoryName: "Software Engineering",
      salaryMin: 20000000,
      currency: "VND",
    };

    const params = applyPreferencesToParams(prefs);

    expect(params.get("experienceLevel")).toBe("SENIOR,MID");
    expect(params.get("employmentType")).toBe("FULL_TIME");
    expect(params.get("skillNames")).toBe("React,Node.js");
    expect(params.get("categoryName")).toBe("Software Engineering");
    expect(params.get("salaryMin")).toBe("20000000");
    expect(params.get("currency")).toBe("VND");
  });

  it("omits empty arrays and undefined fields", () => {
    const prefs: JobPreferences = {
      experienceLevel: [],
      employmentType: [],
      skillNames: [],
      currency: "USD",
    };

    const params = applyPreferencesToParams(prefs);

    expect(params.has("experienceLevel")).toBe(false);
    expect(params.has("employmentType")).toBe(false);
    expect(params.has("skillNames")).toBe(false);
    expect(params.has("categoryName")).toBe(false);
    expect(params.has("salaryMin")).toBe(false);
  });

  it("always resets page and size", () => {
    const base = new URLSearchParams("page=5&size=24&title=engineer");
    const prefs: JobPreferences = {
      experienceLevel: ["JUNIOR"],
      employmentType: [],
      skillNames: [],
      currency: "USD",
    };

    const params = applyPreferencesToParams(prefs, base);

    expect(params.get("page")).toBe("1");
    expect(params.get("size")).toBe("12");
    expect(params.get("title")).toBe("engineer");
  });

  it("removing a field from prefs clears it from existing params", () => {
    const base = new URLSearchParams("categoryName=Marketing&salaryMin=1000&currency=USD");
    const prefs: JobPreferences = {
      experienceLevel: [],
      employmentType: [],
      skillNames: [],
      currency: "USD",
    };

    const params = applyPreferencesToParams(prefs, base);

    expect(params.has("categoryName")).toBe(false);
    expect(params.has("salaryMin")).toBe(false);
    expect(params.has("currency")).toBe(false);
  });
});

describe("hasAnyFilterParams", () => {
  it("returns false for empty params", () => {
    expect(hasAnyFilterParams(new URLSearchParams())).toBe(false);
  });

  it("returns false when only page/size are set", () => {
    expect(hasAnyFilterParams(new URLSearchParams("page=1&size=12"))).toBe(false);
  });

  it("returns true when a known filter key is present", () => {
    expect(hasAnyFilterParams(new URLSearchParams("experienceLevel=SENIOR"))).toBe(true);
    expect(hasAnyFilterParams(new URLSearchParams("title=engineer"))).toBe(true);
  });
});

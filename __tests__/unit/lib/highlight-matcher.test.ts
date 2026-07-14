import { describe, it, expect } from "vitest";
import { matchHighlightSegments, expandCommaTerms } from "@/lib/cv/highlight-matcher";

describe("matchHighlightSegments", () => {
  it("splits a single-token match mid-string into before/matched/after segments", () => {
    const segments = matchHighlightSegments("I know Java well", ["Java"]);

    expect(segments).toEqual([
      { text: "I know ", matched: false },
      { text: "Java", matched: true },
      { text: " well", matched: false },
    ]);
  });

  it("matches case-insensitively", () => {
    const segments = matchHighlightSegments("I know Java well", ["java"]);

    expect(segments).toContainEqual({ text: "Java", matched: true });
  });

  it("matches multiple non-overlapping terms in one string", () => {
    const segments = matchHighlightSegments("Java and Docker", ["Java", "Docker"]);

    expect(segments).toEqual([
      { text: "Java", matched: true },
      { text: " and ", matched: false },
      { text: "Docker", matched: true },
    ]);
  });

  it("prefers the longest overlapping term so a substring term never double-wraps", () => {
    const segments = matchHighlightSegments("I use JavaScript daily", ["Java", "JavaScript"]);

    expect(segments).toEqual([
      { text: "I use ", matched: false },
      { text: "JavaScript", matched: true },
      { text: " daily", matched: false },
    ]);
  });

  it("returns a single unmatched segment when the term is not present", () => {
    const segments = matchHighlightSegments("I know Python", ["Java"]);

    expect(segments).toEqual([{ text: "I know Python", matched: false }]);
  });

  it("returns a single unmatched segment when the terms array is empty", () => {
    const segments = matchHighlightSegments("I know Java", []);

    expect(segments).toEqual([{ text: "I know Java", matched: false }]);
  });

  it("ignores empty and whitespace-only terms without producing zero-width matches", () => {
    const segments = matchHighlightSegments("I know Java", ["", "   ", "Java"]);

    expect(segments).toEqual([
      { text: "I know ", matched: false },
      { text: "Java", matched: true },
    ]);
  });

  it("treats regex-special characters in terms literally", () => {
    const text = "Experience with C++, Node.js, and remote work (remote) preferred";
    const segments = matchHighlightSegments(text, ["C++", "Node.js", "(remote)"]);

    const matched = segments.filter((s) => s.matched).map((s) => s.text);
    expect(matched).toEqual(["C++", "Node.js", "(remote)"]);
  });

  it("matches a multi-word phrase within one text run", () => {
    const segments = matchHighlightSegments("Built services with Spring Boot and REST", ["Spring Boot"]);

    expect(segments).toContainEqual({ text: "Spring Boot", matched: true });
    // Cross-run phrase splitting (e.g. "Spring" and "Boot" in separate PDF text
    // items) is out of scope for this pure per-run matcher — that's the caller's concern.
  });
});

describe("expandCommaTerms", () => {
  it("splits a comma-separated match point into individual terms", () => {
    expect(expandCommaTerms(["Java, Spring Boot, Docker"])).toEqual([
      "Java",
      "Spring Boot",
      "Docker",
    ]);
  });

  it("leaves single-skill match points unchanged", () => {
    expect(expandCommaTerms(["Java", "Docker"])).toEqual(["Java", "Docker"]);
  });

  it("trims whitespace around split parts and tolerates missing space after comma", () => {
    expect(expandCommaTerms(["Java,Docker,  Kubernetes"])).toEqual([
      "Java",
      "Docker",
      "Kubernetes",
    ]);
  });

  it("drops empty parts from trailing commas", () => {
    expect(expandCommaTerms(["Java, , Docker,"])).toEqual(["Java", "Docker"]);
  });

  it("flattens across multiple match points", () => {
    expect(expandCommaTerms(["Java, Docker", "AWS"])).toEqual(["Java", "Docker", "AWS"]);
  });
});

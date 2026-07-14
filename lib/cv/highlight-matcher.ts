export interface HighlightSegment {
  text: string;
  matched: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Expands each term into its comma-separated parts — an AI match point like
 * "Java, Spring Boot, Docker" bundles several distinct skills into one
 * string, and each part is itself a match point that should be
 * highlightable on its own rather than only as the full literal string.
 */
export function expandCommaTerms(terms: string[]): string[] {
  return terms.flatMap((t) => t.split(/,\s*/).map((part) => part.trim()).filter(Boolean));
}

/**
 * Splits `text` into segments flagging which parts match any of `terms`
 * (case-insensitive substring match). Terms are matched longest-first so a
 * substring term (e.g. "Java") never shadows/double-wraps a longer overlapping
 * term (e.g. "JavaScript") that also matched at the same position.
 *
 * Pure, single-text-run matcher — a term split across multiple PDF text runs
 * will not be found by this function; that's the caller's concern.
 */
export function matchHighlightSegments(text: string, terms: string[]): HighlightSegment[] {
  const cleanTerms = Array.from(
    new Set(terms.map((t) => t.trim()).filter((t) => t.length > 0)),
  ).sort((a, b) => b.length - a.length);

  if (!text || cleanTerms.length === 0) {
    return [{ text, matched: false }];
  }

  const pattern = new RegExp(`(${cleanTerms.map(escapeRegExp).join("|")})`, "gi");

  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), matched: false });
    }
    segments.push({ text: match[0], matched: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), matched: false });
  }

  return segments.length > 0 ? segments : [{ text, matched: false }];
}

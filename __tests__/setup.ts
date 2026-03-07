import "@testing-library/jest-dom";

// ── Web Storage polyfill for jsdom ──────────────────────────────────────────
// jsdom implements localStorage/sessionStorage, but the global object
// sometimes misses them when vitest runs in a worker thread.
class StorageMock implements Storage {
  private store: Record<string, string> = {};
  get length() {
    return Object.keys(this.store).length;
  }
  clear() {
    this.store = {};
  }
  getItem(k: string) {
    return this.store[k] ?? null;
  }
  key(i: number) {
    return Object.keys(this.store)[i] ?? null;
  }
  removeItem(k: string) {
    delete this.store[k];
  }
  setItem(k: string, v: string) {
    this.store[k] = v;
  }
}

Object.defineProperty(global, "localStorage", {
  value: new StorageMock(),
  writable: true,
});
Object.defineProperty(global, "sessionStorage", {
  value: new StorageMock(),
  writable: true,
});

// ── Radix UI / ShadCN component polyfills ─────────────────────────────────
// jsdom doesn't implement ResizeObserver or IntersectionObserver used by Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;

// ── TextEncoder / TextDecoder polyfill ─────────────────────────────────────
import { TextEncoder, TextDecoder } from "util";
Object.assign(global, { TextEncoder, TextDecoder });

// ── crypto.randomUUID polyfill ─────────────────────────────────────────────
import { vi } from "vitest";
if (!global.crypto?.randomUUID) {
  Object.defineProperty(global, "crypto", {
    value: { randomUUID: () => "test-device-uuid-1234" },
    writable: true,
  });
}

// ── Next.js router mock ────────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// ── Next.js Image mock ─────────────────────────────────────────────────────
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => null,
}));

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

// ── HTMLCanvasElement stub for lottie-web ──────────────────────────────────
// lottie-web calls getContext("2d") during module init; jsdom doesn't implement it,
// causing "Cannot set properties of null (setting 'fillStyle')" and crashing suites.
const mockCanvasCtx = {
  fillStyle: "" as string | CanvasGradient | CanvasPattern,
  strokeStyle: "" as string | CanvasGradient | CanvasPattern,
  lineWidth: 1,
  globalAlpha: 1,
  globalCompositeOperation: "source-over" as GlobalCompositeOperation,
  lineCap: "butt" as CanvasLineCap,
  lineJoin: "miter" as CanvasLineJoin,
  miterLimit: 10,
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  arc: vi.fn(),
  arcTo: vi.fn(),
  ellipse: vi.fn(),
  rect: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  clip: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  drawImage: vi.fn(),
  putImageData: vi.fn(),
  getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray() }),
  createImageData: vi.fn(),
  createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  createPattern: vi.fn().mockReturnValue(null),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  setLineDash: vi.fn(),
  getLineDash: vi.fn().mockReturnValue([]),
  isPointInPath: vi.fn().mockReturnValue(false),
  isPointInStroke: vi.fn().mockReturnValue(false),
  canvas: { width: 300, height: 150 } as HTMLCanvasElement,
};
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCanvasCtx) as any;

/**
 * Kafka OTP Integration Test — Auth Registration Flows
 *
 * Requires: backend (http://localhost:9085) + Kafka UI (http://localhost:8080)
 * Run with: npx vitest run __tests__/integration/kafka-otp.test.ts
 * Excluded from standard npm run test CI — self-gracefully skips when infra is down.
 *
 * Kafka message format (SSE stream from Kafka UI):
 *   data:{...PHASE...}
 *   data:{...CONSUMING...}
 *   data:{"type":"MESSAGE","message":{"key":"email@...","content":"{ \"metadata\":{\"otp\":\"123456\"} }"}}
 *   data:{...DONE...}
 *
 * OTP location: message.content (JSON string) → metadata.otp
 */
import { describe, it, expect, beforeAll } from "vitest";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9085";
const KAFKA_UI = "http://localhost:8080";
// SSE endpoint — returns Server-Sent Events stream
const KAFKA_SSE = `${KAFKA_UI}/api/clusters/workfitai-local/topics/notification-events/messages?keySerde=String&valueSerde=String&limit=100`;

// ── Types ─────────────────────────────────────────────────────────────────

interface KafkaMessage {
  key: string;
  content: string; // JSON string with the event payload
}

interface NotificationEvent {
  templateType: string;
  recipientEmail: string;
  metadata?: { otp?: string };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function testEmail(role: string): string {
  return `test-${role.toLowerCase()}-${Date.now()}@workfitai.test`;
}

async function callApi<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json() as T;
}

/**
 * Fetch Kafka messages via SSE, parse the stream, and return all OTP_VERIFICATION messages.
 * The Kafka UI returns SSE lines like: data:{...json...}
 */
async function fetchKafkaMessages(): Promise<KafkaMessage[]> {
  const res = await fetch(KAFKA_SSE, {
    headers: { Accept: "text/event-stream" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Kafka UI error: ${res.status}`);

  const text = await res.text();
  const messages: KafkaMessage[] = [];

  for (const line of text.split("\n")) {
    if (!line.startsWith("data:")) continue;
    try {
      const parsed = JSON.parse(line.slice(5)) as {
        type: string;
        message?: KafkaMessage;
      };
      if (parsed.type === "MESSAGE" && parsed.message) {
        messages.push(parsed.message);
      }
    } catch {
      // Non-JSON line, skip
    }
  }

  return messages;
}

/**
 * Poll Kafka for an OTP message to the given email.
 * Retries every 1.5s up to maxAttempts times.
 */
async function fetchOtpFromKafka(
  email: string,
  maxAttempts = 20,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const messages = await fetchKafkaMessages();

    // Search newest-first for this email's OTP_VERIFICATION event
    for (const msg of [...messages].reverse()) {
      if (msg.key?.toLowerCase() !== email.toLowerCase()) continue;
      try {
        const event = JSON.parse(msg.content) as NotificationEvent;
        if (event.templateType === "OTP_VERIFICATION" && event.metadata?.otp) {
          return event.metadata.otp;
        }
      } catch {
        // malformed content, skip
      }
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw new Error(
    `OTP for ${email} not found in Kafka after ${maxAttempts * 1.5}s`,
  );
}

// ── Connectivity ───────────────────────────────────────────────────────────

let backendOk = false;
let kafkaOk = false;

beforeAll(async () => {
  try {
    const r = await fetch(`${API_BASE}/actuator/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    backendOk = r.ok;
  } catch {
    /* unavailable */
  }

  try {
    await fetchKafkaMessages(); // lightweight connectivity test
    kafkaOk = true;
  } catch {
    /* unavailable */
  }

  if (!backendOk)
    console.warn("[kafka-otp] ⚠ Backend not available — tests will skip");
  if (!kafkaOk)
    console.warn("[kafka-otp] ⚠ Kafka UI not available — tests will skip");
}, 20_000);

// ── Tests ──────────────────────────────────────────────────────────────────

describe("[API] Candidate Registration → OTP → ACTIVE", () => {
  it("registers a candidate and verifies OTP from Kafka", async () => {
    if (!backendOk || !kafkaOk)
      return console.warn("Skipping — infra not available");

    const email = testEmail("candidate");
    const phone = `092${String(Date.now()).slice(-7)}`;
    await callApi("/auth/register", {
      email,
      password: "TestPass1",
      fullName: "Test Candidate",
      phoneNumber: phone,
      role: "CANDIDATE",
    });

    const otp = await fetchOtpFromKafka(email);
    expect(otp).toMatch(/^\d{6}$/);
    console.log(`[candidate] OTP: ${otp}`);

    const verifyRes = await callApi<{ status: number; message: string }>(
      "/auth/verify-otp",
      { email, otp },
    );
    console.log(
      `[candidate] verify response: ${verifyRes.status} — ${verifyRes.message}`,
    );
    // CANDIDATE: 200 + message "Account verified"
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.message).toMatch(/verified/i);
  }, 60_000);
});

describe("[API] HR_MANAGER Registration → OTP → WAIT_APPROVED", () => {
  it("registers an HR Manager and verifies OTP from Kafka", async () => {
    if (!backendOk || !kafkaOk)
      return console.warn("Skipping — infra not available");

    const email = testEmail("hrm");
    const ts = Date.now();

    await callApi("/auth/register", {
      email,
      password: "TestPass1",
      fullName: "Test HR Manager",
      phoneNumber: `090${String(ts).slice(-7)}`,
      role: "HR_MANAGER",
      hrProfile: {
        department: "HR",
        hrManagerEmail: email,
        address: "456 Corp Ave",
      },
      company: {
        name: `TestCo ${ts}`,
        address: "456 Corp Ave",
        companyNo: `TAX${ts}`, // required: company tax ID
        size: "10-50",
      },
    });

    const otp = await fetchOtpFromKafka(email);
    expect(otp).toMatch(/^\d{6}$/);
    console.log(`[hr-manager] OTP: ${otp}`);

    const verifyRes = await callApi<{ status: number; message: string }>(
      "/auth/verify-otp",
      { email, otp },
    );
    console.log(
      `[hr-manager] verify response: ${verifyRes.status} — ${verifyRes.message}`,
    );
    // HR_MANAGER: 200 + message about pending approval
    expect(verifyRes.status).toBe(200);
  }, 60_000);
});

describe("[API] HR Registration → OTP → WAIT_APPROVED (needs HR_MANAGER to exist)", () => {
  it("registers HR Manager first, then HR staff and verifies both OTPs", async () => {
    if (!backendOk || !kafkaOk)
      return console.warn("Skipping — infra not available");

    const ts = Date.now();
    const managerEmail = `test-mgr-${ts}@workfitai.test`;
    const hrEmail = `test-hr-${ts}@workfitai.test`;
    // Use last 8 digits of timestamp to create unique 10-digit phone numbers
    const tsShort = String(ts).slice(-7);
    const managerPhone = `090${tsShort}`;
    const hrPhone = `091${tsShort}`;

    // Step 1: Register & verify HR Manager (creates the manager account)
    await callApi("/auth/register", {
      email: managerEmail,
      password: "TestPass1",
      fullName: "Test Manager",
      phoneNumber: managerPhone,
      role: "HR_MANAGER",
      hrProfile: {
        department: "HR",
        hrManagerEmail: managerEmail,
        address: "1 Corp St",
      },
      company: {
        name: `TestCo2 ${ts}`,
        address: "1 Corp St",
        companyNo: `TAX2-${ts}`,
        size: "10-50",
      },
    });
    const managerOtp = await fetchOtpFromKafka(managerEmail);
    await callApi("/auth/verify-otp", { email: managerEmail, otp: managerOtp });
    console.log(`[hr] manager ${managerEmail} verified (OTP: ${managerOtp})`);

    // Step 2: Register HR staff referencing the manager's email
    await callApi("/auth/register", {
      email: hrEmail,
      password: "TestPass1",
      fullName: "Test HR Staff",
      phoneNumber: hrPhone,
      role: "HR",
      hrProfile: {
        department: "Engineering",
        hrManagerEmail: managerEmail, // must be an existing WAIT_APPROVED HR Manager
        address: "2 Office Lane",
      },
    });

    const hrOtp = await fetchOtpFromKafka(hrEmail);
    expect(hrOtp).toMatch(/^\d{6}$/);
    console.log(`[hr] OTP: ${hrOtp}`);

    const verifyRes = await callApi<{ status: number; message: string }>(
      "/auth/verify-otp",
      { email: hrEmail, otp: hrOtp },
    );
    console.log(
      `[hr] verify response: ${verifyRes.status} — ${verifyRes.message}`,
    );
    // HR: 200 + message about pending approval
    expect(verifyRes.status).toBe(200);
  }, 120_000);
});

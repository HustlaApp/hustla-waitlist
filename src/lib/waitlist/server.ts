import { NextResponse } from "next/server";
import type { FeedbackStatus, UserType } from "./shared";

const DEFAULT_WAITLIST_API_URL = "https://backside.hustla.live/api/v1/waitlist";
const REQUEST_TIMEOUT_MS = 10_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;
const MAX_BODY_BYTES = 8_192;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type WaitlistBody = {
  userType: UserType;
  name: string;
  email: string;
  userAgent: string;
  referrer: string;
  website: string;
};

type ParsedWaitlistBody =
  | { ok: true; data: WaitlistBody }
  | {
      ok: false;
      status: number;
      message: string;
      honeypot?: boolean;
    };

const rateLimitStore = new Map<string, RateLimitEntry>();

export function jsonResponse(
  body: unknown,
  init?: ResponseInit,
): NextResponse<unknown> {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("X-Content-Type-Options", "nosniff");

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export function getWaitlistApiUrl(): string {
  return process.env.WAITLIST_API_URL ?? DEFAULT_WAITLIST_API_URL;
}

export function getRequestTimeoutMs(): number {
  return REQUEST_TIMEOUT_MS;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  return (
    forwardedFor.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function isJsonRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.toLowerCase().includes("application/json");
}

export function isBodySizeAllowed(request: Request): boolean {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) {
    return true;
  }

  const parsedLength = Number(contentLength);
  return Number.isFinite(parsedLength) && parsedLength <= MAX_BODY_BYTES;
}

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  const requestOrigin = normalizeOrigin(origin);
  if (!requestOrigin) {
    return false;
  }

  const host = request.headers.get("host");
  const hostOrigins = host ? [`https://${host}`, `http://${host}`] : [];
  const configuredOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
  ]
    .map(normalizeOrigin)
    .filter((value): value is string => Boolean(value));

  const allowedOrigins = new Set(
    [...hostOrigins, ...configuredOrigins]
      .map((value) => normalizeOrigin(value))
      .filter((value): value is string => Boolean(value)),
  );

  return allowedOrigins.has(requestOrigin);
}

export function checkRateLimit(key: string) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return { allowed: true, retryAfter: 0 };
}

export function parseWaitlistBody(body: unknown): ParsedWaitlistBody {
  if (!body || typeof body !== "object") {
    return {
      ok: false,
      status: 400,
      message: "Invalid request payload.",
    };
  }

  const record = body as Record<string, unknown>;
  const userType = record.userType;

  if (userType !== "customer" && userType !== "provider") {
    return {
      ok: false,
      status: 400,
      message: "Please choose a valid user type.",
    };
  }

  const name = normalizeText(record.name, 120);
  const email = normalizeText(record.email, 254).toLowerCase();
  const userAgent = normalizeText(record.userAgent, 512);
  const referrer = normalizeText(record.referrer, 1024);
  const website = normalizeText(record.website, 120);

  if (website) {
    return {
      ok: false,
      status: 200,
      message: "Waitlist submitted successfully.",
      honeypot: true,
    };
  }

  if (name.length < 2) {
    return {
      ok: false,
      status: 400,
      message: "Please enter your full name.",
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      ok: false,
      status: 400,
      message: "Please enter a valid email address.",
    };
  }

  return {
    ok: true,
    data: {
      userType,
      name,
      email,
      userAgent,
      referrer,
      website,
    },
  };
}

export function createFeedback(
  status: FeedbackStatus,
  title: string,
  message: string,
) {
  return { status, title, message };
}

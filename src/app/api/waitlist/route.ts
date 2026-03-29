import {
  checkRateLimit,
  getClientIp,
  getRequestTimeoutMs,
  getWaitlistApiUrl,
  isAllowedOrigin,
  isBodySizeAllowed,
  isJsonRequest,
  jsonResponse,
  parseWaitlistBody,
} from "../../../lib/waitlist/server";

export async function POST(request: Request) {
  try {
    const waitlistApiUrl = getWaitlistApiUrl();
    if (!waitlistApiUrl) {
      return jsonResponse(
        { message: "Waitlist service is not configured." },
        { status: 500 },
      );
    }

    if (!isAllowedOrigin(request)) {
      return jsonResponse({ message: "Invalid origin." }, { status: 403 });
    }

    if (!isJsonRequest(request)) {
      return jsonResponse(
        { message: "Content-Type must be application/json." },
        { status: 415 },
      );
    }

    if (!isBodySizeAllowed(request)) {
      return jsonResponse(
        { message: "Request payload is too large." },
        { status: 413 },
      );
    }

    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return jsonResponse(
        { message: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          },
        },
      );
    }

    const body = await request.json();
    const parsedRequest = parseWaitlistBody(body);

    if (!parsedRequest.ok) {
      return jsonResponse(
        { message: parsedRequest.message },
        { status: parsedRequest.status },
      );
    }

    const payload = {
      userType: parsedRequest.data.userType,
      name: parsedRequest.data.name,
      email: parsedRequest.data.email,
      ip,
      userAgent: parsedRequest.data.userAgent,
      referrer: parsedRequest.data.referrer,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), getRequestTimeoutMs());

    const response = await fetch(waitlistApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const rawText = await response.text();
    let parsedResponseBody: unknown = null;

    try {
      parsedResponseBody = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsedResponseBody = { message: rawText };
    }

    if (!response.ok) {
      return jsonResponse(
        parsedResponseBody ?? { message: "Waitlist submission failed." },
        { status: response.status },
      );
    }

    return jsonResponse(
      parsedResponseBody ?? { message: "Waitlist submitted successfully." },
      { status: response.status },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return jsonResponse(
        { message: "Waitlist service timed out. Please try again." },
        { status: 504 },
      );
    }

    return jsonResponse(
      { message: "Unable to submit waitlist right now." },
      { status: 500 },
    );
  }
}

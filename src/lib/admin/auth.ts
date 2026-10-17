import crypto from "crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/validation/env";

export const ADMIN_COOKIE_NAME = "navrang_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Constant-time password check to prevent timing attacks.
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const target = env.ADMIN_PASSWORD.trim();
  const candidate = password.trim();

  const bufTarget = Buffer.from(target, "utf8");
  const bufCandidate = Buffer.from(candidate, "utf8");

  if (bufTarget.length !== bufCandidate.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufTarget, bufCandidate);
}

/**
 * Create a cryptographically signed HMAC token for the admin session.
 */
export function createAdminSessionToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin:navrang:${expiresAt}`;
  const hmac = crypto
    .createHmac("sha256", env.ADMIN_SESSION_SECRET)
    .update(payload)
    .digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${hmac}`;
}

/**
 * Verify HMAC signature and expiry of admin session token.
 */
export function verifyAdminSessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, receivedHmac] = parts;
  try {
    const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const [role, brand, expStr] = payload.split(":");

    if (role !== "admin" || brand !== "navrang") return false;

    const expiresAt = parseInt(expStr, 10);
    if (isNaN(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
      return false;
    }

    const expectedHmac = crypto
      .createHmac("sha256", env.ADMIN_SESSION_SECRET)
      .update(payload)
      .digest("hex");

    const bufExpected = Buffer.from(expectedHmac, "utf8");
    const bufReceived = Buffer.from(receivedHmac, "utf8");

    if (bufExpected.length !== bufReceived.length) return false;
    return crypto.timingSafeEqual(bufExpected, bufReceived);
  } catch {
    return false;
  }
}

/**
 * Check whether current request has valid admin authorization.
 * Checks Cookie: navrang_admin_session and Authorization: Bearer <token>
 */
export function isRequestAuthorized(req: Request): boolean {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (verifyAdminSessionToken(token)) return true;
  }

  // 2. Check Cookie header
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
  if (match && match[1]) {
    const token = decodeURIComponent(match[1]);
    if (verifyAdminSessionToken(token)) return true;
  }

  return false;
}

/**
 * Check admin session in Server Components using next/headers.
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminSessionToken(token);
  } catch {
    return false;
  }
}

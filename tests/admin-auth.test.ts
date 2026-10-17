import { describe, it, expect } from "vitest";
import {
  verifyAdminPassword,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";

describe("Admin Authentication & Security Suite", () => {
  it("verifies the default admin passphrase correctly", () => {
    expect(verifyAdminPassword("navrang@admin2026")).toBe(true);
    expect(verifyAdminPassword("wrong-passphrase")).toBe(false);
    expect(verifyAdminPassword("")).toBe(false);
  });

  it("generates a valid signed HMAC session token", () => {
    const token = createAdminSessionToken();
    expect(typeof token).toBe("string");
    expect(token).toContain(".");

    const isValid = verifyAdminSessionToken(token);
    expect(isValid).toBe(true);
  });

  it("rejects tampered tokens", () => {
    const token = createAdminSessionToken();
    const tampered = token.slice(0, -4) + "abcd";
    expect(verifyAdminSessionToken(tampered)).toBe(false);
  });

  it("rejects malformed tokens", () => {
    expect(verifyAdminSessionToken("not-a-token")).toBe(false);
    expect(verifyAdminSessionToken("")).toBe(false);
    expect(verifyAdminSessionToken(null)).toBe(false);
    expect(verifyAdminSessionToken(undefined)).toBe(false);
  });
});

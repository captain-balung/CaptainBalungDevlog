import { createHash, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "captain_admin_session";

function hashPassword(password: string): string {
  return createHash("sha256").update(password, "utf8").digest("hex");
}

export function getExpectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return hashPassword(pw);
}

export function verifySession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const expected = getExpectedToken();
  if (!expected) return false;
  if (cookieValue.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(cookieValue, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  } catch {
    return false;
  }
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (password.length !== expected.length) return false;
  return timingSafeEqual(
    Buffer.from(password, "utf8"),
    Buffer.from(expected, "utf8"),
  );
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

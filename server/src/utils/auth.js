import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";
const MIN_SECRET_LENGTH = 32;

const DEV_ACCESS_SECRET = "veergatha-dev-access-secret-not-for-production";
const DEV_REFRESH_SECRET = "veergatha-dev-refresh-secret-not-for-production";

/**
 * Resolve a signing secret, or refuse to start.
 *
 * Falling back to a hardcoded string is fine locally and catastrophic in
 * production: the value is in the public repo, so anyone could mint a valid
 * admin token. Outside development the process exits rather than booting into
 * that state — a deploy that fails loudly beats one that silently accepts
 * forged credentials.
 */
function resolveSecret(name, devFallback) {
  const value = process.env[name];
  const isProduction = process.env.NODE_ENV === "production";

  if (value && value.length >= MIN_SECRET_LENGTH) return value;

  if (isProduction) {
    const reason = value
      ? `${name} is shorter than ${MIN_SECRET_LENGTH} characters`
      : `${name} is not set`;
    console.error(
      `\n  FATAL  ${reason}.\n` +
        `  Generate one with:\n` +
        `    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"\n`
    );
    process.exit(1);
  }

  if (value) {
    console.warn(`[auth] ${name} is under ${MIN_SECRET_LENGTH} chars — fine locally, fatal in production`);
    return value;
  }

  console.warn(`[auth] ${name} not set — using the development secret. Never deploy this.`);
  return devFallback;
}

const ACCESS_SECRET = resolveSecret("JWT_ACCESS_SECRET", DEV_ACCESS_SECRET);
const REFRESH_SECRET = resolveSecret("JWT_REFRESH_SECRET", DEV_REFRESH_SECRET);

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), tokenVersion: user.tokenVersion ?? 0 },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
}

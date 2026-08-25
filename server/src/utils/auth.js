import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "veergatha-dev-access-secret-change-in-prod";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "veergatha-dev-refresh-secret-change-in-prod";

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      tokenVersion: user.tokenVersion ?? 0,
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token");
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
}

import { User } from "../models/index.js";
import { verifyAccessToken } from "../utils/auth.js";
import { ApiError } from "../utils/ApiError.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication token required");
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyAccessToken(token);

  const user = await User.findById(payload.sub).select("+tokenVersion +lockedUntil");
  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  if (user.isLocked()) {
    throw new ApiError(423, "Account is temporarily locked due to failed login attempts");
  }

  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }
  next();
}

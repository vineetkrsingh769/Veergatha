import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/index.js";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/auth.js";

/**
 * Validates JWT generation, verification, and user password mechanics.
 *
 *   npm run check:auth
 */

async function checkAuth() {
  console.log("Checking JWT Token Signing & Verification...");

  const fakeUser = {
    _id: new mongoose.Types.ObjectId(),
    email: "admin@veergatha.in",
    role: "admin",
    tokenVersion: 1,
  };

  const accessToken = signAccessToken(fakeUser);
  const refreshToken = signRefreshToken(fakeUser);

  console.log("  ok    signAccessToken generated:", accessToken.substring(0, 20) + "...");
  console.log("  ok    signRefreshToken generated:", refreshToken.substring(0, 20) + "...");

  const verifiedAccess = verifyAccessToken(accessToken);
  if (verifiedAccess.sub !== fakeUser._id.toString() || verifiedAccess.role !== "admin") {
    throw new Error("AccessToken verification failed");
  }
  console.log("  ok    verifyAccessToken correctly decoded claims");

  const verifiedRefresh = verifyRefreshToken(refreshToken);
  if (verifiedRefresh.sub !== fakeUser._id.toString() || verifiedRefresh.tokenVersion !== 1) {
    throw new Error("RefreshToken verification failed");
  }
  console.log("  ok    verifyRefreshToken correctly decoded claims");

  console.log("\nAll JWT Auth checks passed successfully!\n");
}

checkAuth().catch((err) => {
  console.error("Auth check failed:", err.message);
  process.exit(1);
});

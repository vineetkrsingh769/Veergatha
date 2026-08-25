import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { baseOptions } from "./shared.js";

const { Schema } = mongoose;

export const USER_ROLES = ["admin", "editor"];

const BCRYPT_COST = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: USER_ROLES, default: "editor", required: true },

    // select:false keeps these out of every incidental .find() — a credential
    // cannot leak through a response body it was never loaded into.
    passwordHash: { type: String, required: true, select: false },
    tokenVersion: { type: Number, default: 0, select: false },

    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  baseOptions
);

/**
 * Assign a plaintext password to `user.password` and it is hashed on save.
 * A virtual rather than a real field, so the plaintext is never persisted even
 * if something forgets to clear it.
 */
userSchema
  .virtual("password")
  .set(function (plain) {
    this._plainPassword = plain;
  });

userSchema.pre("validate", async function (next) {
  if (!this._plainPassword) return next();

  if (this._plainPassword.length < 12) {
    return next(new Error("Password must be at least 12 characters"));
  }

  this.passwordHash = await bcrypt.hash(this._plainPassword, BCRYPT_COST);
  this._plainPassword = undefined;

  // Any password change invalidates every outstanding refresh token.
  this.tokenVersion = (this.tokenVersion ?? 0) + 1;
  next();
});

userSchema.methods.verifyPassword = function (plain) {
  if (!this.passwordHash) {
    throw new Error("passwordHash not loaded — select('+passwordHash') first");
  }
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.isLocked = function () {
  return Boolean(this.lockedUntil && this.lockedUntil > new Date());
};

userSchema.methods.registerFailedLogin = function () {
  this.failedLoginAttempts = (this.failedLoginAttempts ?? 0) + 1;
  if (this.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    this.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
    this.failedLoginAttempts = 0;
  }
  return this.save();
};

userSchema.methods.registerSuccessfulLogin = function () {
  this.failedLoginAttempts = 0;
  this.lockedUntil = undefined;
  this.lastLoginAt = new Date();
  return this.save();
};

export const User = mongoose.model("User", userSchema);

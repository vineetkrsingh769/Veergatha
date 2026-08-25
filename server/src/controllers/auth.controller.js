import { User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/auth.js";

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+passwordHash +tokenVersion +failedLoginAttempts +lockedUntil"
  );

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isLocked()) {
    throw new ApiError(423, "Account is temporarily locked. Try again later.");
  }

  const isValid = await user.verifyPassword(password);
  if (!isValid) {
    await user.registerFailedLogin();
    throw new ApiError(401, "Invalid credentials");
  }

  await user.registerSuccessfulLogin();

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  });
}

export async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token required");
  }

  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub).select("+tokenVersion");

  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw new ApiError(401, "Refresh token revoked or invalid");
  }

  const accessToken = signAccessToken(user);
  res.json({ accessToken });
}

export async function getMe(req, res) {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    },
  });
}

/** Seed an initial admin account if no user exists. */
export async function seedAdmin(req, res) {
  const count = await User.countDocuments();
  if (count > 0) {
    throw new ApiError(400, "Admin account already exists. Use standard login.");
  }

  const { email, name, password } = req.body;
  if (!email || !password || !name) {
    throw new ApiError(400, "email, name, and password are required");
  }

  const user = new User({
    email: email.toLowerCase().trim(),
    name,
    role: "admin",
    password,
  });

  await user.save();

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.status(201).json({
    message: "Admin account created successfully",
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  });
}

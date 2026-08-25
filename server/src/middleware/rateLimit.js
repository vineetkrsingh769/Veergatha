import rateLimit from "express-rate-limit";

const json = (message) => (req, res) => res.status(429).json({ error: message });

/**
 * Per-IP throttle on credential endpoints.
 *
 * The User model already locks an account after 5 failed attempts, but that is
 * per-account: it does nothing against someone spraying one common password
 * across many addresses, and an attacker can lock out legitimate users with it.
 * This bounds the attempts themselves.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Successful sign-ins shouldn't count, or a busy editor locks themselves out.
  skipSuccessfulRequests: true,
  handler: json("Too many sign-in attempts. Try again in a few minutes."),
});

/** Refresh is called on a timer by legitimate clients, so the ceiling is higher. */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: json("Too many token refreshes. Try again shortly."),
});

/** Bootstrap endpoint — should realistically be hit once, ever. */
export const seedLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: json("Too many attempts."),
});

/** Broad ceiling for public reads, generous enough not to affect real browsing. */
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: json("Too many requests. Slow down."),
});

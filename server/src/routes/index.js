import { Router } from "express";
import { asyncHandler as a } from "../middleware/asyncHandler.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { handleUpload } from "../middleware/upload.js";
import {
  loginLimiter,
  refreshLimiter,
  seedLimiter,
  publicLimiter,
} from "../middleware/rateLimit.js";

import { listMartyrs, getMartyr } from "../controllers/martyrs.controller.js";
import {
  listMemorials,
  listMemorialsNear,
  getMemorial,
} from "../controllers/memorials.controller.js";
import { listWars, getWar } from "../controllers/wars.controller.js";
import { search } from "../controllers/search.controller.js";
import { getFilters, getStats } from "../controllers/meta.controller.js";
import {
  listMedia,
  listMediaAdmin,
  uploadMedia,
  updateMedia,
  deleteMedia,
} from "../controllers/media.controller.js";
import {
  login,
  refresh,
  getMe,
  seedAdmin,
  changePassword,
} from "../controllers/auth.controller.js";

import {
  listMartyrsAdmin,
  createMartyr,
  updateMartyr,
  deleteMartyr,
  listMemorialsAdmin,
  createMemorial,
  updateMemorial,
  deleteMemorial,
  listWarsAdmin,
  createWar,
  updateWar,
  deleteWar,
} from "../controllers/admin.controller.js";

import {
  martyrCreateSchema,
  martyrUpdateSchema,
  memorialCreateSchema,
  memorialUpdateSchema,
  warCreateSchema,
  warUpdateSchema,
  loginSchema,
  refreshSchema,
  seedAdminSchema,
  changePasswordSchema,
} from "../schemas/index.js";

export const api = Router();

// --- PUBLIC ROUTES ---
api.use(publicLimiter);

api.get("/martyrs", a(listMartyrs));
api.get("/martyrs/:slug", a(getMartyr));

// Declared before /:slug, or "near" is read as a slug.
api.get("/memorials/near", a(listMemorialsNear));
api.get("/memorials", a(listMemorials));
api.get("/memorials/:slug", a(getMemorial));

api.get("/wars", a(listWars));
api.get("/wars/:slug", a(getWar));

api.get("/media", a(listMedia));

api.get("/search", a(search));
api.get("/filters", a(getFilters));
api.get("/stats", a(getStats));

// --- AUTH ROUTES ---
api.post("/auth/login", loginLimiter, validateBody(loginSchema), a(login));
api.post("/auth/refresh", refreshLimiter, validateBody(refreshSchema), a(refresh));
api.post("/auth/seed-admin", seedLimiter, validateBody(seedAdminSchema), a(seedAdmin));
api.get("/auth/me", a(requireAuth), a(getMe));
// Shares the login limiter: guessing the current password here is the same
// attack as guessing it at the sign-in form.
api.post(
  "/auth/change-password",
  loginLimiter,
  a(requireAuth),
  validateBody(changePasswordSchema),
  a(changePassword)
);

// --- ADMIN ROUTES (requireAuth + requireAdmin) ---
const admin = Router();
admin.use(a(requireAuth), requireAdmin);

admin.get("/martyrs", a(listMartyrsAdmin));
admin.post("/martyrs", validateBody(martyrCreateSchema), a(createMartyr));
admin.put("/martyrs/:id", validateBody(martyrUpdateSchema), a(updateMartyr));
admin.delete("/martyrs/:id", a(deleteMartyr));

admin.get("/memorials", a(listMemorialsAdmin));
admin.post("/memorials", validateBody(memorialCreateSchema), a(createMemorial));
admin.put("/memorials/:id", validateBody(memorialUpdateSchema), a(updateMemorial));
admin.delete("/memorials/:id", a(deleteMemorial));

// Upload is multipart, so the body is parsed by multer rather than validateBody;
// the controller enforces the licence and credit rules before anything is stored.
admin.get("/media", a(listMediaAdmin));
admin.post("/media", handleUpload, a(uploadMedia));
admin.put("/media/:id", a(updateMedia));
admin.delete("/media/:id", a(deleteMedia));

admin.get("/wars", a(listWarsAdmin));
admin.post("/wars", validateBody(warCreateSchema), a(createWar));
admin.put("/wars/:id", validateBody(warUpdateSchema), a(updateWar));
admin.delete("/wars/:id", a(deleteWar));

api.use("/admin", admin);

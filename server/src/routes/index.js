import { Router } from "express";
import { asyncHandler as a } from "../middleware/asyncHandler.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
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
import { login, refresh, getMe, seedAdmin } from "../controllers/auth.controller.js";

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

api.get("/search", a(search));
api.get("/filters", a(getFilters));
api.get("/stats", a(getStats));

// --- AUTH ROUTES ---
api.post("/auth/login", loginLimiter, validateBody(loginSchema), a(login));
api.post("/auth/refresh", refreshLimiter, validateBody(refreshSchema), a(refresh));
api.post("/auth/seed-admin", seedLimiter, validateBody(seedAdminSchema), a(seedAdmin));
api.get("/auth/me", a(requireAuth), a(getMe));

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

admin.get("/wars", a(listWarsAdmin));
admin.post("/wars", validateBody(warCreateSchema), a(createWar));
admin.put("/wars/:id", validateBody(warUpdateSchema), a(updateWar));
admin.delete("/wars/:id", a(deleteWar));

api.use("/admin", admin);

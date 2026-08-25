import { z } from "zod";
import { SERVICE_BRANCHES, AWARD_NAMES, MARTYR_STATUS } from "../models/Martyr.js";
import { MEDIA_LICENSES, MEDIA_KINDS } from "../models/Media.js";
import { WAR_TYPES } from "../models/War.js";
import { VERIFICATION_STATUS, SOURCE_TIERS } from "../models/shared.js";

/**
 * Request shapes for the admin write routes. Enums are imported from the models
 * rather than restated, so the two cannot drift apart.
 *
 * These deliberately do NOT re-implement the model's cross-field rules — that a
 * 'survived' record cannot carry a death date, that verifying requires a primary
 * source. Those stay in the schema layer where seeds and scripts hit them too.
 * This layer exists to reject malformed input and strip unknown keys.
 */

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "must be a MongoDB ObjectId");
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be lowercase words separated by hyphens");

const nonEmpty = (label) => z.string().trim().min(1, `${label} is required`);
const optionalText = z.string().trim().optional();
const isoDate = z.union([z.iso.datetime(), z.iso.date()]).optional();

const source = z.object({
  field: nonEmpty("field"),
  title: nonEmpty("title"),
  publisher: optionalText,
  url: z.url().optional(),
  accessedAt: isoDate,
  tier: z.enum(SOURCE_TIERS),
});

const verification = z.object({
  status: z.enum(VERIFICATION_STATUS),
  notes: optionalText,
});

const award = z.object({
  name: z.enum(AWARD_NAMES),
  year: z.number().int().min(1947).max(2100).optional(),
  posthumous: z.boolean().optional(),
  citation: optionalText,
  gazetteRef: optionalText,
});

export const martyrCreateSchema = z.object({
  slug,
  fullName: nonEmpty("fullName"),
  rank: optionalText,
  serviceNumber: optionalText,
  serviceBranch: z.enum(SERVICE_BRANCHES),
  regiment: optionalText,
  unit: optionalText,
  dateOfBirth: isoDate,
  status: z.enum(MARTYR_STATUS),
  dateOfMartyrdom: isoDate,
  placeOfBirth: z
    .object({ village: optionalText, district: optionalText, state: optionalText })
    .optional(),
  war: objectId.optional(),
  operation: optionalText,
  memorials: z.array(objectId).optional(),
  awards: z.array(award).optional(),
  biography: optionalText,
  portrait: objectId.optional(),
  gallery: z.array(objectId).optional(),
  sources: z.array(source).optional(),
  verification: verification.optional(),
});

/** Updates are partial, but slug still has to be a slug when present. */
export const martyrUpdateSchema = martyrCreateSchema.partial();

const coordinates = z
  .object({
    type: z.literal("Point").optional(),
    coordinates: z.tuple([
      z.number().min(-180).max(180),
      z.number().min(-90).max(90),
    ]),
  })
  .optional();

export const memorialCreateSchema = z.object({
  slug,
  name: nonEmpty("name"),
  location: z
    .object({
      city: optionalText,
      district: optionalText,
      state: optionalText,
      coordinates,
    })
    .optional(),
  inauguratedYear: z.number().int().min(1800).max(2100).optional(),
  managedBy: optionalText,
  description: optionalText,
  heroImage: objectId.optional(),
  gallery: z.array(objectId).optional(),
  sources: z.array(source).optional(),
  verification: verification.optional(),
});

export const memorialUpdateSchema = memorialCreateSchema.partial();

export const warCreateSchema = z.object({
  slug,
  name: nonEmpty("name"),
  type: z.enum(WAR_TYPES),
  startDate: isoDate,
  endDate: isoDate,
  summary: z.string().trim().max(400).optional(),
  description: optionalText,
  heroImage: objectId.optional(),
  sources: z.array(source).optional(),
  verification: verification.optional(),
});

export const warUpdateSchema = warCreateSchema.partial();

export const mediaCreateSchema = z.object({
  kind: z.enum(MEDIA_KINDS),
  title: optionalText,
  description: optionalText,
  credit: optionalText,
  license: z.enum(MEDIA_LICENSES),
  sourceUrl: z.url().optional(),
  linkedTo: z
    .object({
      martyr: objectId.optional(),
      memorial: objectId.optional(),
      war: objectId.optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.email("must be a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "password is required"),
});

export const refreshSchema = z.object({
  refreshToken: nonEmpty("refreshToken"),
});

export const seedAdminSchema = z.object({
  email: z.email("must be a valid email address").trim().toLowerCase(),
  name: nonEmpty("name"),
  password: z.string().min(12, "password must be at least 12 characters"),
});

import mongoose from "mongoose";

const { Schema } = mongoose;

export const VERIFICATION_STATUS = ["draft", "in-review", "verified"];
export const SOURCE_TIERS = ["primary", "secondary"];

/**
 * Per-field provenance. `field` names the specific claim this source backs, so
 * the record can answer "where did this date of birth come from?" rather than
 * only "what did we read?".
 */
export const sourceSchema = new Schema(
  {
    field: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    publisher: { type: String, trim: true },
    url: { type: String, trim: true },
    accessedAt: { type: Date, default: Date.now },
    tier: { type: String, enum: SOURCE_TIERS, required: true },
  },
  { _id: false }
);

export const verificationSchema = new Schema(
  {
    status: { type: String, enum: VERIFICATION_STATUS, default: "draft", index: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * A record cannot be published without at least one primary source. Enforcing
 * this in the schema means no controller, seed script or admin form can bypass
 * the project's core content rule by forgetting a check.
 */
export function requirePrimarySourceWhenVerified(doc) {
  if (doc.verification?.status !== "verified") return;

  const hasPrimary = (doc.sources ?? []).some((s) => s.tier === "primary");
  if (!hasPrimary) {
    throw new Error(
      "Cannot verify a record with no primary source — see docs/SOURCING.md"
    );
  }
}

/** Slug shape shared by every public-facing collection. */
export const slugField = {
  type: String,
  required: true,
  unique: true,
  trim: true,
  lowercase: true,
  match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens"],
};

/** Expose `id`, hide `_id`/`__v`, so API responses are clean without mapping. */
export const baseOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
  toObject: { virtuals: true },
};

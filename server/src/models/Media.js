import mongoose from "mongoose";
import { baseOptions, verificationSchema } from "./shared.js";

const { Schema } = mongoose;

export const MEDIA_KINDS = ["photo", "document", "video"];

/**
 * `unverified` is the default on purpose. An image whose licence nobody checked
 * must not be publishable, and making the permissive state the one you have to
 * opt into is what enforces that.
 */
export const MEDIA_LICENSES = [
  "GODL-India",
  "CC-BY",
  "CC-BY-SA",
  "public-domain",
  "permission-granted",
  "unverified",
];

export const PUBLISHABLE_LICENSES = MEDIA_LICENSES.filter((l) => l !== "unverified");

const mediaSchema = new Schema(
  {
    kind: { type: String, enum: MEDIA_KINDS, required: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },

    cloudinary: {
      publicId: { type: String, required: true, trim: true },
      secureUrl: { type: String, required: true, trim: true },
      width: Number,
      height: Number,
      format: String,
      bytes: Number,
    },

    credit: { type: String, trim: true },
    license: { type: String, enum: MEDIA_LICENSES, default: "unverified", required: true },
    sourceUrl: { type: String, trim: true },

    linkedTo: {
      martyr: { type: Schema.Types.ObjectId, ref: "Martyr", index: true, sparse: true },
      memorial: { type: Schema.Types.ObjectId, ref: "Memorial", index: true, sparse: true },
      war: { type: Schema.Types.ObjectId, ref: "War", index: true, sparse: true },
    },

    verification: { type: verificationSchema, default: () => ({}) },
  },
  baseOptions
);

mediaSchema.pre("validate", function (next) {
  if (this.verification?.status === "verified" && this.license === "unverified") {
    return next(new Error("Cannot verify media whose licence is still 'unverified'"));
  }

  // Attribution is a condition of GODL-India and the CC licences. Reconstructing
  // a credit weeks after upload is how wrong attributions get published.
  const needsCredit = ["GODL-India", "CC-BY", "CC-BY-SA"];
  if (needsCredit.includes(this.license) && !this.credit?.trim()) {
    return next(new Error(`Licence ${this.license} requires a credit string`));
  }

  next();
});

export const Media = mongoose.model("Media", mediaSchema);

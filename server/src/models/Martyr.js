import mongoose from "mongoose";
import {
  baseOptions,
  slugField,
  sourceSchema,
  verificationSchema,
  requirePrimarySourceWhenVerified,
} from "./shared.js";

const { Schema } = mongoose;

export const SERVICE_BRANCHES = [
  "Army",
  "Navy",
  "Air Force",
  "BSF",
  "CRPF",
  "Assam Rifles",
  "ITBP",
  "Other",
];

export const AWARD_NAMES = [
  "Param Vir Chakra",
  "Maha Vir Chakra",
  "Vir Chakra",
  "Ashoka Chakra",
  "Kirti Chakra",
  "Shaurya Chakra",
  "Sena Medal",
  "Mention in Despatches",
  "Other",
];

/** Not every recipient died. See docs/SOURCING.md — this gates all UI copy. */
export const MARTYR_STATUS = ["fell-in-action", "survived"];

const awardSchema = new Schema(
  {
    name: { type: String, enum: AWARD_NAMES, required: true },
    year: { type: Number, min: 1947, max: 2100 },
    posthumous: { type: Boolean, default: false },
    citation: { type: String, trim: true },
    gazetteRef: { type: String, trim: true },
  },
  { _id: false }
);

const martyrSchema = new Schema(
  {
    slug: slugField,
    fullName: { type: String, required: true, trim: true },
    rank: { type: String, trim: true },
    serviceNumber: { type: String, trim: true },
    serviceBranch: { type: String, enum: SERVICE_BRANCHES, required: true },
    regiment: { type: String, trim: true, index: true },
    unit: { type: String, trim: true },

    dateOfBirth: { type: Date },

    status: { type: String, enum: MARTYR_STATUS, required: true, index: true },
    dateOfMartyrdom: {
      type: Date,
      index: true,
      required: [
        function () {
          return this.status === "fell-in-action";
        },
        "dateOfMartyrdom is required when status is 'fell-in-action'",
      ],
    },

    placeOfBirth: {
      village: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true, index: true },
    },

    war: { type: Schema.Types.ObjectId, ref: "War", index: true },
    operation: { type: String, trim: true },

    // Many-to-many, held on this side only: a person is named on a handful of
    // memorials, while the National War Memorial alone carries ~26,000 names.
    memorials: [{ type: Schema.Types.ObjectId, ref: "Memorial", index: true }],

    awards: [awardSchema],
    biography: { type: String, trim: true },

    portrait: { type: Schema.Types.ObjectId, ref: "Media" },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],

    sources: [sourceSchema],
    verification: { type: verificationSchema, default: () => ({}) },
  },
  baseOptions
);

martyrSchema.index(
  { fullName: "text", regiment: "text", operation: "text", biography: "text" },
  {
    name: "martyr_search",
    weights: { fullName: 10, regiment: 5, operation: 3, biography: 1 },
  }
);

martyrSchema.index({ war: 1, "verification.status": 1 });
martyrSchema.index({ "awards.name": 1 });

martyrSchema.virtual("yearOfMartyrdom").get(function () {
  return this.dateOfMartyrdom?.getUTCFullYear();
});

martyrSchema.pre("validate", function (next) {
  // The dangerous direction. A stray death date on someone who survived would
  // propagate into headings, meta descriptions and search results.
  if (this.status === "survived" && this.dateOfMartyrdom) {
    return next(new Error("A record with status 'survived' cannot have a dateOfMartyrdom"));
  }

  if (this.dateOfBirth && this.dateOfMartyrdom && this.dateOfMartyrdom < this.dateOfBirth) {
    return next(new Error("dateOfMartyrdom cannot be before dateOfBirth"));
  }

  if (this.status === "survived" && this.awards?.some((a) => a.posthumous)) {
    return next(new Error("A posthumous award is inconsistent with status 'survived'"));
  }

  try {
    requirePrimarySourceWhenVerified(this);
  } catch (err) {
    return next(err);
  }

  next();
});

export const Martyr = mongoose.model("Martyr", martyrSchema);

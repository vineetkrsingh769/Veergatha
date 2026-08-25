import mongoose from "mongoose";
import {
  baseOptions,
  slugField,
  sourceSchema,
  verificationSchema,
  requirePrimarySourceWhenVerified,
} from "./shared.js";

const { Schema } = mongoose;

/**
 * Real GeoJSON, not two loose floats — this is what makes $near and $geoWithin
 * work. Note the `type: { type: String }` nesting, which is how Mongoose is told
 * that "type" here is a field name rather than a type declaration.
 *
 * `default: undefined` on coordinates matters: a 2dsphere index tolerates the
 * field being absent but rejects an empty array, so memorials without confirmed
 * coordinates must omit it rather than store [].
 */
const pointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
      type: [Number],
      default: undefined,
      validate: {
        validator: (v) =>
          v === undefined ||
          (v.length === 2 &&
            v[0] >= -180 &&
            v[0] <= 180 &&
            v[1] >= -90 &&
            v[1] <= 90),
        message: "coordinates must be [longitude, latitude] within valid ranges",
      },
    },
  },
  { _id: false }
);

const memorialSchema = new Schema(
  {
    slug: slugField,
    name: { type: String, required: true, trim: true },
    location: {
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true, index: true },
      coordinates: { type: pointSchema, default: undefined },
    },
    inauguratedYear: { type: Number, min: 1800, max: 2100 },
    managedBy: { type: String, trim: true },
    description: { type: String, trim: true },
    heroImage: { type: Schema.Types.ObjectId, ref: "Media" },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    sources: [sourceSchema],
    verification: { type: verificationSchema, default: () => ({}) },
  },
  baseOptions
);

memorialSchema.index({ "location.coordinates": "2dsphere" });

memorialSchema.pre("validate", function (next) {
  try {
    requirePrimarySourceWhenVerified(this);
  } catch (err) {
    return next(err);
  }
  next();
});

export const Memorial = mongoose.model("Memorial", memorialSchema);

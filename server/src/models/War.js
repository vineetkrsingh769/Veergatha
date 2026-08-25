import mongoose from "mongoose";
import {
  baseOptions,
  slugField,
  sourceSchema,
  verificationSchema,
  requirePrimarySourceWhenVerified,
} from "./shared.js";

const { Schema } = mongoose;

export const WAR_TYPES = ["war", "operation", "counter-insurgency", "peacekeeping"];

const warSchema = new Schema(
  {
    slug: slugField,
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: WAR_TYPES, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    summary: { type: String, trim: true, maxlength: 400 },
    description: { type: String, trim: true },
    heroImage: { type: Schema.Types.ObjectId, ref: "Media" },
    sources: [sourceSchema],
    verification: { type: verificationSchema, default: () => ({}) },
  },
  baseOptions
);

warSchema.virtual("startYear").get(function () {
  return this.startDate?.getUTCFullYear();
});

warSchema.virtual("endYear").get(function () {
  return this.endDate?.getUTCFullYear();
});

warSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error("endDate cannot be before startDate"));
  }
  try {
    requirePrimarySourceWhenVerified(this);
  } catch (err) {
    return next(err);
  }
  next();
});

export const War = mongoose.model("War", warSchema);

import { ApiError } from "../utils/ApiError.js";

/**
 * Validate and REPLACE req.body with the parsed result.
 *
 * Replacing matters as much as validating. The admin controllers do
 * `Object.assign(doc, req.body)`, so without a whitelist a caller could set
 * fields the form never exposes — _id, createdAt, createdBy, or a nested
 * verification block — simply by adding them to the JSON. zod strips unknown
 * keys by default, so what reaches the model is only what the schema declares.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const detail = result.error.issues
        .map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        })
        .join("; ");
      return next(new ApiError(400, detail || "Invalid request body"));
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query ?? {});
    if (!result.success) {
      return next(new ApiError(400, result.error.issues[0]?.message ?? "Invalid query"));
    }
    // req.query is a getter-only property on newer Express — mutate in place.
    Object.assign(req.query, result.data);
    next();
  };
}

/** Every public endpoint filters on this. Drafts must never leak. */
export const PUBLIC = { "verification.status": "verified" };

/** User input reaching a RegExp must be escaped, or a stray "(" is a 500. */
export function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 24));
  return { page, limit, skip: (page - 1) * limit };
}

export function meta(total, page, limit) {
  return { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}

/** Turn "a b c" into { a: 1, b: 1, c: 1 } so $meta can be mixed in. */
export function projectionOf(fields) {
  return fields.split(/\s+/).filter(Boolean).reduce((acc, f) => ({ ...acc, [f]: 1 }), {});
}

/** Calendar-year window in UTC, for filtering a Date field by year. */
export function yearRange(year) {
  const y = Number.parseInt(year, 10);
  if (!Number.isInteger(y)) return null;
  return { $gte: new Date(Date.UTC(y, 0, 1)), $lt: new Date(Date.UTC(y + 1, 0, 1)) };
}

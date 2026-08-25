import { MARTYR_STATUS, STATUS_LABELS } from "./constants.js";

/**
 * Admin endpoints use .lean(), which bypasses the Mongoose toJSON transform,
 * so those documents arrive with _id while public ones arrive with id.
 * Read every identifier through here rather than repeating `x._id || x.id`.
 */
export function recordId(doc) {
  return doc?.id ?? doc?._id ?? null;
}

export function formatDate(value, fallback = "—") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatYear(value, fallback = "—") {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : String(date.getUTCFullYear());
}

/** "Captain Vikram Batra" — rank is optional and must not leave a leading space. */
export function displayName(martyr) {
  if (!martyr) return "";
  return [martyr.rank, martyr.fullName].filter(Boolean).join(" ");
}

export function birthplaceOf(martyr, fallback = "India") {
  const parts = [
    martyr?.placeOfBirth?.village,
    martyr?.placeOfBirth?.district,
    martyr?.placeOfBirth?.state,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : fallback;
}

export function memorialLocation(memorial, fallback = "—") {
  const parts = [memorial?.location?.city, memorial?.location?.state].filter(Boolean);
  return parts.length ? parts.join(", ") : fallback;
}

export function primaryAward(martyr, fallback = "Gallantry Recipient") {
  return martyr?.awards?.[0]?.name || fallback;
}

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? "—";
}

/**
 * Whether a record may be described in past-tense memorial language.
 * Guard any "sacrifice" / "fell" / date-of-death copy on this.
 */
export function isPosthumous(martyr) {
  return martyr?.status === MARTYR_STATUS.FELL;
}

export function conflictYears(war, fallback = "—") {
  if (!war?.startDate) return fallback;
  const start = formatYear(war.startDate);
  const end = war.endDate ? formatYear(war.endDate) : null;
  return !end || end === start ? start : `${start}–${end}`;
}

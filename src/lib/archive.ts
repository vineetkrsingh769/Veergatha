/**
 * Shared, browser-safe archive vocabulary: types, labels and formatting.
 *
 * Status wording is centralised here on purpose. Recipients who survived
 * their action must never be described with martyrdom language, so every
 * label that could imply death routes through these helpers.
 */

export type RecordStatus = "fell-in-action" | "survived";
export type Verification = "draft" | "in-review" | "verified";
export type ConflictType = "war" | "operation" | "counter-insurgency" | "peacekeeping";
export type MediaLicense =
  | "GODL-India"
  | "CC-BY"
  | "CC-BY-SA"
  | "CC0"
  | "public-domain"
  | "permission-granted"
  | "unverified";

export interface SourceRef {
  field?: string;
  title: string;
  publisher?: string;
  url?: string;
  /** Web Archive copy of `url`, for when the original site is unreachable. */
  archived?: string;
  tier: "primary" | "secondary";
  accessed?: string;
}

export interface MediaItem {
  id: string;
  kind: "photo" | "document" | "video";
  title: string;
  description: string | null;
  url: string;
  width: number | null;
  height: number | null;
  credit: string | null;
  license: MediaLicense;
  license_detail: string | null;
  source_url: string | null;
}

export interface Award {
  name: string;
  year: number | null;
  posthumous: boolean;
  citation: string | null;
  citation_verbatim: boolean;
  gazette_ref: string | null;
}

export interface RecipientSummary {
  slug: string;
  full_name: string;
  rank: string | null;
  regiment: string | null;
  unit: string | null;
  service_branch: string;
  status: RecordStatus;
  date_of_action: string | null;
  birth_state: string | null;
  operation: string | null;
  place_of_action: string | null;
  war: { slug: string; name: string; period_label: string | null } | null;
  awards: Pick<Award, "name" | "year" | "posthumous">[];
  portrait: MediaItem | null;
  updated_at?: string;
}

export const STATUS_LABELS: Record<RecordStatus, string> = {
  "fell-in-action": "Fell in action",
  survived: "Survived",
};

/** Neutral fallback: an unknown status never defaults to martyrdom wording. */
export function statusLabel(status: string | null | undefined): string {
  if (status === "fell-in-action" || status === "survived") return STATUS_LABELS[status];
  return "Unrecorded";
}

/** Label for the date of action, worded by status. */
export function actionDateLabel(status: string | null | undefined): string {
  return status === "fell-in-action" ? "Fell on" : "Date of action";
}

/** True only for recipients recorded as having fallen. Guards all sacrifice wording. */
export function isPosthumous(r: { status: string | null | undefined }): boolean {
  return r.status === "fell-in-action";
}

export const AWARD_ORDER = [
  "Param Vir Chakra",
  "Ashoka Chakra",
  "Maha Vir Chakra",
  "Kirti Chakra",
  "Vir Chakra",
  "Shaurya Chakra",
  "Sena Medal",
  "Nao Sena Medal",
  "Vayu Sena Medal",
  "Mention in Despatches",
  "Other",
] as const;

export const AWARD_SHORT: Record<string, string> = {
  "Param Vir Chakra": "PVC",
  "Ashoka Chakra": "AC",
  "Maha Vir Chakra": "MVC",
  "Kirti Chakra": "KC",
  "Vir Chakra": "VrC",
  "Shaurya Chakra": "SC",
  "Sena Medal": "SM",
  "Nao Sena Medal": "NM",
  "Vayu Sena Medal": "VM",
  "Mention in Despatches": "MiD",
};

/** Wartime gallantry vs peacetime gallantry, for context lines. */
export function awardContext(name: string): string {
  if (["Param Vir Chakra", "Maha Vir Chakra", "Vir Chakra"].includes(name))
    return "Wartime gallantry award";
  if (["Ashoka Chakra", "Kirti Chakra", "Shaurya Chakra"].includes(name))
    return "Peacetime gallantry award";
  return "Gallantry award";
}

export const CONFLICT_TYPE_LABELS: Record<ConflictType, string> = {
  war: "War",
  operation: "Operation",
  "counter-insurgency": "Counter-terrorism & insurgency",
  peacekeeping: "Peacekeeping",
};

export const LICENSE_LABELS: Record<MediaLicense, string> = {
  "GODL-India": "Government Open Data Licence – India",
  "CC-BY": "Creative Commons Attribution",
  "CC-BY-SA": "Creative Commons Attribution-ShareAlike",
  CC0: "Public domain dedication (CC0)",
  "public-domain": "Public domain",
  "permission-granted": "Used with permission",
  unverified: "Licence not yet cleared",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Day-month-year, timezone-safe (dates are stored as plain calendar dates). */
export function formatDate(iso: string | null | undefined, long = false): string {
  if (!iso) return "Not recorded";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y) return "Not recorded";
  if (!m) return String(y);
  const month = (long ? MONTHS_LONG : MONTHS)[m - 1];
  return d ? `${d} ${month} ${y}` : `${month} ${y}`;
}

/** Age in whole years at a given date. */
export function ageAt(dob: string | null | undefined, at: string | null | undefined): number | null {
  if (!dob || !at) return null;
  const [y1, m1, d1] = dob.slice(0, 10).split("-").map(Number);
  const [y2, m2, d2] = at.slice(0, 10).split("-").map(Number);
  // A partial date ("1942" or "1942-12") can't give an exact age; show none rather than a guess.
  if ([y1, m1, d1, y2, m2, d2].some((n) => n === undefined || !Number.isFinite(n))) return null;
  let age = y2! - y1!;
  if (m2! < m1! || (m2 === m1 && d2! < d1!)) age -= 1;
  return age >= 0 && age < 120 ? age : null;
}

/**
 * Resize a Wikimedia Commons thumbnail URL. Commons serves standard thumbnail
 * steps; anything else is passed through unchanged.
 */
export function thumb(url: string | null | undefined, width: 330 | 500 | 960 | 1280 | 1920 = 960): string {
  if (!url) return "";
  return url.replace(/\/(\d+)px-([^/]+)$/, `/${width}px-$2`);
}

/** Wide enough to open a page as a 21:9 establishing shot without losing most of the picture. */
export function isLandscape(m: { width: number | null; height: number | null } | null | undefined): boolean {
  return !!m?.width && !!m?.height && m.width / m.height >= 1.3;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function fullTitle(r: { rank: string | null; full_name: string }): string {
  return r.rank ? `${r.rank} ${r.full_name}` : r.full_name;
}

/** Strip characters that would break a PostgREST `or()` filter. */
export function sanitizeSearch(q: string | null | undefined): string {
  return (q ?? "").replace(/[%,()*\\:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

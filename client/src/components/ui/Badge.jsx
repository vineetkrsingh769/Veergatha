import { Award } from "lucide-react";
import { MARTYR_STATUS, STATUS_LABELS } from "../../lib/constants.js";

const BASE = "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide";

/**
 * Status is the one label in this project that must never be wrong: describing
 * a living recipient as fallen is the worst mistake the site can make. The
 * wording comes from STATUS_LABELS, and an unrecognised status renders neutrally
 * rather than defaulting to the martyrdom wording.
 */
export function StatusBadge({ status, className = "" }) {
  const known = status === MARTYR_STATUS.FELL || status === MARTYR_STATUS.SURVIVED;

  const tone =
    status === MARTYR_STATUS.FELL
      ? "bg-rose-100 border border-rose-300 text-rose-800"
      : status === MARTYR_STATUS.SURVIVED
        ? "bg-emerald-100 border border-emerald-300 text-emerald-800"
        : "bg-stone-100 border border-stone-300 text-stone-600";

  return (
    <span className={`${BASE} ${tone} ${className}`}>
      {known ? STATUS_LABELS[status] : "Unrecorded"}
    </span>
  );
}

const VERIFICATION_TONE = {
  verified: "bg-emerald-100 border border-emerald-300 text-emerald-800",
  "in-review": "bg-amber-100 border border-amber-300 text-amber-800",
  draft: "bg-stone-100 border border-stone-300 text-stone-600",
};

export function VerificationBadge({ status = "draft", className = "" }) {
  const tone = VERIFICATION_TONE[status] ?? VERIFICATION_TONE.draft;
  return <span className={`${BASE} ${tone} ${className}`}>{status}</span>;
}

export function AwardBadge({ name, className = "" }) {
  if (!name) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold text-[#C25016] ${className}`}>
      <Award className="h-3.5 w-3.5" aria-hidden="true" />
      {name}
    </span>
  );
}

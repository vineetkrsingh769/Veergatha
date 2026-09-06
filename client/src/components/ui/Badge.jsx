import { Award } from "lucide-react";
import { MARTYR_STATUS, STATUS_LABELS } from "../../lib/constants.js";

const BASE = "inline-flex items-center gap-1 rounded px-2 py-0.5 text-caption font-extrabold uppercase tracking-wide";

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
      ? "bg-danger-bg border border-danger-rule text-danger"
      : status === MARTYR_STATUS.SURVIVED
        ? "bg-success-bg border border-success-rule text-success"
        : "bg-sunken border border-rule-strong text-muted";

  return (
    <span className={`${BASE} ${tone} ${className}`}>
      {known ? STATUS_LABELS[status] : "Unrecorded"}
    </span>
  );
}

const VERIFICATION_TONE = {
  verified: "bg-success-bg border border-success-rule text-success",
  "in-review": "bg-warning-bg border border-warning-rule text-warning",
  draft: "bg-sunken border border-rule-strong text-muted",
};

export function VerificationBadge({ status = "draft", className = "" }) {
  const tone = VERIFICATION_TONE[status] ?? VERIFICATION_TONE.draft;
  return <span className={`${BASE} ${tone} ${className}`}>{status}</span>;
}

export function AwardBadge({ name, className = "" }) {
  if (!name) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-label font-bold text-accent-deep ${className}`}>
      <Award className="h-3.5 w-3.5" aria-hidden="true" />
      {name}
    </span>
  );
}

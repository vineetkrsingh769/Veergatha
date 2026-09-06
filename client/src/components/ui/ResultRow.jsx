import { Link } from "react-router-dom";

import { formatYear, isPosthumous, primaryAward } from "../../lib/format.js";
import { StatusBadge } from "./Badge.jsx";

/**
 * One row of an index.
 *
 * Not a card, and deliberately no photograph. Portraits belong on detail pages:
 * across hundreds of records their quality and framing will be inconsistent,
 * and a grid of mismatched or missing images reads as a broken gallery rather
 * than as an archive. No record has one today in any case.
 *
 * The whole row is a single link, so there is one tab stop and one click target
 * per record rather than a name link plus a separate "view" affordance.
 */
export function ResultRow({ martyr }) {
  const award = primaryAward(martyr, "");
  // Year of action. Surviving recipients have no such date, and the status
  // badge already says why — better an empty column than an invented year.
  const year = isPosthumous(martyr) ? formatYear(martyr.dateOfMartyrdom, "") : "";

  const meta = [martyr.rank, martyr.regiment || martyr.serviceBranch, martyr.placeOfBirth?.state]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      to={`/martyrs/${martyr.slug}`}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-4 py-3 transition-colors hover:bg-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-deep"
    >
      <div className="min-w-0">
        <span className="block truncate font-display text-title font-semibold text-ink transition-colors group-hover:text-accent-deep">
          {martyr.fullName}
        </span>
        {meta && <span className="mt-0.5 block truncate text-caption text-muted">{meta}</span>}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {award && (
          <span className="text-label font-semibold text-accent-deep">{award}</span>
        )}
        {/* Fixed width so the years form a column instead of ragging against
            award names of different lengths. */}
        <span className="w-10 text-right font-mono text-caption text-muted">{year}</span>
        <StatusBadge status={martyr.status} />
      </div>
    </Link>
  );
}

/** The list itself: hairline dividers, one bounding border, no per-row chrome. */
export function ResultList({ children }) {
  return (
    <ul className="divide-y divide-rule overflow-hidden rounded-panel border border-rule-strong bg-raised">
      {children}
    </ul>
  );
}

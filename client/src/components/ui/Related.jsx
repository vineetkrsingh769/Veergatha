import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { fetchMartyrs } from "../../lib/api.js";
import { useApi } from "../../hooks/useApi.js";
import { displayName, formatYear, isPosthumous, primaryAward } from "../../lib/format.js";
import { PersonLink } from "./Detail.jsx";
import { Section } from "./PageHeader.jsx";

/** Rows shown per group before deferring to the filtered browse page. */
const CAP = 4;

/**
 * Which relationships this record can actually be queried for.
 *
 * Every group maps onto a filter /api/martyrs already supports — war, regiment,
 * award, year — so the browser never pulls the dataset down to work out
 * relationships for itself. `operation` is deliberately absent: the record has
 * the field, but the list endpoint has no parameter for it, so a group built on
 * it could be labelled but not fetched.
 */
export function buildGroups(martyr) {
  const groups = [];

  if (martyr.war?.slug && martyr.war?.name) {
    groups.push({
      key: "war",
      label: `Others from ${martyr.war.name}`,
      params: { war: martyr.war.slug },
      seeAll: `/martyrs?war=${encodeURIComponent(martyr.war.slug)}`,
    });
  }

  if (martyr.regiment) {
    groups.push({
      key: "regiment",
      label: `Others from ${martyr.regiment}`,
      params: { regiment: martyr.regiment },
      seeAll: `/martyrs?regiment=${encodeURIComponent(martyr.regiment)}`,
    });
  }

  const award = martyr.awards?.[0]?.name;
  if (award) {
    groups.push({
      key: "award",
      label: `Other recipients of the ${award}`,
      params: { award },
      seeAll: `/martyrs?award=${encodeURIComponent(award)}`,
    });
  }

  /*
   * Year is gated on isPosthumous, and named accordingly.
   *
   * The server's year filter resolves to a range on dateOfMartyrdom, which
   * surviving recipients do not have — so this group can only ever contain
   * people who fell. Offering it on a survivor's profile would run a query
   * they are excluded from by construction, and labelling it "others from
   * 1999" would imply a shared fate the data does not support.
   */
  const year = isPosthumous(martyr) ? formatYear(martyr.dateOfMartyrdom, "") : "";
  if (year) {
    groups.push({
      key: "year",
      label: `Others who fell in ${year}`,
      params: { year },
      seeAll: `/martyrs?year=${encodeURIComponent(year)}`,
    });
  }

  return groups;
}

async function loadGroups(martyr, groups) {
  const results = await Promise.all(
    // One group failing must not take the whole section down with it.
    groups.map((g) =>
      fetchMartyrs({ ...g.params, limit: CAP + 1 }).catch(() => null)
    )
  );

  return groups
    .map((group, i) => {
      const payload = results[i];
      if (!payload) return null;

      // The record always matches its own regiment, war, award and year, so it
      // comes back in its own result set and has to be removed from both the
      // rows and the count.
      const others = (payload.martyrs ?? [])
        .filter((m) => m.slug !== martyr.slug)
        .slice(0, CAP);
      if (!others.length) return null;

      const total = Math.max((payload.meta?.total ?? others.length + 1) - 1, others.length);
      return { ...group, others, total };
    })
    .filter(Boolean);
}

/**
 * Other recipients connected to this one.
 *
 * Lives in its own component so it can own its data fetch. MartyrDetail returns
 * early while its own request is in flight, so a second useApi() up there would
 * sit after a conditional return — a hooks-order bug waiting to happen.
 *
 * Groups deliberately overlap. At the archive's current size nearly every
 * recipient shares a conflict, an award and often a regiment with every other,
 * so the groups will look repetitive today; at twenty-plus records across
 * several conflicts they diverge. De-duplicating across groups would look
 * tidier now and be wrong later — a person genuinely belongs in both "same
 * regiment" and "same award".
 */
export function RelatedEntries({ martyr }) {
  const groups = useMemo(() => buildGroups(martyr), [martyr]);

  const { data, loading, error } = useApi(
    () => loadGroups(martyr, groups),
    [martyr.slug],
    { skip: groups.length === 0, initialData: [] }
  );

  // No relationships to query, still loading, the requests failed, or every
  // group came back with nobody else in it — in all four cases the section is
  // omitted rather than shown empty.
  if (groups.length === 0 || loading || error || !data?.length) return null;

  return (
    <Section title="Related entries">
      <div className="space-y-6">
        {data.map((group) => (
          <div key={group.key}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-label font-semibold text-ink-700">{group.label}</h3>
              {group.total > group.others.length && (
                <Link
                  to={group.seeAll}
                  className="inline-flex items-center gap-1 rounded-control text-caption font-semibold text-accent-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
                >
                  See all {group.total}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              )}
            </div>

            {/* Stacked rows rather than a grid: this is an index of names, not
                a gallery, and no record has a photograph to show anyway. */}
            <ul className="mt-2 space-y-2">
              {group.others.map((other) => (
                <li key={other.slug}>
                  <PersonLink
                    to={`/martyrs/${other.slug}`}
                    name={displayName(other)}
                    detail={[
                      primaryAward(other, ""),
                      // Year of action, which survivors do not have. Left off
                      // rather than filled with a placeholder.
                      isPosthumous(other) ? formatYear(other.dateOfMartyrdom, "") : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

import { fetchMartyrs, fetchFilters } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { useDebounced } from "../hooks/useDebounced";
import { PAGE_SIZE, STATUS_LABELS, STATUS_OPTIONS } from "../lib/constants";
import { recordId } from "../lib/format";
import {
  ActiveFilterChips,
  AsyncBoundary,
  FilterRail,
  PageContainer,
  PageHeader,
  Pagination,
  ResultList,
  ResultRow,
} from "../components/ui";

/**
 * Values match the API's `sort` parameter. Ordering is applied server-side
 * because the client only ever holds one page — sorting here would reorder
 * twelve records while appearing to have ordered the whole result set.
 */
const SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "award", label: "Award precedence" },
  { value: "date", label: "Date of action (most recent)" },
];

/**
 * Every filter that lives in the URL. Each name is also the API parameter, so
 * a link built elsewhere in the app lands here already filtered.
 *
 * `regiment` is in this list because the related-entries section on a recipient
 * profile links to /martyrs?regiment=… — a key missing here would leave that
 * link silently landing on an unfiltered list.
 */
const FILTER_KEYS = ["q", "war", "award", "regiment", "branch", "state", "status", "year"];

const EMPTY_OPTIONS = {
  states: [],
  regiments: [],
  branches: [],
  awards: [],
  wars: [],
  years: [],
  counts: {},
};

export default function MartyrsList() {
  /*
   * Filter state lives in the URL, not in component state.
   *
   * This is an archive people cite: a filtered view has to survive a refresh,
   * be sendable to someone else, and be reachable by the back button. It also
   * makes the "see all" links on recipient profiles work, since those arrive
   * here carrying query parameters.
   */
  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? ""])),
    [params]
  );
  const sort = params.get("sort") ?? "name";
  const page = Math.max(1, Number(params.get("page")) || 1);

  /*
   * The search box stays local and instant; the URL trails behind it. Writing
   * every keystroke straight to the URL would fire a request per character and
   * bury the back button under a history entry per character.
   */
  const [queryInput, setQueryInput] = useState(filters.q);
  const debouncedQuery = useDebounced(queryInput, 350);

  const write = useCallback(
    (mutate, { replace = false } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          // Any change to the result set returns to page 1; paging into a
          // shorter set otherwise lands on an empty page.
          next.delete("page");
          return next;
        },
        { replace }
      );
    },
    [setParams]
  );

  useEffect(() => {
    if (debouncedQuery === filters.q) return;
    write(
      (next) => (debouncedQuery ? next.set("q", debouncedQuery) : next.delete("q")),
      // Replace, so typing leaves one history entry rather than one per word.
      { replace: true }
    );
  }, [debouncedQuery, filters.q, write]);

  const setFilter = useCallback(
    (key, value) => write((next) => (value ? next.set(key, value) : next.delete(key))),
    [write]
  );

  const resetAll = useCallback(() => {
    setQueryInput("");
    // Sort is a view preference, not a filter, so it survives a reset.
    setParams((prev) => {
      const next = new URLSearchParams();
      const keep = prev.get("sort");
      if (keep) next.set("sort", keep);
      return next;
    });
  }, [setParams]);

  const options = useApi(fetchFilters, [], { initialData: EMPTY_OPTIONS });
  const opts = options.data ?? EMPTY_OPTIONS;
  const counts = opts.counts ?? {};

  const queryParams = useMemo(() => {
    const next = { page, limit: PAGE_SIZE, sort };
    for (const key of FILTER_KEYS) {
      if (filters[key]) next[key] = filters[key];
    }
    return next;
  }, [filters, page, sort]);

  // Serialised so the effect compares by value, not by object identity.
  const queryKey = JSON.stringify(queryParams);
  const { data, loading, error, refetch } = useApi(() => fetchMartyrs(queryParams), [queryKey]);

  const martyrs = data?.martyrs ?? [];
  const meta = data?.meta ?? null;

  const rangeFrom = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const rangeTo = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  /*
   * Award options are rendered in the order the API sends them, which is
   * AWARD_NAMES precedence order — Param Vir Chakra first, never alphabetical.
   * The client deliberately does not re-sort: the sequence has one home, in the
   * schema enum the server reads.
   */
  const groups = useMemo(
    () => [
      {
        key: "war",
        label: "Conflict",
        options: (opts.wars ?? []).map((w) => ({
          value: w.slug,
          label: w.name,
          count: counts.wars?.[w.slug],
        })),
      },
      {
        key: "award",
        label: "Award",
        options: (opts.awards ?? []).map((a) => ({
          value: a,
          label: a,
          count: counts.awards?.[a],
        })),
      },
      {
        key: "regiment",
        label: "Regiment",
        options: (opts.regiments ?? []).map((r) => ({
          value: r,
          label: r,
          count: counts.regiments?.[r],
        })),
      },
      {
        key: "branch",
        label: "Service branch",
        options: (opts.branches ?? []).map((b) => ({
          value: b,
          label: b,
          count: counts.branches?.[b],
        })),
      },
      {
        key: "status",
        label: "Outcome",
        options: STATUS_OPTIONS.map((s) => ({
          value: s.value,
          label: s.label,
          count: counts.statuses?.[s.value],
        })),
      },
      {
        key: "year",
        label: "Year fell",
        // The server's year filter is a range on dateOfMartyrdom, so it can
        // only ever return recipients who fell. Saying so is better than
        // letting someone conclude the survivors are missing.
        hint: "Recipients who survived have no recorded date and are not returned by this filter.",
        options: (opts.years ?? []).map((y) => ({
          value: String(y),
          label: String(y),
          count: counts.years?.[String(y)],
        })),
      },
      {
        key: "state",
        label: "Home state",
        options: (opts.states ?? []).map((s) => ({
          value: s,
          label: s,
          count: counts.states?.[s],
        })),
      },
    ],
    [opts, counts]
  );

  const chips = useMemo(() => {
    const labelFor = (key, value) => {
      if (key === "q") return `“${value}”`;
      if (key === "status") return STATUS_LABELS[value] ?? value;
      if (key === "war") return opts.wars?.find((w) => w.slug === value)?.name ?? value;
      return value;
    };
    const groupLabel = (key) =>
      key === "q" ? "Search" : groups.find((g) => g.key === key)?.label ?? key;

    return FILTER_KEYS.filter((k) => filters[k]).map((k) => ({
      key: k,
      value: filters[k],
      label: labelFor(k, filters[k]),
      groupLabel: groupLabel(k),
    }));
  }, [filters, groups, opts.wars]);

  const removeChip = useCallback(
    (key) => {
      if (key === "q") setQueryInput("");
      setFilter(key, "");
    },
    [setFilter]
  );

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Gallantry Award Recipients"
        subtitle="Every recipient documented in the archive, with the sources behind each record."
      />

      <div className="flex items-start gap-8">
        <FilterRail groups={groups} values={filters} onChange={setFilter}>
          <div>
            <label
              htmlFor="recipient-search"
              className="text-caption font-bold uppercase tracking-[0.15em] text-ink-700"
            >
              Search
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-faint"
                aria-hidden="true"
              />
              <input
                id="recipient-search"
                type="search"
                placeholder="Name, regiment…"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="w-full rounded-control border border-rule-strong bg-raised py-2 pl-9 pr-3 text-body text-ink-700 placeholder-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
              />
            </div>
          </div>
        </FilterRail>

        <div className="min-w-0 flex-1 space-y-4">
          <ActiveFilterChips chips={chips} onRemove={removeChip} onReset={resetAll} />

          <AsyncBoundary
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={martyrs.length === 0}
            emptyTitle="No records match these filters"
            emptyHint={chips.length ? "Try removing a filter above." : undefined}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-body text-muted" aria-live="polite">
                  {meta ? (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-ink">
                        {rangeFrom}–{rangeTo}
                      </span>{" "}
                      of <span className="font-semibold text-ink">{meta.total}</span>{" "}
                      {meta.total === 1 ? "recipient" : "recipients"}
                    </>
                  ) : null}
                </p>

                <label className="flex items-center gap-2 text-body text-muted">
                  Sort by
                  <select
                    value={sort}
                    onChange={(e) => write((next) => next.set("sort", e.target.value))}
                    className="rounded-control border border-rule-strong bg-raised px-2.5 py-1.5 text-body text-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
                  >
                    {SORT_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <ResultList>
                {martyrs.map((martyr) => (
                  <li key={recordId(martyr) ?? martyr.slug}>
                    <ResultRow martyr={martyr} />
                  </li>
                ))}
              </ResultList>

              <Pagination
                meta={meta}
                onChange={(next) =>
                  setParams((prev) => {
                    const p = new URLSearchParams(prev);
                    if (next > 1) p.set("page", String(next));
                    else p.delete("page");
                    return p;
                  })
                }
              />
            </div>
          </AsyncBoundary>
        </div>
      </div>
    </PageContainer>
  );
}

import { useCallback, useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";

import { fetchMartyrs, fetchFilters } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { PAGE_SIZE, STATUS_OPTIONS } from "../lib/constants";
import { recordId } from "../lib/format";
import {
  AsyncBoundary,
  PageContainer,
  PageHeader,
  Pagination,
  ResultList,
  ResultRow,
} from "../components/ui";

const EMPTY_FILTERS = { q: "", state: "", branch: "", award: "", status: "" };

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

const CONTROL =
  "w-full rounded-lg border border-rule-strong bg-sunken px-3 py-2 text-label text-ink-700 focus:border-accent focus:outline-none";

export default function MartyrsList() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("name");

  // Any filter change resets to page 1 — paging into a shorter result set
  // otherwise lands the user on an empty page.
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const options = useApi(fetchFilters, [], {
    initialData: { states: [], branches: [], awards: [] },
  });

  // Serialised so the effect compares by value, not by object identity.
  const queryKey = JSON.stringify({ ...filters, page, sort });

  const params = useMemo(() => {
    const next = { page, limit: PAGE_SIZE, sort };
    if (filters.q.trim()) next.q = filters.q.trim();
    if (filters.state) next.state = filters.state;
    if (filters.branch) next.branch = filters.branch;
    if (filters.award) next.award = filters.award;
    if (filters.status) next.status = filters.status;
    return next;
  }, [filters, page, sort]);

  const { data, loading, error, refetch } = useApi(() => fetchMartyrs(params), [queryKey]);

  const martyrs = data?.martyrs ?? [];
  const meta = data?.meta ?? null;
  const hasFilters = Object.values(filters).some(Boolean);

  // Which slice of the whole result set is on screen.
  const rangeFrom = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const rangeTo = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  const selects = [
    { key: "state", label: "All States", items: options.data?.states ?? [] },
    { key: "branch", label: "All Branches", items: options.data?.branches ?? [] },
    { key: "award", label: "All Awards", items: options.data?.awards ?? [] },
  ];

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Gallantry Award Recipients"
        subtitle="Directory of India's gallantry award recipients. Filter by state, branch, award, or status."
      />

      <div className="space-y-4 rounded-xl border border-rule-strong bg-raised p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-label font-bold uppercase tracking-wider text-accent-deep">
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filters &amp; Search
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setPage(1);
              }}
              className="text-label font-medium text-muted underline underline-offset-2 hover:text-accent-deep"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-3">
          <div className="relative col-span-1">
            <Search
              className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by name, regiment…"
              aria-label="Search recipients"
              value={filters.q}
              onChange={(e) => updateFilter("q", e.target.value)}
              className={`${CONTROL} pl-9`}
            />
          </div>

          {selects.map(({ key, label, items }) => (
            <select
              key={key}
              aria-label={label}
              value={filters[key]}
              onChange={(e) => updateFilter(key, e.target.value)}
              className={CONTROL}
            >
              <option value="">{label}</option>
              {items.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          ))}

          <select
            aria-label="All Statuses"
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className={CONTROL}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={martyrs.length === 0}
        emptyTitle="No records match your filters"
        emptyHint={hasFilters ? "Try widening or clearing the filters above." : undefined}
      >
        <div className="space-y-4">
          {/* Count and ordering. Both describe the whole result set, not the
              page, which is why the sort is applied by the API. */}
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
                onChange={(e) => {
                  setSort(e.target.value);
                  // Reordering while on page 3 would leave the reader somewhere
                  // arbitrary in the new sequence.
                  setPage(1);
                }}
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

          <Pagination meta={meta} onChange={setPage} />
        </div>
      </AsyncBoundary>
    </PageContainer>
  );
}

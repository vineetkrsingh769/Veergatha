import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ChevronRight } from "lucide-react";

import { fetchMartyrs, fetchFilters } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { PAGE_SIZE, STATUS_OPTIONS } from "../lib/constants";
import { displayName, primaryAward, recordId } from "../lib/format";
import SpotlightCard from "../components/reactbits/SpotlightCard";
import {
  AsyncBoundary,
  AwardBadge,
  PageContainer,
  PageHeader,
  Pagination,
  StatusBadge,
} from "../components/ui";

const EMPTY_FILTERS = { q: "", state: "", branch: "", award: "", status: "" };

const CONTROL =
  "w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#D96B27] focus:outline-none";

export default function MartyrsList() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

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
  const queryKey = JSON.stringify({ ...filters, page });

  const params = useMemo(() => {
    const next = { page, limit: PAGE_SIZE };
    if (filters.q.trim()) next.q = filters.q.trim();
    if (filters.state) next.state = filters.state;
    if (filters.branch) next.branch = filters.branch;
    if (filters.award) next.award = filters.award;
    if (filters.status) next.status = filters.status;
    return next;
  }, [filters, page]);

  const { data, loading, error, refetch } = useApi(() => fetchMartyrs(params), [queryKey]);

  const martyrs = data?.martyrs ?? [];
  const meta = data?.meta ?? null;
  const hasFilters = Object.values(filters).some(Boolean);

  const selects = [
    { key: "state", label: "All States", items: options.data?.states ?? [] },
    { key: "branch", label: "All Branches", items: options.data?.branches ?? [] },
    { key: "award", label: "All Awards", items: options.data?.awards ?? [] },
  ];

  return (
    <PageContainer className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Gallantry Award Recipients"
        subtitle="Directory of India's gallantry award recipients. Filter by state, branch, award, or status."
      />

      <div className="space-y-4 rounded-xl border border-stone-300 bg-white/80 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
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
              className="text-xs font-medium text-stone-500 underline underline-offset-2 hover:text-[#D96B27]"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search
              className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400"
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {martyrs.map((martyr) => (
              <Link
                key={recordId(martyr) ?? martyr.slug}
                to={`/martyrs/${martyr.slug}`}
                className="group block"
              >
                <SpotlightCard className="flex h-full flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <AwardBadge name={primaryAward(martyr)} />
                      <StatusBadge status={martyr.status} />
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-bold text-[#1A241A] transition-colors group-hover:text-[#D96B27] sm:text-xl">
                        {displayName(martyr)}
                      </h3>
                      <p className="text-xs font-medium text-stone-600">
                        {martyr.regiment || martyr.serviceBranch}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-xs text-stone-600">
                    <span>{martyr.placeOfBirth?.state || "India"}</span>
                    <span className="flex items-center gap-0.5 font-bold text-[#D96B27]">
                      View Profile
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </SpotlightCard>
              </Link>
            ))}
          </div>

          <Pagination meta={meta} onChange={setPage} />
        </div>
      </AsyncBoundary>
    </PageContainer>
  );
}

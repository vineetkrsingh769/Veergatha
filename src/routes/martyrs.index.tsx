import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { recipientsQuery } from "@/lib/queries";
import { EmptyState, FilterChip, PageHeader } from "@/components/archive/primitives";
import { RecipientCard, RecipientRow } from "@/components/archive/RecipientCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RecipientFilters } from "@/lib/archive.functions";

const searchSchema = z.object({
  // The router parses ?q=1971 as a number, so turn it back into text.
  q: z.preprocess((v) => (typeof v === "number" ? String(v) : v), z.string().optional()),
  war: z.string().optional(),
  state: z.string().optional(),
  award: z.string().optional(),
  status: z.enum(["fell-in-action", "survived"]).optional(),
  branch: z.string().optional(),
  decade: z.coerce.number().optional(),
  sort: z.enum(["chronological", "recent-first", "name"]).optional(),
  page: z.coerce.number().optional(),
  view: z.enum(["grid", "list"]).optional(),
});

export const Route = createFileRoute("/martyrs/")({
  validateSearch: (s) => searchSchema.parse(s),
  loaderDeps: ({ search }) => {
    const { view: _v, ...rest } = search;
    void _v;
    return rest as RecipientFilters;
  },
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(recipientsQuery(deps)),
  head: () => ({
    meta: [
      { title: "Roll of Honour: Gallantry Award Recipients | Veergatha" },
      {
        name: "description",
        content: "Search India's gallantry award recipients by name, regiment, home state, conflict, award and decade. Every profile lists the sources it is based on.",
      },
      { property: "og:title", content: "Roll of Honour | Veergatha" },
      { property: "og:description", content: "Search and filter verified profiles of India's Param Vir Chakra, Maha Vir Chakra and Ashoka Chakra recipients." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RollOfHonour,
});

function RollOfHonour() {
  const search = Route.useSearch();
  const deps = Route.useLoaderDeps();
  const navigate = useNavigate({ from: "/martyrs/" });
  const { data } = useSuspenseQuery(recipientsQuery(deps));
  const [q, setQ] = useState(search.q ?? "");
  const view = search.view ?? "grid";

  useEffect(() => setQ(search.q ?? ""), [search.q]);

  // Debounced name search.
  useEffect(() => {
    if ((search.q ?? "") === q) return;
    const t = setTimeout(() => navigate({ search: (s) => ({ ...s, q: q || undefined, page: undefined }), replace: true }), 350);
    return () => clearTimeout(t);
  }, [q, search.q, navigate]);

  const set = (patch: Partial<typeof search>) =>
    navigate({ search: (s) => ({ ...s, ...patch, page: patch.page ?? undefined }) });

  const active = [
    search.war && { key: "war", label: data.facets.wars.find((w) => w.slug === search.war)?.name ?? search.war },
    search.state && { key: "state", label: search.state },
    search.award && { key: "award", label: search.award },
    search.status && { key: "status", label: search.status === "survived" ? "Survived" : "Fell in action" },
    search.branch && { key: "branch", label: search.branch },
    search.decade && { key: "decade", label: `${search.decade}s` },
  ].filter(Boolean) as { key: keyof typeof search; label: string }[];

  return (
    <div>
      <PageHeader
        title="Roll of Honour"
        intro="Search by name, regiment, operation or home state, and narrow by conflict, award and decade. Recipients who survived their actions are recorded as such."
      >
        <div className="relative max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try “Batra”, “Kumaon”, “Tiger Hill” or “Kerala”"
            className="h-14 border-border bg-card pl-12 text-base"
            aria-label="Search recipients"
          />
        </div>
      </PageHeader>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[17rem_1fr]">
        {/* Filters */}
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start" aria-label="Filters">
          <FilterGroup title="Conflict">
            {data.facets.wars.map((w) => (
              <FilterOption key={w.slug} active={search.war === w.slug} onClick={() => set({ war: search.war === w.slug ? undefined : w.slug })}>
                {w.name}
              </FilterOption>
            ))}
          </FilterGroup>
          <FilterGroup title="Award">
            {data.facets.awards.map((a) => (
              <FilterOption key={a} active={search.award === a} onClick={() => set({ award: search.award === a ? undefined : a })}>
                {a}
              </FilterOption>
            ))}
          </FilterGroup>
          <FilterGroup title="Status">
            {(["fell-in-action", "survived"] as const).map((s) => (
              <FilterOption key={s} active={search.status === s} onClick={() => set({ status: search.status === s ? undefined : s })}>
                {s === "survived" ? "Survived" : "Fell in action"}
              </FilterOption>
            ))}
          </FilterGroup>
          <FilterGroup title="Decade of action">
            <div className="flex flex-wrap gap-1.5">
              {data.facets.decades.map((d) => (
                <FilterChip key={d} active={search.decade === d} onClick={() => set({ decade: search.decade === d ? undefined : d })} className="tabular-nums">
                  {d}s
                </FilterChip>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Service">
            {data.facets.branches.map((b) => (
              <FilterOption key={b} active={search.branch === b} onClick={() => set({ branch: search.branch === b ? undefined : b })}>
                {b}
              </FilterOption>
            ))}
          </FilterGroup>
          <FilterGroup title="Home state">
            <select
              value={search.state ?? ""}
              onChange={(e) => set({ state: e.target.value || undefined })}
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
              aria-label="Home state"
            >
              <option value="">All states</option>
              {data.facets.states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FilterGroup>
        </aside>

        {/* Results */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="font-display text-2xl font-semibold text-foreground">{data.total}</span>{" "}
              {data.total === 1 ? "record" : "records"}
              {search.q && <> matching “{search.q}”</>}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={search.sort ?? "chronological"}
                onChange={(e) => set({ sort: e.target.value as typeof search.sort })}
                className="h-9 rounded-md border border-border bg-card px-3 text-sm"
                aria-label="Sort"
              >
                <option value="chronological">Oldest action first</option>
                <option value="recent-first">Most recent action first</option>
                <option value="name">Name A–Z</option>
              </select>
              <div className="flex rounded-md border border-border">
                <button aria-label="Grid view" onClick={() => set({ view: "grid" })} className={cn("p-2", view === "grid" ? "bg-secondary text-bronze" : "text-muted-foreground")}>
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button aria-label="List view" onClick={() => set({ view: "list" })} className={cn("p-2", view === "list" ? "bg-secondary text-bronze" : "text-muted-foreground")}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {active.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {active.map((a) => (
                <button
                  key={a.key}
                  onClick={() => set({ [a.key]: undefined })}
                  className="inline-flex items-center gap-1.5 rounded-md border border-bronze/40 bg-bronze/10 px-3 py-1 text-xs text-bronze-light hover:bg-bronze/20"
                >
                  {a.label} <X className="h-3 w-3" />
                </button>
              ))}
              <Link to="/martyrs" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                Clear all
              </Link>
            </div>
          )}

          {data.items.length === 0 ? (
            <div className="mt-10">
              <EmptyState title="No verified records match">
                Try a broader search, or remove a filter. Names can be romanised several ways, such as “Hamid” and
                “Hameed”.
              </EmptyState>
            </div>
          ) : view === "grid" ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((r, i) => (
                <RecipientCard key={r.slug} r={r} eager={i < 4} />
              ))}
            </div>
          ) : (
            <div className="mt-4">
              {data.items.map((r) => (
                <RecipientRow key={r.slug} r={r} />
              ))}
            </div>
          )}

          {data.pages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
              <Button variant="outline" size="sm" disabled={data.page <= 1} onClick={() => set({ page: data.page - 1 })}>
                Previous
              </Button>
              {Array.from({ length: data.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => set({ page: i + 1 })}
                  className={cn(
                    "h-8 w-8 rounded-md text-sm",
                    data.page === i + 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <Button variant="outline" size="sm" disabled={data.page >= data.pages} onClick={() => set({ page: data.page + 1 })}>
                Next
              </Button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3 text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function FilterOption({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-sm px-2.5 py-1.5 text-left text-sm transition",
        active ? "bg-bronze/15 font-semibold text-bronze-light" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { searchQuery } from "@/lib/queries";
import { EmptyState, Eyebrow } from "@/components/archive/primitives";
import { RecipientRow } from "@/components/archive/RecipientCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CONFLICT_TYPE_LABELS, thumb, type ConflictType } from "@/lib/archive";

export const Route = createFileRoute("/search")({
  // The router parses ?q=1971 as a number, so turn it back into text.
  validateSearch: (s) => z.object({ q: z.preprocess((v) => (typeof v === "number" ? String(v) : v), z.string().optional()) }).parse(s),
  head: () => ({
    meta: [
      { title: "Search the Archive | Veergatha" },
      { name: "description", content: "Search gallantry recipients, war memorials and conflicts in one place, by name, regiment, place or operation." },
      { property: "og:title", content: "Search the Archive | Veergatha" },
      { property: "og:description", content: "One search across people, memorials and conflicts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

const SUGGESTIONS = ["Kargil", "Rezang La", "Gorkha Rifles", "Punjab", "Tiger Hill", "Siachen", "Navy", "1971"];

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  useEffect(() => {
    if (text === q) return;
    const t = setTimeout(() => navigate({ search: { q: text || undefined }, replace: true }), 300);
    return () => clearTimeout(t);
  }, [text, q, navigate]);

  const { data, isFetching } = useQuery({ ...searchQuery(q), enabled: q.trim().length >= 2 });
  const total = data ? data.recipients.length + data.memorials.length + data.wars.length : 0;

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24">
      <Eyebrow>People, memorials and conflicts</Eyebrow>
      <h1 className="mt-4 font-display text-5xl font-semibold md:text-7xl">Search the archive</h1>
      <div className="relative mt-10">
        <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search people, memorials and conflicts"
          className="h-16 border-border bg-card pl-14 text-lg"
          aria-label="Search the archive"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => setText(s)} className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:border-bronze/50 hover:text-foreground">
            {s}
          </button>
        ))}
      </div>

      <div className="mt-14" aria-live="polite">
        {q.trim().length < 2 ? (
          <p className="text-sm text-muted-foreground">Type at least two letters to search.</p>
        ) : isFetching && !data ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : data && total === 0 ? (
          <EmptyState title={`Nothing found for “${q}”`}>
            Names can be romanised several ways, so try another spelling, or browse the{" "}
            <Link to="/martyrs" className="text-bronze underline">
              Roll of Honour
            </Link>
            .
          </EmptyState>
        ) : data ? (
          <div className="space-y-14">
            {data.recipients.length > 0 && (
              <section>
                <h2 className="eyebrow">People · {data.recipients.length}</h2>
                <div className="mt-3">
                  {data.recipients.map((r) => (
                    <RecipientRow key={r.slug} r={r} />
                  ))}
                </div>
              </section>
            )}
            {data.memorials.length > 0 && (
              <section>
                <h2 className="eyebrow">Memorials · {data.memorials.length}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {data.memorials.map((m) => (
                    <Link key={m.slug} to="/memorials/$slug" params={{ slug: m.slug }} className="group flex items-center gap-4 rounded-md border border-border bg-card p-3 hover:border-bronze/50">
                      {m.hero && <img src={thumb(m.hero.url, 330)} alt="" className="h-14 w-20 rounded-sm object-cover" />}
                      <div>
                        <p className="font-display text-xl font-semibold group-hover:text-bronze-light">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.city}, {m.state}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {data.wars.length > 0 && (
              <section>
                <h2 className="eyebrow">Conflicts · {data.wars.length}</h2>
                <div className="mt-4 space-y-3">
                  {data.wars.map((w) => (
                    <Link key={w.slug} to="/wars/$slug" params={{ slug: w.slug }} className="group block rounded-md border border-border bg-card p-5 hover:border-bronze/50">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                        {CONFLICT_TYPE_LABELS[w.type as ConflictType]} · {w.period_label}
                      </p>
                      <p className="mt-1 font-display text-2xl font-semibold group-hover:text-bronze-light">{w.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{w.summary}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

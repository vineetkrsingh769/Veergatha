import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { memorialsQuery } from "@/lib/queries";
import { FilterChip, PageHeader } from "@/components/archive/primitives";
import { thumb } from "@/lib/archive";

const MemorialMap = lazy(() => import("@/components/archive/MemorialMap").then((m) => ({ default: m.MemorialMap })));

export const Route = createFileRoute("/memorials/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(memorialsQuery()),
  head: () => ({
    meta: [
      { title: "War Memorial Directory & Map of India | Veergatha" },
      { name: "description", content: "India's war memorials on a map and in a directory, including the National War Memorial, Kargil, Rezang La, Tawang and Longewala, with history, photographs and the names they hold." },
      { property: "og:title", content: "War Memorial Directory | Veergatha" },
      { property: "og:description", content: "An interactive map and directory of India's war memorials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Memorials,
});

function Memorials() {
  const { data } = useSuspenseQuery(memorialsQuery());
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<string>("");
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  const states = useMemo(() => [...new Set(data.map((m) => m.state).filter(Boolean) as string[])].sort(), [data]);
  const list = state ? data.filter((m) => m.state === state) : data;

  return (
    <div>
      <PageHeader
        title="War memorials"
        intro={`${data.length} war memorials across India, on a map and in a list. Map positions are approximate, so check with the managing authority before planning a visit.`}
      />
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="relative h-[460px] overflow-hidden rounded-md border border-border md:h-[540px]">
          {mounted ? (
            <Suspense fallback={<div className="h-full w-full bg-night" />}>
              <MemorialMap points={data} activeSlug={active} className="absolute inset-0" />
            </Suspense>
          ) : (
            <div className="h-full w-full bg-night" />
          )}
        </div>

        <div className="mt-12 flex flex-wrap gap-2" role="group" aria-label="Filter by state">
          {["", ...states].map((s) => (
            <FilterChip key={s || "all"} active={state === s} onClick={() => setState(s)}>
              {s || `All (${data.length})`}
            </FilterChip>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <article key={m.slug} className="group overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-bronze/50">
              <Link to="/memorials/$slug" params={{ slug: m.slug }} className="block">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {m.hero ? (
                    <img src={thumb(m.hero.url, 500)} alt={m.hero.title} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-secondary" />
                  )}
                  <div className="absolute inset-0 bg-night-fade opacity-70" />
                  {m.inaugurated_year && (
                    <span className="absolute right-3 top-3 rounded-sm bg-background/80 px-2 py-0.5 text-xs font-semibold tabular-nums text-bronze-light">
                      est. {m.inaugurated_year}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-display text-2xl font-semibold leading-tight group-hover:text-bronze-light">{m.name}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {[m.city, m.state].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{m.description}</p>
                </div>
              </Link>
              <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs">
                <span className="text-muted-foreground">
                  {m.honoured} {m.honoured === 1 ? "profile" : "profiles"} linked
                </span>
                <button onClick={() => { setActive(m.slug); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="font-semibold text-bronze hover:underline">
                  Show on map
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

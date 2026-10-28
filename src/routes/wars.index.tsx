import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { warsQuery } from "@/lib/queries";
import { PageHeader } from "@/components/archive/primitives";
import { CONFLICT_TYPE_LABELS, thumb, type ConflictType } from "@/lib/archive";

export const Route = createFileRoute("/wars/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(warsQuery()),
  head: () => ({
    meta: [
      { title: "Conflicts & Operations, 1947–2020 | Veergatha" },
      { name: "description", content: "A timeline of India's wars, operations and peacekeeping missions, from Jammu & Kashmir in 1947 to Kargil in 1999 and Galwan in 2020, with the people decorated in each." },
      { property: "og:title", content: "Conflicts & Operations | Veergatha" },
      { property: "og:description", content: "India's wars, operations and peacekeeping missions since Independence, with key events and gallantry recipients." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Wars,
});

function Wars() {
  const { data } = useSuspenseQuery(warsQuery());
  return (
    <div>
      <PageHeader
        title="Conflicts and operations"
        intro="Wars, high-altitude operations, peacekeeping deployments and counter-terrorism actions in which India's armed forces have served since 1947, each linked to the people decorated for their part in it."
      />
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <ol className="relative">
          <div className="absolute bottom-0 left-[4.5rem] top-0 hidden w-px bg-border md:block" />
          {data.map((w) => (
            <li key={w.slug} className="relative grid gap-6 py-8 md:grid-cols-[9rem_1fr]">
              <div className="md:text-right">
                <p className="font-display text-4xl font-semibold text-bronze md:pr-8">{w.period_label?.split(" ")[0]}</p>
              </div>
              <span className="absolute left-[4.5rem] top-12 hidden h-3 w-3 -translate-x-1/2 rotate-45 border border-bronze bg-background md:block" />
              <Link
                to="/wars/$slug"
                params={{ slug: w.slug }}
                className={`group grid overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-bronze/50 ${w.hero ? "sm:grid-cols-[1fr_14rem]" : ""}`}
              >
                <div className="p-6 md:p-8">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {CONFLICT_TYPE_LABELS[w.type as ConflictType]} · {w.period_label} · {w.theatre}
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold leading-tight group-hover:text-bronze-light md:text-4xl">{w.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{w.summary}</p>
                  <p className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-bronze">
                    {w.count} {w.count === 1 ? "profile" : "profiles"} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </p>
                </div>
                {w.hero && (
                  <img src={thumb(w.hero.url, 500)} alt={w.hero.title} loading="lazy" className="hidden h-full w-full object-cover sm:block" />
                )}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

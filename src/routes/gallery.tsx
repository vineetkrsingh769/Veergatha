import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { mediaQuery } from "@/lib/queries";
import { ArrowRight } from "lucide-react";
import { FilterChip, MORE_LINK, MediaCredit, PageHeader } from "@/components/archive/primitives";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { thumb } from "@/lib/archive";

export const Route = createFileRoute("/gallery")({
  loader: ({ context }) => context.queryClient.ensureQueryData(mediaQuery()),
  head: () => ({
    meta: [
      { title: "Photo Archive: Memorials, Busts & Historical Documents | Veergatha" },
      { name: "description", content: "Openly licensed photographs of India's war memorials, the Param Yodha Sthal busts of Param Vir Chakra recipients, and historical documents, each credited." },
      { property: "og:title", content: "Photo Archive | Veergatha" },
      { property: "og:description", content: "Credited, openly licensed photographs of memorials, busts and historical documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gallery,
});

// Each photograph belongs to exactly one section. Busts are portrait and come in sevens
// (twenty-one in all); memorial and history photographs are landscape.
const SECTIONS = [
  { key: "people", label: "Param Yodha Sthal busts", grid: "grid-cols-3 lg:grid-cols-7", aspect: "aspect-[4/5]" },
  { key: "memorials", label: "Memorials", grid: "grid-cols-2 lg:grid-cols-4", aspect: "aspect-[4/3]" },
  { key: "history", label: "History & documents", grid: "grid-cols-2 lg:grid-cols-4", aspect: "aspect-[4/3]" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

function sectionOf(m: { martyr?: unknown; memorial?: unknown }): SectionKey {
  return m.martyr ? "people" : m.memorial ? "memorials" : "history";
}

function Gallery() {
  const { data } = useSuspenseQuery(mediaQuery());
  const [tab, setTab] = useState<SectionKey | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const sections = SECTIONS.map((s) => ({ ...s, items: data.filter((m) => sectionOf(m) === s.key) })).filter(
    (s) => s.items.length > 0 && (tab === "all" || tab === s.key),
  );
  const current = data.find((m) => m.id === open);

  return (
    <div>
      <PageHeader
        title="Photographs and documents"
        intro={`${data.length} photographs and documents, each published under an open licence with the photographer named. Where no cleared image exists, we show none.`}
      />
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <FilterChip active={tab === "all"} onClick={() => setTab("all")}>
            Everything
          </FilterChip>
          {SECTIONS.map((s) => (
            <FilterChip key={s.key} active={tab === s.key} onClick={() => setTab(s.key)}>
              {s.label}
            </FilterChip>
          ))}
        </div>

        <div className="mt-12 space-y-16">
          {sections.map((s) => (
            <section key={s.key}>
              <h2 className="font-display text-3xl font-semibold">
                {s.label} <span className="text-muted-foreground">· {s.items.length}</span>
              </h2>
              <div className={`mt-6 grid gap-x-4 gap-y-6 ${s.grid}`}>
                {s.items.map((m) => (
                  <button key={m.id} onClick={() => setOpen(m.id)} className="group text-left">
                    <img
                      src={thumb(m.url, 500)}
                      alt={m.title}
                      loading="lazy"
                      className={`w-full rounded-md border border-border object-cover transition-colors group-hover:border-bronze/50 ${s.aspect}`}
                    />
                    <p className="mt-2 line-clamp-2 text-sm leading-snug text-muted-foreground group-hover:text-foreground">
                      {m.martyr ? `${m.martyr.rank} ${m.martyr.full_name}` : m.memorial?.name ?? m.title}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Dialog open={!!current} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-5xl border-border bg-background p-0">
          {current && (
            <div className="grid md:grid-cols-[1fr_18rem]">
              <img src={thumb(current.url, 1280)} alt={current.title} className="max-h-[80vh] w-full bg-night object-contain" />
              <div className="space-y-4 p-6">
                <DialogTitle className="font-display text-2xl font-semibold leading-tight">{current.title}</DialogTitle>
                {current.description && <p className="text-sm text-muted-foreground">{current.description}</p>}
                <MediaCredit media={current} />
                <div className="flex flex-col items-start gap-2 border-t border-border pt-4">
                  {current.martyr && (
                    <Link to="/martyrs/$slug" params={{ slug: current.martyr.slug }} className={MORE_LINK}>
                      {current.martyr.rank} {current.martyr.full_name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {current.memorial && (
                    <Link to="/memorials/$slug" params={{ slug: current.memorial.slug }} className={MORE_LINK}>
                      {current.memorial.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {current.war && (
                    <Link to="/wars/$slug" params={{ slug: current.war.slug }} className={MORE_LINK}>
                      {current.war.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

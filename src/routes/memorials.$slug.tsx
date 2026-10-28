import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Navigation } from "lucide-react";
import { memorialQuery } from "@/lib/queries";
import { EstablishingShot, Eyebrow, MediaCredit, SourcesPanel, StatusText } from "@/components/archive/primitives";
import { Button } from "@/components/ui/button";
import { AWARD_ORDER, fullTitle, isLandscape, thumb, type RecipientSummary } from "@/lib/archive";

export const Route = createFileRoute("/memorials/$slug")({
  loader: async ({ context, params }) => {
    const m = await context.queryClient.ensureQueryData(memorialQuery(params.slug));
    if (!m) throw notFound();
    return { name: m.name, place: [m.city, m.state].filter(Boolean).join(", "), desc: m.description, hero: m.hero?.url ?? null };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name}, ${loaderData.place} | Veergatha` : "Memorial | Veergatha";
    const desc = loaderData?.desc?.slice(0, 160) ?? "";
    const img = loaderData?.hero ? thumb(loaderData.hero, 1280) : null;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
    };
  },
  component: MemorialPage,
});

function MemorialPage() {
  const { slug } = Route.useParams();
  const { data: m } = useSuspenseQuery(memorialQuery(slug));
  if (!m) return null;
  const wide = isLandscape(m.hero);
  const maps = m.latitude != null && m.longitude != null ? `https://www.openstreetmap.org/?mlat=${m.latitude}&mlon=${m.longitude}#map=13/${m.latitude}/${m.longitude}` : null;

  return (
    <article>
      {/* A landscape lead photo opens the page as a wide establishing shot; otherwise the photo sits
          beside the facts as on a recipient's page. Never laid over or dimmed. */}
      <header>
        <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
          <Link to="/memorials" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-bronze">
            <ArrowLeft className="h-4 w-4" /> Memorial directory
          </Link>
        </div>
        {wide && m.hero && (
          <div className="mt-8">
            <EstablishingShot media={m.hero} />
          </div>
        )}
        <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
          <div className={`${wide ? "mt-12" : "mt-10"} grid gap-12 lg:gap-16 ${m.hero && !wide ? "lg:grid-cols-[1fr_minmax(0,34rem)] lg:items-end" : ""}`}>
            <div>
              <Eyebrow>
                {[m.city, m.district !== m.city ? m.district : null, m.state].filter(Boolean).join(" · ")}
              </Eyebrow>
              <h1 className="mt-4 max-w-4xl font-display text-6xl font-semibold leading-[0.9] tracking-tight md:text-7xl">{m.name}</h1>
              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-8 md:grid-cols-3">
                <Fact label="Established" value={m.inaugurated_year ? String(m.inaugurated_year) : "Not recorded"} />
                <Fact label="Managed by" value={m.managed_by ?? "Not recorded"} />
                <Fact label="Location" value={[m.city, m.state].filter(Boolean).join(", ")} />
              </dl>
            </div>
            {m.hero && !wide && (
              <figure>
                <div className="overflow-hidden rounded-md border border-bronze/30">
                  <img src={thumb(m.hero.url, 960)} alt={m.hero.title} className="aspect-[4/3] w-full object-cover" />
                </div>
                <MediaCredit media={m.hero} className="mt-3" />
              </figure>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-16">
          <section>
            <div className="prose-archive">
              <p>{m.description}</p>
            </div>
            {m.significance && (
              <blockquote className="mt-10 border-l-2 border-bronze pl-6 font-display text-2xl italic leading-snug text-foreground/90 md:text-3xl">
                {m.significance}
              </blockquote>
            )}
          </section>

          {m.gallery.length > 0 && (
            <section>
              <Eyebrow>Photographs</Eyebrow>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {m.gallery.map((g) => (
                  <figure key={g.id}>
                    <img src={thumb(g.url, 960)} alt={g.title} loading="lazy" className="aspect-[4/3] w-full rounded-md border border-border object-cover" />
                    <figcaption className="mt-2">
                      <MediaCredit media={g} />
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {m.people.length > 0 && (
            <section>
              <h2 className="font-display text-4xl font-semibold">Names honoured here</h2>
              {/* A roll of names grouped by award, as a memorial lists them; the photographs live on each record. */}
              <div className="mt-8 space-y-10">
                {groupByAward(m.people).map(([award, people]) => (
                  <div key={award}>
                    <h3 className="eyebrow text-muted-foreground">
                      {award} · {people.length}
                    </h3>
                    <ul className="mt-3 grid gap-x-10 sm:grid-cols-2">
                      {people.map((p) => (
                        <li key={p.slug} className="border-b border-border/70">
                          <Link to="/martyrs/$slug" params={{ slug: p.slug }} className="group flex items-start justify-between gap-4 py-3">
                            <span className="min-w-0">
                              <span className="block font-display text-xl font-semibold leading-tight group-hover:text-bronze-light">{fullTitle(p)}</span>
                              <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                                {[p.unit ?? p.regiment, p.date_of_action?.slice(0, 4)].filter(Boolean).join(" · ")}
                              </span>
                            </span>
                            <StatusText status={p.status} className="mt-1.5" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {maps && (
            <div className="rounded-md border border-border bg-card/60 p-6">
              <p className="eyebrow">Visit</p>
              <p className="mt-3 text-sm tabular-nums text-foreground">
                {m.latitude?.toFixed(4)}°N, {m.longitude?.toFixed(4)}°E
              </p>
              {m.coords_approximate && <p className="mt-1 text-xs text-muted-foreground">Approximate position</p>}
              <Button asChild variant="outline" className="mt-5 w-full">
                <a href={maps} target="_blank" rel="noreferrer">
                  <Navigation /> Open in map
                </a>
              </Button>
            </div>
          )}
          <SourcesPanel sources={m.sources} recordSlug={m.slug} recordType="memorial" verifiedAt={m.verified_at} />
        </aside>
      </div>
    </article>
  );
}

/** People grouped under their highest award, highest award first; anyone without a ranked award comes last. */
function groupByAward(people: RecipientSummary[]): [string, RecipientSummary[]][] {
  const groups = new Map<string, RecipientSummary[]>();
  for (const p of people) {
    const award = p.awards[0]?.name ?? "Other";
    groups.set(award, [...(groups.get(award) ?? []), p]);
  }
  const rank = (a: string) => {
    const i = (AWARD_ORDER as readonly string[]).indexOf(a);
    return i === -1 ? AWARD_ORDER.length : i;
  };
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b));
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-display text-xl">{value}</dd>
    </div>
  );
}

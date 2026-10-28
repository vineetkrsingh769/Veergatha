import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { warQuery } from "@/lib/queries";
import { EstablishingShot, Eyebrow, MediaCredit, SourcesPanel, Stat } from "@/components/archive/primitives";
import { RecipientCard } from "@/components/archive/RecipientCard";
import { CONFLICT_TYPE_LABELS, formatDate, isLandscape, thumb, type ConflictType } from "@/lib/archive";

export const Route = createFileRoute("/wars/$slug")({
  loader: async ({ context, params }) => {
    const w = await context.queryClient.ensureQueryData(warQuery(params.slug));
    if (!w) throw notFound();
    return { name: w.name, summary: w.summary, hero: w.hero?.url ?? null };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} | Veergatha` : "Conflict | Veergatha";
    const img = loaderData?.hero ? thumb(loaderData.hero, 1280) : null;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData?.summary ?? "" },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData?.summary ?? "" },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
    };
  },
  component: WarPage,
});

function WarPage() {
  const { slug } = Route.useParams();
  const { data: w } = useSuspenseQuery(warQuery(slug));
  if (!w) return null;
  const fell = w.people.filter((p) => p.status === "fell-in-action").length;
  const wide = isLandscape(w.hero);

  return (
    <article>
      {/* A landscape lead photo opens the page as a wide establishing shot; otherwise the photo sits
          beside the facts as on a recipient's page. Never laid over or dimmed. */}
      <header>
        <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
          <Link to="/wars" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-bronze">
            <ArrowLeft className="h-4 w-4" /> All conflicts
          </Link>
        </div>
        {wide && w.hero && (
          <div className="mt-8">
            <EstablishingShot media={w.hero} />
          </div>
        )}
        <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
          <div className={`${wide ? "mt-12" : "mt-10"} grid gap-12 lg:gap-16 ${w.hero && !wide ? "lg:grid-cols-[1fr_minmax(0,34rem)] lg:items-end" : ""}`}>
            <div>
              <Eyebrow>
                {CONFLICT_TYPE_LABELS[w.type as ConflictType]} · {w.theatre}
              </Eyebrow>
              <h1 className="mt-4 max-w-4xl font-display text-6xl font-semibold leading-[0.9] tracking-tight md:text-7xl">{w.name}</h1>
              <p className="mt-6 max-w-2xl font-prose text-lg text-foreground/80">{w.summary}</p>
              <div className="mt-10 flex flex-wrap gap-12 border-t border-border pt-8">
                <Stat value={w.period_label} label={w.start_date ? `${formatDate(w.start_date)} – ${w.end_date ? formatDate(w.end_date) : "present"}` : "Period"} />
                <Stat value={w.people.length} label="Profiles in archive" />
                {w.people.length > 0 && <Stat value={fell} label="Fell in action" />}
              </div>
            </div>
            {w.hero && !wide && (
              <figure>
                <div className="overflow-hidden rounded-md border border-bronze/30">
                  <img src={thumb(w.hero.url, 960)} alt={w.hero.title} className="aspect-[4/3] w-full object-cover" />
                </div>
                <MediaCredit media={w.hero} className="mt-3" />
              </figure>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-20">
          <section>
            <Eyebrow>Overview</Eyebrow>
            <div className="prose-archive mt-6">
              <p>{w.description}</p>
            </div>
          </section>

          {w.key_events.length > 0 && (
            <section>
              <h2 className="font-display text-4xl font-semibold">Key events</h2>
              <ol className="mt-10 border-l border-bronze/30">
                {w.key_events.map((e, i) => (
                  <li key={i} className="relative pb-10 pl-8 last:pb-0">
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rotate-45 bg-bronze" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-bronze tabular-nums">{e.label}</p>
                    <h3 className="mt-1 font-display text-2xl font-semibold">{e.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{e.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {w.people.length > 0 && (
            <section>
              <h2 className="font-display text-4xl font-semibold">Decorated in this conflict</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {w.people.map((p) => (
                  <RecipientCard key={p.slug} r={p} />
                ))}
              </div>
            </section>
          )}

          {w.memorials.length > 0 && (
            <section>
              <h2 className="font-display text-4xl font-semibold">Memorials connected to this conflict</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {w.memorials.map((m) => (
                  <Link key={m.slug} to="/memorials/$slug" params={{ slug: m.slug }} className="group flex items-center gap-4 rounded-md border border-border bg-card p-3 hover:border-bronze/50">
                    {m.hero && <img src={thumb(m.hero.url, 330)} alt="" loading="lazy" className="h-16 w-24 rounded-sm object-cover" />}
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

          <nav className="grid gap-4 border-t border-border pt-10 sm:grid-cols-2" aria-label="Adjacent conflicts">
            {w.prev ? (
              <Link to="/wars/$slug" params={{ slug: w.prev.slug }} className="group rounded-md border border-border p-5 hover:border-bronze/50">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" /> Earlier
                </p>
                <p className="mt-2 font-display text-xl group-hover:text-bronze-light">{w.prev.name}</p>
              </Link>
            ) : (
              <span />
            )}
            {w.next && (
              <Link to="/wars/$slug" params={{ slug: w.next.slug }} className="group rounded-md border border-border p-5 text-right hover:border-bronze/50">
                <p className="flex items-center justify-end gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Later <ArrowRight className="h-3.5 w-3.5" />
                </p>
                <p className="mt-2 font-display text-xl group-hover:text-bronze-light">{w.next.name}</p>
              </Link>
            )}
          </nav>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SourcesPanel sources={w.sources} recordSlug={w.slug} recordType="conflict" verifiedAt={w.verified_at} />
        </aside>
      </div>
    </article>
  );
}

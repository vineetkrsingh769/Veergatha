import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin } from "lucide-react";
import { recipientQuery } from "@/lib/queries";
import {
  AwardBadge,
  Eyebrow,
  MediaCredit,
  Portrait,
  PORTRAIT_MORPH,
  SourcesPanel,
  StatusBadge,
} from "@/components/archive/primitives";
import type { CSSProperties } from "react";
import { RecipientCard } from "@/components/archive/RecipientCard";
import { actionDateLabel, ageAt, awardContext, formatDate, fullTitle, isPosthumous, thumb } from "@/lib/archive";

export const Route = createFileRoute("/martyrs/$slug")({
  loader: async ({ context, params }) => {
    const r = await context.queryClient.ensureQueryData(recipientQuery(params.slug));
    if (!r) throw notFound();
    return { name: fullTitle(r), award: r.awards[0]?.name, unit: r.unit ?? r.regiment, portrait: r.portrait?.url ?? null };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name}${loaderData.award ? `, ${loaderData.award}` : ""} | Veergatha` : "Recipient | Veergatha";
    const desc = loaderData ? `The sourced record of ${loaderData.name}${loaderData.unit ? `, ${loaderData.unit}` : ""}: service, citation, memorials and provenance.` : "";
    const img = loaderData?.portrait ? thumb(loaderData.portrait, 1280) : null;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
    };
  },
  component: RecipientPage,
});

function RecipientPage() {
  const { slug } = Route.useParams();
  const { data: r } = useSuspenseQuery(recipientQuery(slug));
  if (!r) return null;
  const fell = isPosthumous(r);
  const age = ageAt(r.date_of_birth, r.date_of_action);
  const paragraphs = (r.biography ?? "").split(/\n\s*\n/).filter(Boolean);

  return (
    <article>
      {/* Header */}
      <header>
        <div className="mx-auto max-w-7xl px-5 pb-6 pt-10 sm:px-8">
          <Link to="/martyrs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-bronze">
            <ArrowLeft className="h-4 w-4" /> Roll of Honour
          </Link>
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
            <div>
              {/* The clicked portrait on the previous page glides into this one (see morphFrom). Keyed by
                  recipient so moving between records mounts a fresh, named element. */}
              <div key={r.slug} className="overflow-hidden rounded-md border border-bronze/30" data-morph style={{ viewTransitionName: PORTRAIT_MORPH } as CSSProperties}>
                <Portrait media={r.portrait} name={r.full_name} award={r.awards[0]} width={960} eager className="aspect-[4/5] w-full" />
              </div>
              {r.portrait ? (
                <MediaCredit media={r.portrait} className="mt-3" />
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  No portrait with a cleared licence is available. We publish none rather than a likeness that isn't theirs.
                </p>
              )}
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex flex-wrap gap-2">
                {r.awards.map((a) => (
                  <AwardBadge key={a.name} name={a.name} size="lg" posthumous={a.posthumous} />
                ))}
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-bronze-light">{r.rank}</p>
              <h1 className="mt-2 font-display text-6xl font-semibold leading-[0.9] tracking-tight md:text-8xl">{r.full_name}</h1>
              <p className="mt-5 text-lg text-muted-foreground">{r.regiment}</p>

              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-8 md:grid-cols-3">
                <Meta label="Service" value={r.service_branch} />
                <Meta label="Unit" value={r.unit} />
                {r.service_number && <Meta label="Service number" value={r.service_number} />}
                <Meta label="Born" value={formatDate(r.date_of_birth, true)} />
                <Meta label="Home" value={[r.birth_village, r.birth_district, r.birth_state].filter(Boolean).join(", ")} />
                <Meta label={actionDateLabel(r.status)} value={`${formatDate(r.date_of_action, true)}${age != null ? ` · aged ${age}` : ""}`} />
                <Meta label="Place of action" value={r.place_of_action} />
                {r.war && (
                  <div>
                    <dt className="eyebrow text-muted-foreground">Conflict</dt>
                    <dd className="mt-2">
                      <Link to="/wars/$slug" params={{ slug: r.war.slug }} className="font-display text-xl text-foreground hover:text-bronze">
                        {r.war.name}
                      </Link>
                    </dd>
                  </div>
                )}
                {r.operation && <Meta label="Operation" value={r.operation} />}
              </dl>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-20">
          {/* Citation(s) */}
          {r.awards.map((a) => (
            <section key={a.name} aria-labelledby={`cit-${a.name}`}>
              <Eyebrow>{awardContext(a.name)}</Eyebrow>
              <h2 id={`cit-${a.name}`} className="mt-3 font-display text-4xl font-semibold">
                {a.name}
                {a.year && <span className="text-muted-foreground"> · {a.year}</span>}
              </h2>
              {a.citation && (
                <figure className="relative mt-8 rounded-sm bg-parchment p-8 text-parchment-foreground md:p-10">
                  <span className="pointer-events-none absolute left-5 top-2 font-display text-8xl leading-none text-parchment-muted/30">“</span>
                  <blockquote className="relative font-prose text-lg leading-relaxed md:text-xl">{a.citation}</blockquote>
                  <figcaption className="mt-6 border-t border-parchment-muted/30 pt-4 text-xs text-parchment-muted">
                    {a.citation_verbatim ? "Verbatim citation" : "Summary of the official citation. The full text is on the Gallantry Awards Portal"}
                    {a.gazette_ref ? <> · {a.gazette_ref}</> : <> · Gazette notification number awaiting verification</>}
                  </figcaption>
                </figure>
              )}
            </section>
          ))}

          {/* Story */}
          {paragraphs.length > 0 && (
            <section>
              <h2 className="font-display text-4xl font-semibold">Biography</h2>
              <div className="prose-archive mt-8">
                {paragraphs.map((p, i) => (
                  <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-bronze" : ""}>
                    {p}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Memorials */}
          {r.memorials.length > 0 && (
            <section>
              <h2 className="font-display text-4xl font-semibold">{fell ? "Memorialised at" : "Honoured at"}</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {r.memorials.map((m) => (
                  <Link key={m.slug} to="/memorials/$slug" params={{ slug: m.slug }} className="group relative overflow-hidden rounded-md border border-border">
                    {m.hero && <img src={thumb(m.hero.url, 500)} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />}
                    <div className="absolute inset-0 bg-night-fade" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-display text-2xl font-semibold">{m.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {m.city}, {m.state}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* data-related: other people's cards; the wording check skips them. */}
          {r.related.length > 0 && (
            <section data-related>
              <h2 className="font-display text-4xl font-semibold">Also recorded from {r.war?.name}</h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {r.related.map((p) => (
                  <RecipientCard key={p.slug} r={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <SourcesPanel sources={r.sources} recordSlug={r.slug} recordType="recipient" verifiedAt={r.verified_at} />
        </aside>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-display text-xl text-foreground">{value || "Not recorded"}</dd>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { homeQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  AwardBadge,
  Eyebrow,
  MORE_LINK,
  MediaCredit,
  morphFrom,
  Portrait,
  SectionHeading,
  StatusText,
} from "@/components/archive/primitives";
import { RecipientTile } from "@/components/archive/RecipientCard";
import { CONFLICT_TYPE_LABELS, formatDate, fullTitle, isPosthumous, thumb, type ConflictType } from "@/lib/archive";
import { cn } from "@/lib/utils";

// Every homepage section shares one width and one vertical rhythm; sections are
// separated by space alone, never by borders or background bands.
const SECTION = "mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24";

const MemorialMap = lazy(() => import("@/components/archive/MemorialMap").then((m) => ({ default: m.MemorialMap })));

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery()),
  head: () => ({
    meta: [
      { title: "Veergatha | An archive of India's gallantry award recipients" },
      {
        name: "description",
        content:
          "Verified stories of India's Param Vir Chakra, Maha Vir Chakra and Ashoka Chakra recipients, the wars they fought, and the memorials that carry their names.",
      },
      { property: "og:title", content: "Veergatha | An archive of India's gallantry award recipients" },
      {
        property: "og:description",
        content: "From Badgam 1947 to Galwan 2020: sourced profiles of India's bravest, war histories and a national memorial directory.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(homeQuery());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div>
      {/* ------------------------------------------------------------ HERO */}
      {/* The archive in one sentence, beside today's featured recipient: a real face and record on first view.
          The photo's height follows the window so the bust and its caption fit on the first screen together. */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-5 py-16 sm:px-8 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_auto] lg:py-8">
        <div>
          <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Records of India's gallantry award recipients
          </h1>
          <p className="mt-8 max-w-xl font-prose text-lg leading-relaxed text-foreground/80">
            {data.stats.recipients} recipients, {data.stats.conflicts} conflicts and operations
            {data.stats.firstYear && data.stats.lastYear ? ` from ${data.stats.firstYear} to ${data.stats.lastYear}` : ""}, and{" "}
            {data.stats.memorials} war memorials. Each record lists the sources it is based on, so you can check them.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/martyrs">
                Enter the Roll of Honour <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/wars">Explore the conflicts</Link>
            </Button>
          </div>
        </div>

        {data.featured && (
          <figure className="lg:w-min">
            <Link to="/martyrs/$slug" params={{ slug: data.featured.slug }} onClick={morphFrom} className="group block">
              <div className="aspect-[4/5] overflow-hidden rounded-md border border-bronze/30 transition-colors group-hover:border-bronze/70 lg:h-[clamp(20rem,calc(100vh-22rem),34rem)]">
                <Portrait media={data.featured.portrait} name={data.featured.full_name} width={960} eager className="h-full w-full" />
              </div>
            </Link>
            <figcaption className="mt-5">
              <Eyebrow>Featured today</Eyebrow>
              <Link to="/martyrs/$slug" params={{ slug: data.featured.slug }} className="mt-2 block font-display text-3xl font-semibold leading-tight hover:text-bronze-light">
                {fullTitle(data.featured)}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {[data.featured.unit ?? data.featured.regiment, data.featured.war?.name, formatDate(data.featured.date_of_action)].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                {data.featured.awards[0] && <AwardBadge name={data.featured.awards[0].name} posthumous={isPosthumous(data.featured)} />}
                <StatusText status={data.featured.status} />
              </div>
              <MediaCredit media={data.featured.portrait} className="mt-3" />
            </figcaption>
          </figure>
        )}
      </section>

      {/* ------------------------------------------------------ THE TWENTY-ONE */}
      <section className={SECTION}>
        <SectionHeading
          title={
            <>
              The twenty-one <span className="italic text-bronze">Param Vir Chakras</span>
            </>
          }
          action={
            <Link to="/martyrs" search={{ award: "Param Vir Chakra" }} className={MORE_LINK}>
              View all recipients <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <p className="mt-6 max-w-2xl font-prose text-muted-foreground">
          India's highest wartime gallantry award has been conferred twenty-one times since 1950, fourteen of them
          posthumously. Their bronze busts stand at the National War Memorial in New Delhi. Seven recipients survived
          the actions for which they were decorated, and are recorded here as such.
        </p>
        {/* 3 and 7 columns both divide the twenty-one evenly, so no row is left half full. */}
        <div className="mt-14 grid grid-cols-3 gap-x-4 gap-y-8 lg:grid-cols-7">
          {data.pvc.map((p, i) => (
            <RecipientTile key={p.slug} r={p} eager={i < 7} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ TIMELINE */}
      <section className={SECTION}>
        <SectionHeading
          title="Conflicts and operations"
          action={
            <Link to="/wars" className={MORE_LINK}>
              Full timeline <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <ol className="mt-12 divide-y divide-border border-y border-border">
          {data.wars.map((w) => (
            <li key={w.slug}>
              <Link
                to="/wars/$slug"
                params={{ slug: w.slug }}
                className="group grid gap-x-8 gap-y-1 py-5 sm:grid-cols-[12rem_1fr_auto] sm:items-baseline"
              >
                <span className="whitespace-nowrap font-display text-2xl font-semibold text-bronze">{w.period_label}</span>
                <span>
                  <span className="block font-display text-2xl font-semibold leading-tight group-hover:text-bronze-light">{w.name}</span>
                  <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {CONFLICT_TYPE_LABELS[w.type as ConflictType]}
                  </span>
                </span>
                <span className="whitespace-nowrap text-sm text-muted-foreground">
                  {w.count} {w.count === 1 ? "profile" : "profiles"}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------ MEMORIALS */}
      <section className={SECTION}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div>
            <SectionHeading title="War memorials" />
            <p className="mt-6 max-w-lg font-prose text-muted-foreground">
              {data.stats.memorials} memorials, from the National War Memorial in New Delhi to Tawang and Rezang La,
              each with its location on the map and openly licensed photographs.
            </p>
            <ul className="mt-10 space-y-px overflow-hidden rounded-md border border-border">
              {data.memorials.slice(0, 5).map((m) => (
                <li key={m.slug}>
                  <Link to="/memorials/$slug" params={{ slug: m.slug }} className="group flex items-center gap-4 bg-card p-3 transition hover:bg-secondary">
                    {m.hero && <img src={thumb(m.hero.url, 330)} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded-sm object-cover" />}
                    <div className="min-w-0">
                      <p className="truncate font-display text-xl font-semibold group-hover:text-bronze-light">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.city}, {m.state}
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-bronze" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/memorials" className={cn(MORE_LINK, "mt-8")}>
              Open the full directory and map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-md border border-border">
            {mounted ? (
              <Suspense fallback={<div className="h-full w-full bg-night" />}>
                <MemorialMap points={data.memorials} className="absolute inset-0" />
              </Suspense>
            ) : (
              <div className="absolute inset-0 bg-night" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

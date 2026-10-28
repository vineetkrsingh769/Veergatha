import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { actionDateLabel, formatDate, type RecipientSummary } from "@/lib/archive";
import { AwardBadge, morphFrom, Portrait, StatusBadge, StatusText } from "./primitives";

/**
 * Card for grids. The photo stays clear of text and badges; everything written
 * sits underneath it, and no line is allowed to break inside a label.
 */
export function RecipientCard({ r, className, eager }: { r: RecipientSummary; className?: string; eager?: boolean }) {
  const award = r.awards[0];
  return (
    <Link
      to="/martyrs/$slug"
      params={{ slug: r.slug }}
      onClick={morphFrom}
      className={cn(
        "group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-bronze/50",
        className,
      )}
    >
      <Portrait media={r.portrait} name={r.full_name} award={award} eager={eager ?? false} className="aspect-[4/5] w-full" />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="pt-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-bronze-light/90">{r.rank}</p>
          {award && <AwardBadge name={award.name} className="shrink-0" />}
        </div>
        <h3 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-foreground group-hover:text-bronze-light">
          {r.full_name}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{r.unit ?? r.regiment}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-4">
          <StatusText status={r.status} />
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            <span className="sr-only">{actionDateLabel(r.status)} </span>
            {formatDate(r.date_of_action)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Compact tile for a set that shares one award, such as the twenty-one Param Vir Chakras. */
export function RecipientTile({ r, eager }: { r: RecipientSummary; eager?: boolean }) {
  return (
    <Link to="/martyrs/$slug" params={{ slug: r.slug }} onClick={morphFrom} className="group flex flex-col">
      <Portrait
        media={r.portrait}
        name={r.full_name}
        award={r.awards[0]}
        width={330}
        eager={eager ?? false}
        initialsClassName="text-3xl"
        className="aspect-[4/5] w-full rounded-md border border-border transition-colors group-hover:border-bronze/50"
      />
      <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-bronze-light/90">{r.rank}</p>
      <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-foreground group-hover:text-bronze-light">
        {r.full_name}
      </h3>
      <StatusText status={r.status} className="mt-2" />
    </Link>
  );
}

/** Dense row for lists and search results. */
export function RecipientRow({ r }: { r: RecipientSummary }) {
  const award = r.awards[0];
  return (
    <Link
      to="/martyrs/$slug"
      params={{ slug: r.slug }}
      onClick={morphFrom}
      className="group flex items-center gap-4 border-b border-border/70 py-4 transition hover:bg-secondary/40 sm:px-3"
    >
      <Portrait media={r.portrait} name={r.full_name} width={330} initialsClassName="text-xl" className="h-16 w-14 shrink-0 rounded-sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-xl font-semibold leading-tight group-hover:text-bronze-light">
            {r.rank} {r.full_name}
          </h3>
          {award && <AwardBadge name={award.name} />}
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {[r.unit ?? r.regiment, r.war?.name, r.birth_state].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <StatusBadge status={r.status} />
        <span className="text-xs text-muted-foreground">{formatDate(r.date_of_action)}</span>
      </div>
    </Link>
  );
}

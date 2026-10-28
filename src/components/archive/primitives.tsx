import { Link } from "@tanstack/react-router";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import emblemUrl from "@/assets/veergatha-emblem.png";
import { cn } from "@/lib/utils";
import {
  AWARD_SHORT,
  LICENSE_LABELS,
  initials,
  statusLabel,
  thumb,
  type MediaItem,
  type SourceRef,
} from "@/lib/archive";
import { ExternalLink, ShieldCheck } from "lucide-react";

export function Emblem({ className }: { className?: string }) {
  return <img src={emblemUrl}alt="Veergatha emblem" className={cn("select-none", className)} draggable={false} />;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

/** The view-transition name shared by a clicked portrait and the portrait on the recipient's page. */
export const PORTRAIT_MORPH = "recipient-portrait";

/**
 * Click handler for links to a recipient: names the clicked portrait so it glides into the
 * portrait on the recipient's page. Only the clicked one is named, because the same person can
 * appear twice on a page and a duplicated name cancels the transition.
 */
export function morphFrom(e: MouseEvent<HTMLElement>) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  for (const el of document.querySelectorAll<HTMLElement>("[data-morph]")) {
    el.style.removeProperty("view-transition-name");
    el.removeAttribute("data-morph");
  }
  const portrait = e.currentTarget.querySelector<HTMLElement>("img, [role='img']");
  if (!portrait) return;
  portrait.setAttribute("data-morph", "");
  portrait.style.setProperty("view-transition-name", PORTRAIT_MORPH);
}

/** The one style for "see more" links that lead on to a fuller page; pair with an ArrowRight icon. */
export const MORE_LINK = "inline-flex items-center gap-2 text-sm font-semibold text-bronze underline-offset-4 hover:underline";

/** The one style for filter toggles: decades, states, gallery categories. */
export function FilterChip({
  active,
  className,
  ...props
}: { active: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "rounded-sm border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-bronze bg-bronze/15 text-bronze-light"
          : "border-border text-muted-foreground hover:border-bronze/50 hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={className}>
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 md:pb-14 md:pt-24">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
          {title}
        </h1>
        {intro && <p className="mt-6 max-w-2xl font-prose text-lg leading-relaxed text-muted-foreground">{intro}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-3 font-display text-4xl font-semibold leading-none tracking-tight text-foreground md:text-5xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status, className }: { status: string | null | undefined; className?: string }) {
  const tone =
    status === "fell-in-action"
      ? "border-fallen/40 bg-fallen/10 text-fallen"
      : status === "survived"
        ? "border-survived/40 bg-survived/10 text-survived"
        : "border-border bg-secondary text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em]",
        tone,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "fell-in-action" ? "bg-fallen" : status === "survived" ? "bg-survived" : "bg-muted-foreground")} />
      {statusLabel(status)}
    </span>
  );
}

/** Status as one line of coloured text, for cards and tiles where a boxed badge would wrap. */
export function StatusText({ status, className }: { status: string | null | undefined; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium",
        status === "fell-in-action" ? "text-fallen" : status === "survived" ? "text-survived" : "text-muted-foreground",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}

export function AwardBadge({
  name,
  posthumous,
  size = "sm",
  className,
}: {
  name: string;
  posthumous?: boolean;
  size?: "sm" | "lg";
  className?: string;
}) {
  const supreme = name === "Param Vir Chakra" || name === "Ashoka Chakra";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border font-semibold uppercase",
        supreme ? "border-bronze/60 bg-bronze/15 text-bronze-light" : "border-border bg-secondary text-foreground/85",
        size === "lg" ? "px-3 py-1.5 text-xs tracking-[0.18em]" : "px-2 py-0.5 text-[0.65rem] tracking-[0.16em]",
        className,
      )}
      title={name}
    >
      <ChakraMark className={size === "lg" ? "h-4 w-4" : "h-3 w-3"} />
      {size === "lg" ? name : (AWARD_SHORT[name] ?? name)}
      {posthumous && <span className="font-normal normal-case tracking-normal text-muted-foreground">(posthumous)</span>}
    </span>
  );
}

/** A small 24-spoke chakra, drawn rather than imported, used as the award mark. */
export function ChakraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 24;
        return (
          <line
            key={i}
            x1={12 + Math.cos(a) * 2.6}
            y1={12 + Math.sin(a) * 2.6}
            x2={12 + Math.cos(a) * 9.6}
            y2={12 + Math.sin(a) * 9.6}
            stroke="currentColor"
            strokeWidth="0.6"
          />
        );
      })}
    </svg>
  );
}

export function Portrait({
  media,
  name,
  award,
  className,
  initialsClassName = "text-5xl",
  width = 500,
  eager,
}: {
  media: MediaItem | null | undefined;
  name: string;
  /** When there is no cleared portrait, show this award and year in type instead of initials. */
  award?: { name: string; year: number | null } | null | undefined;
  className?: string;
  /** Size of the initials shown when there is no cleared portrait and no award. */
  initialsClassName?: string;
  width?: 330 | 500 | 960 | 1280;
  eager?: boolean;
}) {
  if (!media && award) {
    return (
      <div
        className={cn("flex flex-col items-center justify-center bg-secondary px-6 text-center", className)}
        aria-label={`No cleared portrait of ${name}`}
        role="img"
      >
        <ChakraMark className="h-10 w-10 text-bronze/60" />
        <p className="mt-4 font-display text-2xl font-semibold leading-tight text-bronze-light">{award.name}</p>
        {award.year && <p className="mt-1 text-sm tabular-nums text-muted-foreground">{award.year}</p>}
      </div>
    );
  }
  if (!media) {
    return (
      <div
        className={cn("flex items-center justify-center bg-secondary", className)}
        aria-label={`No cleared portrait of ${name}`}
        role="img"
      >
        <span className={cn("font-display font-semibold text-bronze/60", initialsClassName)}>{initials(name)}</span>
      </div>
    );
  }
  return (
    <img
      src={thumb(media.url, width)}
      alt={media.title}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("object-cover", className)}
    />
  );
}

export function MediaCredit({ media, className }: { media: MediaItem | null | undefined; className?: string }) {
  if (!media) return null;
  return (
    <p className={cn("text-[0.7rem] leading-snug text-muted-foreground", className)}>
      {media.credit && <>Photo: {media.credit} · </>}
      {media.license_detail ?? LICENSE_LABELS[media.license]}
      {media.source_url && (
        <>
          {" · "}
          <a href={media.source_url} target="_blank" rel="noreferrer" className="underline decoration-bronze/40 underline-offset-2 hover:text-bronze">
            Source
          </a>
        </>
      )}
    </p>
  );
}

/**
 * A wide, unobscured opening photograph for a place, like a film's establishing shot:
 * edge to edge, nothing laid over it, the credit beneath. Its height follows the window
 * so the page title below still shows on the first screen.
 */
export function EstablishingShot({ media }: { media: MediaItem }) {
  return (
    <figure>
      <img src={thumb(media.url, 1920)} alt={media.title} className="h-[clamp(16rem,calc(100vh-22rem),40rem)] w-full object-cover" />
      <figcaption className="mx-auto max-w-7xl px-5 sm:px-8">
        <MediaCredit media={media} className="mt-3" />
      </figcaption>
    </figure>
  );
}

export function SourcesPanel({
  sources,
  recordSlug,
  recordType,
  verifiedAt,
}: {
  sources: SourceRef[];
  recordSlug: string;
  recordType: "recipient" | "memorial" | "conflict";
  verifiedAt?: string | null;
}) {
  return (
    <section className="rounded-md border border-border bg-card/60 p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-survived" />
        <p className="eyebrow text-foreground">Provenance</p>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Every published record must be backed by at least one primary source.
        {verifiedAt && <> Verified by the editorial desk on {new Date(verifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.</>}
      </p>
      <ul className="mt-5 space-y-3">
        {sources.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span
              className={cn(
                "mt-0.5 h-fit shrink-0 rounded-sm px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider",
                s.tier === "primary" ? "bg-bronze/15 text-bronze-light" : "bg-secondary text-muted-foreground",
              )}
            >
              {s.tier}
            </span>
            <div className="min-w-0">
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground hover:text-bronze">
                  {s.title} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="font-medium text-foreground">{s.title}</span>
              )}
              <p className="text-xs text-muted-foreground">
                {s.publisher}
                {s.field && <> · supports {s.field}</>}
                {s.accessed && <> · accessed {s.accessed}</>}
                {s.archived && (
                  <>
                    {" · "}
                    <a href={s.archived} target="_blank" rel="noreferrer" className="underline hover:text-bronze">
                      archived copy
                    </a>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-border pt-4 text-sm">
        Spotted an error?{" "}
        <Link to="/corrections" search={{ record: recordSlug, type: recordType }} className="font-semibold text-bronze hover:underline">
          Submit a correction with your source
        </Link>
      </div>
    </section>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border px-6 py-16 text-center">
      <ChakraMark className="h-10 w-10 text-bronze/50" />
      <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
      {children && <div className="mt-2 max-w-md text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function Stat({ value, label, className }: { value: ReactNode; label: string; className?: string }) {
  return (
    <div className={cn("", className)}>
      <div className="font-display text-5xl font-semibold leading-none text-bronze md:text-6xl">{value}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}

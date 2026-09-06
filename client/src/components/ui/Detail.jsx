import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

/** Shared chrome for the three detail pages, which were near-identical markup. */

export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-accent-deep"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}

export function Pill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-label font-semibold uppercase tracking-wide text-accent-deep">
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}

/**
 * `media` and `accent` are optional. MemorialDetail and WarDetail pass neither
 * and render exactly as before; the recipient profile passes both.
 *
 * `children` deliberately sits OUTSIDE the media grid, spanning the full panel
 * width. That keeps the metadata grid on one alignment instead of squeezing it
 * into the narrow column beside a portrait.
 */
export function DetailPanel({ pill, title, lede, aside, media, accent, children }) {
  const head = (
    <div className="flex min-w-0 flex-col gap-3">
      {(pill || aside) && (
        <div className="flex flex-wrap items-center gap-2">
          {pill}
          {aside}
        </div>
      )}
      {/* break-words so a single very long name cannot push the panel wider */}
      <h1 className="font-display text-display font-bold leading-tight text-tiranga-700 break-words">
        {title}
      </h1>
      {accent}
      {lede && <p className="max-w-reading text-body leading-relaxed text-ink-700">{lede}</p>}
    </div>
  );

  return (
    <div className="space-y-5 rounded-2xl border border-rule-strong bg-raised p-7 shadow-xs">
      {media ? (
        <div className="grid grid-cols-[13.75rem_minmax(0,1fr)] items-start gap-7">
          {media}
          {head}
        </div>
      ) : (
        head
      )}
      {children}
    </div>
  );
}

/**
 * Portrait, or the absence of one.
 *
 * No record in the archive currently has a photograph, so the placeholder is
 * the default path rather than an edge case — it is a monogram in the serif
 * face on a flat ground, not a grey silhouette. A silhouette says "missing
 * avatar"; a monogram and a stated absence say "no photograph on record", which
 * is the true and more dignified claim.
 *
 * A real portrait is presented plainly: no drop shadow, no circular crop, no
 * hover zoom. Credit is rendered when present because the open licences the
 * upload pipeline accepts (GODL-India, CC-BY) require attribution.
 */
export function Portrait({ src, alt, credit, initials }) {
  const frame = "aspect-[3/4] w-full rounded-frame border border-rule-strong";

  if (!src) {
    return (
      <figure className="m-0">
        <div
          className={`${frame} flex items-center justify-center bg-sunken`}
          aria-hidden="true"
        >
          <span className="font-display text-display font-bold text-faint">{initials}</span>
        </div>
        <figcaption className="mt-2 text-caption text-muted">
          No photograph on record
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="m-0">
      <img src={src} alt={alt} className={`${frame} object-cover`} />
      {credit && <figcaption className="mt-2 text-caption text-muted">{credit}</figcaption>}
    </figure>
  );
}

/** Three-column definition grid. Desktop-only layout. */
export function MetaGrid({ children }) {
  return (
    <dl className="grid grid-cols-3 gap-4 border-t border-rule pt-4 text-label">
      {children}
    </dl>
  );
}

export function MetaItem({ icon: Icon, label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" aria-hidden="true" />}
      <div className="min-w-0">
        <dt className="text-caption font-semibold uppercase tracking-wide text-muted">{label}</dt>
        <dd className="text-ink-700">{value}</dd>
      </div>
    </div>
  );
}

/** A linked person in a "documented here" list. */
export function PersonLink({ to, name, detail, accent = false }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-xl border border-rule-strong bg-raised p-4 transition-colors hover:border-accent/60 hover:bg-sunken"
    >
      <span className="min-w-0">
        <span className="block truncate text-body font-semibold text-ink">{name}</span>
        {detail && (
          <span
            className={`mt-0.5 block truncate text-label ${accent ? "font-semibold text-accent-deep" : "text-muted"}`}
          >
            {detail}
          </span>
        )}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
    </Link>
  );
}

export function PersonGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

export function NotFound({ message, backTo, backLabel }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center">
      <p className="text-body text-danger">{message}</p>
      <Link
        to={backTo}
        className="inline-block text-label font-medium text-accent-deep underline underline-offset-2"
      >
        ← {backLabel}
      </Link>
    </div>
  );
}

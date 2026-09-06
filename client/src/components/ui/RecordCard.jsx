import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import SpotlightCard from "../reactbits/SpotlightCard";

/**
 * The card shared by every directory page. Recipients, memorials and conflicts
 * were three copies of the same markup in different colours; the only real
 * differences are the badge slot and the footer text, so those are props.
 */
export function RecordCard({
  to,
  icon: Icon,
  badge,
  title,
  description,
  meta,
  metaIcon: MetaIcon,
  actionLabel = "View",
}) {
  return (
    <Link to={to} className="group block">
      <SpotlightCard className="flex h-full flex-col justify-between gap-4">
        <div className="space-y-3">
          {(Icon || badge) && (
            <div className="flex items-start justify-between gap-2">
              {Icon ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent-deep">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              ) : (
                <span />
              )}
              {badge}
            </div>
          )}

          <div>
            <h3 className="font-display text-title font-bold text-ink transition-colors group-hover:text-accent-deep">
              {title}
            </h3>
            {description && (
              <p className="mt-1 line-clamp-2 text-label text-muted">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-rule pt-3 text-label text-muted">
          <span className="flex min-w-0 items-center gap-1">
            {MetaIcon && (
              <MetaIcon className="h-3.5 w-3.5 shrink-0 text-accent-deep" aria-hidden="true" />
            )}
            <span className="truncate">{meta}</span>
          </span>
          <span className="flex shrink-0 items-center gap-0.5 font-bold text-accent-deep">
            {actionLabel}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </SpotlightCard>
    </Link>
  );
}

/** Card grid used by all three directories. Desktop-only layout. */
export function CardGrid({ children, columns = 3 }) {
  const cols = columns === 2 ? "grid-cols-2" : "grid-cols-3";
  return <div className={`grid gap-4 ${cols}`}>{children}</div>;
}

/** Neutral pill for taxonomy values such as conflict type. */
export function TypePill({ children }) {
  if (!children) return null;
  return (
    <span className="rounded border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-caption font-bold uppercase tracking-wider text-accent-deep">
      {children}
    </span>
  );
}

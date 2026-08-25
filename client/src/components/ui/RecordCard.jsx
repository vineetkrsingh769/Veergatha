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
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D96B27]/25 bg-[#D96B27]/10 text-[#C25016]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              ) : (
                <span />
              )}
              {badge}
            </div>
          )}

          <div>
            <h3 className="font-display text-xl font-bold text-[#1A241A] transition-colors group-hover:text-[#D96B27]">
              {title}
            </h3>
            {description && (
              <p className="mt-1 line-clamp-2 text-xs text-stone-600">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-stone-200 pt-3 text-xs text-stone-600">
          <span className="flex min-w-0 items-center gap-1">
            {MetaIcon && (
              <MetaIcon className="h-3.5 w-3.5 shrink-0 text-[#D96B27]" aria-hidden="true" />
            )}
            <span className="truncate">{meta}</span>
          </span>
          <span className="flex shrink-0 items-center gap-0.5 font-bold text-[#D96B27]">
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
    <span className="rounded border border-[#D96B27]/30 bg-[#D96B27]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C25016]">
      {children}
    </span>
  );
}

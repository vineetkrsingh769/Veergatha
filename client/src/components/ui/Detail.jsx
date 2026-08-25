import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

/** Shared chrome for the three detail pages, which were near-identical markup. */

export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-[#D96B27]"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}

export function Pill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#D96B27]/30 bg-[#D96B27]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#C25016]">
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function DetailPanel({ pill, title, lede, aside, children }) {
  return (
    <div className="space-y-5 rounded-2xl border border-stone-300 bg-white/85 p-5 shadow-xs sm:p-7">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {pill}
          {aside}
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight text-[#1E431B] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {lede && <p className="max-w-3xl text-sm leading-relaxed text-stone-700">{lede}</p>}
      </div>
      {children}
    </div>
  );
}

/** Responsive definition grid. Collapses to one column on narrow screens. */
export function MetaGrid({ children }) {
  return (
    <dl className="grid grid-cols-1 gap-4 border-t border-stone-200 pt-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </dl>
  );
}

export function MetaItem({ icon: Icon, label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#D96B27]" aria-hidden="true" />}
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">{label}</dt>
        <dd className="text-stone-800">{value}</dd>
      </div>
    </div>
  );
}

/** A linked person in a "documented here" list. */
export function PersonLink({ to, name, detail, accent = false }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-xl border border-stone-300 bg-white/70 p-4 transition-colors hover:border-[#D96B27]/60 hover:bg-white"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-[#1A241A]">{name}</span>
        {detail && (
          <span
            className={`mt-0.5 block truncate text-xs ${accent ? "font-semibold text-[#C25016]" : "text-stone-600"}`}
          >
            {detail}
          </span>
        )}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
    </Link>
  );
}

export function PersonGrid({ children }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

export function NotFound({ message, backTo, backLabel }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center">
      <p className="text-sm text-rose-700">{message}</p>
      <Link
        to={backTo}
        className="inline-block text-xs font-medium text-[#C25016] underline underline-offset-2"
      >
        ← {backLabel}
      </Link>
    </div>
  );
}

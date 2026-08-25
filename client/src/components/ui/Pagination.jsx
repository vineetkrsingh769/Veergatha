import { ChevronLeft, ChevronRight } from "lucide-react";

const BTN =
  "inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * `meta` is the { total, page, limit, pages } envelope the API returns.
 * Renders nothing for a single page, so callers don't need the guard.
 */
export function Pagination({ meta, onChange }) {
  if (!meta || meta.pages <= 1) return null;

  const { page, pages, total } = meta;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-between"
    >
      <p className="text-xs text-stone-500">
        Page <span className="font-semibold text-stone-700">{page}</span> of {pages}
        <span className="hidden sm:inline"> · {total} records</span>
      </p>

      <div className="flex items-center gap-2">
        <button type="button" className={BTN} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Previous
        </button>
        <button
          type="button"
          className={BTN}
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

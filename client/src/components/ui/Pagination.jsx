import { ChevronLeft, ChevronRight } from "lucide-react";

const BTN =
  "inline-flex items-center gap-1 rounded-lg border border-rule-strong bg-raised px-3 py-2 text-label font-medium text-ink-700 transition-colors hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep";

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
      className="flex flex-row items-center justify-between gap-3 pt-4"
    >
      <p className="text-label text-muted">
        Page <span className="font-semibold text-ink-700">{page}</span> of {pages}
        <span> · {total} records</span>
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

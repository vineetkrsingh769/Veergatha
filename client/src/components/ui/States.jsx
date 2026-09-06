import { AlertCircle, Inbox, Loader2 } from "lucide-react";

/**
 * The three states every data page needs. Previously each page inlined its own
 * copy, which is why half of them still carried dark-theme text classes on the
 * parchment background.
 */

export function Loading({ label = "Loading records…", className = "" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-16 text-muted ${className}`}
    >
      <Loader2 className="h-5 w-5 animate-spin text-accent-deep" aria-hidden="true" />
      <span className="text-body">{label}</span>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry, className = "" }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 rounded-xl border border-danger-rule bg-danger-bg/80 px-6 py-12 text-center ${className}`}
    >
      <AlertCircle className="h-5 w-5 text-danger" aria-hidden="true" />
      <p className="text-body text-danger">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-danger-rule bg-raised px-4 py-2 text-label font-semibold text-danger transition-colors hover:bg-danger-bg"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  hint,
  icon: Icon = Inbox,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl border border-rule-strong/80 bg-raised px-6 py-16 text-center ${className}`}
    >
      <Icon className="h-5 w-5 text-faint" aria-hidden="true" />
      <p className="text-body font-medium text-ink-700">{title}</p>
      {hint && <p className="max-w-sm text-label text-muted">{hint}</p>}
    </div>
  );
}

/**
 * Renders the right state for a useApi() result, or the children once data is
 * ready. Collapses the loading/error/empty ladder each page was repeating.
 */
export function AsyncBoundary({
  loading,
  error,
  onRetry,
  isEmpty = false,
  loadingLabel,
  emptyTitle,
  emptyHint,
  children,
}) {
  if (loading) return <Loading label={loadingLabel} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState title={emptyTitle} hint={emptyHint} />;
  return children;
}

import { Link } from "react-router-dom";
import { CheckCircle2, ExternalLink, PenLine } from "lucide-react";

import { formatDate } from "../../lib/format.js";

const LINK =
  "inline-flex items-baseline gap-1 rounded-control font-semibold text-accent-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep";

/**
 * How a record was built, and how to challenge it.
 *
 * Renders on EVERY profile, including one with no sources at all. Omitting the
 * section for an unsourced record would make it look identical to a
 * well-sourced one, which is the opposite of what an archive should do.
 */
export function ProvenanceFooter({ sources = [], verificationStatus, updatedAt, recordSlug }) {
  /*
   * Both halves checked independently. The Mongoose model refuses to let a
   * record reach 'verified' without at least one tier:'primary' source, so
   * these should never disagree — and if the data ever drifts, the badge
   * disappears rather than asserting something the sources on screen do not
   * support.
   */
  const verified = verificationStatus === "verified";
  const hasPrimary = sources.some((s) => s.tier === "primary");

  return (
    <>
      {verified && hasPrimary && (
        <p className="inline-flex items-center gap-2 rounded-control border border-success-rule bg-success-bg px-3 py-1.5 text-label font-semibold text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Verified from a primary source
        </p>
      )}

      {sources.length > 0 ? (
        <>
          <p className="max-w-measure text-body text-muted">
            Each field below names the specific document it came from, so any claim on this
            page can be checked against its source.
          </p>

          {/*
           * A definition list, because that is literally the shape: field → the
           * document backing it. Per-field attribution answers "where did this
           * date come from?", which a flat reading list cannot.
           */}
          <dl className="divide-y divide-rule rounded-panel border border-rule-strong bg-raised">
            {sources.map((source, idx) => (
              <div
                key={`${source.field}-${source.title}-${idx}`}
                className="grid grid-cols-[14rem_minmax(0,1fr)] gap-6 p-4"
              >
                <dt className="font-mono text-caption text-accent-deep">{source.field}</dt>
                <dd className="min-w-0 space-y-1">
                  <p className="text-body font-semibold text-ink">
                    {source.title}
                    {source.publisher && (
                      <span className="font-normal text-muted"> · {source.publisher}</span>
                    )}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted">
                    <span
                      className={
                        source.tier === "primary"
                          ? "rounded-control border border-success-rule bg-success-bg px-1.5 py-0.5 font-bold uppercase tracking-wide text-success"
                          : "rounded-control border border-rule-strong bg-sunken px-1.5 py-0.5 font-bold uppercase tracking-wide text-ink-700"
                      }
                    >
                      {source.tier}
                    </span>
                    {source.accessedAt && <span>Accessed {formatDate(source.accessedAt)}</span>}
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK}
                      >
                        View source
                        <ExternalLink className="h-3 w-3 self-center" aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="rounded-panel border border-dashed border-rule-strong bg-sunken p-panel text-body text-muted">
          No sources recorded against this entry yet.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-rule pt-4 text-caption text-muted">
        <p>
          {updatedAt ? (
            <>Record last updated {formatDate(updatedAt)}</>
          ) : (
            <>Last updated date not recorded</>
          )}
        </p>
        <Link
          to={
            recordSlug
              ? `/corrections?record=${encodeURIComponent(recordSlug)}`
              : "/corrections"
          }
          className={LINK}
        >
          <PenLine className="h-3.5 w-3.5 self-center" aria-hidden="true" />
          Spotted an error? Submit a correction
        </Link>
      </div>
    </>
  );
}

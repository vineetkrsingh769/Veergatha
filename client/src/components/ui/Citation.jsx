import { ExternalLink } from "lucide-react";

/**
 * A gazette citation, reproduced verbatim.
 *
 * Three deliberate choices, all about making this read as a quoted document
 * rather than as site prose:
 *
 * MONO. Every other block of text on the site is serif (prose, names) or sans
 * (chrome, metadata). Monospace is used nowhere else at length, so it carries
 * the whole "this is a transcript, not our words" signal on its own. It
 * replaced a serif-italic blockquote, which read as a pull quote — the visual
 * grammar of emphasis, exactly wrong for a primary source.
 *
 * NO TRUNCATION OF ANY KIND. No line-clamp, no max-height, no "read more", no
 * overflow container. A citation is a legal notification; abbreviating it to
 * fit a layout changes what the archive is claiming. Long citations simply
 * flow down the page.
 *
 * whitespace-pre-line. Preserves paragraph breaks that exist in the source
 * document while still wrapping normally. Collapsing them would silently
 * reformat the text.
 */
export function CitationBlock({ citation, gazetteRef, source }) {
  return (
    <section aria-label="Gazette citation">
      <h4 className="text-caption font-bold uppercase tracking-[0.15em] text-accent-deep">
        Gazette citation
      </h4>

      {citation ? (
        <blockquote className="mt-2 rounded-panel border border-rule-strong border-l-2 border-l-accent bg-sunken p-panel">
          <p className="max-w-reading whitespace-pre-line font-mono text-body leading-relaxed text-ink">
            {citation}
          </p>
        </blockquote>
      ) : (
        // An absence is stated, never left as an empty panel. A blank box reads
        // as a rendering fault; this reads as a fact about the record.
        <p className="mt-2 rounded-panel border border-dashed border-rule-strong bg-sunken p-panel text-body text-muted">
          No gazette citation on record.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {/*
         * gazetteRef is a single free-text reference that already carries the
         * publication, the notification date and the number — e.g. "Gazette of
         * India, 15 Aug 1999, No. 42-Pres/99". It is rendered whole rather than
         * split into fields: parsing a citation reference to reformat it is a
         * good way to misattribute one.
         */}
        {gazetteRef ? (
          <p className="font-mono text-caption text-muted">{gazetteRef}</p>
        ) : (
          <p className="text-caption text-muted">No gazette reference on record.</p>
        )}

        {source?.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-baseline gap-1 rounded-control text-caption font-semibold text-accent-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
          >
            {source.title || "View source"}
            <ExternalLink className="h-3 w-3 self-center" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </section>
  );
}

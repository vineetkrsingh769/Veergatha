import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, X } from "lucide-react";

import { fetchMedia } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { recordId } from "../lib/format";
import { AsyncBoundary, PageContainer, PageHeader, Pagination } from "../components/ui";

/** Licences that oblige us to display the credit line, not merely store it. */
const ATTRIBUTION_REQUIRED = new Set(["GODL-India", "CC-BY", "CC-BY-SA"]);

function subjectOf(item) {
  const { martyr, memorial, war } = item.linkedTo ?? {};
  if (martyr) return { label: martyr.fullName, to: `/martyrs/${martyr.slug}` };
  if (memorial) return { label: memorial.name, to: `/memorials/${memorial.slug}` };
  if (war) return { label: war.name, to: `/wars/${war.slug}` };
  return null;
}

function Lightbox({ item, onClose }) {
  const subject = subjectOf(item);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title || "Archive image"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-stone-300 bg-[#FAF7F2] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-300 px-5 py-3">
          <h2 className="font-display text-lg font-bold text-[#1E431B]">
            {item.title || "Untitled"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-stone-400 transition-colors hover:text-stone-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center bg-stone-100 p-4">
          <img
            src={item.cloudinary?.secureUrl}
            alt={item.description || item.title || ""}
            className="max-h-[60vh] w-auto object-contain"
          />
        </div>

        <div className="space-y-2 border-t border-stone-300 px-5 py-4 text-xs">
          {item.description && <p className="text-stone-700">{item.description}</p>}

          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-stone-600">
            {item.credit && (
              <div className="flex gap-1.5">
                <dt className="font-semibold text-stone-500">Credit:</dt>
                <dd>{item.credit}</dd>
              </div>
            )}
            <div className="flex gap-1.5">
              <dt className="font-semibold text-stone-500">Licence:</dt>
              <dd>{item.license}</dd>
            </div>
            {subject && (
              <div className="flex gap-1.5">
                <dt className="font-semibold text-stone-500">Subject:</dt>
                <dd>
                  <Link to={subject.to} className="font-semibold text-[#C25016] hover:underline">
                    {subject.label}
                  </Link>
                </dd>
              </div>
            )}
          </dl>

          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#C25016] hover:underline"
            >
              Original source
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [page, setPage] = useState(1);
  const [active, setActive] = useState(null);

  const { data, loading, error, refetch } = useApi(() => fetchMedia({ page, limit: 24 }), [page]);

  const media = data?.media ?? [];

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Photograph &amp; Document Archive"
        subtitle="Images and scans held in the archive. Every item carries its licence and, where required, its attribution."
      />

      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={refetch}
        loadingLabel="Loading the gallery…"
        isEmpty={media.length === 0}
        emptyTitle="No media published yet"
        emptyHint="Images appear here once an editor has uploaded them with a cleared licence and marked them verified."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {media.map((item) => (
              <button
                key={recordId(item)}
                type="button"
                onClick={() => setActive(item)}
                className="group overflow-hidden rounded-xl border border-stone-300 bg-white/70 text-left transition-colors hover:border-[#D96B27]/60"
              >
                <span className="block aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={item.cloudinary?.secureUrl}
                    alt={item.description || item.title || ""}
                    loading="lazy"
                    width={item.cloudinary?.width}
                    height={item.cloudinary?.height}
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                  />
                </span>

                <span className="block space-y-1 p-3">
                  <span className="block truncate text-sm font-semibold text-[#1A241A]">
                    {item.title || "Untitled"}
                  </span>
                  {/* GODL-India and the CC licences require the credit to be shown,
                      not just recorded — so it sits on the card, not only in the modal. */}
                  {ATTRIBUTION_REQUIRED.has(item.license) && item.credit && (
                    <span className="block truncate text-[11px] text-stone-500">{item.credit}</span>
                  )}
                  <span className="inline-block rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600">
                    {item.license}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <Pagination meta={data?.meta} onChange={setPage} />
        </div>
      </AsyncBoundary>

      {active && <Lightbox item={active} onClose={() => setActive(null)} />}
    </PageContainer>
  );
}

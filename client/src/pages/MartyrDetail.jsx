import { useParams } from "react-router-dom";
import {
  Award,
  Landmark,
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle2,
  Swords,
} from "lucide-react";

import { fetchMartyrBySlug } from "../lib/api";
import { useApi } from "../hooks/useApi";
import {
  birthplaceOf,
  displayName,
  formatDate,
  isPosthumous,
  memorialLocation,
  recordId,
} from "../lib/format";
import {
  BackLink,
  DetailPanel,
  Loading,
  MetaGrid,
  MetaItem,
  NotFound,
  PageContainer,
  PersonGrid,
  PersonLink,
  Pill,
  Section,
  StatusBadge,
} from "../components/ui";

export default function MartyrDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useApi(() => fetchMartyrBySlug(slug), [slug]);
  const martyr = data?.martyr;

  if (loading) return <Loading label="Loading recipient profile…" />;

  if (error || !martyr) {
    return (
      <NotFound
        message={error || "Record not found."}
        backTo="/martyrs"
        backLabel="Return to Recipients Directory"
      />
    );
  }

  const awards = martyr.awards ?? [];
  const memorials = martyr.memorials ?? [];
  const sources = martyr.sources ?? [];

  // Never invent a conflict. An unlinked record shows an em dash, not a guess.
  const conflict = martyr.war?.name || martyr.operation || "—";

  return (
    <PageContainer width="medium" className="space-y-8">
      <BackLink to="/martyrs">Back to Recipients</BackLink>

      <DetailPanel
        pill={<Pill>{martyr.serviceBranch}</Pill>}
        aside={<StatusBadge status={martyr.status} />}
        title={displayName(martyr)}
        lede={
          martyr.regiment
            ? `${martyr.regiment}${martyr.unit ? ` (${martyr.unit})` : ""}`
            : martyr.unit
        }
      >
        {martyr.serviceNumber && (
          <p className="font-mono text-xs text-stone-600">
            Service No: <span className="font-semibold text-stone-800">{martyr.serviceNumber}</span>
          </p>
        )}

        <MetaGrid>
          <MetaItem icon={MapPin} label="Hometown" value={birthplaceOf(martyr)} />
          <MetaItem
            icon={Calendar}
            label={isPosthumous(martyr) ? "Date of action / sacrifice" : "Date of action"}
            value={formatDate(martyr.dateOfMartyrdom, "Recorded in action")}
          />
          <MetaItem icon={Swords} label="Conflict" value={conflict} />
        </MetaGrid>
      </DetailPanel>

      {awards.length > 0 && (
        <Section
          title={
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#D96B27]" aria-hidden="true" />
              Official Gazette Citation
            </span>
          }
        >
          <div className="space-y-4">
            {awards.map((award, idx) => (
              <article
                key={`${award.name}-${idx}`}
                className="space-y-4 rounded-xl border border-[#D96B27]/30 bg-white/80 p-6 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-bold text-[#C25016]">
                      {award.name}
                    </h3>
                    {award.posthumous && (
                      <span className="rounded bg-stone-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-700">
                        Posthumous
                      </span>
                    )}
                  </div>
                  {award.year && (
                    <span className="text-xs text-stone-600">Award year: {award.year}</span>
                  )}
                </div>

                {award.citation && (
                  <blockquote className="border-l-2 border-[#D96B27] py-1 pl-4 font-display text-base italic leading-relaxed text-stone-800">
                    “{award.citation}”
                  </blockquote>
                )}

                {award.gazetteRef && (
                  <p className="rounded-lg border border-stone-200 bg-stone-50 p-2.5 font-mono text-[11px] text-stone-700">
                    <span className="text-stone-500">Gazette reference:</span> {award.gazetteRef}
                  </p>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}

      {martyr.biography && (
        <Section title="Biography">
          <p className="rounded-xl border border-stone-300 bg-white/70 p-6 text-sm leading-relaxed text-stone-800">
            {martyr.biography}
          </p>
        </Section>
      )}

      {memorials.length > 0 && (
        <Section
          title={
            <span className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-[#D96B27]" aria-hidden="true" />
              Honoured at War Memorials
            </span>
          }
        >
          <PersonGrid>
            {memorials.map((memorial) => (
              <PersonLink
                key={recordId(memorial) ?? memorial.slug}
                to={`/memorials/${memorial.slug}`}
                name={memorial.name}
                detail={memorialLocation(memorial, "")}
              />
            ))}
          </PersonGrid>
        </Section>
      )}

      {sources.length > 0 && (
        <Section
          className="border-t border-stone-300 pt-6"
          title={
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#2E5E2A]" aria-hidden="true" />
              Verified Sources &amp; Provenance
            </span>
          }
        >
          <ul className="space-y-2">
            {sources.map((source, idx) => (
              <li
                key={`${source.title}-${idx}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-300 bg-white/70 p-3 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-semibold text-stone-800">{source.title}</span>
                  {source.publisher && (
                    <span className="ml-2 text-stone-500">({source.publisher})</span>
                  )}
                  <span className="mt-0.5 block text-[11px] text-stone-500">
                    Backing claim:{" "}
                    <code className="font-mono text-[#C25016]">{source.field}</code>
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                    {source.tier} source
                  </span>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 font-semibold text-[#C25016] hover:underline"
                    >
                      Link
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </PageContainer>
  );
}

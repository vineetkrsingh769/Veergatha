import { useParams } from "react-router-dom";
import {
  Award,
  Landmark,
  Calendar,
  MapPin,
  FileSearch,
  Hash,
  Shield,
  Swords,
  Users,
} from "lucide-react";

import { fetchMartyrBySlug } from "../lib/api";
import { useApi } from "../hooks/useApi";
import {
  birthplaceOf,
  formatDate,
  initialsOf,
  isPosthumous,
  memorialLocation,
  recordId,
} from "../lib/format";
import {
  BackLink,
  CitationBlock,
  DetailPanel,
  Loading,
  MetaGrid,
  MetaItem,
  NotFound,
  PageContainer,
  PersonGrid,
  PersonLink,
  Portrait,
  ProvenanceFooter,
  RelatedEntries,
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

  /*
   * Every award the record carries, not just the first — a recipient may hold
   * more than one, and the header should not silently drop the rest. Empty when
   * there are no awards, so the accent line is omitted rather than filled with
   * an invented label.
   */
  const awardNames = awards.map((a) => a.name).filter(Boolean).join(" · ");
  const awardYear = awards.find((a) => a.year)?.year;

  /*
   * The source entry backing the citation, so the block can link out to the
   * document it was transcribed from. Per-field provenance means the URL lives
   * on the source whose `field` names the citation — today that is
   * "awards.citation" on every record. Falls back to any primary source rather
   * than pointing at a secondary one.
   */
  const citationSource =
    sources.find((s) => /citation|gazette/i.test(s.field ?? "")) ??
    sources.find((s) => s.tier === "primary");

  /*
   * Unit is the regiment's abbreviation in practice ("13 Jammu & Kashmir
   * Rifles" / "13 JAK RIF"), so it reads as a parenthetical rather than as a
   * second peer value. Handles regiment only, unit only, both, or neither —
   * and all three published records currently carry both.
   */
  const regimentLine = martyr.regiment
    ? `${martyr.regiment}${martyr.unit ? ` (${martyr.unit})` : ""}`
    : martyr.unit || null;

  return (
    <PageContainer width="medium" className="space-y-8">
      <BackLink to="/martyrs">Back to Recipients</BackLink>

      <DetailPanel
        aside={<StatusBadge status={martyr.status} />}
        media={
          <Portrait
            src={martyr.portrait?.cloudinary?.secureUrl}
            alt={`Portrait of ${martyr.fullName}`}
            credit={martyr.portrait?.credit}
            initials={initialsOf(martyr)}
          />
        }
        /*
         * The headline is fullName alone, not displayName(). Rank is a field in
         * its own right and appears in the metadata below — carrying it in both
         * places is duplication, and the person's name is what the page is
         * about.
         */
        title={martyr.fullName}
        accent={
          awardNames && (
            <p className="font-display text-title font-semibold text-accent-deep">
              {awardNames}
            </p>
          )
        }
        /* No lede: the regiment is in the metadata grid, and repeating it
           directly under the name is duplication, not hierarchy. */
      >
        <MetaGrid>
          <MetaItem icon={Shield} label="Rank" value={martyr.rank} />
          <MetaItem icon={Users} label="Regiment / Unit" value={regimentLine} />
          <MetaItem icon={Shield} label="Service branch" value={martyr.serviceBranch} />
          {/*
           * The label switch on isPosthumous() is load-bearing, not cosmetic:
           * three of the twenty-one Param Vir Chakra recipients survived, and
           * "sacrifice" must never appear against a living person. Preserved
           * exactly as it was.
           */}
          <MetaItem
            icon={Calendar}
            label={isPosthumous(martyr) ? "Date of action / sacrifice" : "Date of action"}
            value={formatDate(martyr.dateOfMartyrdom, "Recorded in action")}
          />
          <MetaItem icon={Award} label="Year of award" value={awardYear} />
          <MetaItem icon={Swords} label="Conflict" value={conflict} />
          <MetaItem icon={MapPin} label="Hometown" value={birthplaceOf(martyr)} />
          <MetaItem
            icon={Hash}
            label="Service number"
            value={
              martyr.serviceNumber && (
                <span className="font-mono">{martyr.serviceNumber}</span>
              )
            }
          />
        </MetaGrid>
      </DetailPanel>

      {awards.length > 0 && (
        <Section
          /* Retitled: each award now carries its own "Gazette citation" label,
             so a section called the same thing was saying it twice. */
          title={
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent-deep" aria-hidden="true" />
              {awards.length > 1 ? "Gallantry awards" : "Gallantry award"}
            </span>
          }
        >
          <div className="space-y-4">
            {awards.map((award, idx) => (
              <article
                key={`${award.name}-${idx}`}
                className="space-y-4 rounded-xl border border-accent/30 bg-raised p-6 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-title font-bold text-accent-deep">
                      {award.name}
                    </h3>
                    {award.posthumous && (
                      <span className="rounded bg-rule px-2 py-0.5 text-caption font-bold uppercase tracking-wide text-ink-700">
                        Posthumous
                      </span>
                    )}
                  </div>
                  {award.year && (
                    <span className="text-label text-muted">Award year: {award.year}</span>
                  )}
                </div>

                <CitationBlock
                  citation={award.citation}
                  gazetteRef={award.gazetteRef}
                  source={citationSource}
                />
              </article>
            ))}
          </div>
        </Section>
      )}

      {/*
       * Narrative. Every visual property here is chosen to be the opposite of
       * the citation block above it, because the one thing a reader must never
       * do on this page is mistake the archive's own prose for a quoted legal
       * document:
       *
       *   citation — monospace, inset panel, accent rule, boxed
       *   context  — serif, no panel at all, flowing on the page ground
       *
       * The standfirst says the same thing in words, for anyone who reads
       * rather than scans. Both are needed; neither alone is enough.
       *
       * Omitted entirely when there is no biography — an empty heading would
       * imply the archive has something to say and is withholding it.
       */}
      {martyr.biography && (
        <Section title="Context">
          <p className="max-w-measure text-caption italic text-muted">
            Written by the archive from the sources listed below. Not a quoted document.
          </p>
          <p className="max-w-measure font-display text-prose leading-relaxed text-ink">
            {martyr.biography}
          </p>
        </Section>
      )}

      {memorials.length > 0 && (
        <Section
          title={
            <span className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-accent-deep" aria-hidden="true" />
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

      {/* Owns its own fetch — see the note in Related.jsx on why it cannot
          live as a second useApi() in this component. */}
      <RelatedEntries martyr={martyr} />

      {/*
       * Provenance footer. Renders on EVERY profile, including one with no
       * sources at all — a record that cannot show its working should say so
       * rather than quietly omit the section, which would make an unsourced
       * record look identical to a well-sourced one.
       */}
      <Section
        className="border-t border-rule-strong pt-6"
        title={
          <span className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-accent-deep" aria-hidden="true" />
            Provenance
          </span>
        }
      >
        <ProvenanceFooter
          sources={sources}
          verificationStatus={martyr.verification?.status}
          updatedAt={martyr.updatedAt}
          recordSlug={martyr.slug}
        />
      </Section>
    </PageContainer>
  );
}

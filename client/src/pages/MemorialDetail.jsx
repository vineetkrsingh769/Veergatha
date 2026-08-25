import { useParams } from "react-router-dom";
import { Landmark, MapPin, Award, Calendar, Building2 } from "lucide-react";

import { fetchMemorialBySlug } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { displayName, primaryAward, recordId } from "../lib/format";
import {
  BackLink,
  DetailPanel,
  EmptyState,
  Loading,
  MetaGrid,
  MetaItem,
  NotFound,
  PageContainer,
  PersonGrid,
  PersonLink,
  Pill,
  Section,
} from "../components/ui";

export default function MemorialDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useApi(() => fetchMemorialBySlug(slug), [slug]);

  if (loading) return <Loading label="Loading memorial profile…" />;

  if (error || !data?.memorial) {
    return (
      <NotFound
        message={error || "Memorial not found."}
        backTo="/memorials"
        backLabel="Return to Memorials Directory"
      />
    );
  }

  const { memorial, honoured = [] } = data;

  const fullLocation =
    [memorial.location?.city, memorial.location?.district, memorial.location?.state]
      .filter(Boolean)
      .join(", ") || "India";

  return (
    <PageContainer width="medium" className="space-y-6 sm:space-y-8">
      <BackLink to="/memorials">Back to Memorials</BackLink>

      <DetailPanel
        pill={<Pill icon={Landmark}>War Memorial</Pill>}
        title={memorial.name}
        lede={memorial.description}
      >
        <MetaGrid>
          <MetaItem icon={MapPin} label="Location" value={fullLocation} />
          <MetaItem icon={Calendar} label="Inaugurated" value={memorial.inauguratedYear} />
          <MetaItem icon={Building2} label="Managed by" value={memorial.managedBy} />
        </MetaGrid>
      </DetailPanel>

      <Section
        title={
          <span className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#D96B27]" aria-hidden="true" />
            Honoured Personnel ({honoured.length})
          </span>
        }
      >
        {honoured.length === 0 ? (
          <EmptyState
            title="No recipients linked yet"
            hint="Names appear here as records naming this memorial are verified."
          />
        ) : (
          <PersonGrid>
            {honoured.map((person) => (
              <PersonLink
                key={recordId(person) ?? person.slug}
                to={`/martyrs/${person.slug}`}
                name={displayName(person)}
                detail={primaryAward(person, "Recipient")}
                accent
              />
            ))}
          </PersonGrid>
        )}
      </Section>
    </PageContainer>
  );
}

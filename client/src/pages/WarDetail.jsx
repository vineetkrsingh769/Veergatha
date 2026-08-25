import { useParams } from "react-router-dom";
import { Swords, Calendar, Award } from "lucide-react";

import { fetchWarBySlug } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { conflictYears, displayName, recordId } from "../lib/format";
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

export default function WarDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useApi(() => fetchWarBySlug(slug), [slug]);

  if (loading) return <Loading label="Loading conflict profile…" />;

  if (error || !data?.war) {
    return (
      <NotFound
        message={error || "Conflict not found."}
        backTo="/wars"
        backLabel="Return to Conflicts Directory"
      />
    );
  }

  const { war, martyrs = [] } = data;

  return (
    <PageContainer width="medium" className="space-y-6 sm:space-y-8">
      <BackLink to="/wars">Back to Conflicts</BackLink>

      <DetailPanel
        pill={<Pill icon={Swords}>{war.type}</Pill>}
        title={war.name}
        lede={war.description || war.summary}
      >
        <MetaGrid>
          <MetaItem icon={Calendar} label="Timeline" value={conflictYears(war)} />
        </MetaGrid>
      </DetailPanel>

      <Section
        title={
          <span className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#D96B27]" aria-hidden="true" />
            Personnel Documented in Conflict ({martyrs.length})
          </span>
        }
      >
        {martyrs.length === 0 ? (
          <EmptyState
            title="No personnel linked yet"
            hint="Profiles appear here as records for this conflict are verified."
          />
        ) : (
          <PersonGrid>
            {martyrs.map((person) => (
              <PersonLink
                key={recordId(person) ?? person.slug}
                to={`/martyrs/${person.slug}`}
                name={displayName(person)}
                detail={person.regiment}
              />
            ))}
          </PersonGrid>
        )}
      </Section>
    </PageContainer>
  );
}

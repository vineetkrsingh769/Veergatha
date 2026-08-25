import { Swords, Calendar } from "lucide-react";

import { fetchWars } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { conflictYears } from "../lib/format";
import {
  AsyncBoundary,
  CardGrid,
  PageContainer,
  PageHeader,
  RecordCard,
  TypePill,
} from "../components/ui";

export default function WarsList() {
  const { data, loading, error, refetch } = useApi(fetchWars, []);
  const wars = data?.wars ?? [];

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Conflicts &amp; Operations"
        subtitle="Timeline of post-independence wars, operations, and peacekeeping missions."
      />

      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={refetch}
        loadingLabel="Loading conflicts…"
        isEmpty={wars.length === 0}
        emptyTitle="No conflicts recorded yet"
      >
        <CardGrid columns={2}>
          {wars.map((war) => (
            <RecordCard
              key={war.id ?? war.slug}
              to={`/wars/${war.slug}`}
              icon={Swords}
              badge={<TypePill>{war.type}</TypePill>}
              title={war.name}
              description={war.summary || war.description}
              meta={conflictYears(war)}
              metaIcon={Calendar}
              actionLabel="View Timeline"
            />
          ))}
        </CardGrid>
      </AsyncBoundary>
    </PageContainer>
  );
}

import { Landmark, MapPin } from "lucide-react";

import { fetchMemorials } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { memorialLocation } from "../lib/format";
import {
  AsyncBoundary,
  CardGrid,
  PageContainer,
  PageHeader,
  RecordCard,
} from "../components/ui";

export default function MemorialsList() {
  const { data, loading, error, refetch } = useApi(fetchMemorials, []);
  const memorials = data?.memorials ?? [];

  return (
    <PageContainer className="space-y-6 sm:space-y-8">
      <PageHeader
        title="War Memorials Directory"
        subtitle="Monuments, national war memorials, and regimental sanctuaries built to honour India's armed forces."
      />

      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={refetch}
        loadingLabel="Loading war memorials…"
        isEmpty={memorials.length === 0}
        emptyTitle="No memorials documented yet"
      >
        <CardGrid>
          {memorials.map((memorial) => (
            <RecordCard
              key={memorial.id ?? memorial.slug}
              to={`/memorials/${memorial.slug}`}
              icon={Landmark}
              title={memorial.name}
              description={memorial.description}
              meta={memorialLocation(memorial, "India")}
              metaIcon={MapPin}
              actionLabel="Explore"
            />
          ))}
        </CardGrid>
      </AsyncBoundary>
    </PageContainer>
  );
}

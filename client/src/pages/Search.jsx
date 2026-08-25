import { useState } from "react";
import { Search as SearchIcon, Award, Landmark, Swords } from "lucide-react";

import { searchArchive } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { useDebounced } from "../hooks/useDebounced";
import { displayName, memorialLocation, recordId } from "../lib/format";
import {
  EmptyState,
  ErrorState,
  Loading,
  PageContainer,
  PageHeader,
  PersonGrid,
  PersonLink,
  Section,
} from "../components/ui";

const MIN_QUERY = 2;

function ResultGroup({ icon: Icon, label, count, items, empty, render }) {
  return (
    <Section
      title={
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#D96B27]" aria-hidden="true" />
          {label} ({count})
        </span>
      }
    >
      {items.length === 0 ? (
        <p className="text-xs text-stone-500">{empty}</p>
      ) : (
        <PersonGrid>{items.map(render)}</PersonGrid>
      )}
    </Section>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const term = useDebounced(query.trim(), 300);
  const ready = term.length >= MIN_QUERY;

  const { data, loading, error, refetch } = useApi(() => searchArchive(term), [term], {
    skip: !ready,
  });

  const martyrs = data?.martyrs ?? [];
  const memorials = data?.memorials ?? [];
  const wars = data?.wars ?? [];
  const counts = data?.counts ?? {};

  return (
    <PageContainer width="medium" className="space-y-8">
      <PageHeader
        title="Search Digital Archive"
        subtitle="Query across recipient records, war memorials, and conflicts."
      />

      <div className="relative max-w-2xl">
        <SearchIcon
          className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Search the archive"
          placeholder="Search by name, regiment, location, or conflict…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-stone-300 bg-white/85 py-3 pl-12 pr-4 text-sm text-stone-800 placeholder-stone-400 shadow-xs focus:border-[#D96B27] focus:outline-none"
        />
      </div>

      {!ready ? (
        <EmptyState
          icon={SearchIcon}
          title="Start typing to search"
          hint={`Enter at least ${MIN_QUERY} characters to search across every record.`}
        />
      ) : loading ? (
        <Loading label="Searching the archive…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="space-y-8">
          <ResultGroup
            icon={Award}
            label="Gallantry Recipients"
            count={counts.martyrs ?? martyrs.length}
            items={martyrs}
            empty={`No recipient records match “${term}”.`}
            render={(person) => (
              <PersonLink
                key={recordId(person) ?? person.slug}
                to={`/martyrs/${person.slug}`}
                name={displayName(person)}
                detail={person.regiment}
              />
            )}
          />

          <ResultGroup
            icon={Landmark}
            label="War Memorials"
            count={counts.memorials ?? memorials.length}
            items={memorials}
            empty={`No memorials match “${term}”.`}
            render={(memorial) => (
              <PersonLink
                key={recordId(memorial) ?? memorial.slug}
                to={`/memorials/${memorial.slug}`}
                name={memorial.name}
                detail={memorialLocation(memorial, "")}
              />
            )}
          />

          <ResultGroup
            icon={Swords}
            label="Conflicts &amp; Operations"
            count={counts.wars ?? wars.length}
            items={wars}
            empty={`No conflicts match “${term}”.`}
            render={(war) => (
              <PersonLink
                key={recordId(war) ?? war.slug}
                to={`/wars/${war.slug}`}
                name={war.name}
                detail={war.type}
              />
            )}
          />
        </div>
      )}
    </PageContainer>
  );
}

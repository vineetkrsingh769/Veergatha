import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchArchive } from "../lib/api";
import { Search as SearchIcon, Award, Landmark, Swords, ChevronRight } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("Kargil");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      searchArchive(query.trim())
        .then((data) => setResults(data))
        .catch(() => setResults(null))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="py-8 px-8 max-w-5xl mx-auto space-y-8">
      <div className="space-y-2 border-b border-zinc-900 pb-6">
        <h1 className="font-display text-4xl text-zinc-100 font-semibold">
          Search Digital Archive
        </h1>
        <p className="text-sm text-zinc-400">
          Query across recipient records, war memorials, and conflicts.
        </p>
      </div>

      <div className="relative max-w-2xl">
        <SearchIcon className="w-5 h-5 absolute left-4 top-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by name, regiment, location, or conflict..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-600 font-sans text-sm shadow-inner"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-500 text-sm">Searching archive...</div>
      ) : !results ? (
        <div className="py-12 text-center text-zinc-500 text-sm">
          Type at least 2 characters to search across all records.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Martyrs Results */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-zinc-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Gallantry Recipients ({results.counts?.martyrs || 0})
              </span>
            </h2>

            {results.martyrs?.length === 0 ? (
              <p className="text-xs text-zinc-500">No recipient records match "{query}".</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {results.martyrs.map((m) => (
                  <Link
                    key={m.id || m.slug}
                    to={`/martyrs/${m.slug}`}
                    className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl hover:border-amber-600/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-zinc-100">
                        {m.rank} {m.fullName}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">{m.regiment}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Memorials Results */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-zinc-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-500" />
                War Memorials ({results.counts?.memorials || 0})
              </span>
            </h2>

            {results.memorials?.length === 0 ? (
              <p className="text-xs text-zinc-500">No memorials match "{query}".</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {results.memorials.map((mem) => (
                  <Link
                    key={mem.id || mem.slug}
                    to={`/memorials/${mem.slug}`}
                    className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl hover:border-amber-600/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-zinc-100">{mem.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {[mem.location?.city, mem.location?.state].filter(Boolean).join(", ")}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Wars Results */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-zinc-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-500" />
                Conflicts & Operations ({results.counts?.wars || 0})
              </span>
            </h2>

            {results.wars?.length === 0 ? (
              <p className="text-xs text-zinc-500">No conflicts match "{query}".</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {results.wars.map((w) => (
                  <Link
                    key={w.id || w.slug}
                    to={`/wars/${w.slug}`}
                    className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl hover:border-amber-600/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-zinc-100">{w.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5 font-mono capitalize">{w.type}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

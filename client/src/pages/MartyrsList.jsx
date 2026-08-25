import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMartyrs, fetchFilters } from "../lib/api";
import { Search, Filter, Award, ChevronRight } from "lucide-react";
import SpotlightCard from "../components/reactbits/SpotlightCard";

export default function MartyrsList() {
  const [martyrs, setMartyrs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({ states: [], branches: [], awards: [] });
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedAward, setSelectedAward] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFilters().then(setFilters).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (query.trim()) params.q = query.trim();
    if (selectedState) params.state = selectedState;
    if (selectedBranch) params.branch = selectedBranch;
    if (selectedAward) params.award = selectedAward;
    if (selectedStatus) params.status = selectedStatus;

    fetchMartyrs(params)
      .then((data) => {
        setMartyrs(data.martyrs || []);
        setMeta(data.meta || null);
      })
      .catch(() => {
        setMartyrs([]);
      })
      .finally(() => setLoading(false));
  }, [query, selectedState, selectedBranch, selectedAward, selectedStatus, page]);

  return (
    <div className="py-8 px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-stone-300 pb-6">
        <h1 className="font-display text-4xl text-[#1E431B] font-bold">
          Gallantry Award Recipients
        </h1>
        <p className="text-sm text-stone-600">
          Directory of India's gallantry award recipients. Filter by state, branch, award, or status.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 border border-stone-300 p-4 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#D96B27] uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          <span>Filters & Search</span>
        </div>

        <div className="grid grid-cols-5 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, regiment..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D96B27]"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setPage(1);
            }}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-[#D96B27]"
          >
            <option value="">All States</option>
            {filters.states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setPage(1);
            }}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-[#D96B27]"
          >
            <option value="">All Branches</option>
            {filters.branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={selectedAward}
            onChange={(e) => {
              setSelectedAward(e.target.value);
              setPage(1);
            }}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-[#D96B27]"
          >
            <option value="">All Awards</option>
            {filters.awards.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-[#D96B27]"
          >
            <option value="">All Statuses</option>
            <option value="fell-in-action">Fell in Action</option>
            <option value="survived">Survived</option>
          </select>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 text-sm">Loading records...</div>
      ) : martyrs.length === 0 ? (
        <div className="py-16 text-center text-stone-500 text-sm bg-white/60 border border-stone-300/80 rounded-xl">
          No records match your filter criteria.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {martyrs.map((m) => (
              <Link key={m.id || m.slug} to={`/martyrs/${m.slug}`} className="group block">
                <SpotlightCard className="h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#C25016] flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {m.awards?.[0]?.name || "Gallantry Recipient"}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                          m.status === "fell-in-action"
                            ? "bg-rose-100 border border-rose-300 text-rose-800"
                            : "bg-emerald-100 border border-emerald-300 text-emerald-800"
                        }`}
                      >
                        {m.status === "fell-in-action" ? "Fell in Action" : "Survived"}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-bold text-[#1A241A] group-hover:text-[#D96B27] transition-colors">
                        {m.rank} {m.fullName}
                      </h3>
                      <p className="text-xs text-stone-600 font-medium">{m.regiment || m.serviceBranch}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                    <span>State: {m.placeOfBirth?.state || "India"}</span>
                    <span className="text-[#D96B27] font-bold flex items-center gap-0.5">
                      View Profile <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </SpotlightCard>
              </Link>
            ))}
          </div>

          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-stone-500 font-medium">
                Page {meta.page} of {meta.pages}
              </span>
              <button
                disabled={page >= meta.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

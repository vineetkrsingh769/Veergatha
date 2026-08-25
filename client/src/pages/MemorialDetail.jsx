import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMemorialBySlug } from "../lib/api";
import { Landmark, MapPin, Award, ArrowLeft, ExternalLink, Calendar, Building2 } from "lucide-react";

export default function MemorialDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchMemorialBySlug(slug)
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Memorial not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="py-24 text-center text-zinc-500 text-sm">Loading memorial profile...</div>;
  }

  if (error || !data?.memorial) {
    return (
      <div className="py-16 px-4 max-w-xl mx-auto text-center space-y-4">
        <p className="text-red-400 text-sm">{error || "Memorial not found."}</p>
        <Link to="/memorials" className="inline-block text-xs text-amber-500 underline">
          ← Return to Memorials Directory
        </Link>
      </div>
    );
  }

  const { memorial, honoured } = data;

  return (
    <div className="py-8 px-8 max-w-5xl mx-auto space-y-8">
      <div>
        <Link to="/memorials" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-amber-500 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Memorials</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-amber-500 text-xs font-medium">
            <Landmark className="w-3.5 h-3.5" />
            <span>War Memorial</span>
          </div>

          <h1 className="font-display text-5xl font-bold text-zinc-100">{memorial.name}</h1>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">{memorial.description}</p>
        </div>

        {/* Location & Metadata Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Location</span>
              <span>
                {[memorial.location?.city, memorial.location?.district, memorial.location?.state]
                  .filter(Boolean)
                  .join(", ") || "India"}
              </span>
            </div>
          </div>

          {memorial.inauguratedYear && (
            <div className="flex items-center gap-2 text-zinc-300">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Inaugurated</span>
                <span>{memorial.inauguratedYear}</span>
              </div>
            </div>
          )}

          {memorial.managedBy && (
            <div className="flex items-center gap-2 text-zinc-300">
              <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Managed By</span>
                <span>{memorial.managedBy}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Honoured Personnel List */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-zinc-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Honoured Personnel ({honoured?.length || 0})</span>
        </h2>

        {!honoured || honoured.length === 0 ? (
          <p className="text-xs text-zinc-500 bg-zinc-900/20 p-4 rounded-xl border border-zinc-800">
            No specific recipients linked to this memorial yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {honoured.map((h) => (
              <Link
                key={h._id || h.slug}
                to={`/martyrs/${h.slug}`}
                className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl hover:border-amber-600/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm text-zinc-100">
                    {h.rank} {h.fullName}
                  </div>
                  <div className="text-xs text-amber-400 mt-0.5">{h.awards?.[0]?.name || "Recipient"}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

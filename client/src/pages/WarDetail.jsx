import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchWarBySlug } from "../lib/api";
import { Swords, Calendar, Award, ArrowLeft, ExternalLink } from "lucide-react";

export default function WarDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchWarBySlug(slug)
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Conflict not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="py-24 text-center text-zinc-500 text-sm">Loading conflict profile...</div>;
  }

  if (error || !data?.war) {
    return (
      <div className="py-16 px-4 max-w-xl mx-auto text-center space-y-4">
        <p className="text-red-400 text-sm">{error || "Conflict not found."}</p>
        <Link to="/wars" className="inline-block text-xs text-amber-500 underline">
          ← Return to Conflicts Directory
        </Link>
      </div>
    );
  }

  const { war, martyrs } = data;

  return (
    <div className="py-8 px-8 max-w-5xl mx-auto space-y-8">
      <div>
        <Link to="/wars" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-amber-500 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Conflicts</span>
        </Link>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-amber-500 text-xs font-medium uppercase">
            <Swords className="w-3.5 h-3.5" />
            <span>{war.type}</span>
          </div>

          <h1 className="font-display text-5xl font-bold text-zinc-100">{war.name}</h1>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">{war.description || war.summary}</p>
        </div>

        <div className="pt-4 border-t border-zinc-800/60 flex items-center gap-2 text-xs text-zinc-400">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>
            Timeline:{" "}
            {war.startDate ? new Date(war.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : ""}
            {war.endDate ? ` – ${new Date(war.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : " – Ongoing"}
          </span>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-zinc-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Personnel Documented in Conflict ({martyrs?.length || 0})</span>
        </h2>

        {!martyrs || martyrs.length === 0 ? (
          <p className="text-xs text-zinc-500 bg-zinc-900/20 p-4 rounded-xl border border-zinc-800">
            No personnel profiles linked to this conflict yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {martyrs.map((m) => (
              <Link
                key={m._id || m.slug}
                to={`/martyrs/${m.slug}`}
                className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl hover:border-amber-600/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm text-zinc-100">
                    {m.rank} {m.fullName}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{m.regiment}</div>
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

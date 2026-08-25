import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMartyrBySlug } from "../lib/api";
import { Shield, Award, Landmark, ExternalLink, Calendar, MapPin, CheckCircle2, ArrowLeft } from "lucide-react";

export default function MartyrDetail() {
  const { slug } = useParams();
  const [martyr, setMartyr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchMartyrBySlug(slug)
      .then((data) => setMartyr(data.martyr))
      .catch((err) => setError(err.message || "Record not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="py-24 text-center text-zinc-500 text-sm">Loading recipient profile...</div>;
  }

  if (error || !martyr) {
    return (
      <div className="py-16 px-4 max-w-xl mx-auto text-center space-y-4">
        <p className="text-red-400 text-sm">{error || "Record not found."}</p>
        <Link to="/martyrs" className="inline-block text-xs text-amber-500 underline">
          ← Return to Recipients Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 px-8 max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <div>
        <Link to="/martyrs" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-amber-500 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Recipients</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-950/60 border border-amber-700/40 text-amber-400">
                {martyr.serviceBranch}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  martyr.status === "fell-in-action"
                    ? "bg-red-950/60 border border-red-800/40 text-red-400"
                    : "bg-emerald-950/60 border border-emerald-800/40 text-emerald-400"
                }`}
              >
                {martyr.status === "fell-in-action" ? "Fell in Action" : "Survived"}
              </span>
            </div>

            <h1 className="font-display text-5xl font-bold text-zinc-100">
              {martyr.rank} {martyr.fullName}
            </h1>

            <p className="text-sm text-amber-500 font-medium">
              {martyr.regiment} {martyr.unit ? `(${martyr.unit})` : ""}
            </p>
          </div>

          {martyr.serviceNumber && (
            <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400">
              Service No: <span className="text-zinc-200">{martyr.serviceNumber}</span>
            </div>
          )}
        </div>

        {/* Fact grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Hometown</span>
              <span>
                {[martyr.placeOfBirth?.village, martyr.placeOfBirth?.district, martyr.placeOfBirth?.state]
                  .filter(Boolean)
                  .join(", ") || "India"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">
                {martyr.status === "fell-in-action" ? "Date of Action / Sacrifice" : "Date of Action"}
              </span>
              <span>
                {martyr.dateOfMartyrdom
                  ? new Date(martyr.dateOfMartyrdom).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Recorded in Action"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Shield className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Conflict</span>
              <span>{martyr.war?.name || martyr.operation || "Operation Vijay"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verbatim Gazette Citation */}
      {martyr.awards && martyr.awards.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-zinc-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Official Gazette Citation</span>
          </h2>

          <div className="space-y-4">
            {martyr.awards.map((award, idx) => (
              <div key={idx} className="bg-zinc-900/30 border border-amber-900/40 rounded-xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold text-amber-400">{award.name}</span>
                    {award.posthumous && (
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        Posthumous
                      </span>
                    )}
                  </div>
                  {award.year && <span className="text-xs text-zinc-400">Award Year: {award.year}</span>}
                </div>

                {award.citation && (
                  <blockquote className="text-sm text-zinc-300 leading-relaxed font-serif italic border-l-2 border-amber-600 pl-4 py-1">
                    "{award.citation}"
                  </blockquote>
                )}

                {award.gazetteRef && (
                  <div className="text-xs text-zinc-400 font-mono bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-900">
                    <span className="text-zinc-500">Gazette Reference:</span> {award.gazetteRef}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Biography */}
      {martyr.biography && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold text-zinc-100">Biography</h2>
          <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-xl">
            {martyr.biography}
          </p>
        </section>
      )}

      {/* Linked Memorials */}
      {martyr.memorials && martyr.memorials.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold text-zinc-100 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-500" />
            <span>Honoured at War Memorials</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {martyr.memorials.map((mem) => (
              <Link
                key={mem._id || mem.slug}
                to={`/memorials/${mem.slug}`}
                className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl hover:border-amber-600/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm text-zinc-200">{mem.name}</div>
                  <div className="text-xs text-zinc-400">
                    {[mem.location?.city, mem.location?.state].filter(Boolean).join(", ")}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Primary Sources & Provenance */}
      {martyr.sources && martyr.sources.length > 0 && (
        <section className="space-y-3 border-t border-zinc-900 pt-6">
          <h2 className="font-display text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Verified Sources & Provenance</span>
          </h2>
          <ul className="space-y-2 text-xs">
            {martyr.sources.map((src, idx) => (
              <li key={idx} className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-zinc-300">{src.title}</span>
                  {src.publisher && <span className="text-zinc-500 ml-2">({src.publisher})</span>}
                  <span className="text-zinc-500 block text-[11px]">Backing claim: <code className="text-amber-500">{src.field}</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[10px] uppercase font-bold">
                    {src.tier} source
                  </span>
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline flex items-center gap-1">
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

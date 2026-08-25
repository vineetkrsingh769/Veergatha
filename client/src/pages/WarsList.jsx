import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWars } from "../lib/api";
import { Swords, Calendar, ChevronRight } from "lucide-react";
import SpotlightCard from "../components/reactbits/SpotlightCard";

export default function WarsList() {
  const [wars, setWars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWars()
      .then((data) => setWars(data.wars || []))
      .catch(() => setWars([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 px-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2 border-b border-zinc-900 pb-6">
        <h1 className="font-display text-4xl text-zinc-100 font-semibold">
          Conflicts & Operations
        </h1>
        <p className="text-sm text-zinc-400">
          Timeline of post-independence wars, operations, and peacekeeping missions.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-sm">Loading conflicts...</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {wars.map((w) => (
            <Link key={w.id || w.slug} to={`/wars/${w.slug}`} className="group block">
              <SpotlightCard className="h-full flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-500">
                      <Swords className="w-4 h-4" />
                    </div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-amber-500 px-2.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">
                      {w.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                      {w.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{w.summary || w.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    {w.startDate ? new Date(w.startDate).getFullYear() : ""}
                    {w.endDate ? ` – ${new Date(w.endDate).getFullYear()}` : " – Present"}
                  </span>
                  <span className="text-amber-500 font-medium flex items-center gap-0.5">
                    View Timeline <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

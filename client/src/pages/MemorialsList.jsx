import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMemorials } from "../lib/api";
import { Landmark, MapPin, ChevronRight } from "lucide-react";
import SpotlightCard from "../components/reactbits/SpotlightCard";

export default function MemorialsList() {
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemorials()
      .then((data) => setMemorials(data.memorials || []))
      .catch(() => setMemorials([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 px-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2 border-b border-zinc-900 pb-6">
        <h1 className="font-display text-4xl text-zinc-100 font-semibold">
          War Memorials Directory
        </h1>
        <p className="text-sm text-zinc-400">
          Monuments, national war memorials, and regimental sanctuaries built to honour India's armed forces.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-sm">Loading war memorials...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {memorials.map((mem) => (
            <Link key={mem.id || mem.slug} to={`/memorials/${mem.slug}`} className="group block">
              <SpotlightCard className="h-full flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-500">
                    <Landmark className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                      {mem.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{mem.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {[mem.location?.city, mem.location?.state].filter(Boolean).join(", ") || "India"}
                  </span>
                  <span className="text-amber-500 font-medium flex items-center gap-0.5">
                    Explore <ChevronRight className="w-3.5 h-3.5" />
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

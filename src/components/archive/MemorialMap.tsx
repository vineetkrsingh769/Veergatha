import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MapPoint {
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Interactive memorial map. Leaflet touches `window`, so it is imported
 * dynamically after mount and never evaluated during SSR.
 */
export function MemorialMap({
  points,
  className,
  onSelect,
  activeSlug,
}: {
  points: MapPoint[];
  className?: string;
  onSelect?: (slug: string) => void;
  activeSlug?: string | null;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").CircleMarker>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !el.current || mapRef.current) return;
      const map = L.map(el.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
        minZoom: 3,
        maxBounds: [
          [0, 55],
          [42, 105],
        ],
      }).setView([23.5, 80], 4.4);
      // Standard OpenStreetMap tiles, darkened in styles.css (.leaflet-tile-pane) to suit the site.
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 12,
      }).addTo(map);

      const css = getComputedStyle(document.documentElement);
      const bronze = css.getPropertyValue("--bronze").trim() || "#d4a24c";
      const flame = css.getPropertyValue("--flame").trim() || "#e8742b";

      const bounds: [number, number][] = [];
      for (const p of points) {
        if (p.latitude == null || p.longitude == null) continue;
        bounds.push([p.latitude, p.longitude]);
        const marker = L.circleMarker([p.latitude, p.longitude], {
          radius: 8,
          color: bronze,
          weight: 2,
          fillColor: flame,
          fillOpacity: 0.85,
        }).addTo(map);
        const wrap = document.createElement("div");
        const title = document.createElement("a");
        title.href = `/memorials/${p.slug}`;
        title.textContent = p.name;
        title.style.cssText = "font-family:var(--font-display);font-size:18px;font-weight:600;color:var(--foreground);text-decoration:none;display:block;line-height:1.15";
        const loc = document.createElement("div");
        loc.textContent = [p.city, p.state].filter(Boolean).join(", ");
        loc.style.cssText = "font-size:12px;color:var(--muted-foreground);margin-top:4px";
        wrap.append(title, loc);
        marker.bindPopup(wrap);
        marker.on("click", () => onSelect?.(p.slug));
        markersRef.current.set(p.slug, marker);
      }
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
      mapRef.current = map;
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // Points are static for the lifetime of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    const m = markersRef.current.get(activeSlug);
    if (m && mapRef.current) {
      mapRef.current.flyTo(m.getLatLng(), 7, { duration: 0.8 });
      m.openPopup();
    }
  }, [activeSlug]);

  return <div ref={el} className={cn("h-full w-full", className)} role="region" aria-label="Map of war memorials across India" />;
}

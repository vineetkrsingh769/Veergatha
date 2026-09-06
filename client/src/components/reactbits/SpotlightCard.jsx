import { useRef, useState } from "react";

/**
 * SpotlightCard - ReactBits card component with subtle radial spotlight glow on mouse hover.
 * Tailored for Veergatha's watercolor parchment and saffron/green theme.
 */
export default function SpotlightCard({
  children,
  className = "",
  // Reads the accent token rather than restating it. What this replaced was the
  // accent colour written out as an rgba triplet — the same value in disguise,
  // which a search for hex literals never caught.
  spotlightColor = "color-mix(in oklab, var(--color-accent) 14%, transparent)",
}) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-xl border border-rule-strong/80 bg-raised shadow-sm p-5 transition-all duration-300 hover:border-accent/50 hover:shadow-md ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

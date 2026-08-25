/**
 * Shared page chrome, locked to a desktop layout.
 *
 * min-w matches the header in Layout.jsx, so the bar and the page body scroll
 * sideways as one unit on a narrow viewport instead of the header holding still
 * while the content underneath reflows.
 */
export function PageContainer({ children, width = "wide", className = "" }) {
  const max = width === "narrow" ? "max-w-3xl" : width === "medium" ? "max-w-5xl" : "max-w-7xl";
  return (
    <div className={`mx-auto w-full min-w-[1080px] ${max} px-8 py-8 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, eyebrow, actions }) {
  return (
    <header className="flex flex-row items-end justify-between gap-6 border-b border-stone-300 pb-5">
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#D96B27]">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl font-bold text-[#1E431B]">{title}</h1>
        {subtitle && <p className="max-w-2xl text-sm text-stone-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Section({ title, children, className = "" }) {
  return (
    <section className={`space-y-3 ${className}`}>
      {title && <h2 className="font-display text-xl font-bold text-[#1E431B]">{title}</h2>}
      {children}
    </section>
  );
}

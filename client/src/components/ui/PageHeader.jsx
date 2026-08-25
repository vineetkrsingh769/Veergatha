/**
 * Shared page chrome. Owns the responsive container so individual pages stop
 * hardcoding `px-8 max-w-7xl` — that fixed padding was the reason nothing
 * worked below ~700px.
 */
export function PageContainer({ children, width = "wide", className = "" }) {
  const max = width === "narrow" ? "max-w-3xl" : width === "medium" ? "max-w-5xl" : "max-w-7xl";
  return (
    <div className={`mx-auto w-full ${max} px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, eyebrow, actions }) {
  return (
    <header className="flex flex-col gap-3 border-b border-stone-300 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#D96B27]">{eyebrow}</p>
        )}
        <h1 className="font-display text-2xl font-bold text-[#1E431B] sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="max-w-2xl text-sm text-stone-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Section({ title, children, className = "" }) {
  return (
    <section className={`space-y-3 ${className}`}>
      {title && (
        <h2 className="font-display text-lg font-bold text-[#1E431B] sm:text-xl">{title}</h2>
      )}
      {children}
    </section>
  );
}

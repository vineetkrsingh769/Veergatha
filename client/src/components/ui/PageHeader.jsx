/**
 * Shared page chrome, locked to a desktop layout.
 *
 * The 1080px floor is enforced once on the shell in Layout.jsx rather than
 * repeated here — `max` only bounds the content band on wide screens.
 */
export function PageContainer({ children, width = "wide", className = "" }) {
  const max =
    width === "narrow"
      ? "max-w-reading"
      : width === "medium"
        ? "max-w-column"
        : "max-w-band";
  return (
    <div className={`mx-auto w-full ${max} px-gutter py-band ${className}`}>{children}</div>
  );
}

export function PageHeader({ title, subtitle, eyebrow, actions }) {
  return (
    <header className="flex flex-row items-end justify-between gap-6 border-b border-rule-strong pb-5">
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-caption font-bold uppercase tracking-wider text-accent-deep">{eyebrow}</p>
        )}
        <h1 className="font-display text-heading font-bold text-tiranga-700">{title}</h1>
        {subtitle && <p className="max-w-2xl text-body text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Section({ title, children, className = "" }) {
  return (
    <section className={`space-y-3 ${className}`}>
      {title && <h2 className="font-display text-title font-bold text-tiranga-700">{title}</h2>}
      {children}
    </section>
  );
}

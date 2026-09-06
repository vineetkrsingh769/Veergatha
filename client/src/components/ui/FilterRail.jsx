import { X } from "lucide-react";

/**
 * A persistent left rail. Not a drawer, not a bottom sheet, not a disclosure —
 * the archive is desktop-only by decision, so the filters are simply always
 * there.
 *
 * Purely presentational: the page owns the state, because the state lives in
 * the URL rather than in this component.
 *
 * Each group is a radio group. The API accepts one value per filter, so radios
 * say what is true — picking a second award replaces the first rather than
 * adding to it. Checkboxes would imply a multi-select the endpoint cannot
 * honour.
 */

const OPTION =
  "flex w-full items-baseline justify-between gap-2 rounded-control px-2 py-1 text-left text-body transition-colors hover:bg-sunken focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-deep";

function Group({ group, value, onChange }) {
  const { key, label, hint, options } = group;
  if (!options.length) return null;

  return (
    <fieldset className="border-t border-rule pt-4 first:border-t-0 first:pt-0">
      <legend className="text-caption font-bold uppercase tracking-[0.15em] text-ink-700">
        {label}
      </legend>
      {hint && <p className="mt-1 text-caption text-muted">{hint}</p>}

      {/* Long facets scroll inside the rail rather than pushing the results
          list off the bottom of the page. */}
      <div className="mt-2 max-h-64 space-y-0.5 overflow-y-auto">
        <label className={OPTION}>
          <span className="flex items-baseline gap-2">
            <input
              type="radio"
              name={key}
              checked={value === ""}
              onChange={() => onChange(key, "")}
              className="accent-accent-deep"
            />
            <span className={value === "" ? "font-semibold text-ink" : "text-ink-700"}>
              All
            </span>
          </span>
        </label>

        {options.map((opt) => (
          <label key={opt.value} className={OPTION}>
            <span className="flex min-w-0 items-baseline gap-2">
              <input
                type="radio"
                name={key}
                checked={value === opt.value}
                onChange={() => onChange(key, opt.value)}
                className="shrink-0 accent-accent-deep"
              />
              <span
                className={`truncate ${value === opt.value ? "font-semibold text-ink" : "text-ink-700"}`}
              >
                {opt.label}
              </span>
            </span>
            {opt.count != null && (
              <span className="shrink-0 font-mono text-caption text-muted">{opt.count}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FilterRail({ groups, values, onChange, children }) {
  return (
    <aside aria-label="Filter recipients" className="w-64 shrink-0 space-y-5">
      {children}
      {groups.map((group) => (
        <Group key={group.key} group={group} value={values[group.key] ?? ""} onChange={onChange} />
      ))}
    </aside>
  );
}

/**
 * Active filters, each individually removable. Without these the only way to
 * see what is applied is to read down the whole rail, and the only way to undo
 * one is to find it again.
 */
export function ActiveFilterChips({ chips, onRemove, onReset }) {
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-caption uppercase tracking-wide text-muted">Filtering by</span>

      {chips.map((chip) => (
        <span
          key={`${chip.key}-${chip.value}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 py-0.5 pl-2.5 pr-1 text-caption text-accent-deep"
        >
          <span className="font-semibold">{chip.groupLabel}:</span> {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            aria-label={`Remove ${chip.groupLabel} filter ${chip.label}`}
            className="rounded-full p-0.5 transition-colors hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-deep"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onReset}
        className="rounded-control px-1 text-caption font-semibold text-muted underline underline-offset-2 transition-colors hover:text-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
      >
        Reset all
      </button>
    </div>
  );
}

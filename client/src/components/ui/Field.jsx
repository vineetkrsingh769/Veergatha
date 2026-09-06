import { useId } from "react";

const CONTROL =
  "w-full rounded-lg border border-rule-strong bg-raised px-3 py-2 text-body text-ink-700 placeholder-faint focus:border-accent focus:outline-none disabled:opacity-60";

export function Field({ label, icon: Icon, hint, className = "", ...input }) {
  const id = useId();
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="text-label font-semibold text-ink-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-faint"
            aria-hidden="true"
          />
        )}
        <input id={id} className={`${CONTROL} ${Icon ? "pl-9" : ""}`} {...input} />
      </div>
      {hint && <p className="text-caption text-muted">{hint}</p>}
    </div>
  );
}

export function SelectField({ label, options = [], className = "", ...select }) {
  const id = useId();
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="text-label font-semibold text-ink-700">
        {label}
      </label>
      <select id={id} className={CONTROL} {...select}>
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}

export function Button({ variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-accent-deep text-surface hover:bg-saffron-800 disabled:opacity-50",
    secondary:
      "border border-rule-strong bg-raised text-ink-700 hover:bg-sunken disabled:opacity-50",
    danger: "border border-danger-rule bg-raised text-danger hover:bg-danger-bg disabled:opacity-50",
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-label font-semibold transition-colors disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    />
  );
}

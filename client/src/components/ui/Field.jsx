import { useId } from "react";

const CONTROL =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-[#D96B27] focus:outline-none disabled:opacity-60";

export function Field({ label, icon: Icon, hint, className = "", ...input }) {
  const id = useId();
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold text-stone-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400"
            aria-hidden="true"
          />
        )}
        <input id={id} className={`${CONTROL} ${Icon ? "pl-9" : ""}`} {...input} />
      </div>
      {hint && <p className="text-[11px] text-stone-500">{hint}</p>}
    </div>
  );
}

export function SelectField({ label, options = [], className = "", ...select }) {
  const id = useId();
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold text-stone-700">
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
    primary: "bg-[#D96B27] text-white hover:bg-[#C25016] disabled:opacity-50",
    secondary:
      "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-50",
    danger: "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50",
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    />
  );
}

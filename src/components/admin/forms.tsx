import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import { thumb, type SourceRef } from "@/lib/archive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------- errors */

// The database enforces the editorial rules; these turn its messages into instructions an editor can act on.
const RULES: [RegExp, string][] = [
  [/cannot be verified without at least one primary source/i, "This record can't be verified yet. Add at least one source marked Primary under Sources, then try again."],
  [/posthumous award cannot be attached to a recipient who survived|cannot be marked as survived/i, "A recipient who survived can't hold a posthumous award. Untick Posthumous on the award, or change the status."],
  [/cannot be verified while its licence is unverified/i, "This photo can't be published until its licence is confirmed. Choose the licence it was released under."],
  [/requires an attribution credit/i, "This licence requires a credit line naming the photographer or owner."],
  [/duplicate key value.*slug/i, "Another record already uses this web address. Change the slug."],
  [/row-level security/i, "Your account isn't allowed to make this change."],
];

export function friendlyError(e: unknown): string {
  const message = e instanceof Error ? e.message : ((e as { message?: string })?.message ?? "Something went wrong");
  return RULES.find(([re]) => re.test(message))?.[1] ?? message;
}

export const showError = (e: unknown) => toast.error(friendlyError(e), { duration: 8000 });

/** Empty or blank text is stored as null, never as "". */
export const nn = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

/* --------------------------------------------------------------- sources */

export type SourceDraft = { title: string; url: string; publisher: string; tier: "primary" | "secondary"; field: string; accessed: string; archived: string };

export function toSourceDrafts(json: Json): SourceDraft[] {
  return ((Array.isArray(json) ? json : []) as unknown as SourceRef[]).map((s) => ({
    title: s.title ?? "",
    url: s.url ?? "",
    publisher: s.publisher ?? "",
    tier: s.tier === "primary" ? "primary" : "secondary",
    field: s.field ?? "",
    accessed: s.accessed ?? "",
    archived: s.archived ?? "",
  }));
}

/** Drops untitled rows and empty optional fields, in the shape the public site reads. */
export function fromSourceDrafts(rows: SourceDraft[]): Json {
  return rows
    .filter((r) => r.title.trim())
    .map((r) => {
      const s: Record<string, string> = { title: r.title.trim(), tier: r.tier };
      for (const k of ["url", "publisher", "field", "accessed", "archived"] as const) if (r[k].trim()) s[k] = r[k].trim();
      return s;
    }) as unknown as Json;
}

const emptySource = (): SourceDraft => ({ title: "", url: "", publisher: "", tier: "primary", field: "", accessed: "", archived: "" });

export function SourcesEditor({ value, onChange }: { value: SourceDraft[]; onChange: (v: SourceDraft[]) => void }) {
  const set = (i: number, patch: Partial<SourceDraft>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-4">
      {value.length === 0 && <p className="text-sm text-muted-foreground">No sources yet. A record needs at least one primary source before it can be verified.</p>}
      {value.map((s, i) => (
        <div key={i} className="rounded-md border border-border p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
            <SmallField label="Title" value={s.title} onChange={(v) => set(i, { title: v })} placeholder="e.g. Awardee record: Vikram Batra" />
            <label className="block space-y-1.5 text-sm">
              <span className="text-muted-foreground">Tier</span>
              <select
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-foreground"
                value={s.tier}
                onChange={(e) => set(i, { tier: e.target.value as SourceDraft["tier"] })}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </label>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <SmallField label="Link" value={s.url} onChange={(v) => set(i, { url: v })} placeholder="https://" />
            <SmallField label="Publisher" value={s.publisher} onChange={(v) => set(i, { publisher: v })} placeholder="e.g. Gallantry Awards Portal, Ministry of Defence" />
            <SmallField label="Supports (which fact)" value={s.field} onChange={(v) => set(i, { field: v })} placeholder="e.g. awards, unit, date of action" />
            <SmallField label="Accessed" type="date" value={s.accessed} onChange={(v) => set(i, { accessed: v })} />
            <SmallField label="Archived copy" value={s.archived} onChange={(v) => set(i, { archived: v })} placeholder="https://web.archive.org/..." />
          </div>
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Remove source
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, emptySource()])}>
        <Plus /> Add a source
      </Button>
    </div>
  );
}

export function SmallField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Input className="h-9" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select className="h-9 w-full rounded-md border border-border bg-background px-3 text-foreground" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TextAreaField({ label, value, onChange, rows = 4, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

/** Chooses the lead photo from the photos already linked to this record. */
export function PhotoPicker({
  label,
  value,
  onChange,
  media,
  aspect = "aspect-[4/3] w-40",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  media: { id: string; title: string; url: string; license: string }[];
  aspect?: string;
}) {
  const chosen = media.find((m) => m.id === value);
  return (
    <div className="flex items-start gap-5">
      {chosen && <img src={thumb(chosen.url, 330)} alt={chosen.title} className={cn("shrink-0 rounded-sm border border-border object-cover", aspect)} />}
      <div className="w-full max-w-md">
        <SelectField label={label} value={value} onChange={onChange} options={[{ value: "", label: "None" }, ...media.map((m) => ({ value: m.id, label: `${m.title} (${m.license})` }))]} />
        {media.length === 0 && <p className="mt-2 text-xs text-muted-foreground">No photos are linked to this record yet. Add them under Photos.</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- verification */

export type Verification = "draft" | "in-review" | "verified";

export const VERIFICATION_LABEL: Record<Verification, string> = { draft: "Draft", "in-review": "In review", verified: "Verified" };

export function VerificationBadge({ value }: { value: Verification }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-sm border px-2 py-0.5 text-xs",
        value === "verified" ? "border-bronze/40 text-bronze-light" : value === "in-review" ? "border-pending/40 text-pending" : "border-border text-muted-foreground",
      )}
    >
      {VERIFICATION_LABEL[value]}
    </span>
  );
}

/**
 * The publishing workflow: draft, then in review, then verified (public).
 * Each button saves the form together with the new status.
 */
export function VerificationActions({ value, busy, onSave }: { value: Verification; busy: boolean; onSave: (next: Verification) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" disabled={busy} onClick={() => onSave(value)}>
        {busy ? "Saving…" : "Save"}
      </Button>
      {value === "draft" && (
        <Button type="button" variant="outline" disabled={busy} onClick={() => onSave("in-review")}>
          Save and send for review
        </Button>
      )}
      {value !== "verified" && (
        <Button type="button" variant="outline" disabled={busy} onClick={() => onSave("verified")}>
          Save, verify and publish
        </Button>
      )}
      {value === "in-review" && (
        <Button type="button" variant="ghost" disabled={busy} onClick={() => onSave("draft")}>
          Return to draft
        </Button>
      )}
      {value === "verified" && (
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => {
            if (window.confirm("Unpublish this record? It will disappear from the public site until it is verified again.")) onSave("in-review");
          }}
        >
          Unpublish
        </Button>
      )}
    </div>
  );
}

/** A titled block of the edit form. */
export function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-8">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

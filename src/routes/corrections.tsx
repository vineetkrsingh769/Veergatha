import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitCorrection } from "@/lib/archive.functions";
import { PageHeader } from "@/components/archive/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TYPES = ["recipient", "memorial", "conflict", "media", "other"] as const;

export const Route = createFileRoute("/corrections")({
  validateSearch: (s) =>
    z.object({ record: z.string().optional(), type: z.enum(TYPES).optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Submit a Correction | Veergatha" },
      { name: "description", content: "Report an error in a Veergatha record with a primary source. Submissions go to the editorial desk for review." },
      { property: "og:title", content: "Submit a Correction | Veergatha" },
      { property: "og:description", content: "Help keep the record accurate: report an error with your source." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Corrections,
});

const FIELDS = [
  ["citation", "Award citation"],
  ["gazette", "Gazette reference"],
  ["rank", "Rank or service"],
  ["date", "Date of action"],
  ["unit", "Regiment or unit"],
  ["birthplace", "Birthplace or home state"],
  ["image", "Photograph or credit"],
  ["other", "Something else"],
] as const;

function Corrections() {
  const search = Route.useSearch();
  const [form, setForm] = useState({
    record_type: search.type ?? "recipient",
    record_slug: search.record ?? "",
    field: "citation",
    details: "",
    source_url: "",
    email: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submitCorrection({ data: { ...form, record_type: form.record_type as (typeof TYPES)[number] } });
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Please check the form and try again.";
      toast.error(msg.startsWith("[") ? "Please check the form: a description of at least 10 characters, and a valid link and email if given." : msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Submit a correction"
        intro="If you have found an error and have a document that shows it, such as a gazette notification, a regimental record or a service document, tell the editorial desk. A record is only changed once the correction is confirmed against a primary source."
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_20rem]">
        {done ? (
          <div className="rounded-md border border-survived/40 bg-survived/10 p-10 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-survived" />
            <h2 className="mt-4 font-display text-3xl font-semibold">Thank you, your correction was received</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Your correction is now in the editorial queue. If you left an email, we may write to you for the source document.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/martyrs">Return to the Roll of Honour</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6 rounded-md border border-border bg-card p-6 md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Record type</Label>
                <select id="type" value={form.record_type} onChange={(e) => set("record_type")(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Record</Label>
                <Input id="slug" value={form.record_slug} onChange={(e) => set("record_slug")(e.target.value)} placeholder="e.g. vikram-batra" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">What needs correcting</Label>
                <select id="field" value={form.field} onChange={(e) => set("field")(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {FIELDS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your email (optional)</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="name@example.com" maxLength={255} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">The correction</Label>
              <Textarea id="details" required minLength={10} maxLength={4000} rows={6} value={form.details} onChange={(e) => set("details")(e.target.value)} placeholder="Describe what is wrong and what the record should say." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source link</Label>
              <Input id="source" type="url" value={form.source_url} onChange={(e) => set("source_url")(e.target.value)} placeholder="https://gallantryawards.gov.in/…" maxLength={500} />
              <p className="text-xs text-muted-foreground">A link to the gazette, the Gallantry Awards Portal or another primary document helps us act quickly.</p>
            </div>
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? "Sending…" : "Send to the editorial desk"}
            </Button>
          </form>
        )}
        <aside className="space-y-4 text-sm text-muted-foreground">
          <p className="eyebrow">What happens next</p>
          <p>An editor compares your note with the primary record. Confirmed corrections are applied and the record is re-verified.</p>
          <p>We do not publish personal details of living people beyond their public service record.</p>
        </aside>
      </div>
    </div>
  );
}

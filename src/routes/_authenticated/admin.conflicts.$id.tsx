import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { check, Heading, Loading, slugify, type Row } from "@/components/admin/shared";
import {
  FormSection,
  fromSourceDrafts,
  nn,
  PhotoPicker,
  SelectField,
  showError,
  SmallField,
  SourcesEditor,
  TextAreaField,
  toSourceDrafts,
  VerificationActions,
  VerificationBadge,
  type SourceDraft,
  type Verification,
} from "@/components/admin/forms";
import { MORE_LINK } from "@/components/archive/primitives";
import type { Json } from "@/integrations/supabase/types";
import { CONFLICT_TYPE_LABELS, type ConflictType } from "@/lib/archive";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/conflicts/$id")({
  head: () => ({ meta: [{ title: "Edit conflict | Editorial Desk" }] }),
  component: ConflictEditor,
});

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
type War = Row<"wars">;
type Details = { name: string; slug: string; type: ConflictType; start_date: string; end_date: string; period_label: string; theatre: string; summary: string; description: string; hero_media_id: string };
type EventDraft = { date: string; label: string; title: string; description: string };

function useConflict(id: string) {
  return useQuery({
    queryKey: ["desk", "conflict", id],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (id === "new") return { war: null as War | null, media: [] as Row<"media">[] };
      const war = check(await supabase.from("wars").select("*").eq("id", id).maybeSingle());
      if (!war) return null;
      const media = check(await supabase.from("media").select("*").eq("war_id", id).order("created_at")) ?? [];
      return { war, media };
    },
  });
}

function ConflictEditor() {
  const { id } = Route.useParams();
  const q = useConflict(id);
  if (q.isPending) return <Loading />;
  if (q.error) return <p className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">Could not load this conflict: {q.error.message}</p>;
  if (!q.data) return <p className="text-muted-foreground">No conflict with this id.</p>;
  return <ConflictForm key={q.dataUpdatedAt} id={id} war={q.data.war} media={q.data.media} />;
}

function ConflictForm({ id, war, media }: { id: string; war: War | null; media: Row<"media">[] }) {
  const isNew = id === "new";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [d, setD] = useState<Details>({
    name: war?.name ?? "", slug: war?.slug ?? "", type: (war?.type as ConflictType) ?? "war", start_date: war?.start_date ?? "",
    end_date: war?.end_date ?? "", period_label: war?.period_label ?? "", theatre: war?.theatre ?? "", summary: war?.summary ?? "",
    description: war?.description ?? "", hero_media_id: war?.hero_media_id ?? "",
  });
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [events, setEvents] = useState<EventDraft[]>(
    ((Array.isArray(war?.key_events) ? war.key_events : []) as unknown as Partial<EventDraft>[]).map((e) => ({ date: e.date ?? "", label: e.label ?? "", title: e.title ?? "", description: e.description ?? "" })),
  );
  const [sources, setSources] = useState<SourceDraft[]>(toSourceDrafts(war?.sources ?? []));
  const [busy, setBusy] = useState(false);
  const verification: Verification = war?.verification ?? "draft";
  const set = (patch: Partial<Details>) => setD((cur) => ({ ...cur, ...patch }));
  const setEvent = (i: number, patch: Partial<EventDraft>) => setEvents((cur) => cur.map((e, j) => (j === i ? { ...e, ...patch } : e)));

  function problems(): string | null {
    if (!d.name.trim()) return "Enter the conflict's name.";
    if (!SLUG.test(d.slug)) return "The web address (slug) may use only lowercase letters, numbers and single hyphens.";
    if (d.start_date && d.end_date && d.end_date < d.start_date) return "The end date is before the start date.";
    if (d.summary.length > 400) return `The summary is ${d.summary.length} characters; the limit is 400.`;
    if (events.some((e) => !e.title.trim())) return "Give every key event a title, or remove the empty event.";
    return null;
  }

  async function save(next: Verification) {
    const problem = problems();
    if (problem) return void toast.error(problem, { duration: 8000 });
    setBusy(true);
    try {
      const record = {
        name: d.name.trim(), slug: d.slug, type: d.type, start_date: nn(d.start_date), end_date: nn(d.end_date), period_label: nn(d.period_label),
        theatre: nn(d.theatre), summary: nn(d.summary), description: nn(d.description), hero_media_id: nn(d.hero_media_id),
        key_events: events.map((e) => ({ date: e.date, label: e.label.trim(), title: e.title.trim(), description: e.description.trim() })) as unknown as Json,
        sources: fromSourceDrafts(sources), verification: next,
      };
      const saved = isNew
        ? check(await supabase.from("wars").insert(record).select("id").single())!
        : check(await supabase.from("wars").update(record).eq("id", id).select("id").single())!;
      await qc.invalidateQueries({ queryKey: ["desk"] });
      toast.success(next === verification ? "Saved" : next === "verified" ? "Verified and published" : next === "in-review" ? (verification === "verified" ? "Unpublished; back in review" : "Sent for review") : "Returned to draft");
      if (isNew) await navigate({ to: "/admin/conflicts/$id", params: { id: saved.id }, replace: true });
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(verification); }} className="pb-28">
      <Link to="/admin/conflicts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-bronze">
        <ArrowLeft className="h-4 w-4" /> All conflicts
      </Link>
      <div className="mt-6">
        <Heading title={isNew ? "New conflict" : d.name || "Untitled conflict"}>{!isNew && <VerificationBadge value={verification} />}</Heading>
      </div>
      {verification === "verified" && war && (
        <a href={`/wars/${war.slug}`} target="_blank" rel="noreferrer" className={cn(MORE_LINK, "-mt-4 mb-6")}>
          View on the public site <ExternalLink className="h-4 w-4" />
        </a>
      )}

      <div className="max-w-3xl space-y-10">
        <FormSection title="Details">
          <div className="grid gap-4 md:grid-cols-2">
            <SmallField label="Name" value={d.name} onChange={(v) => set({ name: v, ...(slugTouched ? {} : { slug: slugify(v) }) })} />
            <SmallField label="Web address (slug)" value={d.slug} onChange={(v) => { setSlugTouched(true); set({ slug: v }); }} />
            <SelectField label="Type" value={d.type} onChange={(v) => set({ type: v as ConflictType })} options={Object.entries(CONFLICT_TYPE_LABELS).map(([value, label]) => ({ value, label }))} />
            <SmallField label="Theatre (where it was fought)" value={d.theatre} onChange={(v) => set({ theatre: v })} placeholder="e.g. Kargil district, Ladakh" />
            <SmallField label="Start date" type="date" value={d.start_date} onChange={(v) => set({ start_date: v })} />
            <SmallField label="End date (leave empty if ongoing)" type="date" value={d.end_date} onChange={(v) => set({ end_date: v })} />
            <SmallField label="Period as shown" value={d.period_label} onChange={(v) => set({ period_label: v })} placeholder="e.g. 1999, or 1984 – present" />
          </div>
          <div className="mt-4 space-y-4">
            <TextAreaField label="Summary" rows={3} value={d.summary} onChange={(v) => set({ summary: v })} hint={`${d.summary.length} of 400 characters. Shown on lists and under the title.`} />
            <TextAreaField label="Overview" rows={8} value={d.description} onChange={(v) => set({ description: v })} />
          </div>
        </FormSection>

        <FormSection title="Key events" hint="Shown as a dated timeline on the conflict's page, in the order listed here.">
          <div className="space-y-4">
            {events.length === 0 && <p className="text-sm text-muted-foreground">No key events yet.</p>}
            {events.map((e, i) => (
              <div key={i} className="rounded-md border border-border p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <SmallField label="Date" type="date" value={e.date} onChange={(v) => setEvent(i, { date: v })} />
                  <SmallField label="Date as shown" value={e.label} onChange={(v) => setEvent(i, { label: v })} placeholder="e.g. 3 May 1999" />
                  <SmallField label="Title" value={e.title} onChange={(v) => setEvent(i, { title: v })} />
                </div>
                <div className="mt-3">
                  <TextAreaField label="What happened" rows={2} value={e.description} onChange={(v) => setEvent(i, { description: v })} />
                </div>
                <button type="button" onClick={() => setEvents((cur) => cur.filter((_, j) => j !== i))} className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Remove event
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setEvents((cur) => [...cur, { date: "", label: "", title: "", description: "" }])}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-input px-3 text-xs font-medium hover:border-bronze/60 hover:bg-secondary"
            >
              <Plus className="h-4 w-4" /> Add an event
            </button>
          </div>
        </FormSection>

        <FormSection title="Sources" hint="At least one primary source is required before the conflict can be verified and published.">
          <SourcesEditor value={sources} onChange={setSources} />
        </FormSection>

        <FormSection title="Lead photo" hint={isNew ? "Save the conflict first; photos linked to it can then be chosen here." : "Shown beside the title on the conflict's page."}>
          {!isNew && <PhotoPicker label="Lead photo" value={d.hero_media_id} onChange={(v) => set({ hero_media_id: v })} media={media} />}
        </FormSection>
      </div>

      <div className="fixed bottom-0 left-64 right-0 border-t border-border bg-background/95 px-10 py-4 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <VerificationActions value={verification} busy={busy} onSave={(next) => void save(next)} />
        </div>
      </div>
    </form>
  );
}

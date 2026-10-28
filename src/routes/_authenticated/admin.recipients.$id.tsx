import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { check, Heading, Loading, slugify, type Row } from "@/components/admin/shared";
import {
  FormSection,
  PhotoPicker,
  SelectField,
  fromSourceDrafts,
  nn,
  showError,
  SmallField,
  SourcesEditor,
  toSourceDrafts,
  VerificationActions,
  VerificationBadge,
  type SourceDraft,
  type Verification,
} from "@/components/admin/forms";
import { MORE_LINK } from "@/components/archive/primitives";
import { Textarea } from "@/components/ui/textarea";
import { AWARD_ORDER } from "@/lib/archive";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/recipients/$id")({
  head: () => ({ meta: [{ title: "Edit recipient | Editorial Desk" }] }),
  component: RecipientEditor,
});

const BRANCHES = ["Army", "Navy", "Air Force", "BSF", "CRPF", "Assam Rifles", "ITBP", "NSG", "Other"];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Martyr = Row<"martyrs">;
type Status = Martyr["status"];
type Details = {
  full_name: string; slug: string; rank: string; service_number: string; service_branch: string; regiment: string; unit: string;
  status: Status; date_of_birth: string; date_of_action: string; birth_village: string; birth_district: string; birth_state: string;
  war_id: string; operation: string; place_of_action: string; biography: string; portrait_media_id: string;
};
type AwardDraft = { id: string | null; name: string; year: string; posthumous: boolean; citation: string; citation_verbatim: boolean; gazette_ref: string };

function toDetails(m: Martyr | null): Details {
  return {
    full_name: m?.full_name ?? "", slug: m?.slug ?? "", rank: m?.rank ?? "", service_number: m?.service_number ?? "",
    service_branch: m?.service_branch ?? "Army", regiment: m?.regiment ?? "", unit: m?.unit ?? "", status: m?.status ?? "fell-in-action",
    date_of_birth: m?.date_of_birth ?? "", date_of_action: m?.date_of_action ?? "", birth_village: m?.birth_village ?? "",
    birth_district: m?.birth_district ?? "", birth_state: m?.birth_state ?? "", war_id: m?.war_id ?? "", operation: m?.operation ?? "",
    place_of_action: m?.place_of_action ?? "", biography: m?.biography ?? "", portrait_media_id: m?.portrait_media_id ?? "",
  };
}

function useRecipient(id: string) {
  return useQuery({
    queryKey: ["desk", "recipient", id],
    // Never refetch behind the editor's back: the form is reset from this data after each save.
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const [wars, memorials] = await Promise.all([
        supabase.from("wars").select("id,name").order("start_date", { ascending: true, nullsFirst: false }).then(check),
        supabase.from("memorials").select("id,name,state").order("name").then(check),
      ]);
      const base = { wars: wars ?? [], memorials: memorials ?? [] };
      if (id === "new") return { ...base, martyr: null, awards: [] as Row<"awards">[], memorialIds: [] as string[], media: [] as Row<"media">[] };
      const martyr = check(await supabase.from("martyrs").select("*").eq("id", id).maybeSingle());
      if (!martyr) return null;
      const [awards, links, media] = await Promise.all([
        supabase.from("awards").select("*").eq("martyr_id", id).order("created_at").then(check),
        supabase.from("martyr_memorials").select("memorial_id").eq("martyr_id", id).then(check),
        supabase.from("media").select("*").eq("martyr_id", id).order("created_at").then(check),
      ]);
      return { ...base, martyr, awards: awards ?? [], memorialIds: (links ?? []).map((l) => l.memorial_id), media: media ?? [] };
    },
  });
}

function RecipientEditor() {
  const { id } = Route.useParams();
  const q = useRecipient(id);
  if (q.isPending) return <Loading />;
  if (q.error) return <p className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">Could not load this recipient: {q.error.message}</p>;
  if (!q.data) return <p className="text-muted-foreground">No recipient with this id.</p>;
  // Re-mount the form whenever fresh data arrives, so it always starts from what is saved.
  return <RecipientForm key={q.dataUpdatedAt} id={id} data={q.data} />;
}

type EditorData = NonNullable<ReturnType<typeof useRecipient>["data"]>;

function RecipientForm({ id, data }: { id: string; data: EditorData }) {
  const isNew = id === "new";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [d, setD] = useState<Details>(toDetails(data.martyr));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [awards, setAwards] = useState<AwardDraft[]>(
    data.awards.map((a) => ({ id: a.id, name: a.name, year: a.year?.toString() ?? "", posthumous: a.posthumous, citation: a.citation ?? "", citation_verbatim: a.citation_verbatim, gazette_ref: a.gazette_ref ?? "" })),
  );
  const [sources, setSources] = useState<SourceDraft[]>(toSourceDrafts(data.martyr?.sources ?? []));
  const [memorialIds, setMemorialIds] = useState<string[]>(data.memorialIds);
  const [busy, setBusy] = useState(false);
  const verification: Verification = data.martyr?.verification ?? "draft";

  const set = (patch: Partial<Details>) => setD((cur) => ({ ...cur, ...patch }));
  const setAward = (i: number, patch: Partial<AwardDraft>) => setAwards((cur) => cur.map((a, j) => (j === i ? { ...a, ...patch } : a)));

  /** Checks the editor can fix before anything is sent; the database re-checks the same rules. */
  function problems(): string | null {
    if (!d.full_name.trim()) return "Enter the recipient's full name.";
    if (!SLUG.test(d.slug)) return "The web address (slug) may use only lowercase letters, numbers and single hyphens.";
    if (awards.some((a) => !a.name)) return "Choose the award for every award row, or remove the empty row.";
    if (awards.some((a) => a.year && !(Number(a.year) >= 1947 && Number(a.year) <= 2100))) return "Award years must be between 1947 and 2100.";
    if (d.status === "survived" && awards.some((a) => a.posthumous)) return "A recipient who survived can't hold a posthumous award. Untick Posthumous on the award, or change the status.";
    return null;
  }

  async function save(next: Verification) {
    const problem = problems();
    if (problem) return void toast.error(problem, { duration: 8000 });
    setBusy(true);
    try {
      const record = {
        full_name: d.full_name.trim(), slug: d.slug, rank: nn(d.rank), service_number: nn(d.service_number), service_branch: d.service_branch,
        regiment: nn(d.regiment), unit: nn(d.unit), status: d.status, date_of_birth: nn(d.date_of_birth), date_of_action: nn(d.date_of_action),
        birth_village: nn(d.birth_village), birth_district: nn(d.birth_district), birth_state: nn(d.birth_state), war_id: nn(d.war_id),
        operation: nn(d.operation), place_of_action: nn(d.place_of_action), biography: nn(d.biography), portrait_media_id: nn(d.portrait_media_id),
        sources: fromSourceDrafts(sources), verification: next,
      };

      let martyrId = id;
      if (isNew) {
        martyrId = check(await supabase.from("martyrs").insert(record).select("id").single())!.id;
        await syncAwards(martyrId);
      } else if (d.status === "survived") {
        // Clear any posthumous flag before the status changes, or the database refuses the status.
        await syncAwards(martyrId);
        check(await supabase.from("martyrs").update(record).eq("id", martyrId).select("id").single());
      } else {
        check(await supabase.from("martyrs").update(record).eq("id", martyrId).select("id").single());
        await syncAwards(martyrId);
      }
      await syncMemorials(martyrId);

      await qc.invalidateQueries({ queryKey: ["desk"] });
      toast.success(next === verification ? "Saved" : next === "verified" ? "Verified and published" : next === "in-review" ? (verification === "verified" ? "Unpublished; back in review" : "Sent for review") : "Returned to draft");
      if (isNew) await navigate({ to: "/admin/recipients/$id", params: { id: martyrId }, replace: true });
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  async function syncAwards(martyrId: string) {
    const kept = new Set(awards.map((a) => a.id).filter(Boolean));
    const removed = data.awards.filter((a) => !kept.has(a.id)).map((a) => a.id);
    if (removed.length) check(await supabase.from("awards").delete().in("id", removed).select("id"));
    for (const a of awards) {
      const row = { name: a.name, year: a.year ? Number(a.year) : null, posthumous: a.posthumous, citation: nn(a.citation), citation_verbatim: a.citation_verbatim, gazette_ref: nn(a.gazette_ref) };
      if (a.id) check(await supabase.from("awards").update(row).eq("id", a.id).select("id").single());
      else check(await supabase.from("awards").insert({ ...row, martyr_id: martyrId }).select("id").single());
    }
  }

  async function syncMemorials(martyrId: string) {
    const stale = data.memorialIds.filter((m) => !memorialIds.includes(m));
    if (stale.length) check(await supabase.from("martyr_memorials").delete().eq("martyr_id", martyrId).in("memorial_id", stale).select("memorial_id"));
    const added = memorialIds.filter((m) => !data.memorialIds.includes(m)).map((memorial_id) => ({ martyr_id: martyrId, memorial_id }));
    if (added.length) check(await supabase.from("martyr_memorials").insert(added).select("memorial_id"));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(verification); }} className="pb-28">
      <Link to="/admin/recipients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-bronze">
        <ArrowLeft className="h-4 w-4" /> All recipients
      </Link>
      <div className="mt-6">
        <Heading title={isNew ? "New recipient" : [d.rank, d.full_name].filter(Boolean).join(" ")}>
          {!isNew && <VerificationBadge value={verification} />}
        </Heading>
      </div>
      {verification === "verified" && (
        <a href={`/martyrs/${data.martyr!.slug}`} target="_blank" rel="noreferrer" className={cn(MORE_LINK, "-mt-4 mb-6")}>
          View on the public site <ExternalLink className="h-4 w-4" />
        </a>
      )}

      <div className="max-w-3xl space-y-10">
        <FormSection title="Identity">
          <div className="grid gap-4 md:grid-cols-2">
            <SmallField label="Full name" value={d.full_name} onChange={(v) => set({ full_name: v, ...(slugTouched ? {} : { slug: slugify(v) }) })} />
            <SmallField label="Web address (slug)" value={d.slug} onChange={(v) => { setSlugTouched(true); set({ slug: v }); }} placeholder="e.g. vikram-batra" />
            <SmallField label="Rank" value={d.rank} onChange={(v) => set({ rank: v })} placeholder="e.g. Captain" />
            <SmallField label="Service number" value={d.service_number} onChange={(v) => set({ service_number: v })} />
            <SelectField label="Service" value={d.service_branch} onChange={(v) => set({ service_branch: v })} options={BRANCHES.map((b) => ({ value: b, label: b }))} />
            <SmallField label="Regiment" value={d.regiment} onChange={(v) => set({ regiment: v })} placeholder="e.g. 13th Battalion, The Jammu & Kashmir Rifles" />
            <SmallField label="Unit (short form)" value={d.unit} onChange={(v) => set({ unit: v })} placeholder="e.g. 13 JAK RIF" />
          </div>
        </FormSection>

        <FormSection title="Life and action">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Status"
              value={d.status}
              onChange={(v) => set({ status: v as Status })}
              options={[{ value: "fell-in-action", label: "Fell in action" }, { value: "survived", label: "Survived" }]}
            />
            <SelectField label="Conflict" value={d.war_id} onChange={(v) => set({ war_id: v })} options={[{ value: "", label: "None" }, ...data.wars.map((w) => ({ value: w.id, label: w.name }))]} />
            <SmallField label="Date of birth" type="date" value={d.date_of_birth} onChange={(v) => set({ date_of_birth: v })} />
            <SmallField label={d.status === "survived" ? "Date of action" : "Date of action (fell on)"} type="date" value={d.date_of_action} onChange={(v) => set({ date_of_action: v })} />
            <SmallField label="Operation" value={d.operation} onChange={(v) => set({ operation: v })} placeholder="e.g. Operation Vijay" />
            <SmallField label="Place of action" value={d.place_of_action} onChange={(v) => set({ place_of_action: v })} />
            <SmallField label="Home village or town" value={d.birth_village} onChange={(v) => set({ birth_village: v })} />
            <SmallField label="Home district" value={d.birth_district} onChange={(v) => set({ birth_district: v })} />
            <SmallField label="Home state" value={d.birth_state} onChange={(v) => set({ birth_state: v })} />
          </div>
        </FormSection>

        <FormSection title="Biography" hint="Separate paragraphs with a blank line. Write only what the sources support.">
          <Textarea rows={10} value={d.biography} onChange={(e) => set({ biography: e.target.value })} />
        </FormSection>

        <FormSection title="Awards" hint="A recipient who survived cannot hold a posthumous award; the database refuses it.">
          <div className="space-y-4">
            {awards.length === 0 && <p className="text-sm text-muted-foreground">No awards yet.</p>}
            {awards.map((a, i) => (
              <div key={a.id ?? `new-${i}`} className="rounded-md border border-border p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_7rem_auto]">
                  <SelectField label="Award" value={a.name} onChange={(v) => setAward(i, { name: v })} options={[{ value: "", label: "Choose an award" }, ...AWARD_ORDER.map((n) => ({ value: n, label: n }))]} />
                  <SmallField label="Year" value={a.year} onChange={(v) => setAward(i, { year: v.replace(/\D/g, "").slice(0, 4) })} />
                  <label className="flex items-end gap-2 pb-2 text-sm">
                    <input type="checkbox" className="size-4 accent-bronze" checked={a.posthumous} onChange={(e) => setAward(i, { posthumous: e.target.checked })} />
                    Posthumous
                  </label>
                </div>
                <label className="mt-3 block space-y-1.5 text-sm">
                  <span className="text-muted-foreground">Citation</span>
                  <Textarea rows={4} value={a.citation} onChange={(e) => setAward(i, { citation: e.target.value })} />
                </label>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                  <SmallField label="Gazette notification number" value={a.gazette_ref} onChange={(v) => setAward(i, { gazette_ref: v })} placeholder="Leave empty until confirmed from the gazette" />
                  <label className="flex items-end gap-2 pb-2 text-sm">
                    <input type="checkbox" className="size-4 accent-bronze" checked={a.citation_verbatim} onChange={(e) => setAward(i, { citation_verbatim: e.target.checked })} />
                    Citation is verbatim gazette text
                  </label>
                </div>
                <button type="button" onClick={() => setAwards((cur) => cur.filter((_, j) => j !== i))} className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Remove award
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAwards((cur) => [...cur, { id: null, name: "", year: "", posthumous: false, citation: "", citation_verbatim: false, gazette_ref: "" }])}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-input px-3 text-xs font-medium hover:border-bronze/60 hover:bg-secondary"
            >
              <Plus className="h-4 w-4" /> Add an award
            </button>
          </div>
        </FormSection>

        <FormSection title="Sources" hint="At least one primary source is required before the record can be verified and published.">
          <SourcesEditor value={sources} onChange={setSources} />
        </FormSection>

        <FormSection title="Portrait" hint={isNew ? "Save the recipient first; photos linked to this recipient can then be chosen here." : "Choose from photos linked to this recipient. Only a photo with a cleared licence is shown publicly."}>
          {!isNew && (
            <PhotoPicker label="Portrait" value={d.portrait_media_id} onChange={(v) => set({ portrait_media_id: v })} media={data.media} aspect="aspect-[4/5] w-28" />
          )}
        </FormSection>

        <FormSection title="Memorials" hint="Memorials that carry this recipient's name.">
          <div className="grid gap-x-6 gap-y-1 md:grid-cols-2">
            {data.memorials.map((m) => (
              <label key={m.id} className="flex items-center gap-2 py-1 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-bronze"
                  checked={memorialIds.includes(m.id)}
                  onChange={(e) => setMemorialIds((cur) => (e.target.checked ? [...cur, m.id] : cur.filter((x) => x !== m.id)))}
                />
                {m.name}
                <span className="text-muted-foreground">· {m.state}</span>
              </label>
            ))}
          </div>
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


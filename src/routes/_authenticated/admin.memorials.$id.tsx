import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { check, Heading, Loading, slugify, type Row } from "@/components/admin/shared";
import {
  FormSection,
  fromSourceDrafts,
  nn,
  PhotoPicker,
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/memorials/$id")({
  head: () => ({ meta: [{ title: "Edit memorial | Editorial Desk" }] }),
  component: MemorialEditor,
});

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
type Memorial = Row<"memorials">;
type Details = {
  name: string; slug: string; city: string; district: string; state: string; latitude: string; longitude: string; coords_approximate: boolean;
  inaugurated_year: string; managed_by: string; description: string; significance: string; hero_media_id: string;
};

function useMemorial(id: string) {
  return useQuery({
    queryKey: ["desk", "memorial", id],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (id === "new") return { memorial: null as Memorial | null, media: [] as Row<"media">[] };
      const memorial = check(await supabase.from("memorials").select("*").eq("id", id).maybeSingle());
      if (!memorial) return null;
      const media = check(await supabase.from("media").select("*").eq("memorial_id", id).order("created_at")) ?? [];
      return { memorial, media };
    },
  });
}

function MemorialEditor() {
  const { id } = Route.useParams();
  const q = useMemorial(id);
  if (q.isPending) return <Loading />;
  if (q.error) return <p className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">Could not load this memorial: {q.error.message}</p>;
  if (!q.data) return <p className="text-muted-foreground">No memorial with this id.</p>;
  return <MemorialForm key={q.dataUpdatedAt} id={id} memorial={q.data.memorial} media={q.data.media} />;
}

function MemorialForm({ id, memorial: m, media }: { id: string; memorial: Memorial | null; media: Row<"media">[] }) {
  const isNew = id === "new";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [d, setD] = useState<Details>({
    name: m?.name ?? "", slug: m?.slug ?? "", city: m?.city ?? "", district: m?.district ?? "", state: m?.state ?? "",
    latitude: m?.latitude?.toString() ?? "", longitude: m?.longitude?.toString() ?? "", coords_approximate: m?.coords_approximate ?? true,
    inaugurated_year: m?.inaugurated_year?.toString() ?? "", managed_by: m?.managed_by ?? "", description: m?.description ?? "",
    significance: m?.significance ?? "", hero_media_id: m?.hero_media_id ?? "",
  });
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [sources, setSources] = useState<SourceDraft[]>(toSourceDrafts(m?.sources ?? []));
  const [busy, setBusy] = useState(false);
  const verification: Verification = m?.verification ?? "draft";
  const set = (patch: Partial<Details>) => setD((cur) => ({ ...cur, ...patch }));

  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  function problems(): string | null {
    if (!d.name.trim()) return "Enter the memorial's name.";
    if (!SLUG.test(d.slug)) return "The web address (slug) may use only lowercase letters, numbers and single hyphens.";
    const lat = num(d.latitude), lng = num(d.longitude), year = num(d.inaugurated_year);
    if (lat !== null && !(lat >= -90 && lat <= 90)) return "Latitude must be a number between -90 and 90.";
    if (lng !== null && !(lng >= -180 && lng <= 180)) return "Longitude must be a number between -180 and 180.";
    if ((lat === null) !== (lng === null)) return "Enter both latitude and longitude, or neither.";
    if (year !== null && !(Number.isInteger(year) && year >= 1800 && year <= 2100)) return "The year established must be between 1800 and 2100.";
    return null;
  }

  async function save(next: Verification) {
    const problem = problems();
    if (problem) return void toast.error(problem, { duration: 8000 });
    setBusy(true);
    try {
      const record = {
        name: d.name.trim(), slug: d.slug, city: nn(d.city), district: nn(d.district), state: nn(d.state), latitude: num(d.latitude),
        longitude: num(d.longitude), coords_approximate: d.coords_approximate, inaugurated_year: num(d.inaugurated_year), managed_by: nn(d.managed_by),
        description: nn(d.description), significance: nn(d.significance), hero_media_id: nn(d.hero_media_id),
        sources: fromSourceDrafts(sources), verification: next,
      };
      const saved = isNew
        ? check(await supabase.from("memorials").insert(record).select("id").single())!
        : check(await supabase.from("memorials").update(record).eq("id", id).select("id").single())!;
      await qc.invalidateQueries({ queryKey: ["desk"] });
      toast.success(next === verification ? "Saved" : next === "verified" ? "Verified and published" : next === "in-review" ? (verification === "verified" ? "Unpublished; back in review" : "Sent for review") : "Returned to draft");
      if (isNew) await navigate({ to: "/admin/memorials/$id", params: { id: saved.id }, replace: true });
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(verification); }} className="pb-28">
      <Link to="/admin/memorials" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-bronze">
        <ArrowLeft className="h-4 w-4" /> All memorials
      </Link>
      <div className="mt-6">
        <Heading title={isNew ? "New memorial" : d.name || "Untitled memorial"}>{!isNew && <VerificationBadge value={verification} />}</Heading>
      </div>
      {verification === "verified" && m && (
        <a href={`/memorials/${m.slug}`} target="_blank" rel="noreferrer" className={cn(MORE_LINK, "-mt-4 mb-6")}>
          View on the public site <ExternalLink className="h-4 w-4" />
        </a>
      )}

      <div className="max-w-3xl space-y-10">
        <FormSection title="Details">
          <div className="grid gap-4 md:grid-cols-2">
            <SmallField label="Name" value={d.name} onChange={(v) => set({ name: v, ...(slugTouched ? {} : { slug: slugify(v) }) })} />
            <SmallField label="Web address (slug)" value={d.slug} onChange={(v) => { setSlugTouched(true); set({ slug: v }); }} />
            <SmallField label="City or town" value={d.city} onChange={(v) => set({ city: v })} />
            <SmallField label="District" value={d.district} onChange={(v) => set({ district: v })} />
            <SmallField label="State or union territory" value={d.state} onChange={(v) => set({ state: v })} />
            <SmallField label="Year established" value={d.inaugurated_year} onChange={(v) => set({ inaugurated_year: v.replace(/\D/g, "").slice(0, 4) })} />
            <SmallField label="Managed by" value={d.managed_by} onChange={(v) => set({ managed_by: v })} placeholder="e.g. Ministry of Defence" />
          </div>
          <div className="mt-4 space-y-4">
            <TextAreaField label="Description" rows={6} value={d.description} onChange={(v) => set({ description: v })} />
            <TextAreaField label="Significance" rows={3} value={d.significance} onChange={(v) => set({ significance: v })} hint="Shown as a quotation under the description." />
          </div>
        </FormSection>

        <FormSection title="Location" hint="Used for the map. Mark it approximate unless the position has been checked on the ground or from an official source.">
          <div className="grid gap-4 md:grid-cols-2">
            <SmallField label="Latitude" value={d.latitude} onChange={(v) => set({ latitude: v })} placeholder="e.g. 28.6127" />
            <SmallField label="Longitude" value={d.longitude} onChange={(v) => set({ longitude: v })} placeholder="e.g. 77.2334" />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-bronze" checked={d.coords_approximate} onChange={(e) => set({ coords_approximate: e.target.checked })} />
            The position is approximate
          </label>
        </FormSection>

        <FormSection title="Sources" hint="At least one primary source is required before the memorial can be verified and published.">
          <SourcesEditor value={sources} onChange={setSources} />
        </FormSection>

        <FormSection title="Lead photo" hint={isNew ? "Save the memorial first; photos linked to it can then be chosen here." : "Shown beside the title on the memorial's page and on its card."}>
          {!isNew && <PhotoPicker label="Lead photo" value={d.hero_media_id} onChange={(v) => set({ hero_media_id: v })} media={media} />}
        </FormSection>

        <p className="text-sm text-muted-foreground">The names honoured here are set on each recipient's record, under Memorials.</p>
      </div>

      <div className="fixed bottom-0 left-64 right-0 border-t border-border bg-background/95 px-10 py-4 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <VerificationActions value={verification} busy={busy} onSave={(next) => void save(next)} />
        </div>
      </div>
    </form>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { check, Heading, Loading, type Row } from "@/components/admin/shared";
import {
  nn,
  SelectField,
  showError,
  SmallField,
  TextAreaField,
  VERIFICATION_LABEL,
  VerificationActions,
  VerificationBadge,
  type Verification,
} from "@/components/admin/forms";
import { FilterChip, MORE_LINK } from "@/components/archive/primitives";
import { Button } from "@/components/ui/button";
import { LICENSE_LABELS, thumb } from "@/lib/archive";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/photos")({
  head: () => ({ meta: [{ title: "Photos | Editorial Desk" }] }),
  component: PhotosDesk,
});

type Media = Row<"media">;
type License = Media["license"];
const BUCKET = "archive-media";
const LICENSES = Object.keys(LICENSE_LABELS) as License[];
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MAX_EDGE = 2400;

function usePhotos() {
  return useQuery({
    queryKey: ["desk", "photos"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const [media, martyrs, memorials, wars] = await Promise.all([
        supabase.from("media").select("*").order("created_at", { ascending: false }).then(check),
        supabase.from("martyrs").select("id,full_name,rank").order("full_name").then(check),
        supabase.from("memorials").select("id,name").order("name").then(check),
        supabase.from("wars").select("id,name").order("start_date", { ascending: true, nullsFirst: false }).then(check),
      ]);
      // Uploaded files sit in a private bucket; editors see them through short-lived signed links.
      const paths = (media ?? []).map((m) => m.storage_path).filter((p): p is string => !!p);
      const signed = paths.length ? ((await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60)).data ?? []) : [];
      const links = new Map(signed.map((s) => [s.path, s.signedUrl]));
      return {
        media: (media ?? []).map((m) => ({ ...m, preview: m.storage_path ? (links.get(m.storage_path) ?? "") : thumb(m.url, 330) })),
        martyrs: martyrs ?? [],
        memorials: memorials ?? [],
        wars: wars ?? [],
      };
    },
  });
}

type PhotosData = NonNullable<ReturnType<typeof usePhotos>["data"]>;
type Photo = PhotosData["media"][number];

const FILTERS: (Verification | "all")[] = ["all", "draft", "in-review", "verified"];

function PhotosDesk() {
  const q = usePhotos();
  const [filter, setFilter] = useState<Verification | "all">("all");
  const [selected, setSelected] = useState<string | "new" | null>(null);

  if (q.isPending) return <Loading />;
  if (q.error) return <p className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">Could not load photos: {q.error.message}</p>;

  const data = q.data;
  const visible = data.media.filter((m) => filter === "all" || m.verification === filter);
  const current = selected === "new" ? null : (data.media.find((m) => m.id === selected) ?? null);
  const linkedTo = (m: Media) =>
    data.martyrs.find((x) => x.id === m.martyr_id)?.full_name ?? data.memorials.find((x) => x.id === m.memorial_id)?.name ?? data.wars.find((x) => x.id === m.war_id)?.name ?? "Not linked";

  return (
    <>
      <Heading title="Photos">
        <Button onClick={() => setSelected("new")}>
          <Upload /> Upload a photo
        </Button>
      </Heading>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : VERIFICATION_LABEL[f]} · {data.media.filter((m) => f === "all" || m.verification === f).length}
          </FilterChip>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <ul className="divide-y divide-border/70 self-start border-y border-border/70">
          {visible.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => setSelected(m.id)}
                className={cn("grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-4 px-3 py-2.5 text-left text-sm hover:bg-secondary/60", selected === m.id && "bg-secondary")}
              >
                {m.preview ? (
                  <img src={m.preview} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-sm border border-border object-cover" />
                ) : (
                  <span className="aspect-[4/3] w-full rounded-sm bg-secondary" />
                )}
                <span className="min-w-0">
                  <span className="block truncate font-medium text-foreground">{m.title}</span>
                  <span className="block truncate text-muted-foreground">
                    {linkedTo(m)} · {LICENSE_LABELS[m.license]}
                  </span>
                </span>
                <VerificationBadge value={m.verification} />
              </button>
            </li>
          ))}
          {visible.length === 0 && <li className="px-3 py-4 text-sm text-muted-foreground">No photos match.</li>}
        </ul>

        {selected === "new" ? (
          <PhotoPanel key="new" data={data} photo={null} onDone={setSelected} />
        ) : current ? (
          <PhotoPanel key={`${current.id}-${current.updated_at}`} data={data} photo={current} onDone={setSelected} />
        ) : (
          <p className="text-sm text-muted-foreground">Select a photo to edit it, or upload a new one.</p>
        )}
      </div>
    </>
  );
}

/** Reads the image's size and, when it is very large, scales it down to a JPEG before upload. */
async function prepareImage(file: File): Promise<{ blob: Blob; width: number; height: number; ext: string }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  if (scale === 1 && file.size <= 5 * 1024 * 1024) {
    bitmap.close();
    return { blob: file, width, height, ext: file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg" };
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process the image"))), "image/jpeg", 0.86));
  return { blob, width: canvas.width, height: canvas.height, ext: "jpg" };
}

function PhotoPanel({ data, photo, onDone }: { data: PhotosData; photo: Photo | null; onDone: (id: string | null) => void }) {
  const qc = useQueryClient();
  const isNew = !photo;
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [f, setF] = useState({
    title: photo?.title ?? "",
    description: photo?.description ?? "",
    kind: photo?.kind ?? "photo",
    credit: photo?.credit ?? "",
    license: (photo?.license ?? "unverified") as License,
    license_detail: photo?.license_detail ?? "",
    source_url: photo?.source_url ?? "",
    link: photo?.martyr_id ? `martyr:${photo.martyr_id}` : photo?.memorial_id ? `memorial:${photo.memorial_id}` : photo?.war_id ? `war:${photo.war_id}` : "",
  });
  const [busy, setBusy] = useState(false);
  const verification: Verification = photo?.verification ?? "draft";
  const set = (patch: Partial<typeof f>) => setF((cur) => ({ ...cur, ...patch }));

  function pick(next: File | null) {
    if (localPreview) URL.revokeObjectURL(localPreview);
    if (next && !ACCEPTED.includes(next.type)) return void toast.error("Choose a JPEG, PNG or WebP image.");
    if (next && next.size > MAX_INPUT_BYTES) return void toast.error("This file is over 15 MB. Choose a smaller image.");
    setFile(next);
    setLocalPreview(next ? URL.createObjectURL(next) : null);
    if (next && !f.title) set({ title: next.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") });
  }

  async function save(next: Verification) {
    if (isNew && !file) return void toast.error("Choose an image to upload.");
    if (!f.title.trim()) return void toast.error("Give the photo a title.");
    const [kind, linkId] = f.link.split(":");
    const fields = {
      title: f.title.trim(), description: nn(f.description), kind: f.kind, credit: nn(f.credit), license: f.license, license_detail: nn(f.license_detail),
      source_url: nn(f.source_url), martyr_id: kind === "martyr" ? linkId! : null, memorial_id: kind === "memorial" ? linkId! : null,
      war_id: kind === "war" ? linkId! : null, verification: next,
    };
    setBusy(true);
    let uploadedPath: string | null = null;
    try {
      if (isNew) {
        const img = await prepareImage(file!);
        uploadedPath = `${crypto.randomUUID()}.${img.ext}`;
        const up = await supabase.storage.from(BUCKET).upload(uploadedPath, img.blob, { contentType: img.ext === "jpg" ? "image/jpeg" : `image/${img.ext}`, upsert: false });
        if (up.error) throw new Error(up.error.message);
        // The public site swaps this for a signed link; the path is kept here so the record is self-describing.
        const row = check(await supabase.from("media").insert({ ...fields, url: `${BUCKET}/${uploadedPath}`, storage_path: uploadedPath, width: img.width, height: img.height }).select("id").single())!;
        uploadedPath = null;
        toast.success("Photo uploaded");
        await qc.invalidateQueries({ queryKey: ["desk"] });
        onDone(row.id);
      } else {
        check(await supabase.from("media").update(fields).eq("id", photo.id).select("id").single());
        toast.success(next === verification ? "Saved" : next === "verified" ? "Verified and published" : next === "in-review" ? (verification === "verified" ? "Unpublished; back in review" : "Sent for review") : "Returned to draft");
        await qc.invalidateQueries({ queryKey: ["desk"] });
      }
    } catch (e) {
      // Don't leave an orphaned file behind when the record could not be created.
      if (uploadedPath) await supabase.storage.from(BUCKET).remove([uploadedPath]);
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  const preview = localPreview ?? photo?.preview ?? null;
  const linkOptions = [
    { value: "", label: "Not linked" },
    ...data.martyrs.map((m) => ({ value: `martyr:${m.id}`, label: `Recipient: ${[m.rank, m.full_name].filter(Boolean).join(" ")}` })),
    ...data.memorials.map((m) => ({ value: `memorial:${m.id}`, label: `Memorial: ${m.name}` })),
    ...data.wars.map((w) => ({ value: `war:${w.id}`, label: `Conflict: ${w.name}` })),
  ];

  return (
    <article className="self-start rounded-md border border-border bg-card p-6 lg:sticky lg:top-10">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold leading-tight">{isNew ? "Upload a photo" : "Edit photo"}</h2>
        {!isNew && <VerificationBadge value={verification} />}
      </div>

      {preview && <img src={preview} alt="" className="mt-4 max-h-64 w-full rounded-sm border border-border object-contain" />}
      {isNew && (
        <label className="mt-4 block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Image (JPEG, PNG or WebP, up to 15 MB; large images are scaled to {MAX_EDGE}px)</span>
          <input type="file" accept={ACCEPTED.join(",")} onChange={(e) => pick(e.target.files?.[0] ?? null)} className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-transparent file:px-3 file:py-1.5 file:text-foreground" />
        </label>
      )}
      {!isNew && !photo.storage_path && (
        <a href={photo.url} target="_blank" rel="noreferrer" className={cn(MORE_LINK, "mt-3")}>
          Open the original file <ExternalLink className="h-4 w-4" />
        </a>
      )}

      <div className="mt-5 space-y-3">
        <SmallField label="Title" value={f.title} onChange={(v) => set({ title: v })} />
        <TextAreaField label="Description" rows={2} value={f.description} onChange={(v) => set({ description: v })} />
        <SelectField label="Kind" value={f.kind} onChange={(v) => set({ kind: v })} options={[{ value: "photo", label: "Photograph" }, { value: "document", label: "Document" }]} />
        <SelectField label="Belongs to" value={f.link} onChange={(v) => set({ link: v })} options={linkOptions} />
        <SelectField label="Licence" value={f.license} onChange={(v) => set({ license: v as License })} options={LICENSES.map((l) => ({ value: l, label: LICENSE_LABELS[l] }))} />
        <SmallField label="Credit (photographer or owner)" value={f.credit} onChange={(v) => set({ credit: v })} />
        <SmallField label="Licence detail" value={f.license_detail} onChange={(v) => set({ license_detail: v })} placeholder="e.g. CC BY-SA 4.0" />
        <SmallField label="Where it came from" value={f.source_url} onChange={(v) => set({ source_url: v })} placeholder="https://commons.wikimedia.org/..." />
        <p className="text-xs text-muted-foreground">A photo is shown publicly only once verified, and it can be verified only with a cleared licence. CC BY, CC BY-SA and GODL-India licences also need a credit.</p>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        {isNew ? (
          <Button disabled={busy} onClick={() => void save("draft")}>
            {busy ? "Uploading…" : "Upload as draft"}
          </Button>
        ) : (
          <VerificationActions value={verification} busy={busy} onSave={(next) => void save(next)} />
        )}
      </div>
    </article>
  );
}

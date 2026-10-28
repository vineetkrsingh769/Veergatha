import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { check, fail, Heading, Loading, type Row } from "@/components/admin/shared";
import { FilterChip, MORE_LINK } from "@/components/archive/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/archive";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/corrections")({
  head: () => ({ meta: [{ title: "Corrections | Editorial Desk" }] }),
  component: CorrectionsInbox,
});

type Correction = Row<"corrections">;
type Status = Correction["status"];

const STATUSES: { value: Status; label: string; action: string }[] = [
  { value: "new", label: "New", action: "Move back to new" },
  { value: "reviewing", label: "Reviewing", action: "Mark as reviewing" },
  { value: "resolved", label: "Resolved", action: "Mark as resolved" },
  { value: "rejected", label: "Rejected", action: "Reject" },
];

/** Public page of the record a correction is about, when it names one. */
function recordHref(c: Correction): string | null {
  if (!c.record_slug) return null;
  const base = { recipient: "/martyrs/", memorial: "/memorials/", conflict: "/wars/" }[c.record_type as string];
  return base ? base + c.record_slug : null;
}

function CorrectionsInbox() {
  const [status, setStatus] = useState<Status>("new");
  const [selected, setSelected] = useState<string | null>(null);
  const all = useQuery({
    queryKey: ["desk", "corrections"],
    queryFn: async () =>
      check(await supabase.from("corrections").select("*").order("created_at", { ascending: false })) ?? [],
  });

  const items = (all.data ?? []).filter((c) => c.status === status);
  const current = (all.data ?? []).find((c) => c.id === selected) ?? null;

  return (
    <>
      <Heading title="Corrections" />
      <p className="-mt-4 mb-8 max-w-2xl text-sm text-muted-foreground">
        Submissions from the public correction form. Check each one against its source, change the record if it holds
        up, then mark it resolved or rejected.
      </p>

      {all.isPending ? (
        <Loading />
      ) : all.error ? (
        <p className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">Could not load corrections: {all.error.message}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {STATUSES.map((s) => (
              <FilterChip key={s.value} active={status === s.value} onClick={() => { setStatus(s.value); setSelected(null); }}>
                {s.label} · {(all.data ?? []).filter((c) => c.status === s.value).length}
              </FilterChip>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No {STATUSES.find((s) => s.value === status)!.label.toLowerCase()} corrections.</p>
            ) : (
              <ul className="divide-y divide-border/70 self-start border-y border-border/70">
                {items.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelected(c.id)}
                      className={cn(
                        "grid w-full grid-cols-[6.5rem_1fr] gap-4 px-3 py-3 text-left text-sm transition-colors hover:bg-secondary/60",
                        selected === c.id && "bg-secondary",
                      )}
                    >
                      <span className="tabular-nums text-muted-foreground">{formatDate(c.created_at.slice(0, 10))}</span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {c.record_type}
                          {c.record_slug && <span className="font-normal text-muted-foreground"> · {c.record_slug}</span>}
                          <span className="font-normal text-muted-foreground"> · {c.field}</span>
                        </span>
                        <span className="block truncate text-muted-foreground">{c.details}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {current ? (
              <CorrectionDetail key={current.id} c={current} />
            ) : (
              items.length > 0 && <p className="text-sm text-muted-foreground">Select a correction to read it in full.</p>
            )}
          </div>
        </>
      )}
    </>
  );
}

function CorrectionDetail({ c }: { c: Correction }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(c.editor_notes ?? "");
  const href = recordHref(c);

  const save = useMutation({
    mutationFn: async (patch: { status?: Status; editor_notes: string | null }) =>
      check(await supabase.from("corrections").update(patch).eq("id", c.id).select("id").single()),
    onSuccess: (_d, patch) => {
      void qc.invalidateQueries({ queryKey: ["desk"] });
      toast.success(patch.status ? `Marked as ${STATUSES.find((s) => s.value === patch.status)!.label.toLowerCase()}` : "Notes saved");
    },
    onError: fail,
  });
  const editorNotes = notes.trim() || null;

  return (
    <article className="self-start rounded-md border border-border bg-card p-6 lg:sticky lg:top-10">
      <p className="text-xs text-muted-foreground">
        Received {formatDate(c.created_at.slice(0, 10), true)} · {STATUSES.find((s) => s.value === c.status)!.label}
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">
        {c.record_type}
        {c.record_slug && <> · {c.record_slug}</>}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Field: {c.field}</p>

      <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{c.details}</p>

      <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Source given</dt>
          <dd className="break-all">
            {c.source_url ? (
              <a href={c.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-bronze hover:underline">
                {c.source_url} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Reply address</dt>
          <dd>{c.email ?? <span className="text-muted-foreground">Not given</span>}</dd>
        </div>
      </dl>
      {href && (
        <a href={href} target="_blank" rel="noreferrer" className={cn(MORE_LINK, "mt-4")}>
          Open the record <ExternalLink className="h-4 w-4" />
        </a>
      )}

      <label className="mt-6 block space-y-2 text-sm">
        <span className="text-muted-foreground">Editor notes (only editors see these)</span>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
      </label>
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        disabled={save.isPending || editorNotes === (c.editor_notes ?? null)}
        onClick={() => save.mutate({ editor_notes: editorNotes })}
      >
        Save notes
      </Button>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
        {STATUSES.filter((s) => s.value !== c.status).map((s) => (
          <Button
            key={s.value}
            size="sm"
            variant={s.value === "resolved" ? "default" : "outline"}
            disabled={save.isPending}
            onClick={() => save.mutate({ status: s.value, editor_notes: editorNotes })}
          >
            {s.action}
          </Button>
        ))}
      </div>
    </article>
  );
}

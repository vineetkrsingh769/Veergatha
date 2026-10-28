import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { check, Heading, Loading } from "@/components/admin/shared";
import { MORE_LINK } from "@/components/archive/primitives";
import { formatDate } from "@/lib/archive";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

const RECORD_TABLES = [
  { table: "martyrs", label: "Recipients" },
  { table: "wars", label: "Conflicts" },
  { table: "memorials", label: "Memorials" },
  { table: "media", label: "Photos and documents" },
] as const;
const VERIFICATION = [
  { value: "draft", label: "Draft" },
  { value: "in-review", label: "In review" },
  { value: "verified", label: "Verified" },
] as const;
const CORRECTION_STATUS = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
] as const;

/** Resolves a head-only count query, throwing its error rather than showing a wrong zero. */
async function count(query: PromiseLike<{ count: number | null; error: { message: string } | null }>): Promise<number> {
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

const head = { count: "exact", head: true } as const;

// Every figure here is a live count from the database; editors can read drafts as well as published records.
function useOverview() {
  return useQuery({
    queryKey: ["desk", "overview"],
    queryFn: async () => {
      const [records, corrections, latest, gazettePending, noPortrait, licencePending] = await Promise.all([
        Promise.all(
          RECORD_TABLES.map(async (t) => ({
            label: t.label,
            // All four tables share the verification column; the cast lets one query shape serve them.
            counts: await Promise.all(
              VERIFICATION.map((v) => count(supabase.from(t.table as "martyrs").select("id", head).eq("verification", v.value))),
            ),
          })),
        ),
        Promise.all(CORRECTION_STATUS.map((s) => count(supabase.from("corrections").select("id", head).eq("status", s.value)))),
        supabase
          .from("corrections")
          .select("id,record_type,record_slug,field,details,created_at")
          .eq("status", "new")
          .order("created_at", { ascending: false })
          .limit(5)
          .then(check),
        count(supabase.from("awards").select("id", head).is("gazette_ref", null)),
        count(supabase.from("martyrs").select("id", head).is("portrait_media_id", null)),
        count(supabase.from("media").select("id", head).eq("license", "unverified")),
      ]);
      return { records, corrections, latest: latest ?? [], gazettePending, noPortrait, licencePending };
    },
  });
}

function Overview() {
  const { data, isPending, error } = useOverview();

  return (
    <>
      <Heading title="Overview" />
      {isPending ? (
        <Loading />
      ) : error ? (
        <p className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">Could not load the overview: {error.message}</p>
      ) : (
        <div className="space-y-14">
          <section>
            <h2 className="font-display text-2xl font-semibold">Records by status</h2>
            <p className="mt-1 text-sm text-muted-foreground">Only verified records appear on the public site.</p>
            <table className="mt-5 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 font-medium">Record</th>
                  {VERIFICATION.map((v) => (
                    <th key={v.value} className="py-2 text-right font-medium">
                      {v.label}
                    </th>
                  ))}
                  <th className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r) => (
                  <tr key={r.label} className="border-b border-border/70">
                    <td className="py-3 font-medium text-foreground">{r.label}</td>
                    {r.counts.map((n, i) => (
                      <td key={VERIFICATION[i]!.value} className={`py-3 text-right tabular-nums ${n === 0 ? "text-muted-foreground" : ""}`}>
                        {n}
                      </td>
                    ))}
                    <td className="py-3 text-right font-semibold tabular-nums">{r.counts.reduce((a, b) => a + b, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Corrections</h2>
            <dl className="mt-5 grid grid-cols-4 divide-x divide-border rounded-md border border-border">
              {CORRECTION_STATUS.map((s, i) => (
                <div key={s.value} className="px-5 py-4">
                  <dt className="text-xs text-muted-foreground">{s.label}</dt>
                  <dd className="mt-1 font-display text-3xl font-semibold tabular-nums">{data.corrections[i]}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex items-baseline justify-between gap-4">
              <h3 className="text-sm font-semibold text-foreground">Latest new submissions</h3>
              <Link to="/admin/corrections" className={MORE_LINK}>
                Open the inbox <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {data.latest.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No new corrections.</p>
            ) : (
              <ul className="mt-2 divide-y divide-border/70 border-y border-border/70">
                {data.latest.map((c) => (
                  <li key={c.id} className="grid grid-cols-[7rem_12rem_1fr] gap-4 py-3 text-sm">
                    <span className="tabular-nums text-muted-foreground">{formatDate(c.created_at.slice(0, 10))}</span>
                    <span className="truncate">
                      {c.record_type}
                      {c.record_slug && <span className="text-muted-foreground"> · {c.record_slug}</span>}
                    </span>
                    <span className="truncate text-muted-foreground">
                      <span className="text-foreground">{c.field}:</span> {c.details}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Open questions in the data</h2>
            <ul className="mt-5 divide-y divide-border/70 border-y border-border/70 text-sm">
              <li className="flex items-baseline justify-between gap-4 py-3">
                <span>Awards whose gazette notification number is still awaiting verification</span>
                <span className="font-semibold tabular-nums">{data.gazettePending}</span>
              </li>
              <li className="flex items-baseline justify-between gap-4 py-3">
                <span>Recipients without a portrait under a cleared licence</span>
                <span className="font-semibold tabular-nums">{data.noPortrait}</span>
              </li>
              <li className="flex items-baseline justify-between gap-4 py-3">
                <span>Photos with an unverified licence, which cannot be published</span>
                <span className="font-semibold tabular-nums">{data.licencePending}</span>
              </li>
            </ul>
          </section>
        </div>
      )}
    </>
  );
}

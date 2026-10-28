import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { check, Heading, Loading } from "@/components/admin/shared";
import { VERIFICATION_LABEL, VerificationBadge, type Verification } from "@/components/admin/forms";
import { FilterChip, StatusText } from "@/components/archive/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AWARD_SHORT, formatDate, fullTitle } from "@/lib/archive";

export const Route = createFileRoute("/_authenticated/admin/recipients/")({
  head: () => ({ meta: [{ title: "Recipients | Editorial Desk" }] }),
  component: RecipientsList,
});

const FILTERS: (Verification | "all")[] = ["all", "draft", "in-review", "verified"];

function RecipientsList() {
  const [filter, setFilter] = useState<Verification | "all">("all");
  const [q, setQ] = useState("");
  const rows = useQuery({
    queryKey: ["desk", "recipients"],
    queryFn: async () =>
      check(
        await supabase
          .from("martyrs")
          .select("id,slug,full_name,rank,status,verification,date_of_action,updated_at,war:wars(name),awards(name)")
          .order("date_of_action", { ascending: true, nullsFirst: false }),
      ) ?? [],
  });

  const needle = q.trim().toLowerCase();
  const visible = (rows.data ?? []).filter(
    (r) => (filter === "all" || r.verification === filter) && (!needle || `${r.rank ?? ""} ${r.full_name} ${r.slug}`.toLowerCase().includes(needle)),
  );

  return (
    <>
      <Heading title="Recipients">
        <Button asChild>
          <Link to="/admin/recipients/$id" params={{ id: "new" }}>
            <Plus /> New recipient
          </Link>
        </Button>
      </Heading>

      {rows.isPending ? (
        <Loading />
      ) : rows.error ? (
        <p className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">Could not load recipients: {rows.error.message}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
              {FILTERS.map((f) => (
                <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
                  {f === "all" ? "All" : VERIFICATION_LABEL[f]} · {(rows.data ?? []).filter((r) => f === "all" || r.verification === f).length}
                </FilterChip>
              ))}
            </div>
            <div className="relative w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find by name" className="h-9 pl-9" aria-label="Find by name" />
            </div>
          </div>

          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Award</th>
                <th className="py-2 font-medium">Conflict</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Record</th>
                <th className="py-2 text-right font-medium">Last edited</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-b border-border/70 hover:bg-secondary/40">
                  <td className="py-2.5 pr-4">
                    <Link to="/admin/recipients/$id" params={{ id: r.id }} className="font-medium text-foreground hover:text-bronze-light">
                      {fullTitle(r)}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.awards.map((a) => AWARD_SHORT[a.name] ?? a.name).join(", ") || "None"}</td>
                  <td className="max-w-56 truncate py-2.5 pr-4 text-muted-foreground">{r.war?.name ?? "None"}</td>
                  <td className="py-2.5 pr-4">
                    <StatusText status={r.status} />
                  </td>
                  <td className="py-2.5 pr-4">
                    <VerificationBadge value={r.verification} />
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">{formatDate(r.updated_at.slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No recipients match.</p>}
        </>
      )}
    </>
  );
}

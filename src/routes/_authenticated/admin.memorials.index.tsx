import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { check, Heading, Loading } from "@/components/admin/shared";
import { VERIFICATION_LABEL, VerificationBadge, type Verification } from "@/components/admin/forms";
import { FilterChip } from "@/components/archive/primitives";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/archive";

export const Route = createFileRoute("/_authenticated/admin/memorials/")({
  head: () => ({ meta: [{ title: "Memorials | Editorial Desk" }] }),
  component: MemorialsList,
});

const FILTERS: (Verification | "all")[] = ["all", "draft", "in-review", "verified"];

function MemorialsList() {
  const [filter, setFilter] = useState<Verification | "all">("all");
  const rows = useQuery({
    queryKey: ["desk", "memorials"],
    queryFn: async () =>
      check(await supabase.from("memorials").select("id,name,city,state,verification,updated_at,martyr_memorials(count)").order("name")) ?? [],
  });
  const visible = (rows.data ?? []).filter((r) => filter === "all" || r.verification === filter);

  return (
    <>
      <Heading title="Memorials">
        <Button asChild>
          <Link to="/admin/memorials/$id" params={{ id: "new" }}>
            <Plus /> New memorial
          </Link>
        </Button>
      </Heading>
      {rows.isPending ? (
        <Loading />
      ) : rows.error ? (
        <p className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">Could not load memorials: {rows.error.message}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : VERIFICATION_LABEL[f]} · {(rows.data ?? []).filter((r) => f === "all" || r.verification === f).length}
              </FilterChip>
            ))}
          </div>
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Place</th>
                <th className="py-2 text-right font-medium">Recipients</th>
                <th className="py-2 pl-6 font-medium">Record</th>
                <th className="py-2 text-right font-medium">Last edited</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-b border-border/70 hover:bg-secondary/40">
                  <td className="py-2.5 pr-4">
                    <Link to="/admin/memorials/$id" params={{ id: r.id }} className="font-medium text-foreground hover:text-bronze-light">
                      {r.name}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{[r.city, r.state].filter(Boolean).join(", ") || "Not set"}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">{(r.martyr_memorials as unknown as { count: number }[])?.[0]?.count ?? 0}</td>
                  <td className="py-2.5 pl-6">
                    <VerificationBadge value={r.verification} />
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">{formatDate(r.updated_at.slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No memorials match.</p>}
        </>
      )}
    </>
  );
}

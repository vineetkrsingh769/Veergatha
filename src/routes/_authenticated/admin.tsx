import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ExternalLink, Flag, Image, Inbox, LayoutDashboard, LogOut, Landmark, Users } from "lucide-react";
import { Emblem } from "@/components/archive/primitives";
import { Loading, useEditorRole, useSignOut } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Editorial Desk | Veergatha" }] }),
  component: DeskLayout,
});

// Sections are added here as they are built.
const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/corrections", label: "Corrections", icon: Inbox, exact: false },
  { to: "/admin/recipients", label: "Recipients", icon: Users, exact: false },
  { to: "/admin/conflicts", label: "Conflicts", icon: Flag, exact: false },
  { to: "/admin/memorials", label: "Memorials", icon: Landmark, exact: false },
  { to: "/admin/photos", label: "Photos", icon: Image, exact: false },
] as const;

function DeskLayout() {
  const role = useEditorRole();
  const signOut = useSignOut();

  if (role.isPending) {
    return (
      <main className="mx-auto max-w-5xl px-10 py-16">
        <Loading />
      </main>
    );
  }

  // Signed in, but the database grants this account no editor or admin role.
  if (role.isError || !role.data.isEditor) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-md">
          <Emblem className="h-16 w-16" />
          <h1 className="mt-6 font-display text-4xl font-semibold">No editor access</h1>
          <p className="mt-3 text-muted-foreground">
            {role.isError
              ? role.error.message
              : `${role.data.user.email} is signed in but has no editor role. The archive's admin can grant one.`}
          </p>
          <Button variant="outline" className="mt-6" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border px-5 py-6">
        <Link to="/admin" className="flex items-center gap-3">
          <Emblem className="h-10 w-10" />
          <span>
            <span className="block font-display text-xl font-semibold leading-none">Veergatha</span>
            <span className="eyebrow mt-1.5 block text-[0.6rem]">Editorial Desk</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-1" aria-label="Editorial Desk">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary font-semibold text-foreground" }}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-5 text-sm">
          <div>
            <p className="truncate text-foreground" title={role.data.user.email}>
              {role.data.user.email}
            </p>
            <p className="text-xs text-muted-foreground">{role.data.isAdmin ? "Admin" : "Editor"}</p>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-bronze">
            <ExternalLink className="h-4 w-4" /> View the public site
          </a>
          <button onClick={signOut} className="flex items-center gap-2 text-muted-foreground hover:text-bronze">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-10 py-10">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

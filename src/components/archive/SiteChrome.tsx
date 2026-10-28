import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Emblem } from "./primitives";

const NAV = [
  { to: "/martyrs", label: "Roll of Honour" },
  { to: "/wars", label: "Conflicts" },
  { to: "/memorials", label: "Memorials" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-3" aria-label="Veergatha home">
          <Emblem className="h-9 w-9" />
          <span className="leading-none">
            <span className="block font-display text-2xl font-semibold tracking-wide text-foreground">Veergatha</span>
            <span className="block font-deva text-[0.7rem] tracking-[0.3em] text-bronze">वीरगाथा</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((n) => {
            const active = path === n.to || path.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground",
                  "after:absolute after:inset-x-3.5 after:-bottom-[13px] after:h-px after:scale-x-0 after:bg-bronze after:transition",
                  active && "text-foreground after:scale-x-100",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="flex h-9 items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 text-sm text-muted-foreground transition hover:border-bronze/50 hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search the archive</span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-border bg-background">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mt-8 flex flex-col">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="border-b border-border py-4 font-display text-2xl font-semibold text-foreground hover:text-bronze"
                  >
                    {n.label}
                  </Link>
                ))}
                <Link to="/corrections" onClick={() => setOpen(false)} className="py-4 text-sm text-muted-foreground hover:text-foreground">
                  Submit a correction
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Emblem className="h-12 w-12" />
            <div>
              <p className="font-display text-3xl font-semibold">Veergatha</p>
              <p className="font-deva text-xs tracking-[0.3em] text-bronze">वीरगाथा · tales of bravery</p>
            </div>
          </div>
          <p className="mt-6 max-w-sm font-prose text-sm leading-relaxed text-muted-foreground">
            A digital archive of India's gallantry award recipients, the conflicts they served in, and the memorials that
            carry their names. Every record lists the sources it is based on.
          </p>
        </div>
        <FooterCol
          title="Explore"
          links={[
            ["/martyrs", "Roll of Honour"],
            ["/wars", "Conflicts & operations"],
            ["/memorials", "Memorial directory"],
            ["/gallery", "Photo archive"],
          ]}
        />
        <FooterCol
          title="Integrity"
          links={[
            ["/about", "Sourcing & methodology"],
            ["/corrections", "Submit a correction"],
            ["/search", "Search the archive"],
          ]}
        />
        <div>
          <p className="eyebrow">Primary sources</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              ["https://gallantryawards.gov.in/", "Gallantry Awards Portal"],
              ["https://nationalwarmemorial.gov.in/", "National War Memorial"],
              ["https://indianarmy.nic.in/", "Indian Army"],
              ["https://pib.gov.in/", "Press Information Bureau"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noreferrer" className="hover:text-bronze">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground sm:px-8">
          <p>No classified or operationally sensitive material is published. Photographs are credited under their open licences.</p>
          <Link to="/admin" className="hover:text-bronze">
            Editorial desk
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="hover:text-bronze">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

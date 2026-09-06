import { Link, NavLink, Outlet } from "react-router-dom";
import { Search } from "lucide-react";

/**
 * The five real routes. "/" is deliberately absent — the wordmark is the home
 * link, which is the convention and buys back the width the nav needs.
 *
 * /martyrs is labelled "Recipients", not "Gallantry Awards": the section is a
 * list of people, and three of the twenty-one Param Vir Chakra recipients
 * survived their action. Naming the section after the people rather than after
 * the award avoids a label that quietly implies all of them fell.
 */
const NAV_ITEMS = [
  { to: "/martyrs", label: "Recipients" },
  { to: "/memorials", label: "Memorials" },
  { to: "/wars", label: "Operations" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
];

/**
 * One focus treatment for every interactive element in the shell. An outline
 * rather than a ring: it follows the border radius, is never clipped by an
 * ancestor's overflow, and survives forced-colors mode.
 */
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep";

/** The same treatment on the dark footer, where accent-deep is too dark to see. */
const FOCUS_DARK =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron-100";

/**
 * Footer columns. Everything here either resolves or is explicitly marked as
 * not yet available — a footer full of links that 404 is worse than a footer
 * that admits what has not been built.
 *
 * The external entries are the primary sources named in docs/SOURCING.md. They
 * are listed, not characterised: what the archive claims about its own sourcing
 * belongs on /about, which Night 17 writes.
 */
const FOOTER_COLUMNS = [
  {
    title: "The archive",
    links: [
      { to: "/about", label: "About & methodology" },
      { to: "/martyrs", label: "Recipients" },
      { to: "/memorials", label: "War memorials" },
      { to: "/wars", label: "Operations" },
    ],
  },
  {
    title: "Browse",
    links: [
      { to: "/search", label: "Search the archive" },
      { to: "/gallery", label: "Gallery" },
      { to: "/martyrs", label: "By award" },
      { to: "/wars", label: "By conflict" },
    ],
  },
  {
    title: "Sources",
    links: [
      { href: "https://gallantryawards.gov.in", label: "Gallantry Awards portal" },
      { href: "https://egazette.gov.in", label: "The Gazette of India" },
      { href: "https://www.nationalwarmemorial.gov.in", label: "National War Memorial" },
      { href: "https://pib.gov.in", label: "Press Information Bureau" },
    ],
  },
  {
    title: "Contact",
    links: [
      // Resolves to a marked stub as of Night 8; the form itself is Night 20.
      { to: "/corrections", label: "Submit a correction" },
      { label: "Contribute material", pending: true },
      { label: "Contact the archive", pending: true },
    ],
  },
];

function FooterLink({ to, href, label, pending }) {
  const base = `rounded-control text-body text-parchment-300 transition-colors hover:text-saffron-100 ${FOCUS_DARK}`;

  // Not a link and not focusable: a dead tab stop is a worse experience than an
  // honest label.
  if (pending) {
    return (
      <span className="flex items-baseline gap-2 text-body text-faint">
        {label}
        <span className="rounded-control border border-tiranga-800 px-1.5 py-0.5 text-caption uppercase tracking-wide">
          Soon
        </span>
      </span>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base}>
        {label}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link to={to} className={base}>
      {label}
    </Link>
  );
}

/**
 * Every item keeps identical padding, and the active marker is an `after`
 * underline rather than a border. A border-bottom on the active item alone adds
 * height to just that link, which is what made the row shift as you navigated.
 */
const navLinkClass = ({ isActive }) =>
  [
    "relative whitespace-nowrap rounded-control px-3 py-2 text-body transition-colors",
    "after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:transition-colors",
    FOCUS,
    isActive
      ? "font-semibold text-accent-deep after:bg-accent"
      : "font-medium text-ink-700 after:bg-transparent hover:text-accent-deep",
  ].join(" ");

/**
 * The min-w on the shell is what enforces the desktop lock. header, main and
 * footer are all flex children of this column, so they stretch to its width and
 * cannot fall short of it — which is exactly what the footer did while the
 * minimum lived only on the inner content bands. Any future full-width section
 * now inherits the same floor.
 */
export default function Layout() {
  return (
    <div className="paper-grain flex min-h-screen min-w-[1080px] flex-col bg-surface font-sans text-ink">
      {/*
        First focusable element on every page. Visually hidden until focused,
        then pinned over the header.
      */}
      <a
        href="#main"
        className={`sr-only focus:not-sr-only focus:fixed focus:left-8 focus:top-3 focus:z-[100] focus:rounded-control focus:border focus:border-rule-strong focus:bg-raised focus:px-4 focus:py-2 focus:text-body focus:font-semibold focus:text-accent-deep focus:shadow-md ${FOCUS}`}
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-rule bg-surface/90 backdrop-blur-md">
        {/*
          Static desktop layout: no breakpoint variants and no disclosure panel.
          The width floor comes from the shell; max-w-band here just bounds the
          content band on wide screens.
        */}
        <div className="mx-auto max-w-band px-gutter">
          {/*
            1fr / auto / 1fr. The outer columns are forced equal, so the nav
            centres against the page rather than against whatever space the
            brand leaves over. justify-between cannot do this — the brand block
            is far wider than the actions block.

            minmax(0,…) rather than a bare 1fr: a bare 1fr floors at its content
            width, so at 1080 the brand and actions would push the row wider
            than the band and the whole header would overflow. With a 0 floor
            the outer columns shrink equally instead, the brand truncates, and
            the nav stays centred.
          */}
          <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6">
            {/* Brand — also the home link */}
            <div className="flex min-w-0 justify-start">
              <Link
                to="/"
                className={`group flex min-w-0 items-center gap-2.5 rounded-control ${FOCUS}`}
              >
                <img
                  src="/logo.png"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0"
                />
                <span className="min-w-0 leading-none">
                  <span className="block truncate font-display text-title font-bold tracking-tight text-tiranga-700">
                    Veergatha
                  </span>
                  <span className="mt-1 block truncate text-caption uppercase tracking-[0.15em] text-muted">
                    Archive of Remembrance
                  </span>
                </span>
              </Link>
            </div>

            {/* Centre nav */}
            <nav aria-label="Primary" className="flex items-center gap-1">
              {NAV_ITEMS.map(({ to, label }) => (
                <NavLink key={to} to={to} className={navLinkClass}>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/*
              Actions. Search is a compact entry point, not a search bar — the
              results experience lives on /search. "Browse Archive" used to sit
              here pointing at /martyrs, which the nav already links; a second
              button competing with the nav is exactly what a receding header
              should not do.
            */}
            <div className="flex items-center justify-end gap-1">
              <Link
                to="/search"
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-control px-3 py-2 text-body font-medium text-ink-700 transition-colors hover:text-accent-deep ${FOCUS}`}
              >
                <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Search
              </Link>

              <Link
                to="/admin/dashboard"
                className={`whitespace-nowrap rounded-control px-3 py-2 text-body font-medium text-muted transition-colors hover:text-accent-deep ${FOCUS}`}
              >
                Staff
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main" className="flex-1">
        <Outlet />
      </main>

      {/*
        Flat deep-green ground. The photographic background this replaced
        (/footer.jpg under a three-stop black gradient) needed that gradient
        purely to claw back text contrast — a scrim fighting its own image.
        A flat ground needs no scrim, and /footer.jpg is now unreferenced.
      */}
      <footer className="border-t border-tiranga-800 bg-tiranga-950 text-parchment-300">
        <div className="mx-auto max-w-band px-gutter py-14">
          {/* Statement of purpose */}
          <p className="max-w-reading font-display text-title font-bold tracking-wide text-parchment-100">
            Veergatha — a digital archive of India’s gallantry awards and war memorials.
          </p>

          <div className="mt-10 grid grid-cols-4 gap-8 border-t border-tiranga-800 pt-10">
            {FOOTER_COLUMNS.map(({ title, links }) => (
              <nav key={title} aria-label={title}>
                <h2 className="text-caption font-bold uppercase tracking-[0.15em] text-saffron-100">
                  {title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <FooterLink {...link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-10 space-y-5 border-t border-tiranga-800 pt-8">
            {/* Attribution */}
            <p className="max-w-reading text-body leading-relaxed">
              Records are compiled from award notifications published in the Gazette of India
              and from official Government of India sources. Every field carries a citation
              naming the specific document it came from.
            </p>

            <div className="space-y-1">
              <p className="text-body">
                Built on primary sources. Every fact carries its citation.
              </p>
              <p className="text-body text-faint">
                प्राथमिक स्रोतों पर आधारित। हर तथ्य के साथ उसका प्रमाण।
              </p>
            </div>

            <div className="space-y-1 font-display italic text-saffron-100/90">
              <p className="text-body">
                “Every name, a life. Every citation, a promise to remember.”
              </p>
              <p className="text-body text-saffron-100/80">
                “हर नाम एक जीवन है। हर प्रमाण, याद रखने का वादा।”
              </p>
            </div>

            <div className="flex items-center justify-between gap-6 pt-2">
              <p className="text-caption text-faint">
                © {new Date().getFullYear()} Veergatha Archive. Dedicated to those who served.
              </p>
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="h-2 w-2 rounded-full bg-parchment-100" />
                <span className="h-2 w-2 rounded-full bg-tiranga-600" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

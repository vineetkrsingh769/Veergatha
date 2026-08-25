import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/martyrs", label: "Gallantry Awards" },
  { to: "/memorials", label: "War Memorials" },
  { to: "/wars", label: "Operations" },
];

/**
 * Every item keeps identical padding, and the active marker is an `after`
 * underline rather than a border. A border-bottom on the active item alone adds
 * height to just that link, which is what made the row shift as you navigated.
 */
const navLinkClass = ({ isActive }) =>
  [
    "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
    "after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:transition-colors",
    isActive
      ? "text-[#C25016] after:bg-[#D96B27]"
      : "text-stone-700 after:bg-transparent hover:text-[#C25016]",
  ].join(" ");

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the panel on navigation, or it stays open over the new page.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] font-sans text-[#1A241A]">
      <header className="sticky top-0 z-50 border-b border-stone-300/70 bg-[#FAF7F2]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/*
            Three columns of 1fr / auto / 1fr. The outer columns are forced to
            equal width, so the nav in the middle is centred against the page
            rather than against whatever space the brand happens to leave.
            justify-between could never do this, because the brand block is far
            wider than the actions block.
          */}
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Brand */}
            <div className="flex min-w-0 justify-start">
              <Link to="/" className="group flex min-w-0 items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 transition-transform group-hover:scale-105"
                />
                <span className="min-w-0 leading-none">
                  <span className="block truncate font-display text-lg font-bold tracking-tight text-[#1A241A] sm:text-xl">
                    Veergatha
                  </span>
                  <span className="mt-0.5 hidden truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-[#D96B27] sm:block">
                    Archive of Remembrance
                  </span>
                </span>
              </Link>
            </div>

            {/* Centre nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={navLinkClass}>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              {/*
                Icon-only until xl. At exactly lg the brand, four nav items and
                three actions add up to slightly more than the available width,
                and dropping the label is what buys the room back.
              */}
              <Link
                to="/search"
                aria-label="Search the archive"
                className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:text-[#C25016] sm:flex"
              >
                <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                <span className="hidden xl:inline">Search</span>
              </Link>

              <Link
                to="/martyrs"
                className="hidden rounded-full bg-[#1E431B] px-4 py-2 text-sm font-semibold text-[#FAF7F2] transition-colors hover:bg-[#163319] md:inline-flex"
              >
                Browse Archive
              </Link>

              <Link
                to="/admin/dashboard"
                className="hidden rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-[#1E431B] transition-colors hover:border-[#D96B27] hover:text-[#C25016] md:inline-flex"
              >
                Staff Login
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="rounded-md p-2 text-stone-700 transition-colors hover:bg-stone-200/60 hover:text-[#C25016] lg:hidden"
              >
                {menuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / tablet panel — below lg there was previously no nav at all. */}
        {menuOpen && (
          <nav
            id="mobile-nav"
            className="border-t border-stone-300/70 bg-[#FAF7F2] lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
              {NAV_ITEMS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#D96B27]/10 text-[#C25016]"
                        : "text-stone-700 hover:bg-stone-200/60"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#D96B27]/10 text-[#C25016]"
                      : "text-stone-700 hover:bg-stone-200/60"
                  }`
                }
              >
                <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Search
              </NavLink>

              <div className="mt-2 flex flex-col gap-2 border-t border-stone-300/70 pt-3">
                <Link
                  to="/martyrs"
                  className="rounded-full bg-[#1E431B] px-4 py-2.5 text-center text-sm font-semibold text-[#FAF7F2] transition-colors hover:bg-[#163319]"
                >
                  Browse Archive
                </Link>
                <Link
                  to="/admin/dashboard"
                  className="rounded-full border border-stone-400 px-4 py-2.5 text-center text-sm font-semibold text-[#1E431B] transition-colors hover:border-[#D96B27] hover:text-[#C25016]"
                >
                  Staff Login
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative border-t border-stone-800 bg-stone-950 min-h-[100px] py-14 px-8 flex flex-col items-center justify-center text-center text-xs text-stone-300 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/footer.jpg')" }}
        />

        {/* Subtle Overlay to ensure contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/70" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-4">
          <p className="font-display text-xl text-stone-100 font-bold tracking-wide">
            Veergatha — Digital Archive of India’s Gallantry Awards & War Memorials          </p>
          <p className="max-w-2xl mx-auto text-stone-300 leading-relaxed text-sm space-y-1">
            <span className="block">Built on primary sources. Every fact carries its citation.</span>
            <span className="block text-stone-400">प्राथमिक स्रोतों पर आधारित। हर तथ्य के साथ उसका प्रमाण।</span>
          </p>
          <p className="text-xs text-amber-200/90 font-display italic space-y-1">
            <span className="block">“Every name, a life. Every citation, a promise to remember.”</span>
            <span className="block text-amber-200/80">“हर नाम एक जीवन है। हर प्रमाण, याद रखने का वादा।”</span>
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D96B27]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-white/90"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E5E2A]"></span>
          </div>
          <p className="text-stone-400 text-xs pt-1 font-medium">
            © {new Date().getFullYear()} Veergatha Archive. Dedicated to those who served.
          </p>
        </div>
      </footer>
    </div>
  );
}

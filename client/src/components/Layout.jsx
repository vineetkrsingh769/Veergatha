import { Link, NavLink, Outlet } from "react-router-dom";
import { Search } from "lucide-react";

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

/**
 * The min-w on the shell is what enforces the desktop lock. header, main and
 * footer are all flex children of this column, so they stretch to its width and
 * cannot fall short of it — which is exactly what the footer did while the
 * minimum lived only on the inner content bands. Any future full-width section
 * now inherits the same floor.
 */
export default function Layout() {
  return (
    <div className="flex min-h-screen min-w-[1080px] flex-col bg-[#FAF7F2] font-sans text-[#1A241A]">
      <header className="sticky top-0 z-50 border-b border-stone-300/70 bg-[#FAF7F2]/90 backdrop-blur-md">
        {/*
          Static desktop layout: no breakpoint variants and no disclosure panel.
          The width floor comes from the shell; max-w-7xl here just bounds the
          content band on wide screens.
        */}
        <div className="mx-auto max-w-7xl px-8">
          {/*
            1fr / auto / 1fr. The outer columns are forced equal, so the nav
            centres against the page rather than against whatever space the
            brand leaves over.
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
                  <span className="block truncate font-display text-xl font-bold tracking-tight text-[#1A241A]">
                    Veergatha
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-[#D96B27]">
                    Archive of Remembrance
                  </span>
                </span>
              </Link>
            </div>

            {/* Centre nav */}
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={navLinkClass}>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              <Link
                to="/search"
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:text-[#C25016]"
              >
                <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Search
              </Link>

              <Link
                to="/martyrs"
                className="inline-flex rounded-full bg-[#1E431B] px-4 py-2 text-sm font-semibold text-[#FAF7F2] transition-colors hover:bg-[#163319]"
              >
                Browse Archive
              </Link>

              <Link
                to="/admin/dashboard"
                className="inline-flex rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-[#1E431B] transition-colors hover:border-[#D96B27] hover:text-[#C25016]"
              >
                Staff Login
              </Link>
            </div>
          </div>
        </div>
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

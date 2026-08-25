import { Link, NavLink, Outlet } from "react-router-dom";
import { Search, Shield, LogIn } from "lucide-react";

export default function Layout() {
  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-[#D96B27] ${isActive ? "text-[#D96B27] border-b-2 border-[#D96B27] pb-1 font-semibold" : "text-stone-700"
    }`;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A241A] flex flex-col font-sans">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-stone-300/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-[#1E431B] flex items-center justify-center text-[#D96B27] group-hover:bg-[#163319] transition-colors">
              <Shield className="w-4.5 h-4.5" strokeWidth={1.75} />
            </div>
            <div className="leading-none">
              <span className="font-display text-xl font-bold text-[#1A241A] tracking-tight block">
                Veergatha
              </span>
              <span className="text-[10px] text-[#D96B27] uppercase tracking-[0.15em] font-semibold block mt-0.5">
                Archive of Remembrance
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/martyrs" className={navLinkClass}>
              Gallantry Awards
            </NavLink>
            <NavLink to="/memorials" className={navLinkClass}>
              War Memorials
            </NavLink>
            <NavLink to="/wars" className={navLinkClass}>
              Operations
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              Search
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/search"
              className="p-2 text-stone-500 hover:text-[#D96B27] hover:bg-stone-200/50 rounded-md transition-colors"
              title="Search Archive"
            >
              <Search className="w-4.5 h-4.5" strokeWidth={1.75} />
            </Link>

            <Link
              to="/admin/dashboard"
              className="flex items-center gap-1.5 text-xs font-medium text-[#1E431B] hover:text-[#D96B27] border border-stone-300 hover:border-[#D96B27] bg-white/80 px-3 py-1.5 rounded-md transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" strokeWidth={1.75} />
              Staff Login
            </Link>
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

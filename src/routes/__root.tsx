import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SiteFooter, SiteHeader } from "@/components/archive/SiteChrome";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { recordPageView } from "@/lib/archive.functions";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Record not found</p>
        <h1 className="mt-4 font-display text-6xl font-semibold text-foreground">Not in the archive</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This page doesn't exist, or the record has not yet been verified for publication.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Return home
          </Link>
          <Link
            to="/martyrs"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Roll of Honour
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl font-semibold text-foreground">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      // Fallback for pages that set no title of their own, such as "not found".
      { title: "Veergatha" },
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#141a14" },
      { name: "author", content: "Veergatha" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isDesk = path.startsWith("/admin") || path === "/auth" || path === "/reset-password";

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  // Photos fade in once they finish loading (styles.css, html.fade-images). Images that are already
  // complete are marked first so nothing flickers; failed images are marked too so their alt text shows.
  useEffect(() => {
    const mark = (e: Event) => {
      if (e.target instanceof HTMLImageElement) e.target.setAttribute("data-loaded", "");
    };
    for (const img of document.querySelectorAll<HTMLImageElement>("main img")) if (img.complete) img.setAttribute("data-loaded", "");
    document.addEventListener("load", mark, true);
    document.addEventListener("error", mark, true);
    document.documentElement.classList.add("fade-images");
    return () => {
      document.removeEventListener("load", mark, true);
      document.removeEventListener("error", mark, true);
      document.documentElement.classList.remove("fade-images");
    };
  }, []);

  // Engagement KPI: one anonymous page-view row per public navigation.
  useEffect(() => {
    if (isDesk) return;
    recordPageView({ data: { path } }).catch(() => {});
  }, [path, isDesk]);

  return (
    <QueryClientProvider client={queryClient}>
      {!isDesk && <SiteHeader />}
      {/* data-graded: public pages give every photograph one colour grade (styles.css). */}
      <main className="min-h-[60vh]" data-graded={isDesk ? undefined : ""}>
        <Outlet />
      </main>
      {!isDesk && <SiteFooter />}
      <Toaster />
    </QueryClientProvider>
  );
}

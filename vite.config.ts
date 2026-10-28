import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode, command }) => {
  // Server code reads SUPABASE_* from process.env, which Vite does not populate
  // on its own — only VITE_* reaches import.meta.env. Load every key from .env
  // so SSR and server functions see the same values as the browser.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    server: { port: 3000 },
    resolve: {
      dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
    },
    plugins: [
      tsConfigPaths(),
      tailwindcss(),
      // Route the bundled server entry through src/server.ts (the SSR error wrapper).
      tanstackStart({ server: { entry: "server" } }),
      // Nitro packages the production server; the dev server doesn't need it.
      command === "build" && nitro(),
      viteReact(),
    ],
  };
});

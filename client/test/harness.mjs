import { after } from "node:test";
import { createServer } from "vite";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Shared render-test harness.
 *
 * Components here are .jsx and import from other .jsx, so Node cannot load them
 * directly. Vite's SSR loader transforms them on the fly, which means the tests
 * run against the same code the browser gets — no separate build step and no
 * duplicated module resolution.
 *
 * The server is created once per process and reused. Run the suite with
 * `--test-isolation=none` (see package.json) so every test file shares that one
 * server rather than paying a few seconds to start its own.
 */

const here = dirname(fileURLToPath(import.meta.url));
let pending = null;

function server() {
  if (!pending) {
    pending = createServer({
      root: resolve(here, ".."),
      // ws:false as well as hmr:false — hmr alone still opens the HMR
      // websocket, which fails loudly if a dev server or another test run
      // already holds port 24678.
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: "custom",
      logLevel: "error",
      // Nothing here needs the client dependency pre-bundle, and its scanner
      // races the shutdown below.
      optimizeDeps: { noDiscovery: true, include: [] },
      resolve: { alias: { "react-router-dom": resolve(here, "router-shim.jsx") } },
    });
  }
  return pending;
}

/** Load a module from client/src, transformed. `path` is root-relative. */
export async function load(path) {
  return (await server()).ssrLoadModule(path);
}

export async function closeHarness() {
  if (!pending) return;
  const s = await pending;
  pending = null;
  await s.close();
}

// Vite keeps an esbuild child process alive, which would otherwise hold the
// runner open long after the last assertion. A root-level `after` closes it
// once every file has finished; package.json also passes --test-force-exit so a
// stray handle can never turn a green suite into a hang.
after(closeHarness);

export const h = createElement;

/** Render a component to HTML. */
export const render = (Component, props) =>
  renderToStaticMarkup(createElement(Component, props));

const ENTITY = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
};

/**
 * Decode the entities React escapes on output. Without this an assertion for
 * "13 Jammu & Kashmir Rifles" fails against the perfectly correct
 * "13 Jammu &amp; Kashmir Rifles" — a bug in the test, not the component.
 */
export const decode = (html) =>
  html.replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (m) => ENTITY[m] ?? m);

/** Render a component and flatten it to visible text. */
export const text = (Component, props) =>
  decode(render(Component, props).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

/** How many times a substring appears — for counting tab stops, inputs, links. */
export const countOf = (haystack, needle) =>
  (haystack.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;

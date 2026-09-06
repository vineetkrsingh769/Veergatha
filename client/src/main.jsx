import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

/**
 * Typefaces, self-hosted. Served from our own origin — no Google Fonts, no CDN,
 * no third-party request on any page view.
 *
 * Each stylesheet declares every subset (latin, latin-ext, greek, cyrillic,
 * vietnamese) behind a `unicode-range`, so the browser downloads only the
 * subsets the page actually needs. For English content that is the latin file
 * alone: ~48 KB Inter, ~52 KB Source Serif 4, ~16 KB IBM Plex Mono. The other
 * subset files ship to dist but are never fetched.
 *
 * `wght.css` is the weight axis only — the optical-size axis is not imported,
 * because nothing here varies optical size and it would double the payload.
 *
 * IBM Plex Mono has no variable build, so it is two static latin weights.
 */
import "@fontsource-variable/source-serif-4/wght.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";

import serifUrl from "@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2?url";
import sansUrl from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";

import App from "./App.jsx";
import "./index.css";

/**
 * Start fetching the two faces that carry visible text before React renders.
 *
 * Fontsource declares `font-display: swap`, and a stylesheet alone does not
 * trigger a font fetch — the browser waits until text using that family is laid
 * out. In a client-rendered SPA the body is empty until the 240 KB bundle has
 * downloaded, parsed and run, so without this the request would not even begin
 * until first paint, and the swap would be visible.
 *
 * Preloading here moves the fetch to document-parse time, alongside the bundle
 * rather than after it. Mono is deliberately left out: it appears only inside
 * citation blocks, well below the fold.
 */
for (const href of [serifUrl, sansUrl]) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.type = "font/woff2";
  link.href = href;
  link.crossOrigin = "anonymous"; // required for font preloads, even same-origin
  document.head.appendChild(link);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

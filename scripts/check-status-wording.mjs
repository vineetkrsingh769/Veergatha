// Page-level check of the archive's core editorial rule: a recipient who survived
// their action is never described in the language of death or martyrdom.
//
// Opens every survivor's profile on a running site and scans the visible text.
// A few recipients who fell are checked as a control, so the check can't pass
// simply because the pages failed to render.
//
//   pnpm dev                      (in another terminal)
//   pnpm check:wording            (or BASE_URL=https://… pnpm check:wording)
import { readFileSync } from "node:fs";

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

const env = {};
for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m) env[m[1]] = m[2];
}

// Labels and headings the page uses only for those who fell. Any of these on a
// survivor's page is a failure.
const FORBIDDEN = [/Fell on/, /Fell in action/, /Service and sacrifice/, /Memorialised at/, /\(Posthumous\)/i, /\bPosthumous\b/];
// Words that may legitimately appear in a survivor's biography (about comrades,
// for instance) but deserve a human look.
const REVIEW = /\b(martyr\w*|sacrific\w*|killed|died|fallen)\b/gi;

async function recipients(status) {
  const url = `${env.VITE_SUPABASE_URL}/rest/v1/martyrs?select=slug,full_name&status=eq.${status}&order=full_name`;
  const res = await fetch(url, { headers: { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY } });
  if (!res.ok) throw new Error(`Could not list ${status} recipients: ${res.status}`);
  return res.json();
}

async function pageText(slug) {
  const res = await fetch(`${BASE_URL}/martyrs/${slug}`);
  if (!res.ok) throw new Error(`/martyrs/${slug} returned ${res.status}`);
  const html = await res.text();
  // Only the article: header and footer are shared chrome, and hrefs contain "/martyrs".
  // The "Same conflict" section holds other people's cards, which may rightly say "Fell on".
  const article = html.match(/<article[\s\S]*?<\/article>/)?.[0] ?? "";
  return article
    .replace(/<section[^>]*data-related[\s\S]*?<\/section>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/g, " ")
    .replace(/\s+/g, " ");
}

let failures = 0;
const survivors = await recipients("survived");
const fallen = (await recipients("fell-in-action")).slice(0, 3);
console.log(`Checking ${survivors.length} survivors and ${fallen.length} control records at ${BASE_URL}\n`);

for (const r of survivors) {
  const text = await pageText(r.slug);
  if (!text) { console.log(`FAIL  ${r.full_name}: profile did not render`); failures++; continue; }
  const hits = FORBIDDEN.filter((re) => re.test(text)).map((re) => re.source);
  const review = [...new Set((text.match(REVIEW) ?? []).map((w) => w.toLowerCase()))];
  if (hits.length) { console.log(`FAIL  ${r.full_name}: ${hits.join(", ")}`); failures++; }
  else console.log(`ok    ${r.full_name}${review.length ? `   (review biography wording: ${review.join(", ")})` : ""}`);
}

for (const r of fallen) {
  const text = await pageText(r.slug);
  // Control: a recipient who fell must show the fell-specific label.
  if (/Fell on/.test(text)) console.log(`ok    control: ${r.full_name} shows "Fell on"`);
  else { console.log(`FAIL  control: ${r.full_name} does not show "Fell on" — check is not seeing real pages`); failures++; }
}

console.log(failures ? `\n${failures} failure(s)` : "\nAll survivor pages are free of death wording.");
process.exit(failures ? 1 : 0);

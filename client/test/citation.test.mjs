import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

import { load, render, text, decode } from "./harness.mjs";

let CitationBlock;
before(async () => {
  ({ CitationBlock } = await load("/src/components/ui/Citation.jsx"));
});

const REAL = {
  citation:
    "Captain Vikram Batra of the 13 Jammu and Kashmir Rifles displayed conspicuous gallantry, inspiring leadership and devotion to duty of the highest order during Operation Vijay in Kargil.",
  gazetteRef: "Gazette of India, 15 Aug 1999, No. 42-Pres/99",
  source: {
    url: "https://gallantryawards.gov.in",
    title: "Gallantry Awards portal",
    tier: "primary",
  },
};

const LONG = Array.from(
  { length: 8 },
  (_, i) =>
    `Paragraph ${i + 1}. ` +
    "For most conspicuous bravery in the face of the enemy, sustained over a prolonged engagement in extremely difficult terrain and under continuous fire. ".repeat(
      3
    )
).join("\n\n");

describe("CitationBlock", () => {
  it("renders a full record", () => {
    const out = text(CitationBlock, REAL);
    assert.match(out, /Gazette citation/);
    assert.match(out, /Gazette of India, 15 Aug 1999/);
    assert.match(out, /Gallantry Awards portal/);
    assert.doesNotMatch(out, /No gazette citation on record/);
  });

  it("states a missing citation rather than rendering an empty panel", () => {
    const out = text(CitationBlock, { gazetteRef: REAL.gazetteRef });
    assert.match(out, /No gazette citation on record/);
    assert.doesNotMatch(out, /No gazette reference on record/);
  });

  it("states a missing gazette reference", () => {
    const out = text(CitationBlock, { citation: "Short citation text." });
    assert.match(out, /No gazette reference on record/);
    assert.match(out, /Short citation text\./);
  });

  it("handles both missing", () => {
    const out = text(CitationBlock, {});
    assert.match(out, /No gazette citation on record/);
    assert.match(out, /No gazette reference on record/);
  });

  it("renders no link when the source has no url", () => {
    const out = render(CitationBlock, {
      citation: "Text.",
      gazetteRef: "Ref.",
      source: { title: "No link", tier: "primary" },
    });
    assert.doesNotMatch(out, /opens in a new tab/);
  });

  it("never truncates a long citation", () => {
    const out = text(CitationBlock, { citation: LONG, gazetteRef: "Ref." });
    assert.match(out, /Paragraph 1\./);
    assert.match(out, /Paragraph 8\./);
    assert.doesNotMatch(out, /…|Read more/);
  });

  it("preserves the citation verbatim, newlines intact", () => {
    const html = decode(render(CitationBlock, { citation: LONG, gazetteRef: "R" }));
    assert.ok(
      html.includes(LONG),
      "citation text was altered — it is a quoted legal document and must survive byte for byte"
    );
  });

  it("sets the citation itself in the mono face", () => {
    const html = render(CitationBlock, { citation: LONG, gazetteRef: "R" });
    assert.match(html, /class="[^"]*font-mono[^"]*"[^>]*>\s*Paragraph 1\./);
  });
});

import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

import { load, render, text, countOf } from "./harness.mjs";

let ProvenanceFooter;
before(async () => {
  ({ ProvenanceFooter } = await load("/src/components/ui/Provenance.jsx"));
});

const PRIMARY = {
  field: "awards.citation",
  title: "Gallantry Awards Portal",
  publisher: "Ministry of Defence",
  url: "https://gallantryawards.gov.in",
  accessedAt: "2026-08-23T00:00:00.000Z",
  tier: "primary",
};
const SECONDARY = { field: "dateOfBirth", title: "The Hindu archive", tier: "secondary" };

describe("ProvenanceFooter", () => {
  it("renders a verified record backed by a primary source", () => {
    const out = text(ProvenanceFooter, {
      sources: [PRIMARY],
      verificationStatus: "verified",
      updatedAt: "2026-08-23T06:59:08.503Z",
      recordSlug: "vikram-batra",
    });
    assert.match(out, /Verified from a primary source/);
    assert.match(out, /awards\.citation/);
    assert.match(out, /Ministry of Defence/);
    assert.match(out, /Accessed 23 August 2026/);
    assert.match(out, /Record last updated 23 August 2026/);
    assert.match(out, /Submit a correction/);
  });

  it("withholds the badge when verified but no primary source is present", () => {
    // Data drift. The model should make this impossible; if it happens anyway
    // the page must not assert something the sources on screen do not support.
    const out = text(ProvenanceFooter, {
      sources: [SECONDARY],
      verificationStatus: "verified",
    });
    assert.match(out, /dateOfBirth/);
    assert.doesNotMatch(out, /Verified from a primary source/);
  });

  it("withholds the badge when a primary source exists but the record is not verified", () => {
    const out = text(ProvenanceFooter, {
      sources: [PRIMARY],
      verificationStatus: "in-review",
    });
    assert.doesNotMatch(out, /Verified from a primary source/);
  });

  it("still renders the section when there are no sources at all", () => {
    // Omitting it would make an unsourced record look identical to a
    // well-sourced one.
    const out = text(ProvenanceFooter, {
      sources: [],
      verificationStatus: "draft",
      recordSlug: "x",
    });
    assert.match(out, /No sources recorded against this entry yet/);
    assert.match(out, /Submit a correction/);
  });

  it("handles a missing updatedAt", () => {
    const out = text(ProvenanceFooter, { sources: [PRIMARY], verificationStatus: "verified" });
    assert.match(out, /Last updated date not recorded/);
    assert.doesNotMatch(out, /Record last updated/);
  });

  it("omits absent source detail rather than printing placeholders", () => {
    const out = text(ProvenanceFooter, { sources: [SECONDARY] });
    assert.doesNotMatch(out, /View source/);
    assert.doesNotMatch(out, /Accessed/);
  });

  it("carries the record slug into the correction link, URL-encoded", () => {
    assert.match(
      render(ProvenanceFooter, { sources: [], recordSlug: "vikram-batra" }),
      /\/corrections\?record=vikram-batra/
    );
    assert.match(
      render(ProvenanceFooter, { sources: [], recordSlug: "a b&c" }),
      /record=a%20b%26c/
    );
  });

  it("renders per-field attribution as a definition list", () => {
    // field -> document is the shape that answers "where did this date come
    // from?", which a flat reading list cannot.
    assert.match(
      render(ProvenanceFooter, { sources: [PRIMARY] }),
      /<dt[^>]*>awards\.citation<\/dt>/
    );
  });

  it("lists every source when a record has several", () => {
    const html = render(ProvenanceFooter, {
      sources: [PRIMARY, SECONDARY],
      verificationStatus: "verified",
    });
    assert.equal(countOf(html, "<dt"), 2);
  });
});

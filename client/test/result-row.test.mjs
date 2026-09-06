import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

import { load, render, text, countOf } from "./harness.mjs";

let ResultRow;
before(async () => {
  ({ ResultRow } = await load("/src/components/ui/ResultRow.jsx"));
});

const FELL = {
  slug: "vikram-batra",
  fullName: "Vikram Batra",
  rank: "Captain",
  regiment: "13 Jammu & Kashmir Rifles",
  serviceBranch: "Army",
  status: "fell-in-action",
  dateOfMartyrdom: "1999-07-07T00:00:00.000Z",
  placeOfBirth: { state: "Himachal Pradesh" },
  awards: [{ name: "Param Vir Chakra" }],
};
const SURVIVED = {
  ...FELL,
  slug: "sanjay-kumar",
  fullName: "Sanjay Kumar",
  rank: "Rifleman",
  status: "survived",
  dateOfMartyrdom: undefined,
};

describe("ResultRow", () => {
  it("shows name, rank, regiment, award, year and status", () => {
    const out = text(ResultRow, { martyr: FELL });
    assert.match(out, /Vikram Batra/);
    assert.match(out, /Captain/);
    assert.match(out, /13 Jammu & Kashmir Rifles/);
    assert.match(out, /Param Vir Chakra/);
    assert.match(out, /1999/);
    assert.match(out, /Fell in Action/);
  });

  it("shows no year for a surviving recipient", () => {
    // There is no date to show. Inventing one is the exact failure this
    // archive exists to prevent.
    const out = text(ResultRow, { martyr: SURVIVED });
    assert.match(out, /Survived/);
    assert.doesNotMatch(out, /\b(19|20)\d{2}\b/);
  });

  it("uses no martyrdom language for a surviving recipient", () => {
    const out = text(ResultRow, { martyr: SURVIVED }).replace(/Survived/g, "");
    assert.doesNotMatch(out, /martyr|sacrifice|fell|fallen|died|death/i);
  });

  it("falls back to service branch when regiment is missing", () => {
    assert.match(text(ResultRow, { martyr: { ...FELL, regiment: undefined } }), /Army/);
  });

  it("renders a sparse record without leaking undefined", () => {
    const out = text(ResultRow, {
      martyr: { slug: "x", fullName: "Only A Name", status: "survived", awards: [] },
    });
    assert.match(out, /Only A Name/);
    assert.doesNotMatch(out, /undefined|null|NaN/);
  });

  it("is a single click target with one tab stop", () => {
    assert.equal(countOf(render(ResultRow, { martyr: FELL }), "<a "), 1);
  });

  it("has a visible focus state", () => {
    assert.match(render(ResultRow, { martyr: FELL }), /focus-visible:outline/);
  });

  it("carries no photograph — portraits belong on detail pages", () => {
    assert.doesNotMatch(render(ResultRow, { martyr: FELL }), /<img/);
  });

  it("sets the name in the serif face", () => {
    assert.match(render(ResultRow, { martyr: FELL }), /font-display/);
  });
});

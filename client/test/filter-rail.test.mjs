import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

import { load, render, text, countOf } from "./harness.mjs";

let FilterRail, ActiveFilterChips;
before(async () => {
  ({ FilterRail, ActiveFilterChips } = await load("/src/components/ui/FilterRail.jsx"));
});

const GROUPS = [
  {
    key: "award",
    label: "Award",
    options: [
      { value: "Param Vir Chakra", label: "Param Vir Chakra", count: 3 },
      { value: "Maha Vir Chakra", label: "Maha Vir Chakra", count: 7 },
    ],
  },
  {
    key: "year",
    label: "Year fell",
    hint: "Recipients who survived have no recorded date and are not returned by this filter.",
    options: [{ value: "1999", label: "1999", count: 2 }],
  },
  { key: "empty", label: "Empty group", options: [] },
];

const PROPS = { groups: GROUPS, values: { award: "Param Vir Chakra" }, onChange() {} };

describe("FilterRail", () => {
  it("renders groups, options and per-option counts", () => {
    const out = text(FilterRail, PROPS);
    assert.match(out, /Award/);
    assert.match(out, /Param Vir Chakra/);
    assert.match(out, /3/);
    assert.match(out, /7/);
  });

  it("omits a group with no options", () => {
    assert.doesNotMatch(text(FilterRail, PROPS), /Empty group/);
  });

  it("keeps the year group honest about excluding survivors", () => {
    assert.match(text(FilterRail, PROPS), /Recipients who survived have no recorded date/);
  });

  it("renders radios — the API accepts one value per filter", () => {
    const html = render(FilterRail, PROPS);
    // two rendered groups x (All + their options)
    assert.equal(countOf(html, 'type="radio"'), 5);
    assert.match(html, /name="award"/);
    assert.match(html, /name="year"/);
    assert.equal(countOf(html, 'checked=""'), 2, "exactly one checked option per group");
  });

  it("is a labelled landmark that is always visible", () => {
    const html = render(FilterRail, PROPS);
    assert.match(html, /<aside[^>]*aria-label="Filter recipients"/);
    assert.doesNotMatch(html, /hidden|display:\s*none/);
  });

  it("does not re-sort options — award precedence comes from the API", () => {
    const order = [...render(FilterRail, PROPS).matchAll(/>([A-Z][a-z]+ Vir Chakra)</g)].map(
      (m) => m[1]
    );
    assert.deepEqual(order, ["Param Vir Chakra", "Maha Vir Chakra"]);
  });
});

describe("ActiveFilterChips", () => {
  const chips = [
    { key: "award", value: "Param Vir Chakra", label: "Param Vir Chakra", groupLabel: "Award" },
    { key: "q", value: "batra", label: '"batra"', groupLabel: "Search" },
  ];

  it("says which filter each chip belongs to", () => {
    const out = text(ActiveFilterChips, { chips, onRemove() {}, onReset() {} });
    assert.match(out, /Award:/);
    assert.match(out, /Search:/);
    assert.match(out, /Reset all/);
  });

  it("gives every chip an accessible remove control", () => {
    const html = render(ActiveFilterChips, { chips, onRemove() {}, onReset() {} });
    assert.equal(countOf(html, 'aria-label="Remove '), 2);
  });

  it("renders nothing when no filter is applied", () => {
    assert.equal(text(ActiveFilterChips, { chips: [], onRemove() {}, onReset() {} }), "");
  });
});

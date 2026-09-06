import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { load } from "./harness.mjs";

let buildGroups;
before(async () => {
  ({ buildGroups } = await load("/src/components/ui/Related.jsx"));
});

const FELL = {
  slug: "vikram-batra",
  status: "fell-in-action",
  dateOfMartyrdom: "1999-07-07T00:00:00.000Z",
  regiment: "13 Jammu & Kashmir Rifles",
  war: { slug: "kargil-1999", name: "the Kargil War" },
  awards: [{ name: "Param Vir Chakra" }],
};

describe("buildGroups", () => {
  it("gives a fallen recipient all four relationships", () => {
    assert.deepEqual(
      buildGroups(FELL).map((g) => g.key),
      ["war", "regiment", "award", "year"]
    );
  });

  it("gives a surviving recipient no year group", () => {
    // The server's year filter is a range on dateOfMartyrdom, so a survivor is
    // excluded from it by construction — and "others from 1999" would imply a
    // shared fate the data does not support.
    const keys = buildGroups({ ...FELL, status: "survived", dateOfMartyrdom: undefined }).map(
      (g) => g.key
    );
    assert.deepEqual(keys, ["war", "regiment", "award"]);
  });

  it("skips a relationship the record cannot supply", () => {
    assert.ok(!buildGroups({ ...FELL, war: undefined }).some((g) => g.key === "war"));
  });

  it("never builds an operation group — the list endpoint has no such filter", () => {
    const groups = buildGroups({ ...FELL, war: undefined, operation: "Operation Vijay" });
    assert.ok(!groups.some((g) => g.key === "operation"));
  });

  it("produces nothing for a record with no relationships", () => {
    assert.equal(buildGroups({ slug: "x", status: "survived", awards: [] }).length, 0);
  });

  it("queries by the parameters the API actually supports", () => {
    const params = Object.fromEntries(buildGroups(FELL).map((g) => [g.key, g.params]));
    assert.equal(params.war.war, "kargil-1999", "war is queried by slug, not id");
    assert.equal(params.regiment.regiment, "13 Jammu & Kashmir Rifles");
    assert.equal(params.award.award, "Param Vir Chakra");
    assert.equal(params.year.year, "1999");
  });

  it("URL-encodes see-all links", () => {
    const regiment = buildGroups(FELL).find((g) => g.key === "regiment");
    assert.match(regiment.seeAll, /%26/, "the ampersand in the regiment name must be encoded");
  });
});

describe("cross-page integration", () => {
  it("every see-all link lands on a filter the browse page reads", () => {
    // Night 9 links to /martyrs?<key>=; Night 11 decides which keys the page
    // reads from the URL. A key missing there means the link silently lands on
    // an unfiltered list.
    const related = readFileSync("src/components/ui/Related.jsx", "utf8");
    const list = readFileSync("src/pages/MartyrsList.jsx", "utf8");

    const keys = list
      .match(/const FILTER_KEYS = \[([^\]]*)\]/)[1]
      .split(",")
      .map((s) => s.trim().replace(/"/g, ""))
      .filter(Boolean);

    const linked = [...new Set([...related.matchAll(/\/martyrs\?(\w+)=/g)].map((m) => m[1]))];
    const missing = linked.filter((k) => !keys.includes(k));

    assert.deepEqual(missing, [], `see-all links with no matching filter key: ${missing}`);
  });
});

import { describe, expect, it } from "vitest";

import { ageAt } from "@/lib/archive";

describe("ageAt", () => {
  it("counts whole years, not yet reaching the birthday", () => {
    // Albert Ekka: born 27 Dec 1942, fell 3 Dec 1971.
    expect(ageAt("1942-12-27", "1971-12-03")).toBe(28);
  });

  it("counts the birthday itself as a completed year", () => {
    expect(ageAt("1950-07-07", "1999-07-07")).toBe(49);
  });

  it("returns nothing for a partial date rather than guessing", () => {
    expect(ageAt("1942", "1971-12-03")).toBeNull();
    expect(ageAt("1942-12", "1971-12-03")).toBeNull();
  });

  it("returns nothing when either date is missing", () => {
    expect(ageAt(null, "1971-12-03")).toBeNull();
    expect(ageAt("1942-12-27", undefined)).toBeNull();
  });
});

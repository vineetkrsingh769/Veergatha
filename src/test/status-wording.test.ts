import { describe, expect, it } from "vitest";

import { actionDateLabel, isPosthumous, statusLabel } from "@/lib/archive";

// The archive's core editorial rule: a recipient who survived their action is
// never described in the language of death or martyrdom.
const DEATH_WORDING = /fell|fallen|martyr|sacrifice|posthumous|killed|died/i;

describe("status wording", () => {
  it("labels a survivor without any death wording", () => {
    expect(statusLabel("survived")).toBe("Survived");
    expect(actionDateLabel("survived")).toBe("Date of action");
    expect(statusLabel("survived")).not.toMatch(DEATH_WORDING);
    expect(actionDateLabel("survived")).not.toMatch(DEATH_WORDING);
  });

  it("labels a recipient who fell as such", () => {
    expect(statusLabel("fell-in-action")).toBe("Fell in action");
    expect(actionDateLabel("fell-in-action")).toBe("Fell on");
  });

  it("only treats 'fell-in-action' as posthumous", () => {
    expect(isPosthumous({ status: "fell-in-action" })).toBe(true);
    expect(isPosthumous({ status: "survived" })).toBe(false);
  });

  it.each([null, undefined, "", "unknown", "Fell-In-Action"])(
    "never defaults an unrecognised status (%s) to death wording",
    (status) => {
      expect(statusLabel(status)).not.toMatch(DEATH_WORDING);
      expect(actionDateLabel(status)).not.toMatch(DEATH_WORDING);
      expect(isPosthumous({ status })).toBe(false);
    },
  );
});

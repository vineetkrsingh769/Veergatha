import { describe, expect, it } from "vitest";
import { friendlyError } from "@/components/admin/forms";

// The exact messages the database raises (drizzle/migrations/0000_archive_schema.sql), as seen on a live test.
describe("Editorial Desk error messages", () => {
  it("explains a missing primary source", () => {
    expect(friendlyError(new Error("A record cannot be verified without at least one primary source"))).toMatch(/Add at least one source marked Primary/);
  });

  it("explains a posthumous award on a survivor, from either side", () => {
    expect(friendlyError(new Error("This recipient has a posthumous award; they cannot be marked as survived"))).toMatch(/survived can't hold a posthumous award/);
    expect(friendlyError(new Error("A posthumous award cannot be attached to a recipient who survived"))).toMatch(/survived can't hold a posthumous award/);
  });

  it("explains media licence rules", () => {
    expect(friendlyError(new Error("Media cannot be verified while its licence is unverified"))).toMatch(/until its licence is confirmed/);
    expect(friendlyError(new Error("This licence requires an attribution credit"))).toMatch(/requires a credit line/);
  });

  it("explains a slug that is already taken", () => {
    expect(friendlyError(new Error('duplicate key value violates unique constraint "martyrs_slug_key"'))).toMatch(/already uses this web address/);
  });

  it("passes other messages through unchanged", () => {
    expect(friendlyError(new Error("Network request failed"))).toBe("Network request failed");
    expect(friendlyError({ message: "Plain object error" })).toBe("Plain object error");
  });
});

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { War, Memorial, Martyr, Media, User } from "../models/index.js";

/**
 * Exercises schema rules without a database. Mongoose validates documents
 * offline, so every constraint here is checked before Atlas exists.
 *
 *   npm run check:models
 */

let passed = 0;
let failed = 0;

async function expectValid(label, doc) {
  try {
    await doc.validate();
    console.log(`  ok    ${label}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${label}\n          unexpectedly rejected: ${err.message}`);
    failed++;
  }
}

async function expectInvalid(label, doc, matcher) {
  try {
    await doc.validate();
    console.log(`  FAIL  ${label}\n          was accepted but should have been rejected`);
    failed++;
  } catch (err) {
    if (matcher && !new RegExp(matcher, "i").test(err.message)) {
      console.log(
        `  FAIL  ${label}\n          rejected for the wrong reason: ${err.message}`
      );
      failed++;
      return;
    }
    console.log(`  ok    ${label}`);
    passed++;
  }
}

const oid = () => new mongoose.Types.ObjectId();
const primarySource = {
  field: "awards.citation",
  title: "Gallantry Awards Portal",
  tier: "primary",
};

const baseMartyr = {
  slug: "vikram-batra",
  fullName: "Vikram Batra",
  serviceBranch: "Army",
  status: "fell-in-action",
  dateOfMartyrdom: new Date("1999-07-07"),
};

console.log("\nMartyr — status and dates");
await expectValid("fell-in-action with a date", new Martyr(baseMartyr));
await expectInvalid(
  "fell-in-action without a date",
  new Martyr({ ...baseMartyr, dateOfMartyrdom: undefined }),
  "required when status"
);
await expectValid(
  "survived without a date",
  new Martyr({ ...baseMartyr, slug: "sanjay-kumar", status: "survived", dateOfMartyrdom: undefined })
);
await expectInvalid(
  "survived WITH a death date",
  new Martyr({ ...baseMartyr, status: "survived" }),
  "cannot have a dateOfMartyrdom"
);
await expectInvalid(
  "survived with a posthumous award",
  new Martyr({
    ...baseMartyr,
    status: "survived",
    dateOfMartyrdom: undefined,
    awards: [{ name: "Param Vir Chakra", posthumous: true }],
  }),
  "inconsistent with status"
);
await expectInvalid(
  "died before being born",
  new Martyr({ ...baseMartyr, dateOfBirth: new Date("2000-01-01") }),
  "before dateOfBirth"
);

console.log("\nMartyr — slug and sourcing");
await expectInvalid(
  "slug with spaces and capitals",
  new Martyr({ ...baseMartyr, slug: "Vikram Batra" }),
  "lowercase words"
);
await expectInvalid(
  "verified with no primary source",
  new Martyr({
    ...baseMartyr,
    verification: { status: "verified" },
    sources: [{ field: "biography", title: "A newspaper", tier: "secondary" }],
  }),
  "no primary source"
);
await expectValid(
  "verified with a primary source",
  new Martyr({ ...baseMartyr, verification: { status: "verified" }, sources: [primarySource] })
);

console.log("\nMedia — licensing");
const baseMedia = {
  kind: "photo",
  cloudinary: { publicId: "veergatha/x", secureUrl: "https://res.cloudinary.com/x.jpg" },
};
await expectValid("unverified licence on a draft", new Media(baseMedia));
await expectInvalid(
  "publishing an unverified licence",
  new Media({ ...baseMedia, verification: { status: "verified" } }),
  "licence is still"
);
await expectInvalid(
  "GODL-India with no credit",
  new Media({ ...baseMedia, license: "GODL-India" }),
  "requires a credit"
);
await expectValid(
  "GODL-India with a credit",
  new Media({ ...baseMedia, license: "GODL-India", credit: "PIB, Government of India" })
);

console.log("\nMemorial — geography");
const baseMemorial = { slug: "kargil-war-memorial", name: "Kargil War Memorial" };
await expectValid("no coordinates at all", new Memorial(baseMemorial));
await expectValid(
  "valid [lng, lat]",
  new Memorial({
    ...baseMemorial,
    location: { coordinates: { coordinates: [76.1, 34.43] } },
  })
);
await expectInvalid(
  "lat and lng swapped past the pole",
  new Memorial({
    ...baseMemorial,
    location: { coordinates: { coordinates: [34.43, 176.1] } },
  }),
  "longitude, latitude"
);

console.log("\nWar — dates");
await expectValid(
  "ordered dates",
  new War({
    slug: "kargil-1999",
    name: "Kargil War",
    type: "war",
    startDate: new Date("1999-05-03"),
    endDate: new Date("1999-07-26"),
  })
);
await expectInvalid(
  "end before start",
  new War({
    slug: "kargil-1999",
    name: "Kargil War",
    type: "war",
    startDate: new Date("1999-07-26"),
    endDate: new Date("1999-05-03"),
  }),
  "before startDate"
);

console.log("\nUser — credentials");
await expectInvalid(
  "malformed email",
  new User({ email: "not-an-email", name: "X", passwordHash: "x" }),
  "Invalid email"
);

const hash = await bcrypt.hash("a-sufficiently-long-password", 12);
const user = new User({ email: "e@x.com", name: "Editor", passwordHash: hash });
const roundTrip =
  (await user.verifyPassword("a-sufficiently-long-password")) &&
  !(await user.verifyPassword("wrong-password"));
console.log(`  ${roundTrip ? "ok  " : "FAIL"}  password hash round-trip`);
roundTrip ? passed++ : failed++;

const locked = new User({ email: "e@x.com", name: "E", passwordHash: hash });
locked.lockedUntil = new Date(Date.now() + 60000);
console.log(`  ${locked.isLocked() ? "ok  " : "FAIL"}  lockout window is respected`);
locked.isLocked() ? passed++ : failed++;

console.log("\nDeclared indexes");
for (const [name, model] of Object.entries({ War, Memorial, Martyr, Media, User })) {
  const declared = model.schema.indexes().map(([keys]) => Object.keys(keys).join("+"));
  console.log(`  ${name.padEnd(9)} ${declared.join(" | ") || "(none)"}`);
}

console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);

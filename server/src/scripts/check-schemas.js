import {
  martyrCreateSchema,
  martyrUpdateSchema,
  memorialCreateSchema,
  warCreateSchema,
  mediaCreateSchema,
  loginSchema,
  seedAdminSchema,
} from "../schemas/index.js";

/**
 * Guards the request-validation layer. The mass-assignment strip is the case
 * that matters: it is invisible from the UI, and a refactor that drops a
 * validateBody() would reopen it silently. The admin controllers do
 * Object.assign(doc, req.body), so anything the schema fails to strip is
 * written straight to the document.
 *
 *   npm run check:schemas
 */

let passed = 0;
let failed = 0;

function expectValid(label, schema, input) {
  const r = schema.safeParse(input);
  if (r.success) {
    console.log(`  ok    ${label}`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}\n          unexpectedly rejected: ${r.error.issues[0].message}`);
    failed++;
  }
}

function expectInvalid(label, schema, input, matcher) {
  const r = schema.safeParse(input);
  if (r.success) {
    console.log(`  FAIL  ${label}\n          was accepted but should have been rejected`);
    failed++;
    return;
  }
  const message = r.error.issues.map((i) => i.message).join("; ");
  if (matcher && !new RegExp(matcher, "i").test(message)) {
    console.log(`  FAIL  ${label}\n          rejected for the wrong reason: ${message}`);
    failed++;
    return;
  }
  console.log(`  ok    ${label}`);
  passed++;
}

function expectEquals(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(ok ? `  ok    ${label}` : `  FAIL  ${label}\n          got ${JSON.stringify(actual)}`);
  ok ? passed++ : failed++;
}

const validMartyr = {
  slug: "vikram-batra",
  fullName: "Vikram Batra",
  serviceBranch: "Army",
  status: "fell-in-action",
};

console.log("\nMass assignment — unknown keys must not survive");
{
  const hostile = {
    ...validMartyr,
    _id: "000000000000000000000000",
    createdAt: "1999-01-01",
    createdBy: "someone-else",
    isSuperAdmin: true,
    verification: { status: "verified" },
  };
  const parsed = martyrCreateSchema.parse(hostile);
  const leaked = Object.keys(parsed).filter(
    (k) => !["slug", "fullName", "serviceBranch", "status", "verification"].includes(k)
  );
  expectEquals("_id, createdAt, createdBy, isSuperAdmin all stripped", leaked, []);
}
{
  const parsed = memorialCreateSchema.parse({
    slug: "kargil-war-memorial",
    name: "Kargil War Memorial",
    _id: "deadbeefdeadbeefdeadbeef",
    createdBy: "attacker",
  });
  expectEquals("memorial schema strips unknown keys", Object.keys(parsed).sort(), ["name", "slug"]);
}
{
  const parsed = warCreateSchema.parse({
    slug: "kargil-1999",
    name: "Kargil War",
    type: "war",
    verified: true,
  });
  expectEquals("war schema strips unknown keys", Object.keys(parsed).sort(), [
    "name",
    "slug",
    "type",
  ]);
}

console.log("\nEnum rejection");
expectInvalid(
  "bad serviceBranch",
  martyrCreateSchema,
  { ...validMartyr, serviceBranch: "Marines" },
  "expected one of"
);
expectInvalid(
  "bad status",
  martyrCreateSchema,
  { ...validMartyr, status: "immortal" },
  "expected one of"
);
expectInvalid(
  "bad award name",
  martyrCreateSchema,
  { ...validMartyr, awards: [{ name: "Medal of Honor" }] },
  "expected one of"
);
expectInvalid(
  "bad war type",
  warCreateSchema,
  { slug: "x-y", name: "X", type: "brawl" },
  "expected one of"
);
expectInvalid(
  "bad media licence",
  mediaCreateSchema,
  { kind: "photo", license: "whatever-i-found" },
  "expected one of"
);
expectInvalid(
  "bad source tier",
  martyrCreateSchema,
  {
    ...validMartyr,
    sources: [{ field: "biography", title: "A book", tier: "tertiary" }],
  },
  "expected one of"
);

console.log("\nSlug handling");
expectEquals(
  "uppercase normalises to lowercase",
  martyrUpdateSchema.parse({ slug: "BAD" }).slug,
  "bad"
);
expectEquals(
  "surrounding whitespace trimmed",
  martyrUpdateSchema.parse({ slug: "  Vikram-Batra  " }).slug,
  "vikram-batra"
);
expectInvalid("spaces rejected", martyrUpdateSchema, { slug: "Not A Slug" }, "lowercase words");
expectInvalid("underscores rejected", martyrUpdateSchema, { slug: "bad_slug" }, "lowercase words");

console.log("\nAuth schemas");
expectInvalid("malformed login email", loginSchema, { email: "nope", password: "x" }, "valid email");
expectInvalid("missing login password", loginSchema, { email: "a@b.com" }, "expected string");
expectValid("well-formed login", loginSchema, { email: "A@B.com", password: "x" });
expectEquals(
  "login email lowercased",
  loginSchema.parse({ email: "Admin@Example.COM", password: "x" }).email,
  "admin@example.com"
);
expectInvalid(
  "seed password under 12 chars",
  seedAdminSchema,
  { email: "a@b.com", name: "Editor", password: "short" },
  "at least 12"
);
expectValid("seed password of 12+", seedAdminSchema, {
  email: "a@b.com",
  name: "Editor",
  password: "a-sufficiently-long-password",
});

console.log("\nPartial updates");
expectValid("single field accepted", martyrUpdateSchema, { rank: "Major" });
expectValid("empty patch accepted", martyrUpdateSchema, {});
expectInvalid(
  "invalid enum still rejected in a patch",
  martyrUpdateSchema,
  { serviceBranch: "Marines" },
  "expected one of"
);
{
  const parsed = martyrUpdateSchema.parse({ rank: "Major", _id: "000000000000000000000000" });
  expectEquals("patch strips unknown keys too", Object.keys(parsed), ["rank"]);
}

console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);

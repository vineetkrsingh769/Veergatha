import "dotenv/config";
import mongoose from "mongoose";

/**
 * Verifies MONGODB_URI end to end and translates the three Atlas failures
 * that account for almost every first-time connection problem.
 *
 *   npm run db:check
 */

const uri = process.env.MONGODB_URI;

function fail(message, hint) {
  console.error(`\n  FAILED  ${message}`);
  if (hint) console.error(`\n${hint}\n`);
  process.exit(1);
}

if (!uri) {
  fail(
    "MONGODB_URI is not set.",
    "  Copy server/.env.example to server/.env and paste your Atlas string."
  );
}

// Atlas passwords are pasted raw far more often than they are encoded. A literal
// @ : / ? # [ ] or % inside the password silently breaks URI parsing, and the
// resulting error ("Invalid scheme", "bad auth") points nowhere near the cause.
// Greedy up to the LAST @ — a non-greedy match stops at the first @ inside the
// password itself, which is exactly the case this check exists to catch.
const credentials = uri.match(/^mongodb(?:\+srv)?:\/\/(.*)@/)?.[1] ?? "";
const password = credentials.split(":").slice(1).join(":");
if (/[@:/?#[\]]/.test(password)) {
  fail(
    "The password in MONGODB_URI contains a character that must be percent-encoded.",
    "  @ -> %40    : -> %3A    / -> %2F    ? -> %3F    # -> %23\n" +
      "  Encode it in the URI, or reset the DB user to an alphanumeric password."
  );
}

// A string with no path segment connects you to a database literally named "test".
// Everything then appears to work while writing to the wrong place.
const dbInPath = uri.split("?")[0].split("/")[3];
if (!dbInPath) {
  fail(
    "MONGODB_URI has no database name.",
    "  Add it before the '?':\n" +
      "  ...mongodb.net/veergatha?retryWrites=true&w=majority"
  );
}

console.log(`\n  Connecting to database "${dbInPath}" ...`);

try {
  const started = Date.now();
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const elapsed = Date.now() - started;

  const admin = mongoose.connection.db.admin();
  const { version } = await admin.serverInfo();
  const collections = await mongoose.connection.db.listCollections().toArray();

  console.log(`  OK      connected in ${elapsed}ms`);
  console.log(`  server  MongoDB ${version}`);
  console.log(`  db      ${mongoose.connection.name}`);
  console.log(
    `  coll    ${
      collections.length ? collections.map((c) => c.name).join(", ") : "none yet"
    }\n`
  );

  await mongoose.disconnect();
} catch (err) {
  if (/IP that isn't whitelisted|ENOTFOUND|querySrv/i.test(err.message)) {
    fail(
      "Could not reach the cluster.",
      "  Atlas > Network Access > Add IP Address.\n" +
        "  Use 0.0.0.0/0 — Render's free tier has no static IP, so a pinned\n" +
        "  address will work locally and then fail once deployed."
    );
  }
  if (/bad auth|Authentication failed/i.test(err.message)) {
    fail(
      "Authentication rejected.",
      "  Atlas > Database Access. The DB user is separate from your Atlas\n" +
        "  login account. Check the username, and reset the password if unsure."
    );
  }
  fail(err.message);
}

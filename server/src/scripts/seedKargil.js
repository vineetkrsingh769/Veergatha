import "dotenv/config";
import mongoose from "mongoose";
import { War, Memorial, Martyr } from "../models/index.js";

/**
 * Seeds the Kargil War vertical slice into MongoDB Atlas.
 * Includes the Kargil conflict, two war memorials, and the four Param Vir Chakra recipients
 * (Vikram Batra, Manoj Kumar Pandey, Yogendra Singh Yadav, Sanjay Kumar).
 *
 *   npm run db:seed
 */

const primarySource = (field, title = "Gallantry Awards Portal", url = "https://gallantryawards.gov.in") => ({
  field,
  title,
  publisher: "Ministry of Defence",
  url,
  accessedAt: new Date("2026-08-23"),
  tier: "primary",
});

const verifiedStatus = {
  status: "verified",
  notes: "Primary sourced record for Kargil PVC vertical slice",
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in server/.env");
    process.exit(1);
  }

  console.log("Connecting to database...");
  await mongoose.connect(uri);

  console.log("Clearing existing seed data...");
  await Promise.all([
    War.deleteMany({ slug: "kargil-1999" }),
    Memorial.deleteMany({ slug: { $in: ["kargil-war-memorial", "national-war-memorial"] } }),
    Martyr.deleteMany({
      slug: { $in: ["vikram-batra", "manoj-kumar-pandey", "yogendra-singh-yadav", "sanjay-kumar"] },
    }),
  ]);

  console.log("Inserting Kargil War conflict...");
  const kargilWar = await War.create({
    slug: "kargil-1999",
    name: "Kargil War (Operation Vijay)",
    type: "war",
    startDate: new Date("1999-05-03"),
    endDate: new Date("1999-07-26"),
    summary: "High-altitude armed conflict between India and Pakistan in the Kargil sector of Jammu and Kashmir.",
    description:
      "Fought between May and July 1999 in the Kargil district of Jammu and Kashmir along the Line of Control (LoC). Indian armed forces launched Operation Vijay to clear Pakistani infiltrators from high-altitude posts.",
    sources: [primarySource("summary", "Official War History", "https://mod.gov.in")],
    verification: verifiedStatus,
  });

  console.log("Inserting War Memorials...");
  const [kargilMemorial, nationalMemorial] = await Memorial.create([
    {
      slug: "kargil-war-memorial",
      name: "Kargil War Memorial",
      location: {
        city: "Dras",
        district: "Kargil",
        state: "Ladakh",
        coordinates: { type: "Point", coordinates: [75.7608, 34.4283] },
      },
      inauguratedYear: 2000,
      managedBy: "Indian Army",
      description:
        "Built by the Indian Army at Dras at the foothills of Tololing to commemorate the soldiers who fell during Operation Vijay.",
      sources: [primarySource("location", "Indian Army Portal", "https://indianarmy.nic.in")],
      verification: verifiedStatus,
    },
    {
      slug: "national-war-memorial",
      name: "National War Memorial",
      location: {
        city: "New Delhi",
        district: "New Delhi",
        state: "Delhi",
        coordinates: { type: "Point", coordinates: [77.241, 28.6123] },
      },
      inauguratedYear: 2019,
      managedBy: "Ministry of Defence",
      description:
        "National monument built near India Gate to honour all armed forces personnel killed in post-independence conflicts.",
      sources: [primarySource("name", "National War Memorial Portal", "https://nationalwarmemorial.gov.in")],
      verification: verifiedStatus,
    },
  ]);

  console.log("Inserting Kargil Param Vir Chakra recipients...");
  const martyrs = await Martyr.create([
    {
      slug: "vikram-batra",
      fullName: "Vikram Batra",
      rank: "Captain",
      serviceNumber: "IC-57556",
      serviceBranch: "Army",
      regiment: "13 Jammu & Kashmir Rifles",
      unit: "13 JAK RIF",
      dateOfBirth: new Date("1974-09-09"),
      status: "fell-in-action",
      dateOfMartyrdom: new Date("1999-07-07"),
      placeOfBirth: { village: "Palampur", district: "Kangra", state: "Himachal Pradesh" },
      war: kargilWar._id,
      operation: "Operation Vijay",
      memorials: [kargilMemorial._id, nationalMemorial._id],
      awards: [
        {
          name: "Param Vir Chakra",
          year: 1999,
          posthumous: true,
          citation:
            "Captain Vikram Batra of the 13 Jammu and Kashmir Rifles displayed conspicuous gallantry, inspiring leadership and devotion to duty of the highest order during Operation Vijay in Kargil.",
          gazetteRef: "Gazette of India, 15 Aug 1999, No. 42-Pres/99",
        },
      ],
      biography:
        "Captain Vikram Batra led one of the most arduous mountain warfare operations in Indian military history. He captured Point 5140 and later made the supreme sacrifice while capturing Point 4875 in the Kargil sector.",
      sources: [primarySource("awards.citation")],
      verification: verifiedStatus,
    },
    {
      slug: "manoj-kumar-pandey",
      fullName: "Manoj Kumar Pandey",
      rank: "Lieutenant",
      serviceNumber: "IC-56959",
      serviceBranch: "Army",
      regiment: "1/11 Gorkha Rifles",
      unit: "1/11 GR",
      dateOfBirth: new Date("1975-06-25"),
      status: "fell-in-action",
      dateOfMartyrdom: new Date("1999-07-03"),
      placeOfBirth: { village: "Rudha", district: "Sitapur", state: "Uttar Pradesh" },
      war: kargilWar._id,
      operation: "Operation Vijay",
      memorials: [kargilMemorial._id, nationalMemorial._id],
      awards: [
        {
          name: "Param Vir Chakra",
          year: 1999,
          posthumous: true,
          citation:
            "Lieutenant Manoj Kumar Pandey displayed valiant leadership and courage of the highest order in clearing enemy positions at Khalubar in Batalik sector.",
          gazetteRef: "Gazette of India, 15 Aug 1999, No. 42-Pres/99",
        },
      ],
      biography:
        "Lieutenant Manoj Kumar Pandey took part in several bold attacks during Operation Vijay, culminating in the assault on Khalubar in the Batalik sector where he led his men to clear enemy bunkers.",
      sources: [primarySource("awards.citation")],
      verification: verifiedStatus,
    },
    {
      slug: "yogendra-singh-yadav",
      fullName: "Yogendra Singh Yadav",
      rank: "Grenadier",
      serviceNumber: "2690572",
      serviceBranch: "Army",
      regiment: "18 Grenadiers",
      unit: "18 Grenadiers",
      dateOfBirth: new Date("1980-05-10"),
      status: "survived",
      placeOfBirth: { village: "Aurangabad Ahir", district: "Bulandshahr", state: "Uttar Pradesh" },
      war: kargilWar._id,
      operation: "Operation Vijay",
      memorials: [kargilMemorial._id, nationalMemorial._id],
      awards: [
        {
          name: "Param Vir Chakra",
          year: 1999,
          posthumous: false,
          citation:
            "Grenadier Yogendra Singh Yadav displayed conspicuous bravery and determination in climbing Tiger Hill and capturing enemy positions despite multiple gunshot wounds.",
          gazetteRef: "Gazette of India, 15 Aug 1999, No. 42-Pres/99",
        },
      ],
      biography:
        "Grenadier Yogendra Singh Yadav was part of the commando platoon tasked with capturing strategic bunkers on Tiger Hill. Despite sustaining multiple injuries, he continued climbing and cleared enemy positions.",
      sources: [primarySource("awards.citation")],
      verification: verifiedStatus,
    },
    {
      slug: "sanjay-kumar",
      fullName: "Sanjay Kumar",
      rank: "Rifleman",
      serviceNumber: "13760533",
      serviceBranch: "Army",
      regiment: "13 Jammu & Kashmir Rifles",
      unit: "13 JAK RIF",
      dateOfBirth: new Date("1976-03-03"),
      status: "survived",
      placeOfBirth: { village: "Kalol", district: "Bilaspur", state: "Himachal Pradesh" },
      war: kargilWar._id,
      operation: "Operation Vijay",
      memorials: [kargilMemorial._id, nationalMemorial._id],
      awards: [
        {
          name: "Param Vir Chakra",
          year: 1999,
          posthumous: false,
          citation:
            "Rifleman Sanjay Kumar displayed extraordinary valour and disregard for personal safety in capturing Area Flat Top in the Mushkoh Valley.",
          gazetteRef: "Gazette of India, 15 Aug 1999, No. 42-Pres/99",
        },
      ],
      biography:
        "Rifleman Sanjay Kumar volunteered to lead the assault on Area Flat Top in Mushkoh Valley. Facing heavy automatic fire, he charged enemy positions, seized an enemy machine gun, and cleared the bunker.",
      sources: [primarySource("awards.citation")],
      verification: verifiedStatus,
    },
  ]);

  console.log(`\nSuccessfully seeded:`);
  console.log(`- 1 War (${kargilWar.name})`);
  console.log(`- 2 Memorials (${kargilMemorial.name}, ${nationalMemorial.name})`);
  console.log(`- ${martyrs.length} PVC Recipients: ${martyrs.map((m) => m.fullName).join(", ")}\n`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});

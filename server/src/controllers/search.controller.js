import { Martyr, Memorial, War } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { PUBLIC, escapeRegex, projectionOf } from "../utils/query.js";

const MARTYR_FIELDS = "slug fullName rank regiment status dateOfMartyrdom portrait";

/**
 * Cross-collection search. Martyrs use the weighted text index; memorials and
 * wars are small enough that a case-insensitive name match is both adequate and
 * cheaper than maintaining two more text indexes.
 */
export async function search(req, res) {
  const q = (req.query.q ?? "").trim();
  if (q.length < 2) throw new ApiError(400, "Query must be at least 2 characters");

  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const nameMatch = new RegExp(escapeRegex(q), "i");

  const projection = projectionOf(MARTYR_FIELDS);
  projection.score = { $meta: "textScore" };

  const [martyrs, memorials, wars] = await Promise.all([
    Martyr.find({ ...PUBLIC, $text: { $search: q } }, projection)
      .populate({ path: "portrait", select: "cloudinary.secureUrl", match: PUBLIC })
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean(),
    Memorial.find({ ...PUBLIC, name: nameMatch })
      .select("slug name location.city location.state")
      .limit(limit)
      .lean(),
    War.find({ ...PUBLIC, name: nameMatch })
      .select("slug name type startDate endDate")
      .limit(limit)
      .lean(),
  ]);

  res.json({
    query: q,
    counts: { martyrs: martyrs.length, memorials: memorials.length, wars: wars.length },
    martyrs,
    memorials,
    wars,
  });
}

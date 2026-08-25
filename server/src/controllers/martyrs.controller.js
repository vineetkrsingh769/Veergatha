import { Martyr, War } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import {
  PUBLIC,
  escapeRegex,
  parsePagination,
  meta,
  projectionOf,
  yearRange,
} from "../utils/query.js";

const LIST_FIELDS =
  "slug fullName rank regiment serviceBranch status dateOfMartyrdom placeOfBirth.state awards.name portrait";

/** Media is populated through the same verified gate as everything else. */
const PORTRAIT = { path: "portrait", select: "cloudinary.secureUrl credit", match: PUBLIC };

export async function listMartyrs(req, res) {
  const { q, state, war, year, regiment, award, branch, status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { ...PUBLIC };
  if (state) filter["placeOfBirth.state"] = state;
  if (branch) filter.serviceBranch = branch;
  if (status) filter.status = status;
  if (award) filter["awards.name"] = award;
  if (regiment) filter.regiment = new RegExp(escapeRegex(regiment), "i");
  if (q) filter.$text = { $search: q };

  if (year) {
    const range = yearRange(year);
    if (range) filter.dateOfMartyrdom = range;
  }

  if (war) {
    const found = await War.findOne({ slug: war, ...PUBLIC }).select("_id").lean();
    // An unknown war slug is an empty result set, not an error.
    if (!found) return res.json({ martyrs: [], meta: meta(0, page, limit) });
    filter.war = found._id;
  }

  const projection = projectionOf(LIST_FIELDS);
  let sort = { fullName: 1 };

  if (q) {
    // Sorting by relevance requires the score to be projected.
    projection.score = { $meta: "textScore" };
    sort = { score: { $meta: "textScore" } };
  }

  const [martyrs, total] = await Promise.all([
    Martyr.find(filter, projection).populate(PORTRAIT).sort(sort).skip(skip).limit(limit).lean(),
    Martyr.countDocuments(filter),
  ]);

  res.json({ martyrs, meta: meta(total, page, limit) });
}

export async function getMartyr(req, res) {
  const martyr = await Martyr.findOne({ slug: req.params.slug, ...PUBLIC })
    .populate("war", "slug name type startDate endDate")
    .populate("memorials", "slug name location.city location.state")
    .populate({ ...PORTRAIT, select: "cloudinary.secureUrl credit license sourceUrl" })
    .populate({
      path: "gallery",
      select: "kind title cloudinary.secureUrl credit license sourceUrl",
      match: PUBLIC,
    })
    .lean();

  if (!martyr) throw new ApiError(404, "No such record");
  res.json({ martyr });
}

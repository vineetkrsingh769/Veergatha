import { Martyr, War } from "../models/index.js";
import { AWARD_NAMES } from "../models/Martyr.js";
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

/**
 * Ordering has to happen here, not in the browser. The client only ever holds
 * one page, so sorting there would reorder twelve records while appearing to
 * order the whole result set — which is worse than offering no sort at all.
 *
 * `award` is absent from this map because award order is precedence, not
 * alphabetical: Ashoka Chakra must not sort above Param Vir Chakra. That needs
 * the position of each name within AWARD_NAMES, which a plain find() cannot
 * compute — see the aggregation branch below.
 */
const SORTS = {
  // Undated records (surviving recipients) collate last under a descending
  // sort, rather than heading a list titled "most recent".
  date: { dateOfMartyrdom: -1, fullName: 1 },
  name: { fullName: 1 },
};

const SORT_KEYS = [...Object.keys(SORTS), "award"];

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

  // An explicit sort always wins. Without one, a search falls back to relevance
  // and everything else to alphabetical.
  const requested = SORT_KEYS.includes(req.query.sort) ? req.query.sort : null;

  if (requested === "award") {
    /*
     * Precedence order comes from the position of the award's name inside
     * AWARD_NAMES, which is already ordered PVC → … → Other. Reading the
     * ordering from the enum rather than restating it here means the two
     * cannot drift apart.
     */
    const [martyrs, total] = await Promise.all([
      Martyr.aggregate([
        { $match: filter },
        {
          $addFields: {
            _awardRank: {
              $let: {
                vars: {
                  i: {
                    $indexOfArray: [AWARD_NAMES, { $arrayElemAt: ["$awards.name", 0] }],
                  },
                },
                // $indexOfArray yields -1 for a missing or unrecognised award.
                // Those sort last; -1 would otherwise put them first.
                in: { $cond: [{ $lt: ["$$i", 0] }, AWARD_NAMES.length, "$$i"] },
              },
            },
          },
        },
        { $sort: { _awardRank: 1, fullName: 1 } },
        { $skip: skip },
        { $limit: limit },
        // Inclusion-only, so _awardRank never reaches the response.
        { $project: projection },
      ]),
      Martyr.countDocuments(filter),
    ]);

    await Martyr.populate(martyrs, PORTRAIT);
    return res.json({ martyrs, meta: meta(total, page, limit) });
  }

  let sort = SORTS[requested] ?? { fullName: 1 };

  if (!requested && q) {
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

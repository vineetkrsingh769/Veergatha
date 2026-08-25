import { Martyr, Memorial, War, Media } from "../models/index.js";
import { PUBLIC } from "../utils/query.js";

/** Populates the filter dropdowns. Only values that actually match a published record. */
export async function getFilters(req, res) {
  const [states, regiments, branches, awards, wars, years] = await Promise.all([
    Martyr.distinct("placeOfBirth.state", PUBLIC),
    Martyr.distinct("regiment", PUBLIC),
    Martyr.distinct("serviceBranch", PUBLIC),
    Martyr.distinct("awards.name", PUBLIC),
    War.find(PUBLIC).select("slug name").sort({ startDate: 1 }).lean(),
    Martyr.aggregate([
      { $match: { ...PUBLIC, dateOfMartyrdom: { $ne: null } } },
      { $group: { _id: { $year: "$dateOfMartyrdom" } } },
      { $sort: { _id: -1 } },
    ]),
  ]);

  const clean = (list) => list.filter(Boolean).sort();

  res.json({
    states: clean(states),
    regiments: clean(regiments),
    branches: clean(branches),
    awards: clean(awards),
    wars,
    years: years.map((y) => y._id),
  });
}

export async function getStats(req, res) {
  const [martyrs, memorials, wars, media, fell, survived] = await Promise.all([
    Martyr.countDocuments(PUBLIC),
    Memorial.countDocuments(PUBLIC),
    War.countDocuments(PUBLIC),
    Media.countDocuments(PUBLIC),
    Martyr.countDocuments({ ...PUBLIC, status: "fell-in-action" }),
    Martyr.countDocuments({ ...PUBLIC, status: "survived" }),
  ]);

  res.json({ martyrs, memorials, wars, media, byStatus: { fell, survived } });
}

import { War, Martyr } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { PUBLIC } from "../utils/query.js";

export async function listWars(req, res) {
  const wars = await War.find(PUBLIC)
    .select("slug name type startDate endDate summary heroImage")
    .populate({ path: "heroImage", select: "cloudinary.secureUrl credit", match: PUBLIC })
    .sort({ startDate: 1 })
    .lean();

  res.json({ wars });
}

export async function getWar(req, res) {
  const war = await War.findOne({ slug: req.params.slug, ...PUBLIC })
    .populate({ path: "heroImage", select: "cloudinary.secureUrl credit", match: PUBLIC })
    .lean();

  if (!war) throw new ApiError(404, "No such conflict");

  const martyrs = await Martyr.find({ war: war._id, ...PUBLIC })
    .select("slug fullName rank regiment status dateOfMartyrdom awards.name")
    .sort({ dateOfMartyrdom: 1, fullName: 1 })
    .lean();

  res.json({ war, martyrs });
}

import { Memorial, Martyr } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { PUBLIC, parsePagination, meta } from "../utils/query.js";

const LIST_FIELDS = "slug name location inauguratedYear description heroImage";
const HERO = { path: "heroImage", select: "cloudinary.secureUrl credit", match: PUBLIC };

export async function listMemorials(req, res) {
  const { state } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { ...PUBLIC };
  if (state) filter["location.state"] = state;

  const [memorials, total] = await Promise.all([
    Memorial.find(filter).select(LIST_FIELDS).populate(HERO).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Memorial.countDocuments(filter),
  ]);

  res.json({ memorials, meta: meta(total, page, limit) });
}

/** Uses the 2dsphere index on location.coordinates. */
export async function listMemorialsNear(req, res) {
  const lng = Number.parseFloat(req.query.lng);
  const lat = Number.parseFloat(req.query.lat);
  const km = Math.min(2000, Math.max(1, Number.parseFloat(req.query.km) || 100));

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw new ApiError(400, "lng and lat are required numbers");
  }
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    throw new ApiError(400, "lng and lat are out of range");
  }

  const memorials = await Memorial.find({
    ...PUBLIC,
    "location.coordinates": {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: km * 1000,
      },
    },
  })
    .select(LIST_FIELDS)
    .populate(HERO)
    .limit(50)
    .lean();

  res.json({ memorials, origin: { lng, lat }, radiusKm: km });
}

export async function getMemorial(req, res) {
  const memorial = await Memorial.findOne({ slug: req.params.slug, ...PUBLIC })
    .populate(HERO)
    .populate({ path: "gallery", select: "kind title cloudinary.secureUrl credit", match: PUBLIC })
    .lean();

  if (!memorial) throw new ApiError(404, "No such memorial");

  // The reverse side of the many-to-many, resolved by query rather than by a
  // duplicated array on this document.
  const honoured = await Martyr.find({ memorials: memorial._id, ...PUBLIC })
    .select("slug fullName rank status awards.name")
    .sort({ fullName: 1 })
    .lean();

  res.json({ memorial, honoured });
}

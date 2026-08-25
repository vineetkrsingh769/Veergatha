import { Martyr, Memorial, War, Media } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination, meta } from "../utils/query.js";

// --- MARTYRS ADMIN ---

export async function listMartyrsAdmin(req, res) {
  const { status, war, q } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (status) filter["verification.status"] = status;
  if (war) filter.war = war;
  if (q) filter.$text = { $search: q };

  const [martyrs, total] = await Promise.all([
    Martyr.find(filter)
      .populate("war", "slug name")
      .populate("portrait", "cloudinary.secureUrl credit")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Martyr.countDocuments(filter),
  ]);

  res.json({ martyrs, meta: meta(total, page, limit) });
}

export async function createMartyr(req, res) {
  const martyr = new Martyr(req.body);
  await martyr.save();
  res.status(201).json({ martyr });
}

export async function updateMartyr(req, res) {
  const martyr = await Martyr.findById(req.params.id);
  if (!martyr) throw new ApiError(404, "Martyr record not found");

  Object.assign(martyr, req.body);
  await martyr.save();

  res.json({ martyr });
}

export async function deleteMartyr(req, res) {
  const martyr = await Martyr.findByIdAndDelete(req.params.id);
  if (!martyr) throw new ApiError(404, "Martyr record not found");
  res.json({ message: "Record deleted successfully", id: req.params.id });
}

// --- MEMORIALS ADMIN ---

export async function listMemorialsAdmin(req, res) {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (status) filter["verification.status"] = status;

  const [memorials, total] = await Promise.all([
    Memorial.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Memorial.countDocuments(filter),
  ]);

  res.json({ memorials, meta: meta(total, page, limit) });
}

export async function createMemorial(req, res) {
  const memorial = new Memorial(req.body);
  await memorial.save();
  res.status(201).json({ memorial });
}

export async function updateMemorial(req, res) {
  const memorial = await Memorial.findById(req.params.id);
  if (!memorial) throw new ApiError(404, "Memorial record not found");

  Object.assign(memorial, req.body);
  await memorial.save();

  res.json({ memorial });
}

export async function deleteMemorial(req, res) {
  const memorial = await Memorial.findByIdAndDelete(req.params.id);
  if (!memorial) throw new ApiError(404, "Memorial record not found");
  res.json({ message: "Memorial deleted successfully", id: req.params.id });
}

// --- WARS ADMIN ---

export async function listWarsAdmin(req, res) {
  const { status } = req.query;
  const filter = {};
  if (status) filter["verification.status"] = status;

  const wars = await War.find(filter).sort({ startDate: 1 }).lean();
  res.json({ wars });
}

export async function createWar(req, res) {
  const war = new War(req.body);
  await war.save();
  res.status(201).json({ war });
}

export async function updateWar(req, res) {
  const war = await War.findById(req.params.id);
  if (!war) throw new ApiError(404, "War record not found");

  Object.assign(war, req.body);
  await war.save();

  res.json({ war });
}

export async function deleteWar(req, res) {
  const war = await War.findByIdAndDelete(req.params.id);
  if (!war) throw new ApiError(404, "War record not found");
  res.json({ message: "War record deleted successfully", id: req.params.id });
}

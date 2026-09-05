import { Media, Martyr, Memorial, War } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { PUBLIC, parsePagination, meta } from "../utils/query.js";
import { cloudinaryConfigured, uploadBuffer, destroyAsset } from "../config/cloudinary.js";
import { MEDIA_LICENSES } from "../models/Media.js";

/** Public gallery. Only verified media, and only with a cleared licence. */
export async function listMedia(req, res) {
  const { kind } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { ...PUBLIC };
  if (kind) filter.kind = kind;

  const [media, total] = await Promise.all([
    Media.find(filter)
      .select("kind title description cloudinary credit license sourceUrl linkedTo")
      .populate("linkedTo.martyr", "slug fullName rank")
      .populate("linkedTo.memorial", "slug name")
      .populate("linkedTo.war", "slug name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Media.countDocuments(filter),
  ]);

  res.json({ media, meta: meta(total, page, limit) });
}

export async function listMediaAdmin(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.status) filter["verification.status"] = req.query.status;

  const [media, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Media.countDocuments(filter),
  ]);

  res.json({ media, meta: meta(total, page, limit) });
}

/**
 * multipart/form-data: `file` plus the metadata fields.
 *
 * The licence is required at upload time rather than being fixable later. An
 * asset whose rights nobody checked must never reach the archive, and the
 * moment of upload is the only point where whoever fetched the file still
 * remembers where it came from.
 */
export async function uploadMedia(req, res) {
  if (!cloudinaryConfigured) {
    throw new ApiError(
      503,
      "Media uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
  }

  if (!req.file) throw new ApiError(400, "No file provided under the field name 'file'");

  const { kind = "photo", title, description, credit, license, sourceUrl } = req.body;

  if (!license || !MEDIA_LICENSES.includes(license)) {
    throw new ApiError(400, `license must be one of: ${MEDIA_LICENSES.join(", ")}`);
  }
  if (license === "unverified") {
    throw new ApiError(400, "Refusing to store an asset with an unverified licence");
  }

  const needsCredit = ["GODL-India", "CC-BY", "CC-BY-SA"];
  if (needsCredit.includes(license) && !credit?.trim()) {
    throw new ApiError(400, `Licence ${license} requires a credit string`);
  }

  const linkedTo = {};
  for (const [key, Model] of [
    ["martyr", Martyr],
    ["memorial", Memorial],
    ["war", War],
  ]) {
    const id = req.body[`linkedTo.${key}`] ?? req.body[key];
    if (!id) continue;
    const exists = await Model.exists({ _id: id });
    if (!exists) throw new ApiError(400, `No ${key} exists with id ${id}`);
    linkedTo[key] = id;
  }

  const result = await uploadBuffer(req.file.buffer);

  try {
    const media = await Media.create({
      kind,
      title: title?.trim(),
      description: description?.trim(),
      cloudinary: {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
      credit: credit?.trim(),
      license,
      sourceUrl: sourceUrl?.trim(),
      linkedTo,
    });

    res.status(201).json({ media });
  } catch (err) {
    // The file is already on Cloudinary. If the document fails validation,
    // remove it rather than leaving an asset nothing in the database points to.
    await destroyAsset(result.public_id).catch(() => {});
    throw err;
  }
}

export async function deleteMedia(req, res) {
  const media = await Media.findById(req.params.id);
  if (!media) throw new ApiError(404, "Media not found");

  // Anything still pointing at this asset must be unlinked first, or a profile
  // renders a portrait reference that resolves to nothing.
  await Promise.all([
    Martyr.updateMany({ portrait: media._id }, { $unset: { portrait: 1 } }),
    Martyr.updateMany({ gallery: media._id }, { $pull: { gallery: media._id } }),
    Memorial.updateMany({ heroImage: media._id }, { $unset: { heroImage: 1 } }),
    Memorial.updateMany({ gallery: media._id }, { $pull: { gallery: media._id } }),
    War.updateMany({ heroImage: media._id }, { $unset: { heroImage: 1 } }),
  ]);

  if (cloudinaryConfigured && media.cloudinary?.publicId) {
    await destroyAsset(media.cloudinary.publicId).catch((err) =>
      console.warn(`[media] Cloudinary delete failed for ${media.cloudinary.publicId}: ${err.message}`)
    );
  }

  await media.deleteOne();
  res.json({ message: "Media deleted", id: req.params.id });
}

export async function updateMedia(req, res) {
  const media = await Media.findById(req.params.id);
  if (!media) throw new ApiError(404, "Media not found");

  Object.assign(media, req.body);
  await media.save();

  res.json({ media });
}

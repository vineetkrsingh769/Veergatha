import { useRef, useState } from "react";
import { UploadCloud, X, AlertCircle } from "lucide-react";

import { uploadAdminMedia } from "../../lib/api";
import { getErrorMessage } from "../../hooks/useApi";
import { Button, Field, SelectField } from "../ui/Field.jsx";

/**
 * Licences the archive will accept. `unverified` is deliberately absent — the
 * server refuses it, and offering it here would only invite a rejected upload.
 * See docs/SOURCING.md for what each one means in practice.
 */
const LICENCES = [
  { value: "GODL-India", label: "GODL-India — PIB / data.gov.in" },
  { value: "CC-BY", label: "CC-BY — attribution required" },
  { value: "CC-BY-SA", label: "CC-BY-SA — attribution, share-alike" },
  { value: "public-domain", label: "Public domain — out of copyright" },
  { value: "permission-granted", label: "Permission granted — keep the email" },
];

/** Attribution is a condition of these, so the form makes credit mandatory. */
const ATTRIBUTION_REQUIRED = new Set(["GODL-India", "CC-BY", "CC-BY-SA"]);

const BLANK = {
  title: "",
  description: "",
  license: "",
  credit: "",
  sourceUrl: "",
  kind: "photo",
};

export default function MediaUpload({ onClose, onUploaded }) {
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const creditRequired = ATTRIBUTION_REQUIRED.has(form.license);

  function pickFile(selected) {
    if (!selected) return;
    setFile(selected);
    setError("");
    // Revoke the previous object URL, or every re-pick leaks a blob.
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(selected);
    });
  }

  function close() {
    if (preview) URL.revokeObjectURL(preview);
    onClose();
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!file) return setError("Choose an image first.");
    if (!form.license) return setError("Select a licence. Nothing is stored without one.");
    if (creditRequired && !form.credit.trim()) {
      return setError(`${form.license} requires a credit line.`);
    }

    const body = new FormData();
    body.append("file", file);
    Object.entries(form).forEach(([k, v]) => v && body.append(k, v.trim?.() ?? v));

    setBusy(true);
    setProgress(0);
    try {
      await uploadAdminMedia(body, setProgress);
      if (preview) URL.revokeObjectURL(preview);
      await onUploaded();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Upload failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Upload media"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-stone-300 bg-[#FAF7F2] p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-300 pb-3">
          <h2 className="font-display text-lg font-bold text-[#1E431B]">Upload media</h2>
          <button onClick={close} aria-label="Close" className="text-stone-400 hover:text-stone-700">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-white/60 p-5 transition-colors hover:border-[#D96B27]"
          >
            {preview ? (
              <img
                src={preview}
                alt=""
                className="max-h-40 w-auto rounded-lg object-contain"
              />
            ) : (
              <UploadCloud className="h-7 w-7 text-stone-400" aria-hidden="true" />
            )}
            <span className="text-xs font-medium text-stone-600">
              {file ? file.name : "Choose an image — JPEG, PNG, WebP or AVIF, up to 8 MB"}
            </span>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            onChange={(e) => pickFile(e.target.files?.[0])}
          />

          <Field
            label="Title"
            placeholder="e.g. Captain Vikram Batra, 1999"
            value={form.title}
            onChange={set("title")}
          />

          <SelectField
            label="Licence (required)"
            options={[{ value: "", label: "Select a licence…" }, ...LICENCES]}
            value={form.license}
            onChange={set("license")}
          />

          <Field
            label={creditRequired ? "Credit (required by this licence)" : "Credit"}
            placeholder="e.g. Press Information Bureau, Government of India"
            hint={
              creditRequired
                ? "This licence obliges us to display the attribution, so it is shown on the gallery card."
                : undefined
            }
            value={form.credit}
            onChange={set("credit")}
          />

          <Field
            label="Source URL"
            type="url"
            placeholder="https://pib.gov.in/…"
            hint="Where the file came from. Not the page that embedded it."
            value={form.sourceUrl}
            onChange={set("sourceUrl")}
          />

          <Field
            label="Description"
            placeholder="What the image shows"
            value={form.description}
            onChange={set("description")}
          />

          {busy && (
            <div className="space-y-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-[#D96B27] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-500">Uploading… {progress}%</p>
            </div>
          )}

          <Button type="submit" disabled={busy} className="w-full py-2.5">
            {busy ? "Uploading…" : "Upload"}
          </Button>

          <p className="text-[11px] leading-relaxed text-stone-500">
            Uploads are saved as <strong>draft</strong>. They stay out of the public gallery until
            an editor marks them verified.
          </p>
        </form>
      </div>
    </div>
  );
}

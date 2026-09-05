import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Award,
  Landmark,
  Swords,
  Images,
  KeyRound,
  LogOut,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";

import {
  fetchMe,
  fetchAdminMartyrs,
  fetchAdminMemorials,
  fetchAdminWars,
  createAdminMartyr,
  updateAdminMartyr,
  deleteAdminMartyr,
  fetchAdminMedia,
  deleteAdminMedia,
  updateAdminMedia,
} from "../lib/api";
import { clearSession, isAuthenticated } from "../lib/auth";
import { getErrorMessage } from "../hooks/useApi";
import { SERVICE_BRANCHES, STATUS_OPTIONS, VERIFICATION_STATUS } from "../lib/constants";
import { displayName, memorialLocation, recordId, conflictYears } from "../lib/format";
import {
  EmptyState,
  Loading,
  PageContainer,
  VerificationBadge,
} from "../components/ui";
import { Button, Field, SelectField } from "../components/ui/Field.jsx";
import MediaUpload from "../components/admin/MediaUpload.jsx";
import ChangePassword from "../components/admin/ChangePassword.jsx";

const TABS = [
  { key: "martyrs", label: "Recipients", icon: Award },
  { key: "memorials", label: "Memorials", icon: Landmark },
  { key: "wars", label: "Conflicts", icon: Swords },
  { key: "media", label: "Media", icon: Images },
];

const BLANK_RECORD = {
  slug: "",
  fullName: "",
  rank: "",
  serviceBranch: "Army",
  regiment: "",
  status: STATUS_OPTIONS[0].value,
  verificationStatus: "draft",
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [tab, setTab] = useState("martyrs");
  const [statusFilter, setStatusFilter] = useState("");
  const [records, setRecords] = useState({ martyrs: [], memorials: [], wars: [], media: [] });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const signOut = useCallback(() => {
    clearSession();
    navigate("/admin/login");
  }, [navigate]);

  // Auth check runs once. It used to share an effect with the data load, so
  // every filter change re-verified the session against /auth/me.
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin/login");
      return;
    }

    let active = true;
    fetchMe()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) signOut();
      })
      .finally(() => {
        if (active) setCheckingAuth(false);
      });

    return () => {
      active = false;
    };
  }, [navigate, signOut]);

  const loadRecords = useCallback(async () => {
    const params = statusFilter ? { status: statusFilter } : {};
    setError("");

    try {
      const [martyrRes, memorialRes, warRes, mediaRes] = await Promise.all([
        fetchAdminMartyrs(params),
        fetchAdminMemorials(params),
        fetchAdminWars(),
        fetchAdminMedia(params),
      ]);
      setRecords({
        martyrs: martyrRes.martyrs ?? [],
        memorials: memorialRes.memorials ?? [],
        wars: warRes.wars ?? [],
        media: mediaRes.media ?? [],
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not load records"));
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!user) return;
    loadRecords();
  }, [user, loadRecords]);

  async function toggleVerification(record) {
    const current = record.verification?.status ?? "draft";
    const next = current === "verified" ? "draft" : "verified";

    try {
      await updateAdminMartyr(recordId(record), { verification: { status: next } });
      await loadRecords();
    } catch (err) {
      setError(getErrorMessage(err, "Status update failed"));
    }
  }

  async function removeRecord(record) {
    if (!window.confirm(`Delete “${displayName(record)}”? This cannot be undone.`)) return;

    try {
      await deleteAdminMartyr(recordId(record));
      await loadRecords();
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"));
    }
  }

  async function toggleMediaVerification(item) {
    const current = item.verification?.status ?? "draft";
    const next = current === "verified" ? "draft" : "verified";

    try {
      await updateAdminMedia(recordId(item), { verification: { status: next } });
      await loadRecords();
    } catch (err) {
      // The model refuses to verify media whose licence is still unverified,
      // so surface that reason rather than a generic failure.
      setError(getErrorMessage(err, "Could not change media status"));
    }
  }

  async function removeMedia(item) {
    if (!window.confirm(`Delete “${item.title || "this image"}”? It is removed from Cloudinary too.`))
      return;

    try {
      await deleteAdminMedia(recordId(item));
      await loadRecords();
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"));
    }
  }

  async function createRecord(form) {
    await createAdminMartyr({
      slug: form.slug.toLowerCase().trim(),
      fullName: form.fullName.trim(),
      rank: form.rank.trim() || undefined,
      serviceBranch: form.serviceBranch,
      regiment: form.regiment.trim() || undefined,
      status: form.status,
      verification: { status: form.verificationStatus },
    });
    setShowModal(false);
    await loadRecords();
  }

  if (checkingAuth) return <Loading label="Verifying editorial access…" />;

  const counts = {
    martyrs: records.martyrs.length,
    memorials: records.memorials.length,
    wars: records.wars.length,
    media: records.media.length,
  };

  return (
    <PageContainer className="space-y-6">
      <header className="flex flex-row items-end justify-between gap-4 border-b border-stone-300 pb-5">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-[#1E431B]">
            <Shield className="h-5 w-5 text-[#D96B27]" aria-hidden="true" />
            Editorial Control Panel
          </h1>
          <p className="text-xs text-stone-600">
            Signed in as {user?.email} ({user?.role})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => (tab === "media" ? setShowUpload(true) : setShowModal(true))}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {tab === "media" ? "Upload Media" : "Add Record"}
          </Button>
          <Button variant="secondary" onClick={() => setShowPassword(true)}>
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            Password
          </Button>
          <Button variant="secondary" onClick={signOut}>
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-row items-center justify-between gap-3 border-b border-stone-300 pb-3">
        <div className="flex gap-1 overflow-x-auto" role="tablist">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 text-xs font-semibold transition-colors ${
                tab === key
                  ? "border-[#D96B27] text-[#C25016]"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-stone-600">
          <span className="shrink-0">Verification:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-stone-300 bg-white px-2 py-1 text-stone-800 focus:border-[#D96B27] focus:outline-none"
          >
            <option value="">All statuses</option>
            {VERIFICATION_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {tab === "martyrs" && (
        <RecordTable
          columns={["Name", "Branch & regiment", "Status", "Verification", ""]}
          rows={records.martyrs}
          empty="No recipient records match this filter."
          renderRow={(m) => (
            <tr key={recordId(m) ?? m.slug} className="hover:bg-stone-50">
              <td className="p-3 font-semibold text-[#1A241A]">{displayName(m)}</td>
              <td className="p-3 text-stone-700">{m.regiment || m.serviceBranch}</td>
              <td className="p-3 font-mono text-[11px] text-stone-600">{m.status}</td>
              <td className="p-3">
                <button
                  onClick={() => toggleVerification(m)}
                  title="Toggle verification"
                  className="inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3 text-stone-400" aria-hidden="true" />
                  <VerificationBadge status={m.verification?.status} />
                </button>
              </td>
              <td className="p-3 text-right">
                <button
                  onClick={() => removeRecord(m)}
                  title="Delete record"
                  className="p-1.5 text-stone-400 transition-colors hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </td>
            </tr>
          )}
        />
      )}

      {tab === "memorials" && (
        <RecordTable
          columns={["Name", "Location", "Inaugurated", "Verification"]}
          rows={records.memorials}
          empty="No memorial records match this filter."
          renderRow={(m) => (
            <tr key={recordId(m) ?? m.slug} className="hover:bg-stone-50">
              <td className="p-3 font-semibold text-[#1A241A]">{m.name}</td>
              <td className="p-3 text-stone-700">{memorialLocation(m)}</td>
              <td className="p-3 text-stone-700">{m.inauguratedYear ?? "—"}</td>
              <td className="p-3">
                <VerificationBadge status={m.verification?.status} />
              </td>
            </tr>
          )}
        />
      )}

      {tab === "wars" && (
        <RecordTable
          columns={["Name", "Type", "Years", "Verification"]}
          rows={records.wars}
          empty="No conflicts recorded yet."
          renderRow={(w) => (
            <tr key={recordId(w) ?? w.slug} className="hover:bg-stone-50">
              <td className="p-3 font-semibold text-[#1A241A]">{w.name}</td>
              <td className="p-3 capitalize text-stone-700">{w.type}</td>
              <td className="p-3 text-stone-700">{conflictYears(w)}</td>
              <td className="p-3">
                <VerificationBadge status={w.verification?.status} />
              </td>
            </tr>
          )}
        />
      )}

      {tab === "media" && (
        <RecordTable
          columns={["", "Title", "Licence", "Credit", "Verification", ""]}
          rows={records.media}
          empty="No media uploaded yet."
          renderRow={(item) => (
            <tr key={recordId(item)} className="hover:bg-stone-50">
              <td className="p-2">
                <img
                  src={item.cloudinary?.secureUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded border border-stone-300 object-cover"
                />
              </td>
              <td className="p-3 font-semibold text-[#1A241A]">{item.title || "Untitled"}</td>
              <td className="p-3 text-stone-700">{item.license}</td>
              <td className="p-3 text-stone-600">{item.credit || "—"}</td>
              <td className="p-3">
                <button onClick={() => toggleMediaVerification(item)} title="Toggle verification">
                  <VerificationBadge status={item.verification?.status} />
                </button>
              </td>
              <td className="p-3 text-right">
                <button
                  onClick={() => removeMedia(item)}
                  title="Delete media"
                  className="p-1.5 text-stone-400 transition-colors hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </td>
            </tr>
          )}
        />
      )}

      {showPassword && <ChangePassword onClose={() => setShowPassword(false)} />}

      {showUpload && (
        <MediaUpload onClose={() => setShowUpload(false)} onUploaded={loadRecords} />
      )}

      {showModal && <NewRecordModal onClose={() => setShowModal(false)} onCreate={createRecord} />}
    </PageContainer>
  );
}

function RecordTable({ columns, rows, empty, renderRow }) {
  if (rows.length === 0) return <EmptyState title={empty} />;

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-300 bg-white/80">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-stone-300 bg-stone-100 text-stone-600">
            {columns.map((col, i) => (
              <th key={col || i} scope="col" className="whitespace-nowrap p-3 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

function NewRecordModal({ onClose, onCreate }) {
  const [form, setForm] = useState(BLANK_RECORD);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onCreate(form);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create record"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add new recipient record"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl border border-stone-300 bg-[#FAF7F2] p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-300 pb-3">
          <h2 className="font-display text-lg font-bold text-[#1E431B]">Add Recipient Record</h2>
          <button onClick={onClose} aria-label="Close" className="text-stone-400 hover:text-stone-700">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <Field
            label="Slug (unique URL handle)"
            required
            placeholder="e.g. vikram-batra"
            hint="Lowercase words separated by hyphens."
            value={form.slug}
            onChange={set("slug")}
          />
          <Field
            label="Full name"
            required
            placeholder="e.g. Vikram Batra"
            value={form.fullName}
            onChange={set("fullName")}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Rank" placeholder="e.g. Captain" value={form.rank} onChange={set("rank")} />
            <SelectField
              label="Service branch"
              options={SERVICE_BRANCHES}
              value={form.serviceBranch}
              onChange={set("serviceBranch")}
            />
          </div>

          <Field
            label="Regiment / unit"
            placeholder="e.g. 13 Jammu &amp; Kashmir Rifles"
            value={form.regiment}
            onChange={set("regiment")}
          />

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Action status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={set("status")}
            />
            <SelectField
              label="Verification"
              options={VERIFICATION_STATUS}
              value={form.verificationStatus}
              onChange={set("verificationStatus")}
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full py-2.5">
            {saving ? "Creating…" : "Create Record"}
          </Button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMe,
  fetchAdminMartyrs,
  fetchAdminMemorials,
  fetchAdminWars,
  createAdminMartyr,
  updateAdminMartyr,
  deleteAdminMartyr,
} from "../lib/api";
import { Shield, Award, Landmark, Swords, LogOut, CheckCircle2, Plus, Trash2, Edit3, X } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("martyrs");

  const [martyrs, setMartyrs] = useState([]);
  const [memorials, setMemorials] = useState([]);
  const [wars, setWars] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newMartyr, setNewMartyr] = useState({
    slug: "",
    fullName: "",
    rank: "Captain",
    serviceBranch: "Army",
    regiment: "",
    status: "fell-in-action",
    verificationStatus: "draft",
  });

  useEffect(() => {
    const token = localStorage.getItem("veergatha_token") || localStorage.getItem("smriti_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchMe()
      .then((data) => {
        setUser(data.user);
        loadDashboardData();
      })
      .catch(() => {
        localStorage.removeItem("veergatha_token");
        localStorage.removeItem("smriti_token");
        navigate("/admin/login");
      })
      .finally(() => setLoading(false));
  }, [navigate, statusFilter]);

  const loadDashboardData = () => {
    const params = statusFilter ? { status: statusFilter } : {};
    Promise.all([
      fetchAdminMartyrs(params).catch(() => ({ martyrs: [] })),
      fetchAdminMemorials(params).catch(() => ({ memorials: [] })),
      fetchAdminWars().catch(() => ({ wars: [] })),
    ]).then(([martyrRes, memRes, warRes]) => {
      setMartyrs(martyrRes.martyrs || []);
      setMemorials(memRes.memorials || []);
      setWars(warRes.wars || []);
    });
  };

  const handleCreateMartyr = async (e) => {
    e.preventDefault();
    try {
      await createAdminMartyr({
        slug: newMartyr.slug.toLowerCase().trim(),
        fullName: newMartyr.fullName,
        rank: newMartyr.rank,
        serviceBranch: newMartyr.serviceBranch,
        regiment: newMartyr.regiment,
        status: newMartyr.status,
        verification: { status: newMartyr.verificationStatus },
      });
      setShowModal(false);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to create record");
    }
  };

  const toggleVerificationStatus = async (martyr) => {
    const current = martyr.verification?.status || "draft";
    const nextStatus = current === "verified" ? "draft" : "verified";
    try {
      await updateAdminMartyr(martyr._id || martyr.id, {
        verification: { status: nextStatus },
      });
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Status update failed");
    }
  };

  const handleDeleteMartyr = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteAdminMartyr(id);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("veergatha_token");
    localStorage.removeItem("smriti_token");
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="py-24 text-center text-zinc-500 text-sm">Verifying editorial access...</div>;
  }

  return (
    <div className="py-8 px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h1 className="font-display text-3xl text-zinc-100 font-semibold">Editorial Control Panel</h1>
          </div>
          <p className="text-xs text-zinc-400">Logged in as {user?.email} ({user?.role})</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold text-xs rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium rounded-lg hover:border-zinc-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs & Status Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3 text-xs">
        <div className="flex space-x-6 font-medium">
          <button
            onClick={() => setActiveTab("martyrs")}
            className={`flex items-center gap-1.5 pb-3 ${
              activeTab === "martyrs" ? "text-amber-500 border-b-2 border-amber-500 font-bold" : "text-zinc-400"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Recipients ({martyrs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("memorials")}
            className={`flex items-center gap-1.5 pb-3 ${
              activeTab === "memorials" ? "text-amber-500 border-b-2 border-amber-500 font-bold" : "text-zinc-400"
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Memorials ({memorials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("wars")}
            className={`flex items-center gap-1.5 pb-3 ${
              activeTab === "wars" ? "text-amber-500 border-b-2 border-amber-500 font-bold" : "text-zinc-400"
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Conflicts ({wars.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Filter Verification:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in-review">In Review</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "martyrs" && (
        <div className="space-y-4">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400">
                  <th className="p-3">Name</th>
                  <th className="p-3">Branch & Regiment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {martyrs.map((m) => (
                  <tr key={m._id || m.slug} className="hover:bg-zinc-900/60">
                    <td className="p-3 font-semibold text-zinc-100">{m.rank} {m.fullName}</td>
                    <td className="p-3">{m.regiment || m.serviceBranch}</td>
                    <td className="p-3 font-mono text-[11px]">{m.status}</td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleVerificationStatus(m)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] uppercase font-bold cursor-pointer transition-colors ${
                          m.verification?.status === "verified"
                            ? "bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/60"
                            : "bg-amber-950/60 border border-amber-800/40 text-amber-400 hover:bg-amber-900/60"
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {m.verification?.status || "draft"}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleDeleteMartyr(m._id || m.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for adding record */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display text-lg font-bold text-zinc-100">Add New Recipient Record</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMartyr} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Slug (unique URL handle)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vikram-batra"
                  value={newMartyr.slug}
                  onChange={(e) => setNewMartyr({ ...newMartyr, slug: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={newMartyr.fullName}
                  onChange={(e) => setNewMartyr({ ...newMartyr, fullName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Rank</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Captain"
                    value={newMartyr.rank}
                    onChange={(e) => setNewMartyr({ ...newMartyr, rank: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Service Branch</label>
                  <select
                    value={newMartyr.serviceBranch}
                    onChange={(e) => setNewMartyr({ ...newMartyr, serviceBranch: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  >
                    <option value="Army">Army</option>
                    <option value="Navy">Navy</option>
                    <option value="Air Force">Air Force</option>
                    <option value="BSF">BSF</option>
                    <option value="CRPF">CRPF</option>
                    <option value="Assam Rifles">Assam Rifles</option>
                    <option value="ITBP">ITBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Regiment / Unit</label>
                <input
                  type="text"
                  placeholder="e.g. 13 Jammu & Kashmir Rifles"
                  value={newMartyr.regiment}
                  onChange={(e) => setNewMartyr({ ...newMartyr, regiment: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Action Status</label>
                  <select
                    value={newMartyr.status}
                    onChange={(e) => setNewMartyr({ ...newMartyr, status: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  >
                    <option value="fell-in-action">Fell in Action</option>
                    <option value="survived">Survived</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Verification Status</label>
                  <select
                    value={newMartyr.verificationStatus}
                    onChange={(e) => setNewMartyr({ ...newMartyr, verificationStatus: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="in-review">In Review</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded transition-colors mt-2"
              >
                Create Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

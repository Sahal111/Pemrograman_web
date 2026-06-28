import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../DasboardLayout/DashboardLayout";

const roleLabel = {
  pm: "Project Manager",
  developer: "Developer",
  qa: "QA",
};

const roleColors = {
  pm: "bg-purple-100 text-purple-700",
  developer: "bg-blue-100 text-blue-700",
  qa: "bg-green-100 text-green-700",
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700", 
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
  "bg-indigo-100 text-indigo-700"
];

export default function UserManagement() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRole, setSelectedRole] = useState("developer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, codesRes] = await Promise.all([
        api.get("/users/pending"),
        api.get("/invite-codes"),
      ]);
      setPendingUsers(pendingRes.data.data || []);
      setInviteCodes(codesRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setError("");
    setSuccess("");
    setGenerating(true);
    try {
      await api.post("/invite-codes", { role: selectedRole });
      await fetchData();
      setSuccess("Invite code generated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to generate invite code.");
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (userId) => {
    setError("");
    setSuccess("");
    try {
      await api.post(`/users/${userId}/approve`);
      await fetchData();
      setSuccess("User approved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to approve user.");
    }
  };

  const handleReject = async (userId, username) => {
    if (!confirm(`Reject and delete registration for "${username}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/users/${userId}/reject`);
      await fetchData();
      setSuccess("User rejected successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to reject user.");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage user registrations and invite codes</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              <span className="material-symbols-outlined text-[16px] mr-1">pending</span>
              {pendingUsers.length} Pending
            </span>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-sm text-gray-500">Loading data...</p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Generate Invite Code */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-[22px]">vpn_key</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Generate Invite Code</h2>
                    <p className="text-xs text-gray-500">Create new registration codes</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Select Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full h-11 px-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none"
                    >
                      <option value="pm">Project Manager</option>
                      <option value="developer">Developer</option>
                      <option value="qa">QA Tester</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateCode}
                    disabled={generating}
                    className="w-full bg-blue-600 text-white h-11 px-4 rounded-lg font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Generate Code
                      </>
                    )}
                  </button>
                </div>

                {/* Invite Codes List */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Codes</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {inviteCodes.length === 0 ? (
                      <div className="text-center py-8">
                        <span className="material-symbols-outlined text-gray-300 text-[48px]">key_off</span>
                        <p className="text-sm text-gray-400 mt-2">No invite codes yet</p>
                      </div>
                    ) : (
                      inviteCodes.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between bg-gray-50 px-3 py-3 rounded-lg border border-gray-200 hover:border-blue-200 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-blue-600 text-[16px]">
                                {c.is_used ? "check" : "key"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-mono font-bold text-sm text-gray-900">{c.code}</p>
                              <p className="text-xs text-gray-500">{roleLabel[c.role]}</p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                              c.is_used
                                ? "bg-gray-100 text-gray-500"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {c.is_used ? "Used" : "Active"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Pending Approvals */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-yellow-600 text-[22px]">person_add</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
                      <p className="text-xs text-gray-500">{pendingUsers.length} users waiting for approval</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {pendingUsers.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-gray-400">check_circle</span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">All caught up!</h3>
                      <p className="text-sm text-gray-500 mt-1">No pending user registrations</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingUsers.map((u, idx) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between border border-gray-200 px-5 py-4 rounded-xl hover:shadow-md hover:border-blue-200 transition-all group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[idx % avatarColors.length]}`}>
                              {getInitials(u.username)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">{u.username}</p>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColors[u.role]}`}>
                                  {roleLabel[u.role]}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">email</span>
                                  {u.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                                  {formatDate(u.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleApprove(u.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-green-700 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(u.id, u.username)}
                              className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-50 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

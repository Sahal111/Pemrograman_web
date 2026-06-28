import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../DasboardLayout/DashboardLayout";

/* ─── Helper Functions ─── */
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getAvatarColor = (index) => {
  const colors = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-pink-100 text-pink-700 border-pink-200",
    "bg-orange-100 text-orange-700 border-orange-200",
    "bg-green-100 text-green-700 border-green-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
  ];
  return colors[index % colors.length];
};

/* ─── Add Member Modal ─── */
function AddMemberModal({ open, onClose, onAdded }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "member",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    onClose();
    setError("");
    setForm({ username: "", email: "", password: "", role: "member" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/register", form);
      onAdded();
      handleClose();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors)[0][0] : "Failed to add member.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">
                person_add
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Add Team Member
              </h3>
              <p className="text-xs text-gray-400">Create a new user account</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <span className="material-symbols-outlined text-[16px]">
                error
              </span>{" "}
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Username *
            </label>
            <input
              required
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. johndoe"
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Email *
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. john@example.com"
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Password *
            </label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 8 characters"
              minLength={8}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="member">Team Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && (
                <svg
                  className="animate-spin h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              )}
              {submitting ? "Adding…" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Skeleton Loading Card ─── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center animate-pulse">
      <div className="w-24 h-24 rounded-full bg-gray-100 mb-4"></div>
      <div className="h-5 w-3/4 bg-gray-100 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-100 rounded mb-6"></div>
      <div className="flex gap-3 mb-6 w-full justify-center border-b border-gray-100 pb-6">
        <div className="w-8 h-8 rounded-full bg-gray-100"></div>
        <div className="w-8 h-8 rounded-full bg-gray-100"></div>
        <div className="w-8 h-8 rounded-full bg-gray-100"></div>
      </div>
      <div className="w-full space-y-3 mb-6">
        <div className="flex justify-between">
          <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
          <div className="h-3 w-1/4 bg-gray-100 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
          <div className="h-3 w-1/4 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div className="w-full h-9 bg-gray-100 rounded-lg mt-auto"></div>
    </div>
  );
}

/* ─── View Profile Modal ─── */
function ViewProfileModal({ open, user, onClose }) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            Profile Information
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            {/* Photo */}
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-100 bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.photo ? (
                  <img
                    src={`http://127.0.0.1:8000/storage/${user.photo}`}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(user.username)
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-900">
                  {user.username}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Job Title
                </label>
                <div className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-900">
                  {user.job_title || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Department
                </label>
                <div className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-900">
                  {user.department || "—"}
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Bio
                </label>
                <div className="w-full min-h-[80px] rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 whitespace-pre-wrap">
                  {user.bio || "—"}
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Contact & Regional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email Address
              </label>
              <a
                href={`mailto:${user.email}`}
                className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-blue-600 hover:underline"
              >
                {user.email}
              </a>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Phone Number
              </label>

              {user.phone ? (
                <a
                  href={`https://wa.me/${user.phone.replace(/^0/, "62").replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-blue-600 hover:underline"
                >
                  {user.phone}
                </a>
              ) : (
                <div className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-400">
                  —
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Role
              </label>
              <div className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-900 capitalize">
                {user.role}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Timezone
              </label>
              <div className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-900">
                {user.timezone || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function TeamDirectory() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isPM = currentUser.role === "pm";

  /* ── Fetch Users + Projects ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        api.get("/users"),
        api.get("/projects"),
      ]);
      const userData = usersRes.data.data ?? usersRes.data;
      const projectData = projectsRes.data.data ?? projectsRes.data;
      setUsers(userData);
      setFilteredUsers(userData);
      setProjects(projectData);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ── Search Filter ── */
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.role?.toLowerCase().includes(query),
        ),
      );
    }
  }, [searchQuery, users]);

  /* ── Real project & task counts from actual data ── */
  const getUserProjectsCount = (userId) => {
    return projects.filter((p) => p.members?.some((m) => m.id === userId))
      .length;
  };

  const getUserCompletedTasks = (userId) => {
    let count = 0;
    projects.forEach((p) => {
      (p.tasks || []).forEach((t) => {
        if (t.assignee?.id === userId && t.status === "done") count++;
      });
    });
    return count;
  };

  /* ── Get Online Status (Mock - in real app, you'd track this) ── */
  // const getOnlineStatus = (index) => {
  //   const statuses = ["online", "away", "offline"];
  //   return statuses[index % 3];
  // };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "online":
  //       return "bg-green-500";
  //     case "away":
  //       return "bg-yellow-500";
  //     case "offline":
  //       return "bg-gray-400";
  //     default:
  //       return "bg-gray-400";
  //   }
  // };

  return (
    <DashboardLayout>
      <ViewProfileModal
        open={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Team Directory
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and view internal talent.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members..."
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            {/* Manage Members Button - PM only */}
            {isPM && (
              <button
                onClick={() => navigate("/user-management")}
                className="w-full sm:w-auto bg-blue-600 text-white h-11 px-6 rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  person_add
                </span>
                Kelola Anggota
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-red-400">
              error_outline
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Failed to Load Team
          </h3>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button
            onClick={fetchData}
            className="mt-5 h-9 px-5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Team Grid */}
      {!loading && !error && (
        <>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-gray-400">
                  group
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                No Team Members Found
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Add your first team member to get started"}
              </p>
              {!searchQuery && isPM && (
                <button
                  onClick={() => navigate("/user-management")}
                  className="mt-5 h-9 px-5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all"
                >
                  Kelola Anggota
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
              {filteredUsers.map((user, index) => {
                const projectsCount = getUserProjectsCount(user.id);
                const tasksCompleted = getUserCompletedTasks(user.id);

                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 group relative overflow-hidden"
                  >
                    {/* Decorative top accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Avatar */}
                    <div className="relative w-24 h-24 rounded-full p-1 border-2 border-gray-100 mb-4 group-hover:border-blue-200 transition-colors">
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden ${getAvatarColor(
                          index,
                        )}`}
                      >
                        {user.photo ? (
                          <img
                            src={`http://127.0.0.1:8000/storage/${user.photo}`}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(user.username)
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {user.username}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium mb-6 capitalize">
                      {user.role || "Team Member"}
                    </p>

                    {/* Contact */}
                    <div className="flex gap-3 mb-6 w-full justify-center border-b border-gray-100 pb-6">
                      <a
                        href={`mailto:${user.email}`}
                        className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                        title={`Email ${user.email}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          mail
                        </span>
                      </a>
                      {user.phone && (
                        <a
                          href={`https://wa.me/${user.phone.replace(/^0/, "62").replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
                          title={`WhatsApp ${user.phone}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            chat
                          </span>
                        </a>
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="w-full flex flex-col gap-2 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Active Projects</span>
                        <span className="text-gray-900 font-semibold bg-gray-50 px-2 py-0.5 rounded">
                          {projectsCount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Tasks Completed</span>
                        <span className="text-gray-900 font-semibold bg-gray-50 px-2 py-0.5 rounded">
                          {tasksCompleted}
                        </span>
                      </div>
                      {/* <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Email</span>
                        <span
                          className="text-gray-900 text-xs truncate max-w-[150px]"
                          title={user.email}
                        >
                          {user.email}
                        </span>
                      </div> */}
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="mt-auto w-full h-9 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

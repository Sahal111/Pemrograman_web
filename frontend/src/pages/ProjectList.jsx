import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../DasboardLayout/DashboardLayout";

/* ─── Badge helpers ─── */
const statusConfig = {
  planning: {
    label: "Planning",
    cls: "bg-blue-50 text-blue-600 border-blue-200",
    bar: "bg-blue-500",
  },
  ongoing: {
    label: "In Progress",
    cls: "bg-indigo-50 text-indigo-600 border-indigo-200",
    bar: "bg-indigo-500",
  },
  done: {
    label: "Finished",
    cls: "bg-green-50 text-green-600 border-green-200",
    bar: "bg-green-500",
  },
};

const priorityConfig = {
  low: {
    label: "Low Priority",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
  },
  medium: {
    label: "Medium Priority",
    cls: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
  high: {
    label: "High Priority",
    cls: "bg-red-50 text-red-500 border-red-200",
  },
};

const projectIcons = [
  "dns", "security", "code", "cloud", "storage", "devices",
  "analytics", "build", "rocket_launch", "api",
];

const getIcon = (id) => projectIcons[id % projectIcons.length];

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const ITEMS_PER_PAGE = 8;

/* ═══════════════════════════════════════════════════════════
   MODAL – Form Project (Create / Edit)
═══════════════════════════════════════════════════════════ */
function ProjectFormModal({ open, editId, onClose, onSaved }) {
  const [form, setForm] = useState({
    nama_proyek: "", client: "", deskripsi: "",
    status: "planning", priority: "medium",
    start_date: "", end_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && editId) {
      setLoadingData(true);
      api.get(`/projects/${editId}`).then(res => {
        const d = res.data.data ?? res.data;
        setForm({
          nama_proyek: d.nama_proyek || "",
          client: d.client || "",
          deskripsi: d.deskripsi || "",
          status: d.status || "planning",
          priority: d.priority || "medium",
          start_date: d.timeline?.start_date ? d.timeline.start_date.split('T')[0] : "",
          end_date: d.timeline?.end_date ? d.timeline.end_date.split('T')[0] : "",
        });
      }).catch(() => {
        setError("Failed to load project data");
      }).finally(() => {
        setLoadingData(false);
      });
    } else if (open) {
      setForm({ nama_proyek: "", client: "", deskripsi: "", status: "planning", priority: "medium", start_date: "", end_date: "" });
    }
  }, [open, editId]);

  const handleClose = () => { onClose(); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/projects/${editId}`, form);
      } else {
        await api.post("/projects", form);
      }
      onSaved();
      handleClose();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors)[0][0] : "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]">{editId ? "edit" : "add"}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{editId ? "Edit Project" : "New Project"}</h3>
              <p className="text-xs text-gray-400">Fill in the details below</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        {loadingData ? (
          <div className="p-10 flex justify-center"><svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Project Name *</label>
                <input
                  type="text" required value={form.nama_proyek}
                  onChange={(e) => setForm({ ...form, nama_proyek: e.target.value })}
                  placeholder="e.g. Cloud Migration Q4"
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Client *</label>
                <input
                  type="text" required value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none">
                  <option value="planning">Planning</option>
                  <option value="ongoing">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Start Date</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">End Date</label>
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Brief overview of the project..." rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={handleClose}
                className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2">
                {submitting && (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                )}
                {submitting ? "Saving…" : "Save Project"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Row Actions ─── */
function ActionMenu({ project, onEdit, onDelete, onNavigate, isPM }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate();
        }}
        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        title="View Details"
      >
        <span className="material-symbols-outlined text-[18px]">
          visibility
        </span>
      </button>
      {isPM && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit Project"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete Project"
          >
            <span className="material-symbols-outlined text-[18px]">
              delete
            </span>
          </button>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* UI state */
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isPM = currentUser.role === "pm";

  /* ── Fetch ── */
  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data ?? res.data ?? []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  /* ── Delete ── */
  const handleDelete = async (id, name) => {
    if (!confirm(`Delete project "${name}"?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch {
      alert("Failed to delete project.");
    }
  };

  const handleEdit = (id) => {
    setEditId(id);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditId(null);
    setShowModal(true);
  };

  /* ── Filter + sort + search ── */
  const tabFilter = (p) => {
    if (activeTab === "active")    return p.status === "ongoing";
    if (activeTab === "completed") return p.status === "done";
    if (activeTab === "planning")  return p.status === "planning";
    return true;
  };

  const searchFilter = (p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.nama_proyek?.toLowerCase().includes(q) ||
      p.client?.toLowerCase().includes(q)
    );
  };

  const sorted = [...projects].filter(tabFilter).filter(searchFilter).sort((a, b) => {
    if (sortBy === "priority") {
      const ord = { high: 0, medium: 1, low: 2 };
      return (ord[a.priority] ?? 3) - (ord[b.priority] ?? 3);
    }
    if (sortBy === "deadline") {
      return new Date(a.deadline || 0) - new Date(b.deadline || 0);
    }
    if (sortBy === "progress") {
      return (b.progress ?? 0) - (a.progress ?? 0);
    }
    // newest (default)
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  /* ── Pagination ── */
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated  = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const tabs = [
    { key: "all",       label: "All Projects", count: projects.length },
    { key: "active",    label: "Active",       count: projects.filter((p) => p.status === "ongoing").length },
    { key: "completed", label: "Completed",    count: projects.filter((p) => p.status === "done").length },
    { key: "planning",  label: "Planning",     count: projects.filter((p) => p.status === "planning").length },
  ];

  /* ─── JSX ─── */
  return (
    <DashboardLayout>
      <ProjectFormModal
        open={showModal}
        editId={editId}
        onClose={() => setShowModal(false)}
        onSaved={() => {
          fetchProjects();
        }}
      />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Active Projects
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and track all ongoing IT initiatives across your
            organization.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50
            text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Export
          </button>
          {isPM && (
            <button
              onClick={handleCreate}
              className="flex-1 sm:flex-none h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm
                font-semibold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Project
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div
        className="bg-white border border-gray-200 rounded-xl p-2 flex flex-col md:flex-row
        justify-between items-center gap-3 mb-5 shadow-sm"
      >
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-lg w-full md:w-auto overflow-x-auto gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all
                ${
                  activeTab === t.key
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
                }`}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${activeTab === t.key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search projects, clients..."
              className="w-full h-9 pl-8 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]">
              filter_list
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 pl-8 pr-7 bg-white border border-gray-200 rounded-lg text-sm text-gray-700
                focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="priority">Priority</option>
              <option value="deadline">Deadline</option>
              <option value="progress">Progress</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[14px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* View toggle */}
          <div className="flex bg-gray-100 border border-gray-200 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition ${viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                view_list
              </span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                grid_view
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 flex flex-col items-center justify-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 mb-3"
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
          <p className="text-sm text-gray-400">Loading projects…</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-3">
            error_outline
          </span>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : sorted.length === 0 ? (
        /* ── Empty State ── */
        <div
          className="bg-white border border-gray-200 rounded-xl p-16 flex flex-col items-center
          justify-center text-center shadow-sm"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-gray-400">
              search_off
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No projects found
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-xs">
            {search
              ? `No results for "${search}". Try different keywords.`
              : "Start by creating your first project."}
          </p>
          {(search || isPM) && (
            <button
              onClick={() => (search ? setSearch("") : handleCreate())}
              className="mt-5 h-9 px-5 bg-blue-600 text-white text-sm font-semibold rounded-lg
                hover:bg-blue-700 transition-all active:scale-95"
            >
              {search ? "Clear Search" : "Create Project"}
            </button>
          )}
        </div>
      ) : viewMode === "list" ? (
        /* ══ LIST VIEW (TABLE) ══ */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((p) => {
                  const pc =
                    priorityConfig[p.priority] ?? priorityConfig.medium;
                  const pct =
                    p.progress ??
                    (p.status === "done"
                      ? 100
                      : p.status === "ongoing"
                        ? 55
                        : 15);
                  const isDone = p.status === "done";

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-blue-50/40 transition-colors ${isDone ? "opacity-75" : ""}`}
                    >
                      {/* Project Name */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded bg-blue-50 flex items-center justify-center flex-shrink-0 ${isDone ? "text-green-500 bg-green-50" : "text-blue-600"}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isDone ? "check_circle" : getIcon(p.id)}
                            </span>
                          </div>
                          <span
                            onClick={() => navigate(`/projects/${p.id}`)}
                            className={`text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors ${isDone ? "line-through text-gray-500" : ""}`}
                          >
                            {p.nama_proyek}
                          </span>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-5 text-sm text-gray-700">
                        {p.client || "—"}
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-5 text-sm text-gray-700">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <span className="material-symbols-outlined text-[14px]">
                            event
                          </span>
                          {formatDate(p.deadline)}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${pc.cls}`}
                        >
                          {pc.label}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-blue-500 rounded-full transition-all duration-700 ${isDone ? "bg-green-500" : ""}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium w-8 ${isDone ? "text-green-600" : "text-gray-600"}`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <ActionMenu
                          project={p}
                          isPM={isPM}
                          onEdit={() => handleEdit(p.id)}
                          onNavigate={() => navigate(`/projects/${p.id}`)}
                          onDelete={() => handleDelete(p.id, p.nama_proyek)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {(page - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(page * ITEMS_PER_PAGE, sorted.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {sorted.length}
              </span>{" "}
              results
            </p>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center
                  text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_left
                </span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg border text-sm font-semibold flex items-center justify-center transition
                    ${
                      page === n
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center
                  text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ══ GRID VIEW ══ */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((p) => {
            const sc = statusConfig[p.status] ?? statusConfig.planning;
            const pc = priorityConfig[p.priority] ?? priorityConfig.medium;
            const pct =
              p.progress ??
              (p.status === "done" ? 100 : p.status === "ongoing" ? 55 : 15);

            return (
              <div
                key={p.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:-translate-y-0.5
                  hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {getIcon(p.id)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="text-sm font-semibold text-gray-900 group-hover:text-blue-600
                          transition-colors cursor-pointer truncate"
                      >
                        {p.nama_proyek}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]">
                          business
                        </span>
                        {p.client || "—"}
                      </p>
                    </div>
                  </div>
                  <ActionMenu
                    project={p}
                    isPM={isPM}
                    onEdit={() => handleEdit(p.id)}
                    onNavigate={() => navigate(`/projects/${p.id}`)}
                    onDelete={() => handleDelete(p.id, p.nama_proyek)}
                  />
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${sc.cls}`}
                  >
                    {sc.label}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${pc.cls}`}
                  >
                    {pc.label}
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Progress</span>
                    <span
                      className={`font-semibold ${pct >= 100 ? "text-green-600" : pct >= 50 ? "text-blue-600" : "text-yellow-600"}`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`${sc.bar} h-1.5 rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px]">
                      calendar_today
                    </span>
                    Due {formatDate(p.deadline)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

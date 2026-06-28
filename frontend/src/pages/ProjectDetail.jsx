import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../DasboardLayout/DashboardLayout";

/* ─── Config ─── */
const statusConfig = {
  planning: {
    label: "Planning",
    cls: "bg-blue-50 text-blue-600 border-blue-200",
    bar: "bg-blue-500",
    dot: "bg-blue-500",
  },
  ongoing: {
    label: "In Progress",
    cls: "bg-indigo-50 text-indigo-600 border-indigo-200",
    bar: "bg-indigo-500",
    dot: "bg-indigo-500",
  },
  done: {
    label: "Finished",
    cls: "bg-green-50 text-green-600 border-green-200",
    bar: "bg-green-500",
    dot: "bg-green-500",
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
  "dns",
  "security",
  "code",
  "cloud",
  "storage",
  "devices",
  "analytics",
  "build",
  "rocket_launch",
  "api",
];
const getIcon = (id) => projectIcons[(id ?? 0) % projectIcons.length];

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const daysRemaining = (endDate) => {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate) - new Date()) / 86400000);
  return diff;
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/* ─── Task status columns ─── */
const TASK_COLS = [
  {
    key: "todo",
    label: "To Do",
    color: "bg-gray-400",
    light: "bg-gray-50",
    badge: "bg-gray-100 text-gray-600",
  },
  {
    key: "inprogress",
    label: "In Progress",
    color: "bg-blue-500",
    light: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    key: "review",
    label: "Review",
    color: "bg-purple-500",
    light: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    key: "done",
    label: "Done",
    color: "bg-green-500",
    light: "bg-green-50",
    badge: "bg-green-100 text-green-700",
  },
];

const taskPriority = {
  low: "bg-gray-100 text-gray-500",
  medium: "bg-yellow-50 text-yellow-600",
  high: "bg-red-50 text-red-500",
};

// Colors for team member avatars
const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
];

/* ─── Confirm Delete Modal ─── */
function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-red-500 text-[24px]">
            delete
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center">
          {title}
        </h3>
        <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {loading && (
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
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Task Form Modal (Create / Edit) ─── */
function TaskFormModal({ open, editTask, projectId, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    nama_tugas: "",
    deskripsi: "",
    assigned_to: "",
    priority: "medium",
    due_date: "",
    status: "todo",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && editTask) {
      setForm({
        nama_tugas: editTask.nama_tugas || "",
        deskripsi: editTask.deskripsi || "",
        assigned_to: editTask.assignee?.id || editTask.assigned_to || "",
        priority: editTask.priority || "medium",
        due_date: editTask.due_date ? editTask.due_date.split("T")[0] : "",
        status: editTask.status || "todo",
      });
    } else if (open) {
      setForm({
        nama_tugas: "",
        deskripsi: "",
        assigned_to: "",
        priority: "medium",
        due_date: "",
        status: "todo",
      });
    }
  }, [open, editTask]);

  const handleClose = () => {
    onClose();
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.assigned_to) delete payload.assigned_to;

      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, payload);
      } else {
        await api.post(`/projects/${projectId}/tasks`, payload);
      }
      onSaved();
      handleClose();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors)[0][0] : "Failed to save task.");
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
                {editTask ? "edit_note" : "assignment_add"}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {editTask ? "Edit Task" : "New Task"}
              </h3>
              <p className="text-xs text-gray-400">
                {editTask
                  ? "Update task details"
                  : "Add a task to this project"}
              </p>
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
              Task Name *
            </label>
            <input
              required
              type="text"
              value={form.nama_tugas}
              onChange={(e) => setForm({ ...form, nama_tugas: e.target.value })}
              placeholder="e.g. Set up CI/CD pipeline"
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Assigned To
              </label>
              <select
                value={form.assigned_to}
                onChange={(e) =>
                  setForm({ ...form, assigned_to: e.target.value })
                }
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              rows={2}
              placeholder="Optional task description..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
            />
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
              {submitting ? "Saving…" : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Add Member Modal ─── */
function AddMemberModal({ open, project, users, onClose, onAdded }) {
  const [memberIds, setMemberIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (project && open) {
      setMemberIds(project.members?.map((m) => m.id) || []);
    }
  }, [project, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/projects/${project.id}`, {
        nama_proyek: project.nama_proyek,
        client: project.client,
        deskripsi: project.deskripsi,
        status: project.status,
        priority: project.priority,
        start_date: project.timeline?.start_date || project.start_date,
        end_date: project.timeline?.end_date || project.end_date,
        member_ids: memberIds,
      });
      onAdded();
      onClose();
    } catch (err) {
      alert("Failed to update members");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMember = (id) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Manage Team Members</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-64 overflow-y-auto p-2">
            {users.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={memberIds.includes(u.id)}
                  onChange={() => toggleMember(u.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {getInitials(u.username)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {u.username}
                  </p>
                  <p className="text-xs text-gray-500">{u.role}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="p-5 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
            >
              {submitting ? "Saving..." : "Save Members"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Edit Project Modal ─── */
function EditProjectModal({ open, project, onClose, onSaved }) {
  const [form, setForm] = useState({
    nama_proyek: "",
    client: "",
    deskripsi: "",
    status: "planning",
    priority: "medium",
    start_date: "",
    end_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && project) {
      setForm({
        nama_proyek: project.nama_proyek || "",
        client: project.client || "",
        deskripsi: project.deskripsi || "",
        status: project.status || "planning",
        priority: project.priority || "medium",
        start_date: project.timeline?.start_date
          ? project.timeline.start_date.split("T")[0]
          : project.start_date
            ? project.start_date.split("T")[0]
            : "",
        end_date: project.timeline?.end_date
          ? project.timeline.end_date.split("T")[0]
          : project.end_date
            ? project.end_date.split("T")[0]
            : "",
      });
    }
  }, [open, project]);

  const handleClose = () => {
    onClose();
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.put(`/projects/${project.id}`, form);
      onSaved();
      handleClose();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors ? Object.values(errors)[0][0] : "Failed to update project.",
      );
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">
                edit
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Edit Project</h3>
              <p className="text-xs text-gray-400">Update project details</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto"
        >
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
              Project Name *
            </label>
            <input
              required
              type="text"
              value={form.nama_proyek}
              onChange={(e) =>
                setForm({ ...form, nama_proyek: e.target.value })
              }
              placeholder="e.g. Cloud Migration Project"
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Client
            </label>
            <input
              type="text"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="e.g. TechCorp Inc."
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="planning">Planning</option>
                <option value="ongoing">In Progress</option>
                <option value="done">Finished</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              rows={3}
              placeholder="Project description..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
            />
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
              {submitting ? "Saving…" : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isPM = currentUser.role === "pm";
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  /* UI state */
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);
  const [showDelProject, setShowDelProject] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [delProjectLoading, setDelProjectLoading] = useState(false);
  const [activeTaskTab, setActiveTaskTab] = useState("all");
  const [showEditProject, setShowEditProject] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  /* ── Fetch all data ── */
  const fetchData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get("/users"),
      ]);
      const projData = projRes.data.data ?? projRes.data;
      setProject(projData);
      setTasks(projData.tasks || []);
      setMembers(projData.members || []);
      setAttachments(projData.attachments || []);

      setAllUsers(usersRes.data.data ?? usersRes.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  /* ── Delete project ── */
  const handleDeleteProject = async () => {
    setDelProjectLoading(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate("/projects");
    } catch {
      alert("Failed to delete project.");
    } finally {
      setDelProjectLoading(false);
      setShowDelProject(false);
    }
  };

  /* ── Task CRUD handlers ── */
  const handleEditTask = (task) => {
    setEditTaskData(task);
    setShowTaskForm(true);
  };

  const handleCreateTask = () => {
    setEditTaskData(null);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengubah status task.");
    }
  };

  /* ── Remove Member handler ── */
  const handleRemoveMember = async (memberId) => {
    if (!confirm("Remove this member from the project?")) return;
    try {
      const newMemberIds = members
        .filter((m) => m.id !== memberId)
        .map((m) => m.id);
      await api.put(`/projects/${id}`, {
        nama_proyek: project.nama_proyek,
        client: project.client,
        deskripsi: project.deskripsi,
        status: project.status,
        priority: project.priority,
        start_date: project.timeline?.start_date || project.start_date,
        end_date: project.timeline?.end_date || project.end_date,
        member_ids: newMemberIds,
      });
      fetchData();
    } catch (err) {
      alert("Failed to remove member");
    }
  };

  /* ── Upload File ── */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/projects/${id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchData(); // Refresh attachments
    } catch (err) {
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ── Delete File ── */
  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm("Delete this attachment?")) return;
    try {
      await api.delete(`/attachments/${attachmentId}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete attachment.");
    }
  };

  /* ── Derived values ── */
  const sc = statusConfig[project?.status] ?? statusConfig.planning;
  const pc = priorityConfig[project?.priority] ?? priorityConfig.medium;
  // Use progress from backend
  const pct = project?.progress ?? 0;

  // Backend nested dates in project.timeline
  const startDate = project?.timeline?.start_date || project?.start_date;
  const endDate = project?.timeline?.end_date || project?.end_date;
  const days = daysRemaining(endDate);

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);
  const filteredTasks =
    activeTaskTab === "all" ? tasks : tasksByStatus(activeTaskTab);
  const totalTasks = tasks.length;
  const doneTasks = tasksByStatus("done").length;

  // Calculate overdue tasks dynamically
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date || t.status === "done") return false;
    return new Date(t.due_date) < new Date();
  }).length;

  /* ── Loading / Error states ── */
  if (loading)
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32">
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
          <p className="text-sm text-gray-400">Loading project details…</p>
        </div>
      </DashboardLayout>
    );

  if (error || !project)
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-red-400">
              error_outline
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Project not found
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {error || "This project does not exist."}
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="mt-5 h-9 px-5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Back to Projects
          </button>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      {/* Modals */}
      <ConfirmModal
        open={showDelProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.nama_proyek}"? This action cannot be undone.`}
        onConfirm={handleDeleteProject}
        onCancel={() => setShowDelProject(false)}
        loading={delProjectLoading}
      />
      <TaskFormModal
        open={showTaskForm}
        editTask={editTaskData}
        projectId={id}
        users={allUsers}
        onClose={() => setShowTaskForm(false)}
        onSaved={fetchData}
      />
      <AddMemberModal
        open={showAddMember}
        project={project}
        users={allUsers}
        onClose={() => setShowAddMember(false)}
        onAdded={fetchData}
      />
      <EditProjectModal
        open={showEditProject}
        project={project}
        onClose={() => setShowEditProject(false)}
        onSaved={fetchData}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Breadcrumb & Header Actions ── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="flex text-sm text-gray-500 mb-2"
            >
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                  <Link to="/projects">Projects</Link>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
                <li className="text-gray-900">{project.nama_proyek}</li>
              </ol>
            </nav>
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {project.nama_proyek}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${sc.cls}`}
              >
                {sc.label}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${pc.cls} flex items-center gap-1`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  priority_high
                </span>
                {pc.label}
              </span>
            </div>
          </div>
          {isPM && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEditProject(true)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
                Edit Project
              </button>
            </div>
          )}
        </div>

        {/* ── Bento Layout Container ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Summary Card (Col Span 2) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Project Progress
                </h3>
                <p className="text-sm text-gray-500">
                  Overall completion based on task status
                </p>
              </div>
              <span className="text-2xl font-semibold text-blue-600">
                {pct}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
              <div
                className={`${sc.bar} h-3 rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-700 mb-8 leading-relaxed">
              {project.deskripsi ||
                "No description available for this project."}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  Client
                </p>
                <p className="text-sm text-gray-900 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">
                    domain
                  </span>
                  {project.client || "—"}
                </p>
              </div>
              {/* <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Budget</p>
                <p className="text-sm text-gray-900 font-medium">{project.budget || "—"}</p>
              </div> */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  Start Date
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {formatDate(startDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  Deadline
                </p>
                <p
                  className={`text-sm font-medium ${project.status !== "done" && days !== null && days < 0 ? "text-red-500" : "text-gray-900"}`}
                >
                  {formatDate(endDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Metrics */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Tasks
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {totalTasks}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  checklist
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Tasks Completed
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {doneTasks}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Overdue Tasks
                </p>
                <p className="text-xl font-semibold text-red-500">
                  {overdueTasks}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="border-b border-gray-200 mt-8">
          <nav aria-label="Tabs" className="flex space-x-8 overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "tasks", label: "Tasks" },
              { id: "team", label: "Team" },
              { id: "files", label: "Files" },
            ].map((tab) => (
              <a
                key={tab.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id);
                }}
                className={`${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 border-b-2"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2"
                } py-4 px-1 text-sm font-medium whitespace-nowrap`}
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>

        {/* ── Bottom Grid (Team, Milestones, Files) - Show only on Overview tab ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {/* Team Members */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Team</h4>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              <ul className="space-y-4">
                {members.slice(0, 2).map((member, idx) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-sm font-bold`}
                    >
                      {getInitials(member.username)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.role || "Team Member"}
                      </p>
                    </div>
                  </li>
                ))}
                {members.length > 2 && (
                  <li className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 border border-gray-200">
                      +{members.length - 2}
                    </div>
                    <p className="text-sm text-gray-500">More members</p>
                  </li>
                )}
                {members.length === 0 && (
                  <li className="text-center py-4 text-sm text-gray-400">
                    No team members yet
                  </li>
                )}
              </ul>
            </div>

            {/* Upcoming Milestones */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Milestones
                </h4>
                <button className="text-gray-500 hover:text-blue-600">
                  <span className="material-symbols-outlined text-[20px]">
                    add
                  </span>
                </button>
              </div>
              <div className="relative border-l border-gray-200 ml-2 pl-4 space-y-6">
                {project.status === "done" && (
                  <div className="relative">
                    <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-white"></div>
                    <p className="text-sm font-medium text-gray-500 line-through">
                      Project Completed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Finished {formatDate(endDate)}
                    </p>
                  </div>
                )}
                {project.status === "ongoing" && (
                  <div className="relative">
                    <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white animate-pulse"></div>
                    <p className="text-sm font-medium text-gray-900">
                      In Progress
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Due {formatDate(endDate)}
                    </p>
                  </div>
                )}
                {project.status === "planning" && (
                  <div className="relative">
                    <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 ring-4 ring-white"></div>
                    <p className="text-sm font-medium text-gray-900">
                      Planning Phase
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Starting {formatDate(startDate)}
                    </p>
                  </div>
                )}
                {/* Show task-based milestones */}
                {tasks.filter((t) => t.status === "done").length > 0 && (
                  <div className="relative">
                    <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-white"></div>
                    <p className="text-sm font-medium text-gray-500 line-through">
                      {doneTasks} Tasks Completed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Progress: {pct}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Files */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Recent Files
                </h4>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <ul className="space-y-3">
                {attachments.slice(0, 3).map((att) => {
                  const ext = att.file_name?.split(".").pop()?.toLowerCase();
                  const isPdf = ext === "pdf";
                  const isExcel = ["xlsx", "xls", "csv"].includes(ext);
                  const isWord = ["doc", "docx"].includes(ext);

                  return (
                    <li
                      key={att.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                    >
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center ${
                          isPdf
                            ? "bg-red-100 text-red-500"
                            : isExcel
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isPdf
                            ? "picture_as_pdf"
                            : isExcel
                              ? "table_chart"
                              : "description"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {att.file_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {att.file_size
                            ? `${(att.file_size / 1024).toFixed(0)} KB`
                            : ""}{" "}
                          • {formatDate(att.created_at)}
                        </p>
                      </div>
                    </li>
                  );
                })}
                {attachments.length === 0 && (
                  <li className="text-center py-4 text-sm text-gray-400">
                    No files uploaded yet
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* ── Tasks Tab ── */}
        {activeTab === "tasks" && (
          <div className="pt-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-600">
                    task_alt
                  </span>
                  Tasks
                  {totalTasks > 0 && (
                    <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                      {totalTasks}
                    </span>
                  )}
                </h3>
                {isPM && (
                  <button
                    onClick={handleCreateTask}
                    className="h-8 px-3 text-xs font-semibold bg-blue-600 text-white rounded-lg
                      hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      add
                    </span>
                    Add Task
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 overflow-x-auto">
                <button
                  onClick={() => setActiveTaskTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                    ${activeTaskTab === "all" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  All ({totalTasks})
                </button>
                {TASK_COLS.map((col) => (
                  <button
                    key={col.key}
                    onClick={() => setActiveTaskTab(col.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                      ${activeTaskTab === col.key ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    {col.label} ({tasksByStatus(col.key).length})
                  </button>
                ))}
              </div>

              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-xl text-gray-400">
                      assignment
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    No tasks yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add the first task to this project
                  </p>
                  <button
                    onClick={handleCreateTask}
                    className="mt-4 h-8 px-4 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Add Task
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                  {filteredTasks.map((task) => {
                    const col =
                      TASK_COLS.find((c) => c.key === task.status) ??
                      TASK_COLS[0];
                    const isDone = task.status === "done";
                    const dueInfo = task.due_date
                      ? daysRemaining(task.due_date)
                      : null;
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group"
                      >
                        <div
                          className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${col.color}`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm font-medium text-gray-900 leading-tight ${isDone ? "line-through text-gray-400" : ""}`}
                            >
                              {task.nama_tugas}
                            </p>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0
                              ${taskPriority[task.priority] ?? taskPriority.medium}`}
                            >
                              {task.priority || "none"}
                            </span>
                          </div>

                          {task.deskripsi && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                              {task.deskripsi}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-3 flex-wrap">
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  handleQuickStatusChange(
                                    task.id,
                                    e.target.value,
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-none cursor-pointer ${col.badge}`}
                              >
                                {TASK_COLS.map((c) => (
                                  <option key={c.key} value={c.key}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                              {task.assignee && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600">
                                    {getInitials(task.assignee.username)}
                                  </div>
                                  <span>{task.assignee.username}</span>
                                </div>
                              )}
                              {dueInfo !== null && (
                                <span
                                  className={`text-xs flex items-center gap-0.5 ${dueInfo < 0 ? "text-red-500" : dueInfo === 0 ? "text-orange-500" : "text-gray-400"}`}
                                >
                                  <span className="material-symbols-outlined text-[11px]">
                                    schedule
                                  </span>
                                  {dueInfo < 0
                                    ? `${Math.abs(dueInfo)}d overdue`
                                    : dueInfo === 0
                                      ? "Due today"
                                      : `${dueInfo}d left`}
                                </span>
                              )}
                            </div>

                            {/* Actions (Edit / Delete) */}
                            {isPM && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition"
                                  title="Edit Task"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    edit
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition"
                                  title="Delete Task"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    delete
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Team Tab ── */}
        {activeTab === "team" && (
          <div className="pt-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-blue-600">
                    group
                  </span>
                  Team Members ({members.length})
                </h3>
                {isPM && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Manage Team
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-sm text-gray-400">
                      No team members assigned yet.
                    </p>
                  </div>
                ) : (
                  members.map((member, idx) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[idx % avatarColors.length]}`}
                        >
                          {getInitials(member.username)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.role || "Team Member"}
                          </p>
                        </div>
                      </div>
                      {isPM && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            person_remove
                          </span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Files Tab ── */}
        {activeTab === "files" && (
          <div className="pt-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-blue-600">
                    folder_open
                  </span>
                  Documents ({attachments.length})
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      upload
                    </span>
                    {uploading ? "Uploading..." : "Upload File"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-3xl text-gray-400">
                        folder_open
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      No documents attached
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Upload files to share with your team
                    </p>
                  </div>
                ) : (
                  attachments.map((doc) => {
                    const ext = doc.file_name?.split(".").pop()?.toLowerCase();
                    const isPdf = ext === "pdf";
                    const isExcel = ["xlsx", "xls", "csv"].includes(ext);
                    const isImage = ["jpg", "jpeg", "png", "gif"].includes(ext);
                    const icon = isPdf
                      ? "picture_as_pdf"
                      : isImage
                        ? "image"
                        : isExcel
                          ? "table_chart"
                          : "description";
                    const iconColor = isPdf
                      ? "text-red-500"
                      : isImage
                        ? "text-blue-500"
                        : isExcel
                          ? "text-green-600"
                          : "text-blue-600";
                    const bgColor = isPdf
                      ? "bg-red-100"
                      : isImage
                        ? "bg-blue-100"
                        : isExcel
                          ? "bg-green-100"
                          : "bg-blue-100";

                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}
                          >
                            <span
                              className={`material-symbols-outlined text-[24px] ${iconColor}`}
                            >
                              {icon}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                              href={`http://127.0.0.1:8000/storage/${doc.file_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-400 hover:text-blue-600 transition p-1"
                              title="Download"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                download
                              </span>
                            </a>
                            <button
                              onClick={() => handleDeleteAttachment(doc.id)}
                              className="text-gray-400 hover:text-red-500 transition p-1"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                delete
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate mb-1">
                            {doc.file_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

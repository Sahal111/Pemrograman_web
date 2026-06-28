import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../DasboardLayout/DashboardLayout";

/* ─── Config ─── */
const COLUMNS = [
  { key: "todo",       label: "To Do",       color: "bg-gray-400",   headerBg: "bg-gray-50",   count_color: "bg-gray-100 text-gray-600" },
  { key: "inprogress", label: "In Progress", color: "bg-blue-500",   headerBg: "bg-blue-50",   count_color: "bg-blue-100 text-blue-700" },
  { key: "review",     label: "Review",      color: "bg-purple-500", headerBg: "bg-purple-50", count_color: "bg-purple-100 text-purple-700" },
  { key: "done",       label: "Done",        color: "bg-green-500",  headerBg: "bg-green-50",  count_color: "bg-green-100 text-green-700" },
];

const priorityCfg = {
  low:    { cls: "bg-gray-100 text-gray-500",    label: "Low" },
  medium: { cls: "bg-blue-50 text-blue-600",     label: "Medium" },
  high:   { cls: "bg-red-50 text-red-600",       label: "High" },
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const formatDate = (d, taskStatus, projectStatus) => {
  if (!d) return null;
  const date = new Date(d);
  if (taskStatus === "done" || projectStatus === "done") {
    return { label: date.toLocaleDateString("id-ID", { day:"numeric", month:"short" }), urgent: false };
  }
  const today = new Date(); today.setHours(0,0,0,0);
  const diff  = Math.ceil((date - today) / 86400000);
  if (diff === 0) return { label: "Today", urgent: true };
  if (diff === 1) return { label: "Tomorrow", urgent: false };
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, urgent: true };
  return { label: date.toLocaleDateString("id-ID", { day:"numeric", month:"short" }), urgent: false };
};

/* ══════════════════════════════════════════════════════════ */
export default function TaskList() {
  const navigate = useNavigate();

  /* ── State ── */
  const [allTasks,    setAllTasks]    = useState([]);
  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterProject, setFilterProject] = useState("all");

  /* Modal: Add Task */
  const [showModal,   setShowModal]   = useState(false);
  const [modalCol,    setModalCol]    = useState("todo");
  const [submitting,  setSubmitting]  = useState(false);
  const [formError,   setFormError]   = useState("");
  const [taskForm, setTaskForm] = useState({
    project_id: "", nama_tugas: "", deskripsi: "",
    assigned_to: "", priority: "medium", due_date: "",
  });

  /* Modal: Edit Task */
  const [editTask,    setEditTask]    = useState(null);
  const [editForm,    setEditForm]    = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  /* ── Fetch ── */
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      const projectList = res.data?.data || res.data || [];
      setProjects(projectList);

      // Gather all tasks from all projects
      const allT = projectList.flatMap((p) =>
        (p.tasks || []).map((t) => ({ ...t, project_name: p.nama_proyek, project_id: p.id, project_status: p.status }))
      );
      setAllTasks(allT);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  /* ── Status change (drag-free quick-move) ── */
  const handleStatusChange = async (taskId, newStatus) => {
    setAllTasks((prev) =>
      prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t)
    );
    try { await api.put(`/tasks/${taskId}`, { status: newStatus }); }
    catch { fetchAll(); }
  };

  /* ── Create task ── */
  const selectedProject = projects.find((p) => p.id === parseInt(taskForm.project_id));

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(""); setSubmitting(true);
    try {
      const payload = { ...taskForm, status: modalCol };
      if (!payload.assigned_to) delete payload.assigned_to;
      await api.post(`/projects/${payload.project_id}/tasks`, payload);
      setShowModal(false);
      setTaskForm({ project_id:"", nama_tugas:"", deskripsi:"", assigned_to:"", priority:"medium", due_date:"" });
      fetchAll();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setFormError(errors ? Object.values(errors)[0][0] : "Gagal membuat task.");
    } finally { setSubmitting(false); }
  };

  /* ── Edit task ── */
  const openEdit = (task) => {
    setEditTask(task);
    setEditForm({
      nama_tugas:  task.nama_tugas,
      deskripsi:   task.deskripsi || "",
      assigned_to: task.assignee?.id || "",
      status:      task.status,
      priority:    task.priority,
      due_date:    task.due_date?.split("T")[0] || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      const payload = { ...editForm };
      if (!payload.assigned_to) payload.assigned_to = null;
      await api.put(`/tasks/${editTask.id}`, payload);
      setEditTask(null);
      fetchAll();
    } catch { alert("Gagal mengubah task."); }
    finally { setEditSubmitting(false); }
  };

  /* ── Delete task ── */
  const handleDelete = async (taskId, taskName) => {
    if (!confirm(`Hapus tugas "${taskName}"?`)) return;
    try { await api.delete(`/tasks/${taskId}`); fetchAll(); }
    catch { alert("Gagal menghapus task."); }
  };

  /* ── Filtered tasks ── */
  const visible = allTasks.filter((t) => {
    const matchSearch  = t.nama_tugas?.toLowerCase().includes(search.toLowerCase());
    const matchProject = filterProject === "all" || String(t.project_id) === filterProject;
    return matchSearch && matchProject;
  });

  const byStatus = (col) => visible.filter((t) => t.status === col);

  /* ════════════════ JSX ════════════════ */
  return (
    <DashboardLayout
      title="Kanban Board"
      showSearch={true}
      searchValue={search}
      onSearch={setSearch}
      headerRight={
        <div className="flex items-center gap-3">
          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}
            className="hidden md:block h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.nama_proyek}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="hidden lg:flex h-9 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg items-center gap-1.5 hover:bg-blue-700 active:scale-95 transition-all ml-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Create Task
          </button>
        </div>
      }
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Board Header ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">
              <span className="material-symbols-outlined text-[16px]">group</span>
              Assignee
            </button>
            {/* Mobile create button */}
            <button
              onClick={() => setShowModal(true)}
              className="lg:hidden flex items-center gap-1.5 h-8 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Task
            </button>
          </div>
          <div className="flex gap-1 bg-gray-100 border border-gray-200 rounded-lg p-1">
            <button className="px-3 py-1 bg-white shadow-sm rounded-md text-sm font-semibold text-gray-800">Board</button>
            <Link to="/projects" className="px-3 py-1 rounded-md text-sm font-medium text-gray-500 hover:text-gray-800 transition">List</Link>
          </div>
        </div>

        {/* ════ KANBAN BOARD ════ */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 lg:px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm gap-2">
              <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Memuat tugas…
            </div>
          ) : (
            <div className="flex gap-5 h-full items-start min-w-max pb-4">
              {COLUMNS.map((col) => {
                const tasks = byStatus(col.key);
                return (
                  <div key={col.key}
                    className="flex flex-col w-[300px] bg-gray-100/60 rounded-xl flex-shrink-0 max-h-full">

                    {/* Column Header */}
                    <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${col.headerBg}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                        <h3 className="text-sm font-bold text-gray-800">{col.label}</h3>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.count_color}`}>
                          {tasks.length}
                        </span>
                      </div>
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white/70 transition">
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-[120px]
                      [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">

                      {tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                            <span className="material-symbols-outlined text-gray-300 text-[20px]">inbox</span>
                          </div>
                          <p className="text-xs text-gray-400">No tasks here</p>
                        </div>
                      )}

                      {tasks.map((task) => {
                        const due = formatDate(task.due_date, task.status, task.project_status);
                        const prCfg = priorityCfg[task.priority] || priorityCfg.medium;

                        return (
                          <div key={task.id}
                            className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm
                              hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer group"
                          >
                            {/* Priority + Edit */}
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${prCfg.cls}`}>
                                {prCfg.label}
                              </span>
                              <button
                                onClick={() => openEdit(task)}
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              >
                                <span className="material-symbols-outlined text-[15px]">edit</span>
                              </button>
                            </div>

                            {/* Title */}
                            <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-2.5">
                              {task.nama_tugas}
                            </h4>

                            {/* Project badge */}
                            <div className="mb-3">
                              <Link to={`/projects/${task.project_id}`}
                                className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {task.project_name}
                              </Link>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                {/* Due date */}
                                {due && (
                                  <span className={`flex items-center gap-1 text-[11px] font-medium
                                    ${due.urgent ? "text-red-500" : "text-gray-400"}`}>
                                    <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                    {due.label}
                                  </span>
                                )}
                                {!due && (
                                  <span className="text-[11px] text-gray-300">No date</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Quick status move buttons */}
                                {col.key !== "todo" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const idx = COLUMNS.findIndex(c => c.key === col.key);
                                      handleStatusChange(task.id, COLUMNS[idx - 1].key);
                                    }}
                                    className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition"
                                    title="Move left"
                                  >
                                    <span className="material-symbols-outlined text-[13px]">chevron_left</span>
                                  </button>
                                )}
                                {col.key !== "done" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const idx = COLUMNS.findIndex(c => c.key === col.key);
                                      handleStatusChange(task.id, COLUMNS[idx + 1].key);
                                    }}
                                    className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition"
                                    title="Move right"
                                  >
                                    <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                                  </button>
                                )}

                                {/* Assignee avatar */}
                                {task.assignee ? (
                                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold border-2 border-white shadow-sm"
                                    title={task.assignee.username}>
                                    {getInitials(task.assignee.username || task.assignee.name)}
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                                    <span className="material-symbols-outlined text-gray-400 text-[13px]">person</span>
                                  </div>
                                )}

                                {/* Delete */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(task.id, task.nama_tugas); }}
                                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                                  title="Hapus"
                                >
                                  <span className="material-symbols-outlined text-[13px]">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Task button */}
                    <div className="px-3 pb-3 pt-1">
                      <button
                        onClick={() => { setModalCol(col.key); setShowModal(true); }}
                        className="w-full h-9 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-400
                          hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Add Task
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ════ MODAL: Create Task ════ */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[18px]">add_task</span>
                </div>
                <h3 className="text-base font-bold text-gray-900">Tambah Tugas Baru</h3>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Project */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Project <span className="text-red-500">*</span>
                </label>
                <select name="project_id" value={taskForm.project_id}
                  onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value, assigned_to: "" })}
                  required
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white appearance-none">
                  <option value="">Pilih project…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama_proyek}</option>
                  ))}
                </select>
              </div>

              {/* Task name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Nama Tugas <span className="text-red-500">*</span>
                </label>
                <input type="text" name="nama_tugas" value={taskForm.nama_tugas}
                  onChange={(e) => setTaskForm({ ...taskForm, nama_tugas: e.target.value })}
                  required placeholder="Deskripsi singkat tugas…"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Deskripsi</label>
                <textarea name="deskripsi" value={taskForm.deskripsi}
                  onChange={(e) => setTaskForm({ ...taskForm, deskripsi: e.target.value })}
                  rows={2} placeholder="Detail tambahan (opsional)…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Assignee */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Assignee</label>
                  <select name="assigned_to" value={taskForm.assigned_to}
                    onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white appearance-none">
                    <option value="">Belum ditugaskan</option>
                    {(selectedProject?.members || []).map((m) => (
                      <option key={m.id} value={m.id}>{m.username}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Priority</label>
                  <select name="priority" value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white appearance-none">
                      <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Status column */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Kolom</label>
                  <select value={modalCol} onChange={(e) => setModalCol(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white appearance-none">
                    {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>

                {/* Due date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Due Date</label>
                  <input type="date" value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-10 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition">
                  Batal
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 h-10 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-2">
                  {submitting ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>Menyimpan…</>
                  ) : "Buat Tugas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ MODAL: Edit Task ════ */}
      {editTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditTask(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </div>
                <h3 className="text-base font-bold text-gray-900">Edit Tugas</h3>
              </div>
              <button onClick={() => setEditTask(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Nama Tugas</label>
                <input type="text" value={editForm.nama_tugas}
                  onChange={(e) => setEditForm({ ...editForm, nama_tugas: e.target.value })}
                  required
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Deskripsi</label>
                <textarea value={editForm.deskripsi}
                  onChange={(e) => setEditForm({ ...editForm, deskripsi: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Status</label>
                  <select value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
                    {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Priority</label>
                  <select value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Assignee</label>
                  <select value={editForm.assigned_to}
                    onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
                    <option value="">Belum ditugaskan</option>
                    {(projects.find(p => p.id === editTask.project_id)?.members || []).map((m) => (
                      <option key={m.id} value={m.id}>{m.username}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Due Date</label>
                  <input type="date" value={editForm.due_date}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditTask(null)}
                  className="flex-1 h-10 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition">
                  Batal
                </button>
                <button type="submit" disabled={editSubmitting}
                  className="flex-1 h-10 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-2">
                  {editSubmitting ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>Menyimpan…</>
                  ) : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

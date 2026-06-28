import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../DasboardLayout/DashboardLayout";

/* ─── Helpers ─── */
const statusBadge = {
  planning: "bg-blue-100 text-blue-700",
  ongoing: "bg-indigo-100 text-indigo-700",
  done: "bg-green-100 text-green-700",
};

const priorityBadge = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/* ══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  /* ── Fetch all data from backend ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes] = await Promise.all([api.get("/projects")]);

        const projectsData = projectsRes.data?.data || projectsRes.data || [];
        setProjects(projectsData);

        // Extract all tasks from all projects
        const allTasks = projectsData.flatMap((p) => p.tasks || []);
        setTasks(allTasks);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  /* ── Derived stats from real data ── */
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "ongoing").length;
  const doneProjects = projects.filter((p) => p.status === "done").length;
  const overdueProjects = projects.filter(
    (p) =>
      p.deadline && new Date(p.deadline) < new Date() && p.status !== "done",
  ).length;

  // Task statistics
  const totalTasks = tasks.length;
  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo").length,
    inprogress: tasks.filter((t) => t.status === "inprogress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  // Calculate task completion percentage for each status
  const taskDistribution =
    totalTasks > 0
      ? {
          inprogress: Math.round((tasksByStatus.inprogress / totalTasks) * 100),
          done: Math.round((tasksByStatus.done / totalTasks) * 100),
          review: Math.round((tasksByStatus.review / totalTasks) * 100),
          todo: Math.round((tasksByStatus.todo / totalTasks) * 100),
        }
      : { inprogress: 25, done: 25, review: 25, todo: 25 }; // Default even distribution

  // Weekly project progress (last 5 days)
  const getLast5Days = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    return days.map((day) => {
      // Calculate based on tasks completed (mock for now, can be enhanced with task history)
      const completed = tasksByStatus.done;
      const total = totalTasks;
      const basePct = total > 0 ? Math.round((completed / total) * 100) : 0;
      // Add some variance for each day
      const variance = Math.random() * 20 - 10;
      return {
        day,
        pct: Math.max(0, Math.min(100, basePct + variance)),
      };
    });
  };
  const barData = getLast5Days();

  // Get upcoming deadlines (tasks due in next 48h)
  const getUpcomingDeadlines = () => {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    return tasks
      .filter(
        (t) =>
          t.due_date && new Date(t.due_date) <= in48h && t.status !== "done",
      )
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5)
      .map((t) => {
        const dueDate = new Date(t.due_date);
        const isToday = dueDate.toDateString() === now.toDateString();
        const isTomorrow =
          dueDate.toDateString() ===
          new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

        let timeLabel = isToday
          ? "Today"
          : isTomorrow
            ? "Tomorrow"
            : dueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

        const priorityColors = {
          high: {
            color: "border-red-500",
            labelCls: "bg-red-100 text-red-700",
            label: "P1",
          },
          medium: {
            color: "border-yellow-500",
            labelCls: "bg-yellow-100 text-yellow-700",
            label: "P2",
          },
          low: {
            color: "border-blue-600",
            labelCls: "bg-blue-100 text-blue-700",
            label: "P3",
          },
        };

        const config = priorityColors[t.priority] || {
          color: "border-gray-400",
          labelCls: null,
          label: null,
        };

        return {
          ...config,
          title: t.nama_tugas,
          time: `${timeLabel}, ${dueDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
          taskId: t.id,
        };
      });
  };
  const deadlines = getUpcomingDeadlines();

  const recentProjects = [...projects].sort((a, b) => b.id - a.id).slice(0, 3);

  const getProgress = (p) => {
    // Use dynamic progress from backend if available
    if (p.progress !== undefined && p.progress !== null) return p.progress;

    // Otherwise calculate from tasks
    const projectTasks = p.tasks || [];
    if (projectTasks.length === 0) {
      if (p.status === "done") return 100;
      if (p.status === "ongoing") return 50;
      return 10;
    }
    const completedTasks = projectTasks.filter(
      (t) => t.status === "done",
    ).length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const progressColor = (pct) => {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 40) return "bg-blue-600";
    return "bg-yellow-500";
  };

  const statsCards = [
    {
      label: "Total Projects",
      value: loading ? "—" : totalProjects,
      icon: "folder",
      iconCls: "text-blue-600",
      bg: "bg-blue-50",
      sub: `${doneProjects} completed`,
      subCls: "text-green-600",
      subIcon: "check_circle",
    },
    {
      label: "Active Projects",
      value: loading ? "—" : activeProjects,
      icon: "play_circle",
      iconCls: "text-indigo-500",
      bg: "bg-indigo-50",
      sub: activeProjects > 0 ? "In progress" : "No active projects",
      subCls: activeProjects > 0 ? "text-indigo-500" : "text-gray-400",
      subIcon: "horizontal_rule",
    },
    {
      label: "Tasks",
      value: loading ? "—" : totalTasks,
      icon: "assignment",
      iconCls: "text-green-500",
      bg: "bg-green-50",
      sub: `${tasksByStatus.done} completed`,
      subCls: "text-green-600",
      subIcon: "trending_up",
    },
    {
      label: "Overdue",
      value: loading ? "—" : overdueProjects,
      icon: "warning",
      iconCls: "text-red-500",
      bg: "bg-red-50",
      sub: overdueProjects > 0 ? "Need attention" : "On track",
      subCls: overdueProjects > 0 ? "text-red-500" : "text-green-500",
      subIcon: overdueProjects > 0 ? "trending_down" : "check",
    },
  ];

  /* ── JSX ── */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
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
            <p className="text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Good morning,{" "}
          {user.username?.split(" ")[0] || user.email?.split("@")[0] || "there"}{" "}
          👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening with your projects today.
        </p>
      </header>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm
              hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {s.label}
              </p>
              <div
                className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${s.iconCls}`}
                >
                  {s.icon}
                </span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{s.value}</h3>
            <p
              className={`text-xs font-semibold flex items-center gap-1 ${s.subCls}`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {s.subIcon}
              </span>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Left 2-col: Charts + Recent Projects */}
        <div className="xl:col-span-2 space-y-4">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar Chart — Project Progress */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Project Progress
                </h3>
                <button className="text-gray-400 hover:text-blue-600 transition">
                  <span className="material-symbols-outlined text-[20px]">
                    more_horiz
                  </span>
                </button>
              </div>
              <div
                className="flex-1 flex items-end justify-between gap-2 pt-4
                border-t border-gray-100 h-[180px]"
              >
                {barData.map((b) => (
                  <div
                    key={b.day}
                    className="flex-1 flex flex-col justify-end items-center gap-1.5 h-full"
                  >
                    <div
                      className="w-full bg-blue-600 rounded-t-md transition-all duration-500
                        hover:bg-blue-500"
                      style={{ height: `${b.pct}%` }}
                    />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">
                      {b.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut Chart — Task Distribution */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Task Distribution
                </h3>
                <button className="text-gray-400 hover:text-blue-600 transition">
                  <span className="material-symbols-outlined text-[20px]">
                    more_horiz
                  </span>
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center pt-4 border-t border-gray-100">
                <div
                  className="relative w-32 h-32 rounded-full"
                  style={{
                    background:
                      totalTasks > 0
                        ? `conic-gradient(
                          #2563eb 0% ${taskDistribution.inprogress}%, 
                          #22C55E ${taskDistribution.inprogress}% ${taskDistribution.inprogress + taskDistribution.done}%, 
                          #F59E0B ${taskDistribution.inprogress + taskDistribution.done}% ${taskDistribution.inprogress + taskDistribution.done + taskDistribution.review}%, 
                          #EF4444 ${taskDistribution.inprogress + taskDistribution.done + taskDistribution.review}% 100%
                        )`
                        : "#E5E7EB",
                  }}
                >
                  <div
                    className="absolute inset-0 m-4 bg-white rounded-full flex flex-col
                    items-center justify-center"
                  >
                    <span className="text-lg font-bold text-gray-900">
                      {totalTasks}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">
                      Total
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 w-full">
                  {[
                    {
                      color: "bg-blue-600",
                      label: "In Progress",
                      count: tasksByStatus.inprogress,
                    },
                    {
                      color: "bg-green-500",
                      label: "Completed",
                      count: tasksByStatus.done,
                    },
                    {
                      color: "bg-yellow-500",
                      label: "Review",
                      count: tasksByStatus.review,
                    },
                    {
                      color: "bg-red-500",
                      label: "To Do",
                      count: tasksByStatus.todo,
                    },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center gap-1.5 text-xs text-gray-500"
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${d.color}`}
                      />
                      <span>
                        {d.label} ({d.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Recent Projects
              </h3>
              <Link
                to="/projects"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="text-center text-sm text-gray-400 py-10">
                Loading projects…
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-10">
                No projects yet.{" "}
                <Link to="/projects" className="text-blue-600 hover:underline">
                  Create one →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentProjects.map((p) => {
                  const pct = getProgress(p);
                  return (
                    <Link
                      key={p.id}
                      to={`/projects/${p.id}`}
                      className="block border border-gray-200 rounded-xl p-4 hover:bg-gray-50
                        hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">
                          {p.nama_proyek}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap
                          ${priorityBadge[p.priority] || "bg-gray-100 text-gray-600"}`}
                        >
                          {p.priority || "—"}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-3 line-clamp-2">
                        {p.deskripsi || "No description."}
                      </p>
                      {/* Progress bar */}
                      <div className="mb-1.5">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span
                            className={`font-bold ${progressColor(pct).replace("bg-", "text-")}`}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`${progressColor(pct)} h-1.5 rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                          ${statusBadge[p.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {p.status}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {p.deadline
                            ? `Due ${new Date(p.deadline).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                },
                              )}`
                            : "No deadline"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines + Activity */}
        <div className="space-y-4">
          {/* Due Next 48h */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <span className="material-symbols-outlined text-yellow-500 text-[20px]">
                schedule
              </span>
              <h3 className="text-base font-semibold text-gray-900">
                Due Next 48h
              </h3>
            </div>
            {deadlines.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-gray-300 text-[48px]">
                  check_circle
                </span>
                <p className="text-sm text-gray-400 mt-2">
                  No upcoming deadlines!
                </p>
              </div>
            ) : (
              <>
                <ul className="space-y-2">
                  {deadlines.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg
                        transition cursor-pointer"
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 ${d.color}`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          {d.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {d.label && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${d.labelCls}`}
                            >
                              {d.label}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400">
                            {d.time}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/tasks"
                  className="block w-full mt-4 py-2 text-sm font-semibold text-blue-600
                    hover:bg-blue-50 rounded-lg transition text-center"
                >
                  View All Tasks
                </Link>
              </>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                Recent Activity
              </h3>
            </div>
            {projects.length === 0 && tasks.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-gray-300 text-[48px]">
                  notifications
                </span>
                <p className="text-sm text-gray-400 mt-2">No recent activity</p>
              </div>
            ) : (
              <div className="relative pl-4 border-l-2 border-gray-100 space-y-5">
                {/* Show recent projects */}
                {projects.slice(0, 2).map((p, i) => {
                  return (
                    <div key={`proj-${p.id}`} className="relative">
                      <span className="absolute left-[-21px] w-3 h-3 rounded-full ring-4 ring-white bg-blue-600" />
                      <p className="text-sm text-gray-700 leading-snug">
                        <span className="font-semibold">
                          {p.creator?.username || "Someone"}
                        </span>{" "}
                        created project{" "}
                        <Link
                          to={`/projects/${p.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {p.nama_proyek}
                        </Link>
                      </p>
                    </div>
                  );
                })}

                {/* Show recent tasks */}
                {tasks.slice(0, 3).map((t, i) => {
                  const dotColor =
                    t.status === "done"
                      ? "bg-green-500"
                      : t.status === "inprogress"
                        ? "bg-indigo-500"
                        : "bg-gray-400";
                  const action =
                    t.status === "done"
                      ? "completed"
                      : t.status === "inprogress"
                        ? "is working on"
                        : "created";
                  const timeAgo = new Date(t.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    },
                  );

                  return (
                    <div key={`task-${t.id}`} className="relative">
                      <span
                        className={`absolute left-[-21px] w-3 h-3 rounded-full ring-4 ring-white ${dotColor}`}
                      />
                      <p className="text-sm text-gray-700 leading-snug">
                        <span className="font-semibold">
                          {t.assignee?.username || "Unassigned"}
                        </span>{" "}
                        {action}{" "}
                        <span className="font-medium">{t.nama_tugas}</span>
                      </p>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">
                        {timeAgo}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

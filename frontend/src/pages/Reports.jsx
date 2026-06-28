import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../DasboardLayout/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
];

// const topPerformers = users
//   .map((user) => {
//     const userTasks = tasks.filter((t) => t.assignee?.id === user.id);
//     const completedCount = userTasks.filter((t) => t.status === "done").length;
//     return { ...user, completedCount };
//   })
//   .filter((u) => u.completedCount > 0)
//   .sort((a, b) => b.completedCount - a.completedCount)
//   .slice(0, 3);

export default function Reports() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, usersRes] = await Promise.all([
        api.get("/projects"),
        api.get("/users"),
      ]);

      const projectsData = projectsRes.data?.data || projectsRes.data || [];
      setProjects(projectsData);

      // Extract all tasks
      const allTasks = projectsData.flatMap((p) => p.tasks || []);
      setTasks(allTasks);

      setUsers(usersRes.data?.data || usersRes.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };
  const handleExport = () => {
    const rows = [];

    // Summary section
    rows.push(["TaskFlow Report Summary"]);
    rows.push([`Generated: ${new Date().toLocaleString("en-US")}`]);
    rows.push([`Period: Last ${dateRange} Days`]);
    rows.push([]);
    rows.push(["Metric", "Value"]);
    rows.push(["Team Velocity", `${teamVelocity} pts`]);
    rows.push(["On-time Delivery", `${onTimeDelivery}%`]);
    rows.push(["Task Churn", taskChurn]);
    rows.push(["Total Tasks", totalTasks]);
    rows.push(["Completed Tasks", completedTasks]);
    rows.push([]);

    // Top performers section
    rows.push(["Top Performers"]);
    rows.push(["Username", "Role", "Tasks Completed"]);
    topPerformers.forEach((u) => {
      rows.push([u.username, u.role, u.completedCount]);
    });
    rows.push([]);

    // Project risk section
    rows.push(["Project Risk Analysis"]);
    rows.push(["Project Name", "Risk Level", "Key Factor", "Overdue Rate (%)"]);
    projectRisks.forEach((r) => {
      rows.push([r.name, r.riskLevel, r.keyFactor, r.overdueRate.toFixed(1)]);
    });

    // Convert to CSV string
    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            // Escape commas/quotes by wrapping in quotes if needed
            if (value.includes(",") || value.includes('"')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(","),
      )
      .join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `taskflow-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate KPIs
  // Filter tasks based on selected date range
  const filteredTasks = (() => {
    const days = parseInt(dateRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return tasks.filter((t) => {
      // Gunakan due_date kalau ada, kalau tidak gunakan created_at
      const refDate = t.due_date || t.created_at;
      if (!refDate) return true; // task tanpa tanggal tetap dihitung
      return new Date(refDate) >= cutoff;
    });
  })();

  // Calculate KPIs
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (t) => t.status === "done",
  ).length;
  const onTimeProjects = projects.filter(
    (p) =>
      p.deadline && new Date(p.deadline) >= new Date() && p.status === "done",
  ).length;
  const activeProjects = projects.filter((p) => p.status === "ongoing").length;

  const teamVelocity =
    completedTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const onTimeDelivery =
    projects.length > 0
      ? Math.round((onTimeProjects / projects.length) * 100)
      : 0;
  const taskChurn = filteredTasks.filter((t) => t.status === "review").length;

  // Top performers (users with most completed tasks)
  const topPerformers = users
    .map((user) => {
      const userTasks = filteredTasks.filter((t) => t.assignee?.id === user.id);
      const completedCount = userTasks.filter(
        (t) => t.status === "done",
      ).length;
      return { ...user, completedCount };
    })
    .filter((u) => u.completedCount > 0)
    .sort((a, b) => b.completedCount - a.completedCount)
    .slice(0, 3);

  // Project risk analysis
  const projectRisks = projects.map((p) => {
    const projectTasks = p.tasks || [];
    const overdueTasks = projectTasks.filter(
      (t) =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== "done",
    ).length;
    const totalProjectTasks = projectTasks.length;
    const overdueRate =
      totalProjectTasks > 0 ? (overdueTasks / totalProjectTasks) * 100 : 0;

    let riskLevel = "Low";
    let riskColor = "bg-green-100 text-green-700";
    let keyFactor = "On Track";

    if (overdueRate > 30) {
      riskLevel = "High";
      riskColor = "bg-red-100 text-red-700";
      keyFactor = "Resource Bottleneck";
    } else if (overdueRate > 10) {
      riskLevel = "Medium";
      riskColor = "bg-yellow-100 text-yellow-700";
      keyFactor = "Scope Creep";
    }

    return {
      name: p.nama_proyek,
      riskLevel,
      riskColor,
      keyFactor,
      overdueRate,
    };
  });
  // Data untuk Project Health chart
  const projectHealthData = projects.map((p) => ({
    name:
      p.nama_proyek.length > 15
        ? p.nama_proyek.slice(0, 15) + "…"
        : p.nama_proyek,
    progress: p.progress ?? 0,
  }));

  // Data untuk Resource Allocation chart
  const resourceAllocationData = users
    .map((user) => {
      const userTasks = filteredTasks.filter((t) => t.assignee?.id === user.id);
      return {
        name: user.username,
        todo: userTasks.filter((t) => t.status === "todo").length,
        inprogress: userTasks.filter((t) => t.status === "inprogress").length,
        review: userTasks.filter((t) => t.status === "review").length,
        done: userTasks.filter((t) => t.status === "done").length,
      };
    })
    .filter((u) => u.todo + u.inprogress + u.review + u.done > 0);

  return (
    <DashboardLayout>
      <div className="max-w-[1280px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Reports
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Analytics and performance overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 pl-10 pr-8 h-9 rounded-lg text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                calendar_today
              </span>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white border border-gray-300 px-4 h-9 rounded-lg text-sm font-medium hover:border-blue-600 hover:ring-2 hover:ring-blue-100 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3"
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
              <p className="text-sm text-gray-500">Loading reports...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Team Velocity */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Team Velocity
                  </span>
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">
                    speed
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {teamVelocity} pts
                  </span>
                  {/* <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mb-1 flex items-center">
                    <span className="material-symbols-outlined text-[12px]">
                      trending_up
                    </span>{" "}
                    12%
                  </span> */}
                </div>
              </div>

              {/* On-time Delivery */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    On-time Delivery
                  </span>
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">
                    check_circle
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {onTimeDelivery}%
                  </span>
                  {/* <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mb-1 flex items-center">
                    <span className="material-symbols-outlined text-[12px]">
                      trending_up
                    </span>{" "}
                    2%
                  </span> */}
                </div>
              </div>

              {/* Budget Burn */}
              {/* <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Budget Burn
                  </span>
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">
                    account_balance_wallet
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    $12.4k
                  </span>
                  <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full mb-1 flex items-center">
                    <span className="material-symbols-outlined text-[12px]">
                      trending_flat
                    </span>{" "}
                    0%
                  </span>
                </div>
              </div> */}

              {/* Task Churn */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Task Churn
                  </span>
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">
                    autorenew
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {taskChurn}
                  </span>
                  {/* <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mb-1 flex items-center">
                    <span className="material-symbols-outlined text-[12px]">
                      trending_up
                    </span>{" "}
                    4%
                  </span> */}
                </div>
              </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Project Health Radar */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-1 flex flex-col h-[320px]">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Project Health
                </h3>
                <div className="flex-1 w-full h-full">
                  {projectHealthData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      No project data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={projectHealthData}
                        layout="vertical"
                        margin={{ left: 10, right: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={90}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                          {projectHealthData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={
                                entry.progress >= 70
                                  ? "#22c55e"
                                  : entry.progress >= 40
                                    ? "#2563eb"
                                    : "#f59e0b"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Resource Allocation Stacked Bar */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-2 flex flex-col h-[320px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Resource Allocation
                  </h3>
                  <button className="text-xs font-medium text-gray-500 hover:text-blue-600">
                    View Details
                  </button>
                </div>
                <div className="flex-1 w-full h-full">
                  {resourceAllocationData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      No task assignment data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={resourceAllocationData}
                        margin={{ left: 0, right: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar
                          dataKey="todo"
                          stackId="a"
                          fill="#9ca3af"
                          name="To Do"
                        />
                        <Bar
                          dataKey="inprogress"
                          stackId="a"
                          fill="#2563eb"
                          name="In Progress"
                        />
                        <Bar
                          dataKey="review"
                          stackId="a"
                          fill="#f59e0b"
                          name="Review"
                        />
                        <Bar
                          dataKey="done"
                          stackId="a"
                          fill="#22c55e"
                          name="Done"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Task Completion Trend */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 h-[360px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Task Completion Trend
                </h3>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>{" "}
                    Completed
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>{" "}
                    Added
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 px-8">
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-bold text-blue-600">
                      {totalTasks > 0
                        ? Math.round((completedTasks / totalTasks) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-700"
                      style={{
                        width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {completedTasks} of {totalTasks} tasks completed across all
                  projects
                </p>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Top Performers */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Performers
                </h3>
                {topPerformers.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-gray-300 text-[48px]">
                      emoji_events
                    </span>
                    <p className="text-sm text-gray-400 mt-2">
                      No data available
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {topPerformers.map((user, idx) => (
                      <li
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[idx % avatarColors.length]}`}
                          >
                            {getInitials(user.username)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.role || "Team Member"}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {user.completedCount} tasks
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Project Risk Analysis Table */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-2 overflow-x-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Project Risk Analysis
                </h3>
                {projectRisks.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-gray-300 text-[48px]">
                      analytics
                    </span>
                    <p className="text-sm text-gray-400 mt-2">
                      No projects to analyze
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600">
                          <th className="pb-3 font-semibold">Project Name</th>
                          <th className="pb-3 font-semibold">Risk Level</th>
                          <th className="pb-3 font-semibold">Key Factor</th>
                          <th className="pb-3 font-semibold text-right">
                            Trend
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {projectRisks.slice(0, 5).map((risk, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 font-medium text-gray-900">
                              {risk.name}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-1 ${risk.riskColor} rounded-full text-[10px] font-bold`}
                              >
                                {risk.riskLevel}
                              </span>
                            </td>
                            <td className="py-3 text-gray-600">
                              {risk.keyFactor}
                            </td>
                            <td className="py-3 text-right">
                              <span
                                className={`material-symbols-outlined text-[16px] ${
                                  risk.riskLevel === "High"
                                    ? "text-red-500"
                                    : risk.riskLevel === "Medium"
                                      ? "text-yellow-500"
                                      : "text-green-500"
                                }`}
                              >
                                {risk.riskLevel === "High"
                                  ? "trending_up"
                                  : risk.riskLevel === "Medium"
                                    ? "trending_flat"
                                    : "trending_down"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

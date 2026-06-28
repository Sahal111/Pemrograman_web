import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../DasboardLayout/DashboardLayout";

/* ─── Helper Functions ─── */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const isToday = (year, month, day) => {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
};

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

const getTaskColor = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-600 hover:bg-red-100";
    case "medium":
      return "bg-blue-50 text-blue-600 hover:bg-blue-100";
    case "low":
      return "bg-green-50 text-green-600 hover:bg-green-100";
    default:
      return "bg-gray-50 text-gray-600 hover:bg-gray-100";
  }
};

const getTaskDotColor = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-blue-600";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week, day
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const today = new Date();

  /* ── Fetch Tasks ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      const projectList = res.data?.data || res.data || [];
      setProjects(projectList);

      // Gather all tasks with due dates that are not done
      const allTasks = projectList.flatMap((p) =>
        (p.tasks || [])
          .filter((t) => t.due_date && t.status !== "done" && p.status !== "done")
          .map((t) => ({
            ...t,
            project_name: p.nama_proyek,
            project_id: p.id,
          }))
      );
      setTasks(allTasks);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ── Navigation ── */
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  /* ── Get tasks for a specific date ── */
  const getTasksForDate = (year, month, day) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.due_date);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month && taskDate.getDate() === day;
    });
  };

  /* ── Get upcoming tasks (within 7 days) ── */
  const getUpcomingTasks = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return tasks
      .filter((task) => {
        const taskDate = new Date(task.due_date);
        return taskDate >= now && taskDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);
  };

  /* ── Generate calendar days ── */
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        month: currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        month: currentMonth,
        year: currentYear,
      });
    }

    // Next month days to fill the grid
    const remainingDays = 35 - days.length; // 5 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        month: currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const upcomingTasks = getUpcomingTasks();

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Calendar Section (3 columns) */}
          <div className="xl:col-span-3 flex flex-col">
            {/* Calendar Header Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={goToPrevMonth}
                    aria-label="Previous month"
                    className="p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={goToNextMonth}
                    aria-label="Next month"
                    className="p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setView("month")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === "month"
                      ? "bg-gray-100 text-gray-900 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView("week")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === "week"
                      ? "bg-gray-100 text-gray-900 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setView("day")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === "day"
                      ? "bg-gray-100 text-gray-900 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Day
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-96 bg-white border border-gray-200 rounded-xl">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <p className="text-sm text-gray-500">Loading calendar...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                  {DAYS.map((day, index) => (
                    <div
                      key={index}
                      className={`py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                        index > 0 ? "border-l border-gray-200" : ""
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-gray-100 gap-[1px]">
                  {calendarDays.map((dayObj, index) => {
                    const dayTasks = getTasksForDate(dayObj.year, dayObj.month, dayObj.day);
                    const isTodayDate = isToday(dayObj.year, dayObj.month, dayObj.day);
                    const hasImportantTask = dayTasks.some((t) => t.priority === "high");

                    return (
                      <div
                        key={index}
                        className={`bg-white p-2 hover:bg-gray-50 transition-colors group min-h-[100px] cursor-pointer ${
                          !dayObj.isCurrentMonth ? "opacity-40" : ""
                        }`}
                        onClick={() => setSelectedDate(new Date(dayObj.year, dayObj.month, dayObj.day))}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`text-sm font-medium ${
                              dayObj.isCurrentMonth ? "text-gray-900" : "text-gray-400"
                            } ${isTodayDate ? "flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white" : ""} ${
                              hasImportantTask && !isTodayDate ? "text-red-500" : ""
                            }`}
                          >
                            {dayObj.day}
                          </span>
                          {hasImportantTask && !isTodayDate && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map((task) => (
                            <Link
                              key={task.id}
                              to={`/projects/${task.project_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className={`block px-2 py-1 rounded text-xs font-medium truncate transition-colors ${getTaskColor(
                                task.priority
                              )}`}
                              title={task.nama_tugas}
                            >
                              {task.nama_tugas}
                            </Link>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-gray-500 px-2">+{dayTasks.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Mini Calendar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  {MONTHS[currentMonth]} {currentYear}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={goToPrevMonth}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {DAYS_SHORT.map((day, index) => (
                  <span key={index} className="text-[10px] text-gray-500 font-medium">
                    {day}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.slice(0, 35).map((dayObj, index) => {
                  const isTodayDate = isToday(dayObj.year, dayObj.month, dayObj.day);
                  return (
                    <span
                      key={index}
                      className={`p-1 text-xs rounded cursor-pointer transition-colors ${
                        isTodayDate
                          ? "bg-blue-600 text-white font-bold"
                          : dayObj.isCurrentMonth
                          ? "text-gray-900 hover:bg-gray-100"
                          : "text-gray-400"
                      }`}
                      onClick={() => setCurrentDate(new Date(dayObj.year, dayObj.month, dayObj.day))}
                    >
                      {dayObj.day}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex-1 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming This Week</h3>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-gray-400">calendar_today</span>
                  </div>
                  <p className="text-sm text-gray-500">No upcoming tasks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => {
                    const taskDate = new Date(task.due_date);
                    const isTaskToday = isSameDay(taskDate, today);
                    const isTomorrow = isSameDay(taskDate, new Date(today.getTime() + 24 * 60 * 60 * 1000));
                    
                    let dateLabel = "";
                    if (isTaskToday) dateLabel = "Today";
                    else if (isTomorrow) dateLabel = "Tomorrow";
                    else
                      dateLabel = taskDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });

                    const timeLabel = formatTime(task.due_date);

                    return (
                      <Link
                        key={task.id}
                        to={`/projects/${task.project_id}`}
                        className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`text-xs font-medium group-hover:underline ${
                              task.priority === "high"
                                ? "text-red-600"
                                : task.priority === "medium"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            {dateLabel}
                            {timeLabel && `, ${timeLabel}`}
                          </span>
                          <span className={`w-2 h-2 rounded-full mt-1 ${getTaskDotColor(task.priority)}`}></span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{task.nama_tugas}</p>
                        <p className="text-xs text-gray-500 mt-1">{task.project_name}</p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

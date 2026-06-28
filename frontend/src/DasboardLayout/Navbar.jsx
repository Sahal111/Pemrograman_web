import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const isPM = user.role === "pm";

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Fetch notifications ── */
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const list = [];

      const projectsRes = await api.get("/projects");
      const projectsData = projectsRes.data?.data || projectsRes.data || [];
      const allTasks = projectsData.flatMap((p) =>
        (p.tasks || []).map((t) => ({ ...t, project_name: p.nama_proyek })),
      );

      const now = new Date();
      const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      allTasks.forEach((t) => {
        if (!t.due_date || t.status === "done") return;
        const due = new Date(t.due_date);
        if (due < now) {
          list.push({
            type: "overdue",
            icon: "error",
            color: "text-red-500",
            text: `"${t.nama_tugas}" is overdue`,
            sub: t.project_name,
          });
        } else if (due <= in48h) {
          list.push({
            type: "due_soon",
            icon: "schedule",
            color: "text-yellow-500",
            text: `"${t.nama_tugas}" is due soon`,
            sub: t.project_name,
          });
        }
      });

      if (isPM) {
        const pendingRes = await api.get("/users/pending");
        const pendingUsers = pendingRes.data?.data || [];
        pendingUsers.forEach((u) => {
          list.push({
            type: "pending_user",
            icon: "person_add",
            color: "text-blue-500",
            text: `${u.username} is waiting for approval`,
            sub: u.role,
            link: "/user-management",
          });
        });
      }

      setNotifications(list);
    } catch (err) {
      // Diam saja kalau gagal
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav
      className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between
      h-16 px-6 bg-white border-b border-gray-200 lg:pl-[284px]"
    >
      {/* Mobile: hamburger + brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onMenuClick}
          className="w-9 h-9 flex items-center justify-center rounded-lg
            hover:bg-gray-100 text-gray-600 transition"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="text-lg font-black text-blue-600">TaskFlow</span>
      </div>

      {/* Desktop: search bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2
            -translate-y-1/2 text-gray-400 text-[18px]"
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200
              rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center
            text-gray-500 hover:bg-gray-100 transition relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  Notifications
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <span className="material-symbols-outlined text-gray-300 text-[32px]">
                      notifications_none
                    </span>
                    <p className="text-xs text-gray-400 mt-2">
                      No notifications
                    </p>
                  </div>
                ) : (
                  notifications.map((n, idx) => {
                    const content = (
                      <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition">
                        <span
                          className={`material-symbols-outlined text-[18px] mt-0.5 ${n.color}`}
                        >
                          {n.icon}
                        </span>
                        <div>
                          <p className="text-sm text-gray-800">{n.text}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {n.sub}
                          </p>
                        </div>
                      </div>
                    );
                    return n.link ? (
                      <Link
                        key={idx}
                        to={n.link}
                        onClick={() => setShowNotifMenu(false)}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={idx}>{content}</div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar + dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center
              text-white text-xs font-bold border-2 border-blue-200"
            title={user.username || user.email}
          >
            {user.photo ? (
              <img
                src={`http://127.0.0.1:8000/storage/${user.photo}`}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(user.username || user.email || "U")
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {user.username || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                <p className="text-xs text-blue-600 capitalize mt-0.5">
                  {user.role}
                </p>
              </div>
              <Link
                to="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <span className="material-symbols-outlined text-[18px]">
                  settings
                </span>
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <span className="material-symbols-outlined text-[18px]">
                  logout
                </span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

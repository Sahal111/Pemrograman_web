import { Link, useNavigate, useLocation } from "react-router-dom";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const navItems = [
  { icon: "dashboard", label: "Dashboard", to: "/dashboard" },
  { icon: "folder_open", label: "Projects", to: "/projects" },
  { icon: "assignment", label: "Tasks", to: "/tasks" },
  { icon: "calendar_today", label: "Calendar", to: "/calendar" },
  { icon: "groups", label: "Team", to: "/team" },
  { icon: "domain", label: "Clients", to: "/clients" },
  { icon: "analytics", label: "Reports", to: "/reports" },
  { icon: "settings", label: "Settings", to: "/settings" },
];

const pmOnlyNavItems = [
  {
    icon: "admin_panel_settings",
    label: "User Management",
    to: "/user-management",
  },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  const isPM = user.role === "pm";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full z-50 w-[260px] bg-white border-r border-gray-200
          flex flex-col py-6 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* ── Brand ── */}
        <div className="px-6 pb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow">
              <span className="material-symbols-outlined text-white text-[18px]">
                layers
              </span>
            </div>
            <h1 className="text-lg font-black text-blue-600">TaskFlow</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-10">
            IT Project Management
          </p>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all border-l-4
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-blue-600"
                      : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}

          {isPM && (
            <>
              <div className="my-2 border-t border-gray-100" />
              {pmOnlyNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all border-l-4
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border-blue-600"
                          : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* ── User + Logout ── */}
        <div className="px-3 mt-4 pt-4 border-t border-gray-200 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center
              text-white text-xs font-bold flex-shrink-0"
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
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.username || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm
              font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all
              border-l-4 border-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

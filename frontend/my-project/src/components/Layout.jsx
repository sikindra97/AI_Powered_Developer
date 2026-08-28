import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const menuItems = [
  { path: "/", label: "Dashboard", icon: "▦" },
  { path: "/repositories", label: "Repositories", icon: "□" },
  { path: "/analysis", label: "Analysis", icon: "◈" },
  { path: "/ai", label: "AI Assistant", icon: "✦" },
  { path: "/productivity", label: "Productivity", icon: "↗" },
  { path: "/github/connect", label: "GitHub", icon: "◉" },
  { path: "/profile", label: "Profile", icon: "○" }
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            AI Dev
          </h1>
          <p className="text-xs text-slate-500">
            Developer Productivity
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <span className="flex h-5 w-5 items-center justify-center text-base">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <span className="text-base">↪</span>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-slate-200 bg-white">
        <div className="flex h-full items-center px-4 md:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-600 transition hover:bg-slate-100 md:hidden"
          >
            ☰
          </button>

          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Developer Productivity
            </h2>

            <p className="hidden text-xs text-slate-500 sm:block">
              AI-powered development insights
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {(user?.name ||
                  user?.username ||
                  user?.email ||
                  "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-semibold text-slate-800">
                {user?.name ||
                  user?.username ||
                  user?.email ||
                  "Profile"}
              </p>

              <p className="text-xs text-slate-500">
                View profile
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="ml-1 hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 sm:flex"
          >
            ↪
          </button>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-60 border-r border-slate-200 bg-white md:block">
        {sidebar}
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/30 md:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-60 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {sidebar}
          </aside>
        </div>
      )}

      <main className="min-h-screen pt-16 md:ml-60">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

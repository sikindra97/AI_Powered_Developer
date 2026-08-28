import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  FolderGit2,
  BarChart3,
  Sparkles,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  Settings,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

/* =========================
   GitHub Icon
========================= */

const GitHubIcon = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0z" />
  </svg>
);

/* =========================
   Menu Items
========================= */

const menuItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/repositories",
    label: "Repositories",
    icon: FolderGit2,
  },
  {
    path: "/analysis",
    label: "Analysis",
    icon: BarChart3,
  },
  {
    path: "/ai",
    label: "AI Assistant",
    icon: Sparkles,
  },
  {
    path: "/productivity",
    label: "Productivity",
    icon: TrendingUp,
  },
  {
    path: "/github/connect",
    label: "GitHub",
    icon: GitHubIcon,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: User,
  },
];

/* =========================
   Layout Component
========================= */

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* =========================
     Logout
  ========================= */

  const handleLogout = () => {
    setProfileOpen(false);
    setOpen(false);

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  /* =========================
     Profile
  ========================= */

  const handleProfile = () => {
    setProfileOpen(false);
    setOpen(false);

    navigate("/profile");
  };

  /* =========================
     User Initial
  ========================= */

  const getUserInitial = () => {
    const value =
      user?.name ||
      user?.username ||
      user?.email ||
      "U";

    return value.charAt(0).toUpperCase();
  };

  /* =========================
     Sidebar
  ========================= */

  const sidebar = (
    <div className="flex h-full flex-col bg-white">

      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b border-slate-200 px-5">

        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            AI Dev
          </h1>

          <p className="text-xs text-slate-500">
            Developer Productivity
          </p>
        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `
                  group
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`
                        h-[18px]
                        w-[18px]
                        shrink-0
                        transition
                        ${
                          isActive
                            ? "text-slate-900"
                            : "text-slate-500 group-hover:text-slate-800"
                        }
                      `}
                      strokeWidth={1.8}
                    />

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}

        </div>

      </nav>

      {/* Sidebar Logout */}
      <div className="border-t border-slate-200 p-3">

        <button
          type="button"
          onClick={handleLogout}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-3
            py-2.5
            text-sm
            font-medium
            text-slate-600
            transition
            hover:bg-red-50
            hover:text-red-600
          "
        >
          <LogOut
            className="h-[18px] w-[18px]"
            strokeWidth={1.8}
          />

          <span>Logout</span>
        </button>

      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================
          HEADER
      ========================= */}

      <header
        className="
          fixed
          left-0
          right-0
          top-0
          z-40
          h-16
          border-b
          border-slate-200
          bg-white
        "
      >

        <div className="flex h-full items-center px-4 md:px-6">

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="
              mr-3
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-600
              transition
              hover:bg-slate-100
              md:hidden
            "
            aria-label="Open menu"
          >
            <Menu
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </button>

          {/* Header Title */}
          <div className="flex-1">

            <h2 className="text-sm font-semibold text-slate-900">
              Developer Productivity
            </h2>

            <p className="hidden text-xs text-slate-500 sm:block">
              AI-powered development insights
            </p>

          </div>

          {/* Search */}
          <button
            type="button"
            className="
              mr-2
              hidden
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-800
              sm:flex
            "
            title="Search"
          >
            <Search
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
            />
          </button>

          {/* Profile Area */}
          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (previous) => !previous
                )
              }
              className="
                flex
                items-center
                gap-2
                rounded-lg
                px-2
                py-1.5
                transition
                hover:bg-slate-50
              "
            >

              {/* Avatar */}
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="
                    h-8
                    w-8
                    rounded-full
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-900
                    text-xs
                    font-semibold
                    text-white
                  "
                >
                  {getUserInitial()}
                </div>
              )}

              {/* User Information */}
              <div className="hidden text-left sm:block">

                <p
                  className="
                    max-w-32
                    truncate
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  {user?.name ||
                    user?.username ||
                    user?.email ||
                    "Profile"}
                </p>

                <p className="text-xs text-slate-500">
                  View profile
                </p>

              </div>

              {/* Dropdown Icon */}
              <ChevronDown
                className={`
                  hidden
                  h-4
                  w-4
                  text-slate-400
                  transition-transform
                  sm:block
                  ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
                strokeWidth={1.8}
              />

            </button>

            {/* =========================
                PROFILE DROPDOWN
            ========================= */}

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-56
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  shadow-lg
                "
              >

                {/* User Details */}
                <div
                  className="
                    border-b
                    border-slate-100
                    px-4
                    py-3
                  "
                >

                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.name ||
                      user?.username ||
                      "User"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user?.email || ""}
                  </p>

                </div>

                {/* Profile */}
                <button
                  type="button"
                  onClick={handleProfile}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-2.5
                    text-left
                    text-sm
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    hover:text-slate-900
                  "
                >
                  <User
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />

                  <span>Profile</span>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-2.5
                    text-left
                    text-sm
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    hover:text-slate-900
                  "
                >
                  <Settings
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />

                  <span>Settings</span>
                </button>

                {/* Logout */}
                <div className="border-t border-slate-100">

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      px-4
                      py-2.5
                      text-left
                      text-sm
                      text-red-600
                      transition
                      hover:bg-red-50
                    "
                  >
                    <LogOut
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />

                    <span>Logout</span>
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* =========================
          DESKTOP SIDEBAR
      ========================= */}

      <aside
        className="
          fixed
          bottom-0
          left-0
          top-16
          hidden
          w-60
          border-r
          border-slate-200
          bg-white
          md:block
        "
      >
        {sidebar}
      </aside>

      {/* =========================
          MOBILE SIDEBAR
      ========================= */}

      {open && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-slate-900/30
            md:hidden
          "
          onClick={() => setOpen(false)}
        >

          <aside
            className="
              relative
              h-full
              w-60
              bg-white
              shadow-xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                absolute
                right-3
                top-3
                z-10
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                text-slate-500
                transition
                hover:bg-slate-100
                hover:text-slate-900
              "
              aria-label="Close menu"
            >
              <X
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </button>

            {sidebar}

          </aside>

        </div>
      )}

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main
        className="
          min-h-screen
          pt-16
          md:ml-60
        "
      >

        <div className="p-4 md:p-6">

          <Outlet />

        </div>

      </main>

    </div>
  );
}

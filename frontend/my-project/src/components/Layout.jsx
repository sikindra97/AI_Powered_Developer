import { useState, useEffect, useRef } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/*
========================================================
ICONS
No lucide-react required
========================================================
*/

const DashboardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const RepositoryIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5A2.5 2.5 0 0 0 4 19.5V5.5Z" />
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" />
    <path d="M8 7h8M8 11h6" />
  </svg>
);

const AnalysisIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="m7 15 3-4 3 2 5-7" />
  </svg>
);

const AIIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" />
    <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
    <path d="m5 14 .7 1.8L7.5 16.5l-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7L5 14Z" />
  </svg>
);

const ProductivityIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <path d="M4 17 17 4" />
    <path d="M10 4h7v7" />
    <path d="M20 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-5" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0Z" />
  </svg>
);

const ProfileIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
    <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
  </svg>
);

const MenuIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-5 w-5"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-5 w-5"
  >
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={`h-4 w-4 transition-transform ${
      open ? "rotate-180" : ""
    }`}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/*
========================================================
NAVIGATION ITEMS
========================================================
*/

const menuItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: DashboardIcon,
  },
  {
    path: "/repositories",
    label: "Repositories",
    icon: RepositoryIcon,
  },
  {
    path: "/analysis",
    label: "Analysis",
    icon: AnalysisIcon,
  },
  {
    path: "/ai",
    label: "AI Assistant",
    icon: AIIcon,
  },
  {
    path: "/productivity",
    label: "Productivity",
    icon: ProductivityIcon,
  },
  {
    path: "/github/connect",
    label: "GitHub",
    icon: GitHubIcon,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: ProfileIcon,
  },
];

/*
========================================================
LAYOUT
========================================================
*/

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);

  /*
  ========================================================
  CLOSE PROFILE WHEN CLICKING OUTSIDE
  ========================================================
  */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
  ========================================================
  CLOSE MOBILE MENU WHEN ROUTE CHANGES
  ========================================================
  */

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /*
  ========================================================
  LOGOUT
  ========================================================
  */

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setProfileOpen(false);

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  /*
  ========================================================
  USER INFORMATION
  ========================================================
  */

  const displayName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Developer";

  const avatarLetter = displayName
    .charAt(0)
    .toUpperCase();

  /*
  ========================================================
  DESKTOP NAVIGATION
  ========================================================
  */

  const DesktopNavigation = () => (
    <nav className="hidden items-center gap-1 lg:flex">
      {menuItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              [
                "group flex items-center gap-2 rounded-lg",
                "px-3 py-2 text-sm font-medium",
                "transition-all duration-200",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon />

                <span className="whitespace-nowrap">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  /*
  ========================================================
  MOBILE SIDEBAR
  ========================================================
  */

  const MobileSidebar = () => (
    <>
      {/* Overlay */}

      <div
        className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}

      <aside
        className="fixed bottom-0 left-0 top-0 z-[60] flex w-[min(82vw,300px)] flex-col bg-white shadow-2xl lg:hidden"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Sidebar Header */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              AI Dev
            </h1>

            <p className="text-[11px] font-medium text-slate-400">
              Developer Productivity
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
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
                  className={({ isActive }) =>
                    [
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5",
                      "text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          isActive
                            ? "bg-white/10"
                            : "bg-slate-50",
                        ].join(" ")}
                      >
                        <Icon />
                      </span>

                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Mobile User Section */}

        <div className="shrink-0 border-t border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {avatarLetter}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {displayName}
              </p>

              <p className="truncate text-[11px] text-slate-400">
                Developer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>
    </>
  );

  /*
  ========================================================
  RETURN
  ========================================================
  */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==================================================
          TOP NAVBAR
          ================================================== */}

      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full w-full items-center px-4 sm:px-5 lg:px-6">
          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          {/* BRAND */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mr-5 shrink-0 text-left"
          >
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              AI Dev
            </h1>

            <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
              Developer Productivity
            </p>
          </button>

          {/* DESKTOP NAVIGATION */}

          <div className="min-w-0 flex-1">
            <DesktopNavigation />
          </div>

          {/* PROFILE */}

          <div
            ref={profileRef}
            className="relative ml-auto shrink-0"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (previous) => !previous
                )
              }
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
              aria-expanded={profileOpen}
            >
              {/* Avatar */}

              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {avatarLetter}
                </div>
              )}

              {/* Name */}

              <div className="hidden max-w-32 text-left sm:block">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {displayName}
                </p>

                <p className="text-[10px] text-slate-400">
                  View profile
                </p>
              </div>

              <span className="hidden text-slate-400 sm:block">
                <ChevronIcon open={profileOpen} />
              </span>
            </button>

            {/* PROFILE DROPDOWN */}

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                {/* User */}

                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="flex items-center gap-3">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                        {avatarLetter}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user?.email ||
                          "Developer account"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <ProfileIcon />
                    </span>

                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                      <LogoutIcon />
                    </span>

                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==================================================
          MOBILE SIDEBAR
          ================================================== */}

      {mobileMenuOpen && <MobileSidebar />}

      {/* ==================================================
          MAIN CONTENT
          ================================================== */}

      <main className="min-h-screen pt-16">
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

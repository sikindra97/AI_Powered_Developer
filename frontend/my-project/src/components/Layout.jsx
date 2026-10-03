import { useState, useEffect, useRef } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

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

const GitHubIcon = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
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
    className={`h-4 w-4 transition-transform duration-200 ${
      open ? "rotate-180" : ""
    }`}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path d="M14 5h5v5" />
    <path d="M10 14 19 5" />
    <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </svg>
);
const UsageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4l2.5 2.5" />
  </svg>
);
const HeartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-3.5 w-3.5"
  >
    <path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
  </svg>
);

const SparkleSmallIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
  </svg>
);

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
    path: "/ai-assistant",
    label: "AI Assistant",
    icon: AIIcon,
  },
  {
    path: "/productivity",
    label: "Productivity",
    icon: ProductivityIcon,
  },
  {
    path: "/usage",
    label: "How to Use",
    icon: UsageIcon,
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
const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
<div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/5 blur-3xl" />

      <div className="relative w-full px-5 py-10 sm:px-7 lg:px-10">
<div className="grid gap-9 lg:grid-cols-12">
<div className="lg:col-span-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-sm font-black shadow-lg shadow-blue-500/20">
                AI
              </div>

              <div>
                <h2 className="text-lg font-black tracking-tight">
                  AI Dev
                </h2>

                <p className="text-[9px] font-medium tracking-[0.18em] text-slate-500">
                  DEVELOPER PRODUCTIVITY
                </p>
              </div>

            </div>

            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
              An intelligent developer workspace that connects
              GitHub activity, code analysis and productivity
              insights into one powerful engineering platform.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                GitHub Connected
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/10 bg-blue-400/5 px-3 py-1.5 text-xs font-medium text-blue-400">
                <SparkleSmallIcon />
                AI Powered
              </span>

            </div>

          </div>
<div className="lg:col-span-2">

            <h3 className="text-sm font-semibold text-white">
              Platform
            </h3>

            <div className="mt-4 space-y-3">

              <FooterLink
                to="/"
                label="Dashboard"
              />

              <FooterLink
                to="/repositories"
                label="Repositories"
              />

              <FooterLink
                to="/analysis"
                label="Code Analysis"
              />

              <FooterLink
                to="/productivity"
                label="Productivity"
              />

            </div>

          </div>
<div className="lg:col-span-2">

            <h3 className="text-sm font-semibold text-white">
              Intelligence
            </h3>

            <div className="mt-4 space-y-3">

              <FooterLink
                to="/ai-assistant"
                label="AI Assistant"
              />

              <FooterLink
                to="/github/connect"
                label="GitHub Integration"
              />

              <FooterLink
                to="/profile"
                label="Developer Profile"
              />

            </div>

          </div>
<div className="lg:col-span-3">

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <GitHubIcon />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    GitHub ecosystem
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Connected developer workspace
                  </p>
                </div>

              </div>

              <div className="mt-4 h-px bg-white/10" />

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Track repositories, commits, pull requests,
                issues and code quality from one workspace.
              </p>

              <NavLink
                to="/github/connect"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Open GitHub
                <ExternalLinkIcon />
              </NavLink>

            </div>

          </div>

        </div>
<div className="my-8 h-px bg-white/10" />
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} AI Dev. All rights reserved.
            </p>

            <p className="mt-1 text-[11px] text-slate-600">
              Developer Productivity Platform
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">

            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              Built with
              <HeartIcon />
              for developers
            </span>

            <span className="hidden h-4 w-px bg-white/10 sm:block" />

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              All systems operational
            </span>

          </div>

        </div>

      </div>
    </footer>
  );
};

const FooterLink = ({ to, label }) => (
  <NavLink
    to={to}
    className="block text-sm text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
  >
    {label}
  </NavLink>
);

export default function Layout() {

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const profileRef = useRef(null);

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

  useEffect(() => {

    setMobileMenuOpen(false);
    setProfileOpen(false);

  }, [location.pathname]);

  const handleLogout = () => {

    setMobileMenuOpen(false);
    setProfileOpen(false);

    logout();

    navigate("/login", {
      replace: true,
    });

  };

  const displayName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Developer";

  const avatar =
    user?.avatarUrl ||
    user?.avatar_url ||
    user?.avatar ||
    null;

  const avatarLetter =
    displayName.charAt(0).toUpperCase();

  const DesktopNavigation = () => (

    <nav className="hidden items-center gap-1 xl:flex">

      {menuItems.map((item) => {

        const Icon = item.icon;

        return (

          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              [
                "group relative flex items-center gap-2",
                "rounded-xl px-3 py-2.5",
                "text-sm font-semibold",
                "transition-all duration-200",
                isActive
                  ? "bg-slate-950 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")
            }
          >

            {({ isActive }) => (

              <>
                <span
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-slate-900"
                  }
                >
                  <Icon />
                </span>

                <span className="whitespace-nowrap">
                  {item.label}
                </span>

                {item.label === "AI Assistant" && (
                  <span
                    className={
                      isActive
                        ? "rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-bold text-blue-200"
                        : "rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-600"
                    }
                  >
                    AI
                  </span>
                )}

              </>

            )}

          </NavLink>

        );

      })}

    </nav>

  );

  const MobileSidebar = () => (

    <>
<div
        className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm lg:hidden"
        onClick={() => setMobileMenuOpen(false)}
      />
<aside
        className="fixed bottom-0 left-0 top-0 z-[70] flex w-[min(86vw,320px)] flex-col border-r border-slate-200 bg-white shadow-2xl lg:hidden"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
<div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 px-5">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-indigo-500/20">
              AI
            </div>

            <div className="text-left">

              <h1 className="text-base font-black text-slate-950">
                AI Dev
              </h1>

              <p className="text-[9px] font-semibold tracking-[0.12em] text-slate-400">
                DEVELOPER PRODUCTIVITY
              </p>

            </div>

          </button>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <CloseIcon />
          </button>

        </div>
<nav className="flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
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
                      "flex items-center gap-3 rounded-xl px-3 py-3",
                      "text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-slate-950 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                    ].join(" ")
                  }
                >

                  {({ isActive }) => (

                    <>
                      <span
                        className={[
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          isActive
                            ? "bg-white/10"
                            : "bg-slate-100",
                        ].join(" ")}
                      >
                        <Icon />
                      </span>

                      <span>
                        {item.label}
                      </span>

                    </>

                  )}

                </NavLink>

              );

            })}

          </div>

        </nav>
<div className="shrink-0 border-t border-slate-200 p-3">

          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">

            {avatar ? (
              <img
                src={avatar}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
                {avatarLetter}
              </div>
            )}

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="truncate text-[11px] text-slate-500">
                {user?.email || "Developer"}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogoutIcon />
            Logout
          </button>

        </div>

      </aside>
    </>

  );

  return (

    <div className="flex min-h-screen flex-col bg-[#f7f9fd] text-slate-900">

{/* header */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">

        <div className="flex h-[72px] w-full items-center px-4 sm:px-6 lg:px-8">
<button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
<button
            type="button"
            onClick={() => navigate("/")}
            className="mr-5 flex shrink-0 items-center gap-3 text-left"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition hover:scale-105">
              AI
            </div>

            <div className="hidden sm:block">

              <h1 className="text-[15px] font-black tracking-tight text-slate-950">
                AI Dev
              </h1>

              <p className="text-[9px] font-semibold tracking-[0.12em] text-slate-400">
                DEVELOPER PRODUCTIVITY
              </p>

            </div>

          </button>
<div className="min-w-0 flex-1 overflow-x-auto">

            <DesktopNavigation />

          </div>
<div
            ref={profileRef}
            className="relative ml-3 shrink-0"
          >

            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (previous) => !previous
                )
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition hover:border-slate-300 hover:bg-slate-50"
              aria-expanded={profileOpen}
            >

              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
                  {avatarLetter}
                </div>
              )}

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
{profileOpen && (

              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">

                <div className="border-b border-slate-100 px-4 py-4">

                  <div className="flex items-center gap-3">

                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
                        {avatarLetter}
                      </div>
                    )}

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user?.email || "Developer account"}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="p-2">

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
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
{mobileMenuOpen && <MobileSidebar />}
{/* main content area  */}
      <main className="relative flex-1 overflow-hidden bg-[#f7f9fd]">
<div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-blue-200/25 blur-3xl" />

          <div className="absolute right-[-160px] top-10 h-[500px] w-[500px] rounded-full bg-violet-200/20 blur-3xl" />

          <div className="absolute bottom-[-180px] left-1/3 h-[400px] w-[400px] rounded-full bg-indigo-200/15 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.055) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

        </div>

        {/* FULL WIDTH PAGE */}

        <div className="relative z-10 w-full px-3 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-7">

          <Outlet />

        </div>

      </main>
      <Footer />
    </div>

  );
}

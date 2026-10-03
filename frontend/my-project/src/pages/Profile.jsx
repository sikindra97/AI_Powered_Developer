import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Loading from "../components/Loading.jsx";
import StatCard from "../components/StatCard.jsx";
const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
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
const MapIcon = () => (
  <Icon>
    <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
    <path d="M9 3v15" />
    <path d="M15 6v15" />
  </Icon>
);
const LinkIcon = () => (
  <Icon>
    <path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.15-1.15" />
  </Icon>
);
const UsersIcon = () => (
  <Icon>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);
const ProfileAvatar = ({
  src,
  name,
  size = "h-24 w-24",
  textSize = "text-3xl",
}) => {
  const [imageError, setImageError] = useState(false);
  const letter = name?.charAt(0)?.toUpperCase() || "D";
  if (!src || imageError) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 ${size} ${textSize} font-black text-white shadow-[0_0_35px_rgba(59,130,246,0.45)]`}
      >
        <div className="absolute inset-0 bg-white/10" />
        <span className="relative">
          {letter}
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name || "GitHub profile"}
      onError={() => setImageError(true)}
      className={`shrink-0 object-cover ${size} rounded-[20px] border border-white/20 shadow-[0_0_35px_rgba(59,130,246,0.35)]`}
    />
  );
};
export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/github/profile");
        console.log("GitHub Profile:", response.data?.data);
        setProfile(response.data?.data || null);
      } catch (error) {
        console.error(
          "Failed to fetch GitHub profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const name =
    profile?.name ||
    profile?.login ||
    "Developer";

  const login =
    profile?.login ||
    "not-connected";

  return (
    <>
      <style>{`
        @keyframes pageReveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatOrb {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(20px, -15px, 0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: .35;
            transform: scale(1);
          }

          50% {
            opacity: .65;
            transform: scale(1.08);
          }
        }

        .profile-reveal {
          animation: pageReveal .65s ease-out both;
        }

        .profile-orb {
          animation: floatOrb 7s ease-in-out infinite;
        }

        .profile-glow {
          animation: pulseGlow 5s ease-in-out infinite;
        }
      `}</style>

      <main className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-[#f5f7fb]">

        {}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="profile-orb absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

          <div
            className="profile-orb absolute right-0 top-0 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl"
            style={{
              animationDelay: "-3s",
            }}
          />

          <div className="profile-glow absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-400/5 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">

          {}

          <div className="profile-reveal mb-7">

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Account
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Your developer profile
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Manage your connected GitHub identity and view your
              developer footprint.
            </p>
          </div>

          {}

          <section
            className="profile-reveal relative overflow-hidden rounded-[28px] border border-white/20 bg-slate-950 p-6 text-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.65)] sm:p-8"
            style={{
              animationDelay: "100ms",
            }}
          >
<div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
<div className="flex items-center gap-5">

                <div className="relative">

                  <div className="absolute -inset-2 rounded-[24px] bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 opacity-60 blur-md" />

                  <ProfileAvatar
                    src={profile?.avatar_url}
                    name={name}
                    size="h-24 w-24"
                    textSize="text-3xl"
                  />

                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                      {name}
                    </h2>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      Connected
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    @{login}
                  </p>

                  {profile?.company && (
                    <p className="mt-3 text-xs font-medium text-slate-500">
                      {profile.company}
                    </p>
                  )}

                </div>
              </div>
{profile?.html_url && (
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:shadow-lg"
                >
                  <GitHubIcon />
                  View GitHub
                  <LinkIcon />
                </a>
              )}
            </div>
<div className="relative mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
              <HeroStat
                label="Public repositories"
                value={profile?.public_repos || 0}
              />

              <HeroStat
                label="Followers"
                value={profile?.followers || 0}
              />
              <HeroStat
                label="Following"
                value={profile?.following || 0}
              />
            </div>
          </section>
          {}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
<section
              className="profile-reveal rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_15px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:col-span-2"
              style={{
                animationDelay: "200ms",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UsersIcon />
                </div>
                <div>
                  <h2 className="font-bold text-slate-950">
                    About developer
                  </h2>
                  <p className="text-xs text-slate-400">
                    Public GitHub information
                  </p>

                </div>
              </div>

              <p className="mt-6 text-sm leading-7 text-slate-600">
                {profile?.bio ||
                  "No public GitHub biography is available. Add a bio on GitHub to personalize your developer profile."}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                <InfoItem
                  icon={<MapIcon />}
                  label="Location"
                  value={
                    profile?.location ||
                    "Not specified"
                  }
                />

                <InfoItem
                  icon={<LinkIcon />}
                  label="Website"
                  value={
                    profile?.blog ||
                    "Not specified"
                  }
                />

              </div>
            </section>

<section
              className="profile-reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-[0_25px_60px_-30px_rgba(79,70,229,0.7)]"
              style={{
                animationDelay: "300ms",
              }}
            >

              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

              <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  <GitHubIcon />
                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[0.15em] text-blue-100">
                  Integration
                </p>

                <h2 className="mt-2 text-xl font-black">
                  GitHub connected
                </h2>

                <p className="mt-2 text-sm leading-6 text-blue-100/80">
                  Your GitHub identity is connected and ready for repository
                  analysis.
                </p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.08] p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-xs text-blue-100">
                      Connection status
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                      Active
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-300" />
                  </div>
                </div>
              </div>
            </section>
          </div>
          {}
          <section className="mt-6 grid gap-4 sm:grid-cols-3">

            <StatCard
              index={0}
              title="Repositories"
              value={profile?.public_repos || 0}
              subtitle="Public projects"
              color="blue"
              icon={<GitHubIcon />}
            />

            <StatCard
              index={1}
              title="Followers"
              value={profile?.followers || 0}
              subtitle="Developer network"
              color="violet"
              icon={<UsersIcon />}
            />

            <StatCard
              index={2}
              title="Following"
              value={profile?.following || 0}
              subtitle="Developer interests"
              color="emerald"
              icon={<UsersIcon />}
            />
          </section>
          {}
          <div className="profile-reveal mt-6 rounded-2xl border border-slate-200 bg-white/70 px-5 py-4 text-center shadow-sm backdrop-blur-xl">
            <p className="text-xs text-slate-400">
              Developer workspace powered by GitHub
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
const HeroStat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 transition duration-300 hover:bg-white/[0.08]">
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-2xl font-black">
      {value}
    </p>
  </div>
);
const InfoItem = ({
  icon,
  label,
  value,
}) => (
  <div className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50/40">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition group-hover:text-blue-600">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  </div>
);
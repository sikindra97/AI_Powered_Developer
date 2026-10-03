import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

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
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0z" />
  </svg>
);

const ArrowRight = () => (
  <Icon className="h-4 w-4">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Icon>
);

const ArrowUpRight = () => (
  <Icon className="h-4 w-4">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </Icon>
);

const FolderIcon = () => (
  <Icon>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h8.5A1.5 1.5 0 0 1 22 8.5v8A2.5 2.5 0 0 1 19.5 19h-14A2.5 2.5 0 0 1 3 16.5z" />
  </Icon>
);

const StarIcon = () => (
  <Icon>
    <path d="m12 3 2.78 5.63 6.22.9-4.5 4.38 1.06 6.19L12 17.18l-5.56 2.92 1.06-6.19L3 9.53l6.22-.9z" />
  </Icon>
);

const ForkIcon = () => (
  <Icon>
    <circle cx="6" cy="5" r="2" />
    <circle cx="18" cy="19" r="2" />
    <circle cx="18" cy="5" r="2" />
    <path d="M6 7v3a5 5 0 0 0 5 5h5" />
    <path d="M18 7v3" />
  </Icon>
);

const IssueIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16.5h.01" />
  </Icon>
);

const CodeIcon = () => (
  <Icon>
    <path d="m8 9-3 3 3 3" />
    <path d="m16 9 3 3-3 3" />
    <path d="m14 5-4 14" />
  </Icon>
);

const ActivityIcon = () => (
  <Icon>
    <path d="M3 12h4l2-7 4 14 2-7h6" />
  </Icon>
);

const SparklesIcon = () => (
  <Icon>
    <path d="m12 3-1.2 4.1L7 8.3l3.8 1.2L12 13l1.2-3.5L17 8.3l-3.8-1.2z" />
    <path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7z" />
    <path d="m5 14-.6 1.9L2.5 17l1.9.6L5 19.5l.6-1.9z" />
  </Icon>
);

const ShieldIcon = () => (
  <Icon>
    <path d="M12 3 5 6v5c0 4.7 2.9 8.1 7 10 4.1-1.9 7-5.3 7-10V6z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

const BoltIcon = () => (
  <Icon>
    <path d="m13 2-9 12h7l-1 8 9-12h-7z" />
  </Icon>
);

const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="6" />
    <path d="m16 16 4 4" />
  </Icon>
);

const RefreshIcon = ({ spinning = false }) => (
  <Icon className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}>
    <path d="M20 11a8 8 0 0 0-14.9-4" />
    <path d="M4 4v4h4" />
    <path d="M4 13a8 8 0 0 0 14.9 4" />
    <path d="M20 20v-4h-4" />
  </Icon>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const profileResponse = await api.get("/github/profile");

      const githubProfile =
        profileResponse.data?.data || null;

      if (!githubProfile) {
        setGithubConnected(false);
        setProfile(null);
        setRepositories([]);
        return;
      }

      setProfile(githubProfile);
      setGithubConnected(true);

      const repositoryResponse =
        await api.get("/github/repositories");

      setRepositories(
        repositoryResponse.data?.data || []
      );
    } catch (error) {
      if (error.response?.status === 400) {
        setGithubConnected(false);
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to load your GitHub dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalStars = useMemo(
    () =>
      repositories.reduce(
        (total, repository) =>
          total + (repository.stargazers_count || 0),
        0
      ),
    [repositories]
  );

  const totalForks = useMemo(
    () =>
      repositories.reduce(
        (total, repository) =>
          total + (repository.forks_count || 0),
        0
      ),
    [repositories]
  );

  const totalIssues = useMemo(
    () =>
      repositories.reduce(
        (total, repository) =>
          total + (repository.open_issues_count || 0),
        0
      ),
    [repositories]
  );

  const totalWatchers = useMemo(
    () =>
      repositories.reduce(
        (total, repository) =>
          total + (repository.watchers_count || 0),
        0
      ),
    [repositories]
  );

  const recentRepositories = useMemo(() => {
    const filtered = repositories.filter((repository) =>
      repository.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );

    return [...filtered]
      .sort(
        (a, b) =>
          new Date(b.updated_at || 0) -
          new Date(a.updated_at || 0)
      )
      .slice(0, 4);
  }, [repositories, search]);

  const developerName =
    user?.name ||
    profile?.name ||
    profile?.login ||
    "Developer";

  const openRepository = (repository) => {
    navigate(
      `/repositories/${repository.owner?.login}/${repository.name}`
    );
  };

  const formatDate = (date) => {
    if (!date) return "Recently";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "Recently";
    }

    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <>
        <style>{dashboardStyles}</style>

        <div className="min-h-[calc(100vh-64px)] bg-[#f5f7fb] p-5">
          <div className="mx-auto max-w-[1450px] space-y-5">
            <div className="h-[330px] animate-pulse rounded-[30px] bg-slate-200" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <div className="h-[450px] animate-pulse rounded-3xl bg-white xl:col-span-2" />
              <div className="h-[450px] animate-pulse rounded-3xl bg-white" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{dashboardStyles}</style>

      <div className="dashboard-shell relative -mx-4 -mt-5 min-h-[calc(100vh-44px)] overflow-hidden px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {/* Premium ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="dashboard-bg-grid absolute inset-0" />
          <div className="dashboard-bg-glow dashboard-bg-glow-blue absolute -left-32 top-20 h-[420px] w-[420px] rounded-full" />
          <div className="dashboard-bg-glow dashboard-bg-glow-violet absolute right-[-140px] top-[22%] h-[520px] w-[520px] rounded-full" />
          <div className="dashboard-bg-glow dashboard-bg-glow-cyan absolute bottom-[-180px] left-[28%] h-[460px] w-[460px] rounded-full" />
          <div className="dashboard-bg-orbit dashboard-bg-orbit-one absolute left-[8%] top-[18%] h-40 w-40 rounded-full" />
          <div className="dashboard-bg-orbit dashboard-bg-orbit-two absolute right-[12%] bottom-[12%] h-56 w-56 rounded-full" />
          <div className="dashboard-bg-noise absolute inset-0" />
          <div className="dashboard-bg-bottom absolute inset-x-0 bottom-0 h-72" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1450px] space-y-5">

          <section className="premium-hero relative overflow-hidden rounded-[30px] border border-slate-800 bg-[#080d1d] text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,.5)]">

            {/* animated grid */}
            <div className="hero-grid absolute inset-0 opacity-30" />

            {/* glowing orbs */}
            <div className="hero-orb hero-orb-one absolute -right-24 -top-28 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />

            <div className="hero-orb hero-orb-two absolute bottom-[-130px] left-[35%] h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="hero-orb hero-orb-three absolute left-[-100px] top-[30%] h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative z-10 grid min-h-[390px] gap-10 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.35fr_.65fr] lg:items-center lg:px-12">

              {/* LEFT */}

              <div className="animate-fade-up">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>

                  <span className="text-xs font-semibold tracking-wide text-slate-300">
                    ENGINEERING WORKSPACE
                  </span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                  Build better.
                  <span className="block gradient-text">
                    Ship smarter.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                  Welcome back,{" "}
                  <span className="font-semibold text-white">
                    {developerName}
                  </span>
                  . Monitor your GitHub ecosystem, analyze
                  code health and turn development activity into
                  actionable engineering insights.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      navigate("/analysis")
                    }
                    className="premium-button group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_35px_-12px_rgba(99,102,241,.8)]"
                  >
                    <CodeIcon />
                    Analyze code
                    <ArrowUpRight />
                  </button>

                  <button
                    onClick={() =>
                      navigate("/ai-assistant")
                    }
                    className="premium-button inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur"
                  >
                    <SparklesIcon />
                    AI Assistant
                  </button>

                </div>

                <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <ShieldIcon />
                    Secure GitHub integration
                  </span>

                  <span className="hidden h-4 w-px bg-white/10 sm:block" />

                  <span className="flex items-center gap-2">
                    <ActivityIcon />
                    Real-time developer insights
                  </span>
                </div>
              </div>

              {/* RIGHT - PROFILE / SCORE */}

              <div className="relative mx-auto w-full max-w-[390px] lg:ml-auto">

                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-2xl" />

                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.login}
                          className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                          <GitHubIcon />
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-bold">
                          {profile?.name ||
                            profile?.login ||
                            "Developer"}
                        </p>

                        <p className="text-xs text-slate-400">
                          @{profile?.login || "github"}
                        </p>
                      </div>
                    </div>

                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      CONNECTED
                    </span>
                  </div>

                  <div className="my-5 h-px bg-white/10" />

                  <div className="flex items-center gap-5">

                    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">

                      <div className="absolute inset-0 rounded-full border border-blue-400/10" />

                      <div className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-t-blue-400 border-r-violet-400 animate-spin-slow" />

                      <div className="text-center">
                        <p className="text-3xl font-black">
                          {repositories.length}
                        </p>

                        <p className="text-[10px] uppercase tracking-wider text-slate-500">
                          Repositories
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">

                      <MiniSignal
                        label="Stars"
                        value={totalStars}
                        icon={<StarIcon />}
                      />

                      <MiniSignal
                        label="Forks"
                        value={totalForks}
                        icon={<ForkIcon />}
                      />

                      <MiniSignal
                        label="Watchers"
                        value={totalWatchers}
                        icon={<ActivityIcon />}
                      />

                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Workspace status
                      </span>

                      <span className="font-semibold text-emerald-400">
                        Healthy
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 animate-progress" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

{/* Error */}
          {error && (
            <div className="animate-fade-up flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <IssueIcon />
              <span>{error}</span>
            </div>
          )}
          {!githubConnected && (
            <section className="premium-card rounded-[28px] p-10 text-center sm:p-16">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-xl">
                <GitHubIcon className="h-9 w-9" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-blue-600">
                Developer workspace
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Connect GitHub
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                Connect your GitHub account to unlock repository
                analytics, code analysis and productivity insights.
              </p>

              <button
                onClick={() =>
                  navigate("/github/connect")
                }
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-600"
              >
                <GitHubIcon />
                Connect GitHub
                <ArrowRight />
              </button>
            </section>
          )}

{/* Connected Dashbaord */}
          {githubConnected && profile && (
            <>
              <section className="dashboard-reveal dashboard-delay-1 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <PremiumMetric
                  index="01"
                  label="Repositories"
                  value={repositories.length}
                  description="Connected projects"
                  icon={<FolderIcon />}
                  gradient="from-blue-500 to-cyan-400"
                />

                <PremiumMetric
                  index="02"
                  label="Total stars"
                  value={totalStars}
                  description="Community recognition"
                  icon={<StarIcon />}
                  gradient="from-amber-400 to-orange-500"
                />

                <PremiumMetric
                  index="03"
                  label="Total forks"
                  value={totalForks}
                  description="Developer activity"
                  icon={<ForkIcon />}
                  gradient="from-violet-500 to-fuchsia-500"
                />

                <PremiumMetric
                  index="04"
                  label="Open issues"
                  value={totalIssues}
                  description={`${totalWatchers} repository watchers`}
                  icon={<IssueIcon />}
                  gradient="from-rose-500 to-pink-500"
                />

              </section>

{/* Main Content */}
              <section className="dashboard-reveal dashboard-delay-2 grid gap-5 xl:grid-cols-[1.65fr_.75fr]">

                {/* REPOSITORIES */}

                <div className="premium-card overflow-hidden rounded-[28px]">

                  <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <div className="flex items-center gap-3">

                        <div className="icon-box blue">
                          <FolderIcon />
                        </div>

                        <div>
                          <h2 className="font-black tracking-tight text-slate-950">
                            Repository intelligence
                          </h2>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Your most recently updated projects
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="flex items-center gap-2">

                      <div className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
                        <SearchIcon />

                        <input
                          value={search}
                          onChange={(e) =>
                            setSearch(e.target.value)
                          }
                          placeholder="Search..."
                          className="ml-2 w-28 bg-transparent text-xs font-medium outline-none placeholder:text-slate-400"
                        />
                      </div>

                      <button
                        onClick={() =>
                          navigate("/repositories")
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-950 hover:text-white"
                      >
                        View all
                        <ArrowRight />
                      </button>

                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">

                    {recentRepositories.length > 0 ? (
                      recentRepositories.map(
                        (repository, index) => (
                          <PremiumRepository
                            key={
                              repository.id ||
                              repository.name
                            }
                            repository={repository}
                            index={index}
                            formatDate={formatDate}
                            onOpen={() =>
                              openRepository(repository)
                            }
                            onAnalyze={() =>
                              navigate("/analysis")
                            }
                          />
                        )
                      )
                    ) : (
                      <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                          <FolderIcon />
                        </div>

                        <p className="mt-4 font-bold text-slate-900">
                          No repositories found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Try another search or sync GitHub.
                        </p>
                      </div>
                    )}

                  </div>
                </div>

                {/* AI CARD */}

                <div className="premium-ai relative overflow-hidden rounded-[28px] p-6 text-white">

                  <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-400/30 blur-3xl" />

                  <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-violet-400/20 blur-3xl" />

                  <div className="relative z-10">

                    <div className="flex items-center justify-between">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                        <SparklesIcon className="h-6 w-6" />
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-100">
                        AI Powered
                      </span>

                    </div>

                    <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-blue-200">
                      Developer intelligence
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight">
                      Understand your code.
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-blue-100">
                      Transform repository activity and source
                      code into engineering insights that help you
                      build better software.
                    </p>

                    <div className="mt-7 space-y-3">

                      <AIFeature
                        icon={<CodeIcon />}
                        title="Code analysis"
                        description="Complexity, readability and maintainability."
                      />

                      <AIFeature
                        icon={<ActivityIcon />}
                        title="Productivity"
                        description="Development consistency and activity."
                      />

                      <AIFeature
                        icon={<ShieldIcon />}
                        title="Security"
                        description="Identify potentially risky patterns."
                      />

                    </div>

                    <button
                      onClick={() =>
                        navigate("/ai-assistant")
                      }
                      className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-black text-indigo-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
                    >
                      <SparklesIcon />
                      Open AI Assistant
                      <ArrowUpRight />
                    </button>

                  </div>
                </div>

              </section>

                {/* Analysis */}

              <section className="dashboard-reveal dashboard-delay-3 grid gap-5 lg:grid-cols-3">

                <AnalyticsCard
                  title="Engineering activity"
                  subtitle="GitHub ecosystem"
                  icon={<ActivityIcon />}
                  value={repositories.length}
                  label="repositories connected"
                  progress={
                    repositories.length
                      ? Math.min(
                          repositories.length * 7,
                          100
                        )
                      : 0
                  }
                  gradient="blue"
                />

                <AnalyticsCard
                  title="Community signal"
                  subtitle="Open-source footprint"
                  icon={<StarIcon />}
                  value={totalStars}
                  label="total stars"
                  progress={
                    totalStars
                      ? Math.min(totalStars * 5, 100)
                      : 0
                  }
                  gradient="amber"
                />

                <AnalyticsCard
                  title="Workspace health"
                  subtitle="Integration status"
                  icon={<ShieldIcon />}
                  value="Active"
                  label="GitHub connection"
                  progress={100}
                  gradient="green"
                />

              </section>

{/* workflow */}
              <section className="dashboard-reveal dashboard-delay-4 premium-card overflow-hidden rounded-[28px] p-6">

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.22em] text-blue-600">
                      Developer workflow
                    </p>

                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      One workspace. Complete visibility.
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Connect, analyze, measure and improve your
                      development workflow.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/productivity")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600"
                  >
                    Open productivity
                    <ArrowRight />
                  </button>

                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-4">

                  <WorkflowStep
                    number="01"
                    title="Connect"
                    description="Link your GitHub ecosystem."
                    icon={<GitHubIcon />}
                    active
                  />

                  <WorkflowStep
                    number="02"
                    title="Analyze"
                    description="Inspect code health and quality."
                    icon={<CodeIcon />}
                  />

                  <WorkflowStep
                    number="03"
                    title="Measure"
                    description="Track engineering productivity."
                    icon={<ActivityIcon />}
                  />

                  <WorkflowStep
                    number="04"
                    title="Improve"
                    description="Use AI-powered recommendations."
                    icon={<SparklesIcon />}
                  />

                </div>
              </section>

{/* Bottom */}
              <section className="dashboard-reveal dashboard-delay-5 premium-card flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      GitHub integration active
                    </p>

                    <p className="text-xs text-slate-500">
                      Your developer workspace is synchronized.
                    </p>
                  </div>

                </div>

                <button
                  onClick={() =>
                    loadDashboard(true)
                  }
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-950 hover:text-white disabled:opacity-50"
                >
                  <RefreshIcon spinning={refreshing} />
                  {refreshing
                    ? "Refreshing..."
                    : "Refresh workspace"}
                </button>

              </section>

            </>
          )}
        </div>
      </div>
    </>
  );
};

const PremiumMetric = ({
  index,
  label,
  value,
  description,
  icon,
  gradient
}) => (
  <div className="premium-card group relative overflow-hidden rounded-[24px] p-5">

    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-slate-100 opacity-50 blur-2xl transition group-hover:scale-150" />

    <div className="relative">

      <div className="flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          {icon}
        </div>

        <span className="text-[10px] font-black tracking-[.2em] text-slate-300">
          {index}
        </span>

      </div>

      <p className="mt-5 text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {description}
      </p>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full w-2/3 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 group-hover:w-full`}
        />
      </div>

    </div>
  </div>
);

const PremiumRepository = ({
  repository,
  index,
  formatDate,
  onOpen,
  onAnalyze
}) => (
  <div
    className="repository-row group px-6 py-5"
    style={{
      animationDelay: `${index * 80}ms`
    }}
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex min-w-0 items-start gap-4">

        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:bg-blue-600">

          <GitHubIcon />

          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />

        </div>

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="truncate font-black text-slate-950">
              {repository.name}
            </h3>

            {repository.private && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                Private
              </span>
            )}

          </div>

          <p className="mt-1 line-clamp-1 max-w-xl text-xs leading-5 text-slate-500">
            {repository.description ||
              "No description available for this repository."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-400">

            <span className="inline-flex items-center gap-1.5">
              <StarIcon />
              {repository.stargazers_count || 0}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <ForkIcon />
              {repository.forks_count || 0}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <IssueIcon />
              {repository.open_issues_count || 0}
            </span>

            <span>
              Updated {formatDate(repository.updated_at)}
            </span>

          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">

        <button
          onClick={onAnalyze}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <CodeIcon />
          Analyze
        </button>

        <button
          onClick={onOpen}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600"
        >
          Open
          <ArrowUpRight />
        </button>

      </div>

    </div>
  </div>
);

const MiniSignal = ({ label, value, icon }) => (
  <div className="flex items-center gap-3">

    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-blue-300">
      {icon}
    </div>

    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="text-sm font-black text-white">
        {value}
      </p>
    </div>

  </div>
);

const AIFeature = ({
  icon,
  title,
  description
}) => (
  <div className="group flex gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3 transition hover:bg-white/[0.12]">

    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200 transition group-hover:scale-110">
      {icon}
    </div>

    <div>
      <p className="text-xs font-bold text-white">
        {title}
      </p>

      <p className="mt-1 text-[11px] leading-5 text-blue-100/70">
        {description}
      </p>
    </div>

  </div>
);

const AnalyticsCard = ({
  title,
  subtitle,
  icon,
  value,
  label,
  progress,
  gradient
}) => {

  const gradients = {
    blue: "from-blue-500 to-cyan-400",
    amber: "from-amber-400 to-orange-500",
    green: "from-emerald-400 to-cyan-400"
  };

  return (
    <div className="premium-card group relative overflow-hidden rounded-[24px] p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="font-black text-slate-950">
            {title}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
          {icon}
        </div>

      </div>

      <div className="mt-6 flex items-end justify-between">

        <div>
          <p className="text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-[11px] font-medium text-slate-400">
            {label}
          </p>
        </div>

        <div className="flex items-end gap-1">
          {[30, 45, 35, 65, 50, 80, 70].map(
            (height, index) => (
              <span
                key={index}
                className={`w-1.5 rounded-full bg-gradient-to-t ${gradients[gradient]}`}
                style={{
                  height: `${height * 0.45}px`,
                  animationDelay: `${index * 80}ms`
                }}
              />
            )
          )}
        </div>

      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradients[gradient]} animate-progress`}
          style={{
            width: `${Math.min(progress, 100)}%`
          }}
        />

      </div>

    </div>
  );
};

const WorkflowStep = ({
  number,
  title,
  description,
  icon,
  active = false
}) => (
  <div
    className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${
      active
        ? "border-blue-200 bg-blue-50/50"
        : "border-slate-200 bg-slate-50"
    }`}
  >

    <div className="flex items-center justify-between">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition duration-300 group-hover:scale-110 ${
          active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            : "bg-white text-slate-700 shadow-sm"
        }`}
      >
        {icon}
      </div>

      <span className="text-[10px] font-black tracking-[.2em] text-slate-300">
        {number}
      </span>

    </div>

    <h3 className="mt-5 font-black text-slate-950">
      {title}
    </h3>

    <p className="mt-1 text-xs leading-5 text-slate-500">
      {description}
    </p>

    <div className="mt-4 h-0.5 w-8 rounded-full bg-blue-500 transition-all duration-300 group-hover:w-16" />

  </div>
);

const dashboardStyles = `
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translate3d(0, 0, 0);
    }

    50% {
      transform: translate3d(0, -14px, 0);
    }
  }

  @keyframes pulseGlow {
    0%, 100% {
      opacity: .35;
      transform: scale(1);
    }

    50% {
      opacity: .7;
      transform: scale(1.08);
    }
  }

  @keyframes progress {
    from {
      width: 0;
    }

    to {
      width: var(--progress-width);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }

    100% {
      background-position: 1000px 0;
    }
  }

  .animate-fade-up {
    animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both;
  }

  .animate-spin-slow {
    animation: spin 8s linear infinite;
  }

  .animate-progress {
    animation: progress 1.2s cubic-bezier(.22,1,.36,1) both;
  }

  .hero-orb-one {
    animation: float 7s ease-in-out infinite;
  }

  .hero-orb-two {
    animation: pulseGlow 6s ease-in-out infinite;
  }

  .hero-orb-three {
    animation: float 9s ease-in-out infinite reverse;
  }

  .hero-grid {
    background-image:
      linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: linear-gradient(to bottom, black, transparent);
  }

  .gradient-text {
    background: linear-gradient(
      90deg,
      #60a5fa,
      #818cf8,
      #c084fc,
      #67e8f9
    );
    background-size: 300% 300%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: gradientMove 7s ease infinite;
  }

  @keyframes gradientMove {
    0%, 100% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }
  }

  .dashboard-shell {
    background:
      radial-gradient(circle at 8% 8%, rgba(59,130,246,.10), transparent 28%),
      radial-gradient(circle at 92% 18%, rgba(139,92,246,.09), transparent 30%),
      radial-gradient(circle at 52% 100%, rgba(6,182,212,.07), transparent 30%),
      linear-gradient(135deg, #f8fbff 0%, #f5f7fb 42%, #f7f5ff 100%);
  }

  .dashboard-bg-grid {
    opacity: .42;
    background-image:
      linear-gradient(rgba(100,116,139,.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(100,116,139,.045) 1px, transparent 1px);
    background-size: 46px 46px;
    mask-image: linear-gradient(
      to bottom,
      rgba(0,0,0,.95),
      rgba(0,0,0,.55) 55%,
      transparent 100%
    );
  }

  .dashboard-bg-glow {
    filter: blur(75px);
    opacity: .55;
    transform: translate3d(0,0,0);
  }

  .dashboard-bg-glow-blue {
    background: rgba(59,130,246,.16);
    animation: dashboardFloatBlue 11s ease-in-out infinite;
  }

  .dashboard-bg-glow-violet {
    background: rgba(124,58,237,.13);
    animation: dashboardFloatViolet 13s ease-in-out infinite;
  }

  .dashboard-bg-glow-cyan {
    background: rgba(6,182,212,.10);
    animation: dashboardFloatCyan 15s ease-in-out infinite;
  }

  .dashboard-bg-orbit {
    border: 1px solid rgba(99,102,241,.08);
    box-shadow:
      0 0 0 18px rgba(99,102,241,.018),
      0 0 0 36px rgba(59,130,246,.012);
    opacity: .7;
    animation: dashboardOrbit 18s linear infinite;
  }

  .dashboard-bg-orbit-two {
    animation-direction: reverse;
    animation-duration: 22s;
  }

  .dashboard-bg-noise {
    opacity: .28;
    background-image:
      radial-gradient(rgba(15,23,42,.08) .55px, transparent .55px);
    background-size: 7px 7px;
    mask-image: linear-gradient(to bottom, transparent, black 35%, black 70%, transparent);
  }

  .dashboard-bg-bottom {
    background:
      linear-gradient(
        to bottom,
        transparent,
        rgba(255,255,255,.22)
      );
    pointer-events: none;
  }

  @keyframes dashboardFloatBlue {
    0%, 100% {
      transform: translate3d(0,0,0) scale(1);
    }
    50% {
      transform: translate3d(55px,30px,0) scale(1.08);
    }
  }

  @keyframes dashboardFloatViolet {
    0%, 100% {
      transform: translate3d(0,0,0) scale(1);
    }
    50% {
      transform: translate3d(-45px,35px,0) scale(1.06);
    }
  }

  @keyframes dashboardFloatCyan {
    0%, 100% {
      transform: translate3d(0,0,0) scale(1);
    }
    50% {
      transform: translate3d(30px,-35px,0) scale(1.09);
    }
  }

  @keyframes dashboardOrbit {
    from {
      transform: rotate(0deg) translateX(10px) rotate(0deg);
    }
    to {
      transform: rotate(360deg) translateX(10px) rotate(-360deg);
    }
  }

  .dashboard-reveal {
    animation: dashboardSectionIn .75s cubic-bezier(.22,1,.36,1) both;
  }

  .dashboard-delay-1 { animation-delay: .08s; }
  .dashboard-delay-2 { animation-delay: .16s; }
  .dashboard-delay-3 { animation-delay: .24s; }
  .dashboard-delay-4 { animation-delay: .32s; }
  .dashboard-delay-5 { animation-delay: .40s; }

  @keyframes dashboardSectionIn {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .premium-card {
    background: linear-gradient(
      145deg,
      rgba(255,255,255,.94),
      rgba(255,255,255,.82)
    );
    border: 1px solid rgba(226,232,240,.88);
    box-shadow:
      0 15px 45px -30px rgba(15,23,42,.45),
      0 1px 2px rgba(15,23,42,.04);
    backdrop-filter: blur(14px);
    transition:
      transform .3s ease,
      box-shadow .3s ease,
      border-color .3s ease;
  }

  .premium-card:hover {
    transform: translateY(-2px);
    border-color: rgba(148,163,184,.6);
    box-shadow:
      0 25px 60px -35px rgba(15,23,42,.5),
      0 4px 12px rgba(15,23,42,.05);
  }

  .premium-ai {
    background:
      radial-gradient(
        circle at 80% 10%,
        rgba(96,165,250,.28),
        transparent 30%
      ),
      radial-gradient(
        circle at 20% 90%,
        rgba(168,85,247,.22),
        transparent 35%
      ),
      linear-gradient(
        145deg,
        #111827 0%,
        #1d4ed8 48%,
        #6d28d9 100%
      );
  }

  .premium-button {
    transition:
      transform .25s ease,
      box-shadow .25s ease,
      background .25s ease;
  }

  .premium-button:hover {
    transform: translateY(-2px);
  }

  .repository-row {
    animation: fadeUp .55s cubic-bezier(.22,1,.36,1) both;
    transition: background .25s ease;
  }

  .repository-row:hover {
    background: rgba(248,250,252,.8);
  }

  .icon-box {
    display: flex;
    height: 38px;
    width: 38px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }

  .icon-box.blue {
    background: #eff6ff;
    color: #2563eb;
  }

  @media (prefers-reduced-motion: reduce) {
    .dashboard-bg-glow,
    .dashboard-bg-orbit,
    .dashboard-reveal {
      animation: none !important;
    }

    *,
    *::before,
    *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default Dashboard;

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import Loading from "../components/Loading.jsx";
import ErrorState from "../components/ErrorState.jsx";

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

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92v3.293c0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0Z" />
  </svg>
);

const ArrowLeft = () => (
  <Icon className="h-4 w-4">
    <path d="m15 18-6-6 6-6" />
  </Icon>
);

const ArrowUpRight = () => (
  <Icon className="h-4 w-4">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
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

const GitBranchIcon = () => (
  <Icon>
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M6 9v2a7 7 0 0 0 7 7h2" />
    <path d="M18 15V9" />
  </Icon>
);

export default function RepositoryDetails() {
  const { owner, repo } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [repository, setRepository] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState("");

  const tabs = [
    {
      label: "Overview",
      icon: <ActivityIcon />,
    },
    {
      label: "Commits",
      icon: <GitBranchIcon />,
    },
    {
      label: "Pull Requests",
      icon: <CodeIcon />,
    },
    {
      label: "Issues",
      icon: <IssueIcon />,
    },
  ];

  useEffect(() => {
    const loadRepository = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/github/repositories/${owner}/${repo}`
        );

        setRepository(response.data?.data || null);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load repository."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRepository();
  }, [owner, repo]);

  useEffect(() => {
    if (!repository || tab === 0) {
      return;
    }

    const endpoints = ["commits", "pulls", "issues"];

    const loadData = async () => {
      setTabLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/github/repositories/${owner}/${repo}/${endpoints[tab - 1]}`
        );

        setData(response.data?.data || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load repository data."
        );
      } finally {
        setTabLoading(false);
      }
    };

    loadData();
  }, [tab, owner, repo, repository]);

  const totalActivity = useMemo(() => {
    if (tab === 0) return null;
    return data.length;
  }, [data, tab]);

  if (loading && !repository) {
    return <Loading />;
  }

  return (
    <>
      <style>{`
        @keyframes detailsReveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes detailsOrb {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(15px, -15px, 0);
          }
        }

        .details-reveal {
          animation: detailsReveal .6s ease-out both;
        }

        .details-orb {
          animation: detailsOrb 7s ease-in-out infinite;
        }
      `}</style>

      <main className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-[#f5f7fb]">
<div className="pointer-events-none absolute inset-0">
          <div className="details-orb absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />

          <div
            className="details-orb absolute right-0 top-10 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl"
            style={{ animationDelay: "-3s" }}
          />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-5">
              <ErrorState message={error} />
            </div>
          )}

          {repository && (
            <>
<button
                type="button"
                onClick={() => navigate("/repositories")}
                className="details-reveal mb-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-950"
              >
                <ArrowLeft />
                Back to repositories
              </button>
<section className="details-reveal relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.7)] sm:p-8">
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
                <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />

                <div className="relative">
                  <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                        <GitHubIcon />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-medium text-slate-400">
                            {owner}
                          </span>

                          <span className="text-slate-600">/</span>

                          <h1 className="truncate text-2xl font-black sm:text-3xl">
                            {repository.name}
                          </h1>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                              repository.private
                                ? "bg-amber-400/10 text-amber-300"
                                : "bg-emerald-400/10 text-emerald-300"
                            }`}
                          >
                            {repository.private ? "Private" : "Public"}
                          </span>
                        </div>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                          {repository.description ||
                            "No description available for this repository."}
                        </p>
                      </div>
                    </div>

                    {repository.html_url && (
                      <a
                        href={repository.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                      >
                        Open GitHub
                        <ArrowUpRight />
                      </a>
                    )}
                  </div>
<div className="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
                    <HeroMetric
                      icon={<StarIcon />}
                      label="Stars"
                      value={repository.stargazers_count || 0}
                    />

                    <HeroMetric
                      icon={<ForkIcon />}
                      label="Forks"
                      value={repository.forks_count || 0}
                    />

                    <HeroMetric
                      icon={<IssueIcon />}
                      label="Open issues"
                      value={repository.open_issues_count || 0}
                    />

                    <HeroMetric
                      icon={<CodeIcon />}
                      label="Language"
                      value={repository.language || "N/A"}
                    />
                  </div>
                </div>
              </section>
<section
                className="details-reveal mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl"
                style={{ animationDelay: "120ms" }}
              >
                <div className="overflow-x-auto border-b border-slate-100 p-2">
                  <div className="flex min-w-max gap-1">
                    {tabs.map((item, index) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setTab(index)}
                        className={`relative flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                          tab === index
                            ? "bg-slate-950 text-white shadow-md"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                        }`}
                      >
                        {item.icon}
                        {item.label}

                        {index > 0 && tab === index && (
                          <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                            {totalActivity}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  {tab === 0 && (
                    <Overview repository={repository} />
                  )}

                  {tab > 0 && (
                    <ActivityList
                      data={data}
                      loading={tabLoading}
                      tab={tab}
                    />
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

const HeroMetric = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
    <div className="flex items-center gap-2 text-slate-500">
      {icon}

      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>

    <p className="mt-2 text-xl font-black text-white">
      {value}
    </p>
  </div>
);

const Overview = ({ repository }) => (
  <div>
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
          Repository intelligence
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
          Repository overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Core metadata and GitHub activity signals.
        </p>
      </div>

      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Repository active
      </span>
    </div>

    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <OverviewCard
        label="Stars"
        value={repository.stargazers_count || 0}
        icon={<StarIcon />}
      />

      <OverviewCard
        label="Forks"
        value={repository.forks_count || 0}
        icon={<ForkIcon />}
      />

      <OverviewCard
        label="Issues"
        value={repository.open_issues_count || 0}
        icon={<IssueIcon />}
      />

      <OverviewCard
        label="Language"
        value={repository.language || "N/A"}
        icon={<CodeIcon />}
      />
    </div>

    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <InfoPanel
        title="Default branch"
        value={repository.default_branch || "main"}
      />

      <InfoPanel
        title="Visibility"
        value={repository.private ? "Private repository" : "Public repository"}
      />
    </div>
  </div>
);

const OverviewCard = ({ label, value, icon }) => (
  <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition group-hover:bg-blue-50 group-hover:text-blue-600">
      {icon}
    </div>

    <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p className="mt-1 truncate text-xl font-black text-slate-950">
      {value}
    </p>
  </div>
);

const InfoPanel = ({ title, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
      {title}
    </p>

    <p className="mt-2 text-sm font-bold text-slate-900">
      {value}
    </p>
  </div>
);

const ActivityList = ({ data, loading, tab }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ActivityIcon />
        </div>

        <h3 className="mt-4 font-bold text-slate-900">
          No activity found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          There is no data available for this section.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            GitHub activity
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            {tab === 1
              ? "Recent commits"
              : tab === 2
              ? "Pull requests"
              : "Open issues"}
          </h2>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {data.length} items
        </span>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
        {data.map((item, index) => (
          <div
            key={item.id || item.sha || item.number || index}
            className="group flex items-start gap-4 bg-white p-5 transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
              {tab === 1 ? (
                <GitBranchIcon />
              ) : tab === 2 ? (
                <CodeIcon />
              ) : (
                <IssueIcon />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900">
                {item.title ||
                  item.commit?.message ||
                  "Untitled activity"}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {item.user?.login ||
                  item.author?.login ||
                  item.commit?.author?.name ||
                  "Unknown contributor"}
              </p>

              {item.commit?.message && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {item.commit.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

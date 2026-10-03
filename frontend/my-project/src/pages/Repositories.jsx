import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0Z" />
  </svg>
);

const FolderIcon = () => (
  <Icon>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h8.5A1.5 1.5 0 0 1 22 8.5v8A2.5 2.5 0 0 1 19.5 19h-14A2.5 2.5 0 0 1 3 16.5v-9Z" />
  </Icon>
);

const StarIcon = () => (
  <Icon>
    <path d="m12 3 2.78 5.63 6.22.9-4.5 4.38 1.06 6.19L12 17.18l-5.56 2.92 1.06-6.19L3 9.53l6.22-.9L12 3Z" />
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

const SearchIcon = () => (
  <Icon className="h-4 w-4">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </Icon>
);

const ArrowUpRight = () => (
  <Icon className="h-4 w-4">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </Icon>
);

export default function Repositories() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        const response = await api.get("/github/repositories");
        setRepos(response.data?.data || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load repositories."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRepositories();
  }, []);

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const matchesSearch =
        repo.name?.toLowerCase().includes(search.toLowerCase()) ||
        repo.description?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "public" && !repo.private) ||
        (filter === "private" && repo.private);

      return matchesSearch && matchesFilter;
    });
  }, [repos, search, filter]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <style>{`
        @keyframes repoReveal {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes repoFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .repo-reveal {
          animation: repoReveal .55s ease-out both;
        }

        .repo-float {
          animation: repoFloat 6s ease-in-out infinite;
        }
      `}</style>

      <main className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-[#f5f7fb]">
<div className="pointer-events-none absolute inset-0">
          <div className="repo-float absolute -left-32 top-16 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div
            className="repo-float absolute right-0 top-40 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl"
            style={{ animationDelay: "-3s" }}
          />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8">
<section className="repo-reveal relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_25px_70px_-35px_rgba(15,23,42,0.65)] sm:p-8">
            <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                  <GitHubIcon />
                  GitHub workspace
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                  Your repositories.
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Explore your GitHub ecosystem, inspect development activity
                  and open repositories for deeper engineering analysis.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total
                  </p>

                  <p className="mt-0.5 text-2xl font-black">
                    {repos.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 px-5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/60">
                    Connected
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-emerald-300">
                    Active
                  </p>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="repo-reveal mt-6">
              <ErrorState message={error} />
            </div>
          )}

          {!error && (
            <>
<section
                className="repo-reveal mt-6 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-xl"
                style={{ animationDelay: "100ms" }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative max-w-xl flex-1">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <SearchIcon />
                    </div>

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search repositories..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="flex rounded-xl bg-slate-100 p-1">
                    {[
                      ["all", "All"],
                      ["public", "Public"],
                      ["private", "Private"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                          filter === value
                            ? "bg-white text-slate-950 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
{filteredRepos.length > 0 ? (
                <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredRepos.map((repo, index) => (
                    <RepositoryCard
                      key={repo.id}
                      repo={repo}
                      index={index}
                      onOpen={() =>
                        navigate(
                          `/repositories/${repo.owner?.login}/${repo.name}`
                        )
                      }
                    />
                  ))}
                </section>
              ) : (
                <EmptyState search={search} />
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

const RepositoryCard = ({ repo, index, onOpen }) => (
  <article
    className="repo-reveal group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_25px_60px_-30px_rgba(37,99,235,0.3)]"
    style={{ animationDelay: `${120 + index * 70}ms` }}
  >
<div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/0 blur-3xl transition-all duration-500 group-hover:bg-blue-500/10" />

    <div className="relative flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600">
          <FolderIcon />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-base font-black text-slate-950">
            {repo.name}
          </h2>

          <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
            {repo.owner?.login || "GitHub repository"}
          </p>
        </div>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
          repo.private
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-emerald-700"
        }`}
      >
        {repo.private ? "Private" : "Public"}
      </span>
    </div>

    <p className="relative mt-5 min-h-[48px] text-sm leading-6 text-slate-500">
      {repo.description || "No description available for this repository."}
    </p>

    {repo.language && (
      <div className="mt-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {repo.language}
        </span>
      </div>
    )}

    <div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-100 py-4">
      <RepoMetric
        icon={<StarIcon />}
        value={repo.stargazers_count || 0}
        label="Stars"
      />

      <RepoMetric
        icon={<ForkIcon />}
        value={repo.forks_count || 0}
        label="Forks"
      />

      <RepoMetric
        icon={<IssueIcon />}
        value={repo.open_issues_count || 0}
        label="Issues"
      />
    </div>

    <button
      type="button"
      onClick={onOpen}
      className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20"
    >
      Open repository
      <ArrowUpRight />
    </button>
  </article>
);

const RepoMetric = ({ icon, value, label }) => (
  <div className="text-center">
    <div className="mx-auto flex h-7 w-7 items-center justify-center text-slate-400">
      {icon}
    </div>

    <p className="mt-1 text-sm font-bold text-slate-800">
      {value}
    </p>

    <p className="text-[10px] text-slate-400">
      {label}
    </p>
  </div>
);

const EmptyState = ({ search }) => (
  <div className="repo-reveal mt-6 rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white">
      <FolderIcon />
    </div>

    <h2 className="mt-5 text-xl font-black text-slate-950">
      {search ? "No repositories matched" : "No repositories found"}
    </h2>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {search
        ? "Try a different repository name or clear your search."
        : "Connect your GitHub account or check your GitHub repositories."}
    </p>
  </div>
);

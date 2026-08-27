import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import Loading from "../components/Loading.jsx";
import ErrorState from "../components/ErrorState.jsx";

export default function Repositories() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/github/repositories")
      .then((response) => {
        setRepos(response.data?.data || []);
      })
      .catch((error) => {
        setError(
          error.response?.data?.message ||
          "Failed to load repositories."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">
          GitHub
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Repositories
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Browse and analyze your GitHub repositories.
        </p>
      </div>

      {error && <ErrorState message={error} />}

      {!error && repos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {repo.name}
                  </h2>

                  {repo.owner?.login && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {repo.owner.login}
                    </p>
                  )}
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    repo.private
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {repo.private ? "Private" : "Public"}
                </span>
              </div>

              <p className="mt-4 min-h-[48px] text-sm leading-6 text-slate-500">
                {repo.description || "No description available."}
              </p>

              <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>
                  ★ {repo.stargazers_count || 0}
                </span>

                <span>
                  Forks {repo.forks_count || 0}
                </span>

                <span>
                  Issues {repo.open_issues_count || 0}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/repositories/${repo.owner?.login}/${repo.name}`
                  )
                }
                className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-900 hover:text-white"
              >
                Open Repository
              </button>
            </div>
          ))}
        </div>
      )}

      {!repos.length && !error && (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"
              />
            </svg>
          </div>

          <h2 className="mt-4 font-semibold text-slate-900">
            No repositories found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Connect your GitHub account or check your GitHub repositories.
          </p>
        </div>
      )}
    </div>
  );
}
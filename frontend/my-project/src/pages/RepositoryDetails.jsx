import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import Loading from "../components/Loading.jsx";
import ErrorState from "../components/ErrorState.jsx";

export default function RepositoryDetails() {
  const { owner, repo } = useParams();

  const [tab, setTab] = useState(0);
  const [repository, setRepository] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setLoading(true);
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
        setLoading(false);
      }
    };

    loadData();
  }, [tab, owner, repo, repository]);

  if (loading && !repository) {
    return <Loading />;
  }

  return (
    <div>
      {error && <ErrorState message={error} />}

      {repository && (
        <>
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-sm text-slate-500">
                  {owner}
                </p>

                <h1 className="text-2xl font-bold text-slate-900">
                  {repository.name}
                </h1>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  repository.private
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {repository.private ? "Private" : "Public"}
              </span>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {repository.description ||
                "No description available."}
            </p>

            <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-600">
              <span>
                Language:{" "}
                <strong className="text-slate-900">
                  {repository.language || "N/A"}
                </strong>
              </span>

              <span>
                ★{" "}
                <strong className="text-slate-900">
                  {repository.stargazers_count || 0}
                </strong>
              </span>

              <span>
                Forks:{" "}
                <strong className="text-slate-900">
                  {repository.forks_count || 0}
                </strong>
              </span>

              <span>
                Issues:{" "}
                <strong className="text-slate-900">
                  {repository.open_issues_count || 0}
                </strong>
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex overflow-x-auto border-b border-slate-200">
              {["Overview", "Commits", "Pull Requests", "Issues"].map(
                (label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setTab(index)}
                    className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition ${
                      tab === index
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            <div className="p-5">
              {tab === 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Repository Overview
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Default branch:{" "}
                    <span className="font-medium text-slate-800">
                      {repository.default_branch || "main"}
                    </span>
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat
                      label="Stars"
                      value={repository.stargazers_count || 0}
                    />

                    <Stat
                      label="Forks"
                      value={repository.forks_count || 0}
                    />

                    <Stat
                      label="Issues"
                      value={repository.open_issues_count || 0}
                    />

                    <Stat
                      label="Language"
                      value={repository.language || "N/A"}
                    />
                  </div>
                </div>
              )}

              {tab > 0 &&
                (loading ? (
                  <Loading />
                ) : (
                  <div>
                    {data.map((item) => (
                      <div
                        key={
                          item.id ||
                          item.sha ||
                          item.number
                        }
                        className="border-b border-slate-100 py-4 last:border-0"
                      >
                        <h3 className="font-semibold text-slate-900">
                          {item.title ||
                            item.commit?.message ||
                            "Untitled"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.user?.login ||
                            item.author?.login ||
                            item.commit?.author?.name ||
                            "Unknown"}
                        </p>
                      </div>
                    ))}

                    {!data.length && (
                      <div className="py-10 text-center">
                        <p className="text-sm text-slate-500">
                          No data found.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-4">
    <p className="text-xs font-medium text-slate-500">
      {label}
    </p>

    <p className="mt-1 text-lg font-bold text-slate-900">
      {value}
    </p>
  </div>
);
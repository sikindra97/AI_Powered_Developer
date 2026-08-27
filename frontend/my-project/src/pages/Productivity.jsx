import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

const PERIODS = ["daily", "weekly", "monthly"];

const formatDate = (date) => {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "—";

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatHours = (hours) => {
  const value = Number(hours || 0);

  if (!value) return "0 hrs";
  if (value < 1) return `${Math.round(value * 60)} min`;

  return `${value.toFixed(1)} hrs`;
};

const getScoreLabel = (score) => {
  const value = Number(score || 0);

  if (value >= 80) return "Excellent";
  if (value >= 60) return "Good";
  if (value >= 40) return "Average";

  return "Needs Improvement";
};

const getScoreWidth = (score) => {
  const value = Number(score || 0);

  return `${Math.min(Math.max(value, 0), 100)}%`;
};

const extractData = (response) => {
  return response?.data?.data ?? response?.data ?? null;
};

const extractRepositories = (response) => {
  const data = response?.data?.data ?? response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.repositories)) return data.repositories;

  return [];
};

const ScoreCard = ({ title, score, description }) => {
  const value = Math.round(Number(score || 0));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>

        <span className="text-sm font-semibold text-slate-900">
          {value}
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: getScoreWidth(value) }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description || getScoreLabel(value)}
      </p>
    </div>
  );
};

const MetricCard = ({ title, value, subtitle }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

const LoadingCard = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="animate-pulse">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="mt-4 h-7 w-16 rounded bg-slate-200" />
        <div className="mt-5 h-1.5 rounded bg-slate-200" />
      </div>
    </div>
  );
};

export default function Productivity() {
  const [productivity, setProductivity] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState("");
  const [period, setPeriod] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [repositoryLoading, setRepositoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const loadRepositories = useCallback(async () => {
    try {
      setRepositoryLoading(true);

      const response = await api.get("/repositories");

      setRepositories(extractRepositories(response));
    } catch (error) {
      console.error("Failed to load repositories:", error);
      setRepositories([]);
    } finally {
      setRepositoryLoading(false);
    }
  }, []);

  const loadProductivity = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint = `/productivity?period=${period}`;

      if (selectedRepository) {
        endpoint =
          `/productivity/repository/${selectedRepository}?period=${period}`;
      }

      const response = await api.get(endpoint);
      const result = extractData(response);

      if (!result) {
        throw new Error(
          "Productivity data was not returned by the server."
        );
      }

      setProductivity(result);

      const historyEndpoint = selectedRepository
        ? `/productivity/repository/${selectedRepository}/history?period=${period}`
        : `/productivity/history?period=${period}`;

      const historyResponse = await api.get(historyEndpoint);
      const historyData = historyResponse?.data?.data;

      const safeHistory = Array.isArray(historyData)
        ? historyData
        : [];

      const uniqueHistory = Array.from(
        new Map(
          safeHistory.map((item) => [
            `${item.startDate}-${item.period}-${item.repositoryId || "all"}`,
            item
          ])
        ).values()
      );

      setHistory(uniqueHistory);
    } catch (error) {
      console.error("Productivity API error:", error);

      setProductivity(null);
      setHistory([]);

      setError(
        error?.response?.data?.message ||
          error.message ||
          "Unable to load productivity data."
      );
    } finally {
      setLoading(false);
    }
  }, [period, selectedRepository]);

  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  useEffect(() => {
    loadProductivity();
  }, [loadProductivity]);

  const repositoryName = useMemo(() => {
    if (!selectedRepository) return "All Repositories";

    const repository = repositories.find(
      (item) =>
        String(item._id || item.id) ===
        String(selectedRepository)
    );

    return (
      repository?.name ||
      repository?.fullName ||
      "Selected Repository"
    );
  }, [repositories, selectedRepository]);

  const codeQuality = {
    qualityScore:
      productivity?.qualityScore ??
      productivity?.codeQualityDetails?.qualityScore ??
      0,

    securityScore:
      productivity?.securityScore ??
      productivity?.codeQualityDetails?.securityScore ??
      0,

    maintainabilityScore:
      productivity?.maintainabilityScore ??
      productivity?.codeQualityDetails?.maintainabilityScore ??
      0,

    readabilityScore:
      productivity?.readabilityScore ??
      productivity?.codeQualityDetails?.readabilityScore ??
      0
  };

  const overallScore = Number(
    productivity?.overallScore || 0
  );

  const totalDays =
    period === "daily"
      ? 1
      : period === "weekly"
        ? 7
        : 30;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Developer Productivity
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Productivity
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Understand your development activity,
              consistency and code quality.
            </p>
          </div>

          <button
            type="button"
            onClick={loadProductivity}
            disabled={loading}
            className="w-fit rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-md">
            <label
              htmlFor="repository"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Repository
            </label>

            <select
              id="repository"
              value={selectedRepository}
              onChange={(event) =>
                setSelectedRepository(event.target.value)
              }
              disabled={repositoryLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Repositories</option>

              {repositories.map((repository) => {
                const id = repository._id || repository.id;
                const name =
                  repository.name ||
                  repository.fullName ||
                  "Unnamed Repository";

                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">
              Period
            </p>

            <div className="flex rounded-lg bg-slate-100 p-1">
              {PERIODS.map((item) => {
                const active = period === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPeriod(item)}
                    className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition ${
                      active
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          </div>
        )}

        {!loading && productivity && (
          <>
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Current analysis
                </p>

                <h2 className="mt-1 font-semibold text-slate-900">
                  {repositoryName}
                </h2>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-slate-400">
                  Analysis period
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {formatDate(productivity.startDate)}
                  {" — "}
                  {formatDate(productivity.endDate)}
                </p>
              </div>
            </div>

            <div className="mb-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl bg-blue-600 p-6 text-white">
                <p className="text-sm text-blue-100">
                  Overall Productivity
                </p>

                <div className="mt-3 flex items-end gap-1">
                  <span className="text-5xl font-bold">
                    {Math.round(overallScore)}
                  </span>

                  <span className="mb-1.5 text-sm text-blue-100">
                    /100
                  </span>
                </div>

                <p className="mt-2 text-sm text-blue-100">
                  {getScoreLabel(overallScore)}
                </p>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-blue-500">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{
                      width: getScoreWidth(overallScore)
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                <ScoreCard
                  title="Commit Score"
                  score={productivity.commitScore}
                  description="Based on commit activity"
                />

                <ScoreCard
                  title="Pull Request Score"
                  score={productivity.pullRequestScore}
                  description="Based on pull request activity"
                />

                <ScoreCard
                  title="Issue Score"
                  score={productivity.issueScore}
                  description="Based on issue activity"
                />

                <ScoreCard
                  title="Consistency Score"
                  score={productivity.consistencyScore}
                  description="Based on active coding days"
                />
              </div>
            </div>

            <section className="mb-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Development Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your activity during the selected period.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Total Commits"
                  value={productivity.totalCommits ?? 0}
                  subtitle="Code changes committed"
                />

                <MetricCard
                  title="Pull Requests"
                  value={productivity.totalPullRequests ?? 0}
                  subtitle="Pull requests created"
                />

                <MetricCard
                  title="Merged PRs"
                  value={productivity.mergedPullRequests ?? 0}
                  subtitle="Successfully merged"
                />

                <MetricCard
                  title="Active Coding Days"
                  value={productivity.activeCodingDays ?? 0}
                  subtitle={`Out of ${totalDays} days`}
                />

                <MetricCard
                  title="Issues Opened"
                  value={productivity.issuesOpened ?? 0}
                  subtitle="Issues created"
                />

                <MetricCard
                  title="Issues Closed"
                  value={productivity.issuesClosed ?? 0}
                  subtitle="Issues resolved"
                />

                <MetricCard
                  title="PR Merge Time"
                  value={formatHours(
                    productivity.averagePrMergeTime
                  )}
                  subtitle="Average time to merge"
                />

                <MetricCard
                  title="AI Recommendations"
                  value={
                    productivity.aiRecommendationsCount ?? 0
                  }
                  subtitle="AI-generated recommendations"
                />
              </div>
            </section>

            <section className="mb-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Code Quality
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Average quality metrics from your code analysis.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ScoreCard
                  title="Quality"
                  score={codeQuality.qualityScore}
                />

                <ScoreCard
                  title="Security"
                  score={codeQuality.securityScore}
                />

                <ScoreCard
                  title="Maintainability"
                  score={codeQuality.maintainabilityScore}
                />

                <ScoreCard
                  title="Readability"
                  score={codeQuality.readabilityScore}
                />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Productivity History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recent productivity scores for the selected period.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {history.length === 0 ? (
                  <div className="rounded-lg bg-slate-50 px-4 py-8 text-center">
                    <p className="text-sm text-slate-500">
                      No historical productivity records available yet.
                    </p>
                  </div>
                ) : (
                  history.slice(0, 5).map((item) => {
                    const score = Number(
                      item.overallScore || 0
                    );

                    return (
                      <div
                        key={
                          item._id ||
                          `${item.startDate}-${item.period}-${item.repositoryId || "all"}`
                        }
                        className="rounded-lg border border-slate-100 px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {formatDate(item.startDate)}
                              {" — "}
                              {formatDate(item.endDate)}
                            </p>

                            <p className="mt-1 text-xs capitalize text-slate-400">
                              {item.period || period}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-bold text-slate-900">
                              {Math.round(score)}
                            </p>

                            <p className="text-xs text-slate-400">
                              Overall score
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: getScoreWidth(score)
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
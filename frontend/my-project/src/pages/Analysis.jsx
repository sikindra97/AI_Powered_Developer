import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

const Analysis = () => {
  const [repositories, setRepositories] = useState([]);
  const [repositoryId, setRepositoryId] = useState("");
  const [files, setFiles] = useState([]);
  const [filePath, setFilePath] = useState("");
  const [result, setResult] = useState(null);
  const [loadingRepositories, setLoadingRepositories] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setLoadingRepositories(true);
        setError("");

        await api.post("/repositories/sync");

        const response = await api.get("/repositories");
        setRepositories(response.data?.data || []);
      } catch (error) {
        console.error("Load repositories error:", error);
        setRepositories([]);
        setError(
          error.response?.data?.message ||
            "Unable to load repositories."
        );
      } finally {
        setLoadingRepositories(false);
      }
    };

    loadRepositories();
  }, []);

  const handleRepositoryChange = async (event) => {
    const id = event.target.value;

    setRepositoryId(id);
    setFilePath("");
    setFiles([]);
    setResult(null);
    setError("");

    if (!id) return;

    try {
      setLoadingFiles(true);

      const response = await api.get(`/analysis/${id}/files`);
      setFiles(response.data?.data || []);
    } catch (error) {
      console.error("Load files error:", error);
      setFiles([]);
      setError(
        error.response?.data?.message ||
          "Unable to load repository files."
      );
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileChange = (event) => {
    setFilePath(event.target.value);
    setResult(null);
    setError("");
  };

  const handleAnalysis = async () => {
    if (!repositoryId) {
      setError("Please select a repository.");
      return;
    }

    if (!filePath) {
      setError("Please select a file.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        `/analysis/${repositoryId}`,
        { filePath }
      );

      setResult(response.data?.data || null);
    } catch (error) {
      console.error("Code analysis error:", error);
      setError(
        error.response?.data?.message ||
          "Analysis failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRepositoryId("");
    setFilePath("");
    setFiles([]);
    setResult(null);
    setError("");
  };

  const qualitySummary = useMemo(() => {
    if (!result) return null;

    const score = Number(result.qualityScore) || 0;

    if (score >= 90) {
      return {
        label: "Excellent",
        description: "The code is in excellent condition.",
        className: "bg-green-50 text-green-700 border-green-200"
      };
    }

    if (score >= 75) {
      return {
        label: "Good",
        description:
          "The code is generally healthy with some room for improvement.",
        className: "bg-blue-50 text-blue-700 border-blue-200"
      };
    }

    if (score >= 60) {
      return {
        label: "Needs Improvement",
        description:
          "Several areas should be improved.",
        className:
          "bg-yellow-50 text-yellow-700 border-yellow-200"
      };
    }

    return {
      label: "Needs Attention",
      description:
        "This file has significant issues that should be addressed.",
      className: "bg-red-50 text-red-700 border-red-200"
    };
  }, [result]);

  const sortedIssues = useMemo(() => {
    if (!result?.issues) return [];

    const priority = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4
    };

    return [...result.issues].sort(
      (a, b) =>
        (priority[String(a.severity).toLowerCase()] || 5) -
        (priority[String(b.severity).toLowerCase()] || 5)
    );
  }, [result]);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600">
            Developer Tools
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Code Analysis
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Analyze your code and get insights about quality,
            security, readability and maintainability.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-red-700">
                Something went wrong
              </p>
              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-lg text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Select Code
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose a repository and file to analyze.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="repository"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Repository
              </label>

              <select
                id="repository"
                value={repositoryId}
                onChange={handleRepositoryChange}
                disabled={loadingRepositories || loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              >
                <option value="">
                  {loadingRepositories
                    ? "Loading repositories..."
                    : "Select repository"}
                </option>

                {repositories.map((repository) => (
                  <option
                    key={repository._id}
                    value={repository._id}
                  >
                    {repository.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="file"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                File to Analyze
              </label>

              <select
                id="file"
                value={filePath}
                onChange={handleFileChange}
                disabled={
                  !repositoryId ||
                  loadingFiles ||
                  loading
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              >
                <option value="">
                  {!repositoryId
                    ? "Select repository first"
                    : loadingFiles
                    ? "Loading files..."
                    : files.length === 0
                    ? "No analyzable files found"
                    : "Select file"}
                </option>

                {files.map((file) => (
                  <option
                    key={file.path}
                    value={file.path}
                  >
                    {file.path}
                  </option>
                ))}
              </select>

              {files.length > 0 && !loadingFiles && (
                <p className="mt-2 text-xs text-gray-500">
                  {files.length} analyzable files available
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={handleAnalysis}
              disabled={
                loading ||
                loadingFiles ||
                !repositoryId ||
                !filePath
              }
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing...
                </>
              ) : (
                "Analyze Code"
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-blue-600">
                    Analysis Complete
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    Analysis Summary
                  </h2>

                  <p className="mt-1 break-all text-sm text-gray-500">
                    {result.filePath}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-8 border-blue-100 bg-blue-50">
                    <span className="text-2xl font-bold text-blue-700">
                      {result.qualityScore ?? 0}
                    </span>
                    <span className="text-xs text-gray-500">
                      / 100
                    </span>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${qualitySummary?.className}`}
                    >
                      {qualitySummary?.label}
                    </span>

                    <p className="mt-2 max-w-xs text-sm text-gray-500">
                      {qualitySummary?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ScoreCard
                label="Code Quality"
                value={result.qualityScore}
                description="Overall code health"
              />

              <ScoreCard
                label="Maintainability"
                value={result.maintainabilityScore}
                description="Ease of future changes"
              />

              <ScoreCard
                label="Readability"
                value={result.readabilityScore}
                description="Ease of understanding"
              />

              <ScoreCard
                label="Security"
                value={result.securityScore}
                description="Security risk level"
              />
            </div>

            <SectionCard
              title="Quick Status"
              description="Important code health indicators."
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatusCard
                  label="Complexity"
                  value={result.complexity}
                  status={getComplexityStatus(result.complexity)}
                />

                <StatusCard
                  label="Code Smells"
                  value={result.codeSmells}
                  status={getIssueStatus(result.codeSmells)}
                />

                <StatusCard
                  label="Security Issues"
                  value={result.securityIssues}
                  status={getIssueStatus(result.securityIssues)}
                />

                <StatusCard
                  label="Bugs"
                  value={result.bugs}
                  status={getIssueStatus(result.bugs)}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="What Needs Attention?"
              description="Problems detected in the selected file."
            >
              {sortedIssues.length === 0 ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="font-semibold text-green-800">
                    ✓ No major issues detected
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    The analyzer did not find any specific issues
                    in this file.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedIssues.map((issue, index) => (
                    <IssueCard
                      key={`${issue.title}-${index}`}
                      issue={issue}
                    />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Code Metrics"
              description="Basic statistics about the selected file."
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Total Lines"
                  value={result.metrics?.totalLines}
                />

                <MetricCard
                  label="Code Lines"
                  value={result.metrics?.codeLines}
                />

                <MetricCard
                  label="Comment Lines"
                  value={result.metrics?.commentLines}
                />

                <MetricCard
                  label="Blank Lines"
                  value={result.metrics?.blankLines}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Security Analysis"
              description="Potential security risks identified by the analyzer."
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {result.securityScore ?? 0}
                    <span className="text-base font-medium text-gray-400">
                      {" "}
                      / 100
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Security score
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1.5 text-sm font-semibold ${getSecurityStatusClass(
                    result.securityScore
                  )}`}
                >
                  {getSecurityStatusLabel(
                    result.securityScore
                  )}
                </span>
              </div>

              <div className="my-5 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${getSecurityProgressClass(
                    result.securityScore
                  )}`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        Number(result.securityScore) || 0
                      )
                    )}%`
                  }}
                />
              </div>

              {Number(result.securityIssues || 0) === 0 ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="font-semibold text-green-800">
                    ✓ No obvious security issues detected
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    The static analysis did not identify any
                    checked security patterns.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="font-semibold text-red-800">
                    {result.securityIssues} potential security
                    issue
                    {Number(result.securityIssues) === 1
                      ? ""
                      : "s"}{" "}
                    detected
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    Review the reported security findings.
                  </p>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Recommended Next Steps"
              description="Suggestions based on the analysis."
            >
              <div className="space-y-3">
                {getRecommendations(result).map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {index + 1}
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {recommendation.title}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {recommendation.description}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Analysis Information"
              description="Information about the analyzed source file."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard
                  label="File"
                  value={result.filePath}
                />

                <InfoCard
                  label="Language"
                  value={result.language}
                />

                <InfoCard
                  label="Status"
                  value={
                    result.analysisStatus || "completed"
                  }
                />
              </div>

              {result.analyzedAt && (
                <p className="mt-4 text-xs text-gray-500">
                  Analyzed on{" "}
                  {new Date(
                    result.analyzedAt
                  ).toLocaleString()}
                </p>
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
};

const SectionCard = ({
  title,
  description,
  children
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
};

const ScoreCard = ({
  label,
  value,
  description
}) => {
  const score = Number(value) || 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {score}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getScoreBadgeClass(
            score
          )}`}
        >
          {getScoreLabel(score)}
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${getScoreProgressClass(
            score
          )}`}
          style={{
            width: `${Math.min(
              100,
              Math.max(0, score)
            )}%`
          }}
        />
      </div>
    </div>
  );
};

const StatusCard = ({
  label,
  value,
  status
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-600">
          {label}
        </p>

        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-gray-900">
        {value ?? 0}
      </p>
    </div>
  );
};

const MetricCard = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value ?? 0}
      </p>
    </div>
  );
};

const IssueCard = ({ issue }) => {
  const severity = String(
    issue?.severity || "medium"
  ).toLowerCase();

  return (
    <div
      className={`rounded-lg border p-4 ${getIssueBorderClass(
        severity
      )}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span
            className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${getSeverityDot(
              severity
            )}`}
          />

          <div>
            <h3 className="font-semibold text-gray-900">
              {issue?.title || "Code issue detected"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              {issue?.message ||
                "This issue may affect code quality."}
            </p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${getSeverityBadgeClass(
            severity
          )}`}
        >
          {severity.toUpperCase()}
        </span>
      </div>

      {issue?.recommendation && (
        <div className="mt-4 rounded-lg bg-white/70 p-3">
          <p className="text-xs font-semibold text-gray-800">
            Recommended Fix
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            {issue.recommendation}
          </p>
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
};

const getScoreLabel = (score) => {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Poor";
};

const getScoreBadgeClass = (score) => {
  if (score >= 80) {
    return "bg-green-100 text-green-700";
  }

  if (score >= 60) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-red-100 text-red-700";
};

const getScoreProgressClass = (score) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

const getComplexityStatus = (complexity) => {
  const value = Number(complexity) || 0;

  if (value <= 5) {
    return {
      label: "Low",
      className: "bg-green-100 text-green-700"
    };
  }

  if (value <= 10) {
    return {
      label: "Moderate",
      className: "bg-yellow-100 text-yellow-700"
    };
  }

  return {
    label: "High",
    className: "bg-red-100 text-red-700"
  };
};

const getIssueStatus = (count) => {
  const value = Number(count) || 0;

  if (value === 0) {
    return {
      label: "Good",
      className: "bg-green-100 text-green-700"
    };
  }

  if (value <= 2) {
    return {
      label: "Review",
      className: "bg-yellow-100 text-yellow-700"
    };
  }

  return {
    label: "Attention",
    className: "bg-red-100 text-red-700"
  };
};

const getSecurityStatusLabel = (score) => {
  const value = Number(score) || 0;

  if (value >= 90) return "Strong Security";
  if (value >= 75) return "Good Security";
  if (value >= 60) return "Needs Review";
  return "High Risk";
};

const getSecurityStatusClass = (score) => {
  const value = Number(score) || 0;

  if (value >= 90) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (value >= 75) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value >= 60) {
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
};

const getSecurityProgressClass = (score) => {
  const value = Number(score) || 0;

  if (value >= 90) return "bg-green-500";
  if (value >= 75) return "bg-blue-500";
  if (value >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

const getSeverityDot = (severity) => {
  if (severity === "critical" || severity === "high") {
    return "bg-red-500";
  }

  if (severity === "medium") {
    return "bg-yellow-500";
  }

  if (severity === "low") {
    return "bg-blue-500";
  }

  return "bg-gray-400";
};

const getSeverityBadgeClass = (severity) => {
  if (severity === "critical") {
    return "border-red-300 bg-red-100 text-red-700";
  }

  if (severity === "high") {
    return "border-red-200 bg-red-50 text-red-600";
  }

  if (severity === "medium") {
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  if (severity === "low") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-gray-200 bg-gray-50 text-gray-600";
};

const getIssueBorderClass = (severity) => {
  if (severity === "critical" || severity === "high") {
    return "border-red-200 bg-red-50/40";
  }

  if (severity === "medium") {
    return "border-yellow-200 bg-yellow-50/40";
  }

  if (severity === "low") {
    return "border-blue-200 bg-blue-50/40";
  }

  return "border-gray-200 bg-white";
};

const getRecommendations = (result) => {
  const recommendations = [];

  const complexity = Number(result.complexity) || 0;
  const maintainability =
    Number(result.maintainabilityScore) || 0;
  const readability =
    Number(result.readabilityScore) || 0;
  const securityIssues =
    Number(result.securityIssues) || 0;
  const codeSmells = Number(result.codeSmells) || 0;

  if (complexity > 10) {
    recommendations.push({
      title: "Reduce code complexity",
      description:
        "Break complex logic into smaller functions and simplify nested conditions."
    });
  }

  if (maintainability < 80) {
    recommendations.push({
      title: "Improve maintainability",
      description:
        "Move reusable logic into smaller modules or helper functions."
    });
  }

  if (readability < 80) {
    recommendations.push({
      title: "Improve readability",
      description:
        "Use clear naming, reduce unnecessary nesting and keep functions focused."
    });
  }

  if (securityIssues > 0) {
    recommendations.push({
      title: "Review security findings",
      description:
        "Inspect every reported security issue and remove unsafe patterns."
    });
  }

  if (codeSmells > 0) {
    recommendations.push({
      title: "Clean up code smells",
      description:
        "Refactor duplicated, overly complex or difficult-to-maintain code."
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Keep the current code quality",
      description:
        "No major improvement area was detected. Continue following good coding and testing practices."
    });
  }

  return recommendations.slice(0, 4);
};

export default Analysis;
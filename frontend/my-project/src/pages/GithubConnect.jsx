import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";

const GitHubIcon = ({ className = "h-6 w-6" }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 6 9 17l-5-5"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="9" />
    <path
      strokeLinecap="round"
      d="M12 8v4M12 16h.01"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12h14m-5-5 5 5-5 5"
    />
  </svg>
);

const GitHubConnect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const status = searchParams.get("status");

  useEffect(() => {
    const loadGithubProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/github/profile");
        const githubProfile =
          response.data?.data || null;

        setProfile(githubProfile);
      } catch (error) {
        if (error.response?.status === 400) {
          setProfile(null);
          return;
        }

        setError(
          error.response?.data?.message ||
            "Unable to load GitHub profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadGithubProfile();
  }, []);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError("");

      const response = await api.get("/github/login");

      const githubUrl =
        response.data?.data?.url ||
        response.data?.url;

      if (!githubUrl) {
        throw new Error(
          "GitHub authorization URL was not received."
        );
      }

      window.location.href = githubUrl;
    } catch (error) {
      console.error(
        "GitHub OAuth start error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start GitHub authentication."
      );

      setConnecting(false);
    }
  };

  const handleDashboard = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Integrations
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            GitHub
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Connect GitHub to bring your repositories and
            development activity into your workspace.
          </p>
        </div>

        {status === "success" && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckIcon />
            <span>
              GitHub account connected successfully.
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ErrorIcon />
            <span>
              GitHub authentication failed. Please try
              again.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ErrorIcon />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {profile ? (
            <>
              <div className="border-b border-gray-100 px-6 py-7 sm:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <img
                    src={profile.avatar_url}
                    alt={profile.login}
                    className="h-20 w-20 rounded-full border border-gray-200"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">
                        {profile.name ||
                          profile.login}
                      </h2>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Connected
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      @{profile.login}
                    </p>

                    {profile.bio && (
                      <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-4 sm:divide-y-0">
                <Stat
                  value={profile.public_repos || 0}
                  label="Repositories"
                />

                <Stat
                  value={profile.followers || 0}
                  label="Followers"
                />

                <Stat
                  value={profile.following || 0}
                  label="Following"
                />

                <Stat
                  value={profile.public_gists || 0}
                  label="Gists"
                />
              </div>

              <div className="border-t border-gray-100 px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleDashboard}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Go to Dashboard
                    <ArrowIcon />
                  </button>

                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={connecting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <GitHubIcon className="h-5 w-5" />

                    {connecting
                      ? "Connecting..."
                      : "Reconnect"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-6 py-10 text-center sm:px-8 sm:py-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-white">
                  <GitHubIcon className="h-8 w-8" />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Connect your GitHub account
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                  Give the platform access to your GitHub
                  activity so you can analyze repositories,
                  commits, pull requests and issues.
                </p>

                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={connecting}
                  className="mx-auto mt-7 flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <GitHubIcon className="h-5 w-5" />

                  {connecting
                    ? "Connecting..."
                    : "Connect GitHub"}
                </button>
              </div>

              <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
                <p className="text-center text-xs text-gray-500">
                  You will be redirected to GitHub to
                  authorize the connection.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ value, label }) => (
  <div className="px-4 py-5 text-center">
    <p className="text-xl font-bold text-gray-900">
      {value}
    </p>

    <p className="mt-1 text-xs text-gray-500">
      {label}
    </p>
  </div>
);

export default GitHubConnect;
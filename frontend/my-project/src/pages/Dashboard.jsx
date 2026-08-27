import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0z" />
  </svg>
);

const FolderIcon = () => (
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
);

const StarIcon = () => (
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
      d="m12 3 2.78 5.63 6.22.9-4.5 4.38 1.06 6.19L12 17.18l-5.56 2.92 1.06-6.19L3 9.53l6.22-.9L12 3Z"
    />
  </svg>
);

const ForkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="6" cy="5" r="2" />
    <circle cx="18" cy="19" r="2" />
    <circle cx="18" cy="5" r="2" />
    <path strokeLinecap="round" d="M6 7v3a5 5 0 0 0 5 5h5" />
    <path strokeLinecap="round" d="M18 7v3" />
  </svg>
);

const IssueIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" d="M12 8v5" />
    <circle
      cx="12"
      cy="16.5"
      r=".7"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12h14m-6-6 6 6-6 6"
    />
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [githubConnected, setGithubConnected] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/github/profile");
        const githubProfile = response.data?.data || null;

        if (githubProfile) {
          setProfile(githubProfile);
          setGithubConnected(true);
        }
      } catch (error) {
        if (error.response?.status !== 400) {
          setError(
            error.response?.data?.message ||
              "Unable to check GitHub connection."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!githubConnected) return;

    const loadRepositories = async () => {
      try {
        const response = await api.get("/github/repositories");
        setRepositories(response.data?.data || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load GitHub repositories."
        );
      }
    };

    loadRepositories();
  }, [githubConnected]);

  const totalStars = repositories.reduce(
    (total, repository) =>
      total + (repository.stargazers_count || 0),
    0
  );

  const totalForks = repositories.reduce(
    (total, repository) =>
      total + (repository.forks_count || 0),
    0
  );

  const totalIssues = repositories.reduce(
    (total, repository) =>
      total + (repository.open_issues_count || 0),
    0
  );

  const openRepository = (repository) => {
    navigate(
      `/repositories/${repository.owner?.login}/${repository.name}`
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-5 lg:p-7">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Developer Productivity
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Welcome back,{" "}
              {user?.name ||
                profile?.name ||
                profile?.login ||
                "Developer"}
              .
            </p>
          </div>

          <button
            onClick={() => navigate("/github/connect")}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <GitHubIcon />
            {githubConnected ? "GitHub Connected" : "Connect GitHub"}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!githubConnected && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
              <GitHubIcon />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Connect your GitHub account
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Connect GitHub to analyze your repositories,
              commits, pull requests and issues.
            </p>

            <button
              onClick={() => navigate("/github/connect")}
              className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Connect GitHub
            </button>
          </div>
        )}

        {githubConnected && profile && (
          <>
            <div className="mb-5 flex items-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <img
                src={profile.avatar_url}
                alt={profile.login}
                className="h-14 w-14 rounded-full"
              />

              <div className="ml-4">
                <h2 className="font-semibold text-slate-900">
                  {profile.name || profile.login}
                </h2>

                <p className="text-sm text-slate-500">
                  @{profile.login}
                </p>
              </div>

              <div className="ml-auto flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Connected
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                title="Repositories"
                value={repositories.length}
                icon={<FolderIcon />}
              />

              <StatCard
                title="Stars"
                value={totalStars}
                icon={<StarIcon />}
              />

              <StatCard
                title="Forks"
                value={totalForks}
                icon={<ForkIcon />}
              />

              <StatCard
                title="Open Issues"
                value={totalIssues}
                icon={<IssueIcon />}
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Your Repositories
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Recently updated repositories
                  </p>
                </div>

                <button
                  onClick={() => navigate("/repositories")}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  View All
                  <ArrowIcon />
                </button>
              </div>

              <div>
                {repositories.slice(0, 2).map((repository) => (
                  <div
                    key={repository.id}
                    className="flex items-center justify-between border-b border-slate-100 px-5 py-5 last:border-0 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">
                        {repository.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {repository.description ||
                          "No description available."}
                      </p>

                      <div className="mt-2 flex gap-4 text-xs text-slate-500">
                        <span>
                          ★ {repository.stargazers_count || 0}
                        </span>

                        <span>
                          Forks {repository.forks_count || 0}
                        </span>

                        <span>
                          Issues {repository.open_issues_count || 0}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openRepository(repository)}
                      className="ml-5 shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white hover:border-slate-300"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {value}
        </p>
      </div>

      <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
        {icon}
      </div>
    </div>
  </div>
);

export default Dashboard;
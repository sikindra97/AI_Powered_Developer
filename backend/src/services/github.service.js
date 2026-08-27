import User from "../models/User.js";
import Repository from "../models/Repository.js";
import Commit from "../models/Commit.js";
import PullRequest from "../models/PullRequest.js";
import Issue from "../models/Issue.js";

const GITHUB_API_URL = "https://api.github.com";

const getGithubHeaders = (accessToken) => {
  if (!accessToken) {
    throw new Error("GitHub access token is required.");
  }

  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
};

const githubGet = async (url, accessToken) => {
  const response = await fetch(url, {
    method: "GET",
    headers: getGithubHeaders(accessToken),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `GitHub API request failed: ${response.status}`
    );
  }

  return data;
};

const getGithubOAuthUrl = (state) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: "read:user user:email repo",
    state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

const exchangeCodeForToken = async (code) => {
  if (!code) {
    throw new Error("GitHub authorization code is required.");
  }

  const response = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    }
  );

  const data = await response.json();

  if (
    !response.ok ||
    data.error ||
    !data.access_token
  ) {
    throw new Error(
      data.error_description ||
        "GitHub access token was not received."
    );
  }

  return data.access_token;
};

const getGithubUser = async (accessToken) => {
  return githubGet(
    `${GITHUB_API_URL}/user`,
    accessToken
  );
};

const getUserRepositories = async (accessToken) => {
  const repositories = [];

  let page = 1;
  const perPage = 100;

  while (true) {
    const data = await githubGet(
      `${GITHUB_API_URL}/user/repos?per_page=${perPage}&page=${page}&sort=updated`,
      accessToken
    );

    repositories.push(...data);

    if (data.length < perPage) {
      break;
    }

    page++;
  }

  return repositories;
};

const getRepository = async (
  accessToken,
  owner,
  repo
) => {
  if (!owner || !repo) {
    throw new Error(
      "Repository owner and name are required."
    );
  }

  return githubGet(
    `${GITHUB_API_URL}/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(repo)}`,
    accessToken
  );
};

const getRepositoryFiles = async (
  accessToken,
  owner,
  repo,
  branch = "main"
) => {
  const data = await githubGet(
    `${GITHUB_API_URL}/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(
      repo
    )}/git/trees/${encodeURIComponent(
      branch
    )}?recursive=1`,
    accessToken
  );

  if (!data.tree) {
    return [];
  }

  return data.tree
    .filter((item) => item.type === "blob")
    .filter(
      (item) =>
        !item.path.startsWith("node_modules/")
    )
    .filter(
      (item) =>
        !item.path.startsWith(".git/")
    )
    .map((item) => ({
      path: item.path,
      sha: item.sha,
      size: item.size || 0,
    }));
};

const getRepositoryFile = async (
  accessToken,
  owner,
  repo,
  filePath,
  branch = "main"
) => {
  if (!filePath) {
    throw new Error("File path is required.");
  }

  const encodedFilePath = filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const data = await githubGet(
    `${GITHUB_API_URL}/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(
      repo
    )}/contents/${encodedFilePath}?ref=${encodeURIComponent(
      branch
    )}`,
    accessToken
  );

  if (data.type !== "file") {
    throw new Error("Selected path is not a file.");
  }

  if (!data.content) {
    throw new Error("File content is unavailable.");
  }

  const code = Buffer.from(
    data.content,
    "base64"
  ).toString("utf-8");

  return {
    path: data.path,
    name: data.name,
    code,
    size: data.size || 0,
    sha: data.sha,
  };
};

const getRepositoryCommits = async (
  accessToken,
  owner,
  repo,
  page = 1,
  perPage = 100
) => {
  return githubGet(
    `${GITHUB_API_URL}/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(
      repo
    )}/commits?per_page=${perPage}&page=${page}`,
    accessToken
  );
};

const getRepositoryPullRequests = async (
  accessToken,
  owner,
  repo,
  state = "all",
  page = 1,
  perPage = 100
) => {
  return githubGet(
    `${GITHUB_API_URL}/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(
      repo
    )}/pulls?state=${state}&per_page=${perPage}&page=${page}`,
    accessToken
  );
};

const getRepositoryIssues = async (
  accessToken,
  owner,
  repo,
  state = "all",
  page = 1,
  perPage = 100
) => {
  const data = await githubGet(
    `${GITHUB_API_URL}/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(
      repo
    )}/issues?state=${state}&per_page=${perPage}&page=${page}`,
    accessToken
  );

  return data.filter(
    (issue) => !issue.pull_request
  );
};

const syncRepositoryCommits = async ({
  repository,
  accessToken,
}) => {
  const [owner, repo] =
    repository.fullName.split("/");

  if (!owner || !repo) {
    throw new Error(
      `Invalid repository fullName: ${repository.fullName}`
    );
  }

  let page = 1;
  let totalSynced = 0;

  const perPage = 100;

  while (true) {
    const commits =
      await getRepositoryCommits(
        accessToken,
        owner,
        repo,
        page,
        perPage
      );

    if (!commits.length) {
      break;
    }

    for (const githubCommit of commits) {
      const committedAt =
        githubCommit.commit?.author?.date ||
        githubCommit.commit?.committer?.date;

      if (!committedAt) {
        continue;
      }

      await Commit.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubCommitId: githubCommit.sha,
        },

        {
          $set: {
            repositoryId: repository._id,
            githubCommitId: githubCommit.sha,
            sha: githubCommit.sha,

            message:
              githubCommit.commit?.message ||
              "No commit message",

            authorName:
              githubCommit.commit?.author?.name ||
              null,

            authorEmail:
              githubCommit.commit?.author?.email ||
              null,

            authorGithubUsername:
              githubCommit.author?.login ||
              null,

            branch: repository.defaultBranch,

            committedAt: new Date(committedAt),
          },
        },

        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      totalSynced++;
    }

    if (commits.length < perPage) {
      break;
    }

    page++;

    if (page > 10) {
      break;
    }
  }

  return totalSynced;
};

const syncRepositoryPullRequests = async ({
  repository,
  accessToken,
}) => {
  const [owner, repo] =
    repository.fullName.split("/");

  if (!owner || !repo) {
    throw new Error(
      `Invalid repository fullName: ${repository.fullName}`
    );
  }

  let page = 1;
  let totalSynced = 0;

  const perPage = 100;

  while (true) {
    const pullRequests =
      await getRepositoryPullRequests(
        accessToken,
        owner,
        repo,
        "all",
        page,
        perPage
      );

    if (!pullRequests.length) {
      break;
    }

    for (const githubPR of pullRequests) {
      let status = "open";

      if (githubPR.merged_at) {
        status = "merged";
      } else if (
        githubPR.state === "closed"
      ) {
        status = "closed";
      }

      await PullRequest.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubPrId: githubPR.id,
        },

        {
          $set: {
            repositoryId: repository._id,
            githubPrId: githubPR.id,

            number: githubPR.number,

            title:
              githubPR.title ||
              "Untitled PR",

            description:
              githubPR.body || null,

            authorGithubUsername:
              githubPR.user?.login || null,

            status,

            sourceBranch:
              githubPR.head?.ref || null,

            targetBranch:
              githubPR.base?.ref || null,

            additions:
              githubPR.additions || 0,

            deletions:
              githubPR.deletions || 0,

            changedFiles:
              githubPR.changed_files || 0,

            createdAtGithub:
              new Date(
                githubPR.created_at
              ),

            closedAtGithub:
              githubPR.closed_at
                ? new Date(
                    githubPR.closed_at
                  )
                : null,

            mergedAtGithub:
              githubPR.merged_at
                ? new Date(
                    githubPR.merged_at
                  )
                : null,
          },
        },

        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      totalSynced++;
    }

    if (pullRequests.length < perPage) {
      break;
    }

    page++;

    if (page > 10) {
      break;
    }
  }

  return totalSynced;
};

const syncRepositoryIssues = async ({
  repository,
  accessToken,
}) => {
  const [owner, repo] =
    repository.fullName.split("/");

  if (!owner || !repo) {
    throw new Error(
      `Invalid repository fullName: ${repository.fullName}`
    );
  }

  let page = 1;
  let totalSynced = 0;

  const perPage = 100;

  while (true) {
    const issues =
      await getRepositoryIssues(
        accessToken,
        owner,
        repo,
        "all",
        page,
        perPage
      );

    if (!issues.length) {
      break;
    }

    for (const githubIssue of issues) {
      await Issue.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubIssueId: githubIssue.id,
        },

        {
          $set: {
            repositoryId: repository._id,
            githubIssueId: githubIssue.id,

            number: githubIssue.number,

            title:
              githubIssue.title ||
              "Untitled issue",

            description:
              githubIssue.body || null,

            authorGithubUsername:
              githubIssue.user?.login || null,

            status:
              githubIssue.state === "closed"
                ? "closed"
                : "open",

            labels:
              Array.isArray(
                githubIssue.labels
              )
                ? githubIssue.labels.map(
                    (label) => label.name
                  )
                : [],

            commentsCount:
              githubIssue.comments || 0,

            createdAtGithub:
              new Date(
                githubIssue.created_at
              ),

            closedAtGithub:
              githubIssue.closed_at
                ? new Date(
                    githubIssue.closed_at
                  )
                : null,
          },
        },

        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      totalSynced++;
    }

    if (issues.length < perPage) {
      break;
    }

    page++;

    if (page > 10) {
      break;
    }
  }

  return totalSynced;
};

const syncRepositoryActivity = async ({
  userId,
  repositoryId,
}) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!repositoryId) {
    throw new Error(
      "Repository ID is required."
    );
  }

  const user = await User.findById(
    userId
  ).select("+githubAccessToken");

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.githubAccessToken) {
    throw new Error(
      "GitHub account is not connected."
    );
  }

  const repository =
    await Repository.findOne({
      _id: repositoryId,
      userId,
    });

  if (!repository) {
    throw new Error(
      "Repository not found."
    );
  }

  const [
    commits,
    pullRequests,
    issues,
  ] = await Promise.all([
    syncRepositoryCommits({
      repository,
      accessToken:
        user.githubAccessToken,
    }),

    syncRepositoryPullRequests({
      repository,
      accessToken:
        user.githubAccessToken,
    }),

    syncRepositoryIssues({
      repository,
      accessToken:
        user.githubAccessToken,
    }),
  ]);

  repository.lastSyncedAt = new Date();

  await repository.save();

  return {
    repositoryId: repository._id,

    repositoryName:
      repository.fullName,

    commits,

    pullRequests,

    issues,

    syncedAt:
      repository.lastSyncedAt,
  };
};

const connectGithubAccount = async (
  userId,
  accessToken
) => {
  const githubUser =
    await getGithubUser(accessToken);

  const user =
    await User.findByIdAndUpdate(
      userId,

      {
        githubId: String(
          githubUser.id
        ),

        githubUsername:
          githubUser.login,

        githubAccessToken:
          accessToken,

        avatarUrl:
          githubUser.avatar_url,
      },

      {
        new: true,
      }
    ).select(
      "-password -githubAccessToken"
    );

  if (!user) {
    throw new Error(
      "User not found."
    );
  }

  return user;
};

const syncAllUserRepositories = async (
  userId
) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  const user = await User.findById(
    userId
  ).select("+githubAccessToken");

  if (!user) {
    throw new Error(
      "User not found."
    );
  }

  if (!user.githubAccessToken) {
    throw new Error(
      "GitHub account is not connected."
    );
  }

  const repositories =
    await Repository.find({
      userId,
    });

  if (!repositories.length) {
    return {
      repositories: 0,
      commits: 0,
      pullRequests: 0,
      issues: 0,
      details: [],
    };
  }

  let totalCommits = 0;
  let totalPullRequests = 0;
  let totalIssues = 0;

  const details = [];

  for (const repository of repositories) {
    try {
      const result =
        await syncRepositoryActivity({
          userId,
          repositoryId: repository._id,
        });

      totalCommits +=
        result.commits || 0;

      totalPullRequests +=
        result.pullRequests || 0;

      totalIssues +=
        result.issues || 0;

      details.push({
        repositoryId:
          repository._id,

        repositoryName:
          repository.fullName,

        commits:
          result.commits || 0,

        pullRequests:
          result.pullRequests || 0,

        issues:
          result.issues || 0,

        success: true,
      });
    } catch (error) {
      console.error(
        `Failed to sync repository ${repository.fullName}:`,
        error.message
      );

      details.push({
        repositoryId:
          repository._id,

        repositoryName:
          repository.fullName,

        commits: 0,

        pullRequests: 0,

        issues: 0,

        success: false,

        error: error.message,
      });
    }
  }

  return {
    repositories:
      repositories.length,

    commits:
      totalCommits,

    pullRequests:
      totalPullRequests,

    issues:
      totalIssues,

    details,
  };
};

export {
  getGithubOAuthUrl,
  exchangeCodeForToken,
  getGithubUser,
  getUserRepositories,
  getRepository,
  getRepositoryFiles,
  getRepositoryFile,
  getRepositoryCommits,
  getRepositoryPullRequests,
  getRepositoryIssues,
  connectGithubAccount,
  syncRepositoryCommits,
  syncRepositoryPullRequests,
  syncRepositoryIssues,
  syncRepositoryActivity,
  syncAllUserRepositories,
};
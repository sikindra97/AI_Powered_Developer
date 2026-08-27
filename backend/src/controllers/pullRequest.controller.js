import User from "../models/User.js";
import Repository from "../models/Repository.js";
import PullRequest from "../models/PullRequest.js";
import { getRepositoryPullRequests } from "../services/github.service.js";

const syncPullRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub account is not connected."
      });
    }

    const repository = await Repository.findOne({
      _id: req.params.repositoryId,
      userId: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found."
      });
    }

    const [owner, repoName] = repository.fullName.split("/");
    const state = req.query.state || "all";
    const page = Number(req.query.page) || 1;
    const perPage = Math.min(Number(req.query.perPage) || 30, 100);

    const githubPullRequests = await getRepositoryPullRequests(
      user.githubAccessToken,
      owner,
      repoName,
      state,
      page,
      perPage
    );

    const pullRequests = [];

    for (const githubPR of githubPullRequests) {
      let status = "open";

      if (githubPR.merged_at) {
        status = "merged";
      } else if (githubPR.state === "closed") {
        status = "closed";
      }

      const pullRequestData = {
        repositoryId: repository._id,
        githubPrId: githubPR.id,
        number: githubPR.number,
        title: githubPR.title || "Untitled Pull Request",
        description: githubPR.body || null,
        authorGithubUsername: githubPR.user?.login || null,
        status,
        sourceBranch: githubPR.head?.ref || null,
        targetBranch: githubPR.base?.ref || null,
        additions: githubPR.additions || 0,
        deletions: githubPR.deletions || 0,
        changedFiles: githubPR.changed_files || 0,
        createdAtGithub: githubPR.created_at,
        closedAtGithub: githubPR.closed_at || null,
        mergedAtGithub: githubPR.merged_at || null
      };

      const pullRequest = await PullRequest.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubPrId: githubPR.id
        },
        pullRequestData,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      pullRequests.push(pullRequest);
    }

    return res.status(200).json({
      success: true,
      message: "Pull requests synchronized successfully.",
      page,
      perPage,
      count: pullRequests.length,
      data: pullRequests
    });
  } catch (error) {
    console.error("Sync Pull Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to synchronize pull requests.",
      error: error.message
    });
  }
};

const getPullRequests = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.repositoryId,
      userId: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found."
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const skip = (page - 1) * limit;

    const filter = {
      repositoryId: repository._id
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [pullRequests, total] = await Promise.all([
      PullRequest.find(filter)
        .sort({ createdAtGithub: -1 })
        .skip(skip)
        .limit(limit),
      PullRequest.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: pullRequests
    });
  } catch (error) {
    console.error("Get Pull Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pull requests.",
      error: error.message
    });
  }
};

const getPullRequestById = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.repositoryId,
      userId: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found."
      });
    }

    const pullRequest = await PullRequest.findOne({
      _id: req.params.pullRequestId,
      repositoryId: repository._id
    });

    if (!pullRequest) {
      return res.status(404).json({
        success: false,
        message: "Pull request not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: pullRequest
    });
  } catch (error) {
    console.error("Get Pull Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pull request.",
      error: error.message
    });
  }
};

export {
  syncPullRequests,
  getPullRequests,
  getPullRequestById
};
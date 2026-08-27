import User from "../models/User.js";
import Repository from "../models/Repository.js";
import Commit from "../models/Commit.js";
import { getRepositoryCommits } from "../services/github.service.js";

const syncCommits = async (req, res) => {
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
    const page = Number(req.query.page) || 1;
    const perPage = Math.min(Number(req.query.perPage) || 30, 100);

    const githubCommits = await getRepositoryCommits(
      user.githubAccessToken,
      owner,
      repoName,
      page,
      perPage
    );

    const commits = [];

    for (const githubCommit of githubCommits) {
      const commitData = {
        repositoryId: repository._id,
        githubCommitId: githubCommit.node_id,
        sha: githubCommit.sha,
        message: githubCommit.commit?.message || "No commit message",
        authorName: githubCommit.commit?.author?.name || null,
        authorEmail: githubCommit.commit?.author?.email || null,
        authorGithubUsername: githubCommit.author?.login || null,
        committedAt:
          githubCommit.commit?.author?.date ||
          githubCommit.commit?.committer?.date ||
          new Date()
      };

      const commit = await Commit.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubCommitId: githubCommit.node_id
        },
        commitData,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      commits.push(commit);
    }

    return res.status(200).json({
      success: true,
      message: "Commits synchronized successfully.",
      page,
      perPage,
      count: commits.length,
      data: commits
    });
  } catch (error) {
    console.error("Sync Commits Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to synchronize commits.",
      error: error.message
    });
  }
};

const getCommits = async (req, res) => {
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

    const [commits, total] = await Promise.all([
      Commit.find({
        repositoryId: repository._id
      })
        .sort({ committedAt: -1 })
        .skip(skip)
        .limit(limit),

      Commit.countDocuments({
        repositoryId: repository._id
      })
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: commits
    });
  } catch (error) {
    console.error("Get Commits Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch commits.",
      error: error.message
    });
  }
};

const getCommitById = async (req, res) => {
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

    const commit = await Commit.findOne({
      _id: req.params.commitId,
      repositoryId: repository._id
    });

    if (!commit) {
      return res.status(404).json({
        success: false,
        message: "Commit not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: commit
    });
  } catch (error) {
    console.error("Get Commit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch commit.",
      error: error.message
    });
  }
};

export {
  syncCommits,
  getCommits,
  getCommitById
};
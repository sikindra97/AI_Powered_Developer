import User from "../models/User.js";
import Repository from "../models/Repository.js";
import Issue from "../models/Issue.js";
import { getRepositoryIssues } from "../services/github.service.js";

const getPriorityFromLabels = (labels = []) => {
  const labelNames = labels.map((label) =>
    typeof label === "string"
      ? label.toLowerCase()
      : label.name?.toLowerCase() || ""
  );

  if (
    labelNames.some((label) =>
      ["critical", "urgent", "p0"].includes(label)
    )
  ) {
    return "critical";
  }

  if (
    labelNames.some((label) =>
      ["high", "high-priority", "p1"].includes(label)
    )
  ) {
    return "high";
  }

  if (
    labelNames.some((label) =>
      ["low", "low-priority", "p3"].includes(label)
    )
  ) {
    return "low";
  }

  return "medium";
};

const syncIssues = async (req, res) => {
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
    const perPage = Math.min(
      Number(req.query.perPage) || 30,
      100
    );

    const githubIssues = await getRepositoryIssues(
      user.githubAccessToken,
      owner,
      repoName,
      state,
      page,
      perPage
    );

    const issues = [];

    for (const githubIssue of githubIssues) {
      const labels = (githubIssue.labels || []).map(
        (label) => label.name
      );

      const issueData = {
        repositoryId: repository._id,
        githubIssueId: githubIssue.id,
        number: githubIssue.number,
        title: githubIssue.title || "Untitled Issue",
        description: githubIssue.body || null,
        authorGithubUsername: githubIssue.user?.login || null,
        status:
          githubIssue.state === "closed"
            ? "closed"
            : "open",
        priority: getPriorityFromLabels(
          githubIssue.labels
        ),
        labels,
        commentsCount: githubIssue.comments || 0,
        createdAtGithub: githubIssue.created_at,
        closedAtGithub: githubIssue.closed_at || null
      };

      const issue = await Issue.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubIssueId: githubIssue.id
        },
        issueData,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      issues.push(issue);
    }

    return res.status(200).json({
      success: true,
      message: "Issues synchronized successfully.",
      page,
      perPage,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error("Sync Issues Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to synchronize issues.",
      error: error.message
    });
  }
};

const getIssues = async (req, res) => {
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
    const limit = Math.min(
      Number(req.query.limit) || 30,
      100
    );
    const skip = (page - 1) * limit;

    const filter = {
      repositoryId: repository._id
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .sort({ createdAtGithub: -1 })
        .skip(skip)
        .limit(limit),
      Issue.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: issues
    });
  } catch (error) {
    console.error("Get Issues Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch issues.",
      error: error.message
    });
  }
};

const getIssueById = async (req, res) => {
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

    const issue = await Issue.findOne({
      _id: req.params.issueId,
      repositoryId: repository._id
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error("Get Issue Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch issue.",
      error: error.message
    });
  }
};

export {
  syncIssues,
  getIssues,
  getIssueById
};
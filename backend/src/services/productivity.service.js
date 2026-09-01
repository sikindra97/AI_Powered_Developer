import Commit from "../models/Commit.js";
import PullRequest from "../models/PullRequest.js";
import Issue from "../models/Issue.js";
import CodeAnalysis from "../models/CodeAnalysis.js";
import { calculateProductivityScore } from "../utils/calculateScore.js";

const getDateRange = (period) => {
  const now = new Date();

  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  if (period === "daily") {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    startDate.setDate(startDate.getDate() - 6);
  } else if (period === "monthly") {
    startDate.setDate(startDate.getDate() - 29);
  } else {
    throw new Error(
      "Period must be daily, weekly or monthly."
    );
  }

  return { startDate, endDate };
};

const calculateActiveCodingDays = (commits) => {
  const uniqueDays = new Set();

  commits.forEach((commit) => {
    if (commit.committedAt) {
      const date = new Date(commit.committedAt)
        .toISOString()
        .split("T")[0];

      uniqueDays.add(date);
    }
  });

  return uniqueDays.size;
};

const calculateAverageMergeTime = (pullRequests) => {
  const mergedPRs = pullRequests.filter(
    (pr) =>
      pr.createdAtGithub &&
      pr.mergedAtGithub
  );

  if (mergedPRs.length === 0) {
    return 0;
  }

  let totalHours = 0;

  mergedPRs.forEach((pr) => {
    const created = new Date(pr.createdAtGithub);
    const merged = new Date(pr.mergedAtGithub);

    const difference =
      merged.getTime() - created.getTime();

    totalHours +=
      difference / (1000 * 60 * 60);
  });

  return Number(
    (totalHours / mergedPRs.length).toFixed(2)
  );
};

const getAverageCodeQuality = (analyses) => {
  if (!analyses || analyses.length === 0) {
    return {
      qualityScore: 0,
      securityScore: 0,
      maintainabilityScore: 0,
      readabilityScore: 0
    };
  }

  const totals = analyses.reduce(
    (acc, analysis) => {
      acc.qualityScore +=
        Number(analysis.qualityScore) || 0;

      acc.securityScore +=
        Number(analysis.securityScore) || 0;

      acc.maintainabilityScore +=
        Number(analysis.maintainabilityScore) || 0;

      acc.readabilityScore +=
        Number(analysis.readabilityScore) || 0;

      return acc;
    },
    {
      qualityScore: 0,
      securityScore: 0,
      maintainabilityScore: 0,
      readabilityScore: 0
    }
  );

  return {
    qualityScore:
      totals.qualityScore / analyses.length,
    securityScore:
      totals.securityScore / analyses.length,
    maintainabilityScore:
      totals.maintainabilityScore / analyses.length,
    readabilityScore:
      totals.readabilityScore / analyses.length
  };
};

const calculateProductivity = async ({
  userId,
  repositoryId = null,
  period = "weekly"
}) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const { startDate, endDate } =
    getDateRange(period);

  const repositoryFilter = repositoryId
    ? { repositoryId }
    : {};

  const commitFilter = {
    ...repositoryFilter,
    committedAt: {
      $gte: startDate,
      $lte: endDate
    }
  };

  const pullRequestFilter = {
    ...repositoryFilter,
    createdAtGithub: {
      $gte: startDate,
      $lte: endDate
    }
  };

  const issueFilter = {
    ...repositoryFilter,
    createdAtGithub: {
      $gte: startDate,
      $lte: endDate
    }
  };

  const analysisFilter = {
    ...repositoryFilter,
    analysisStatus: "completed",
    analyzedAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  const [
    commits,
    pullRequests,
    issues,
    analyses
  ] = await Promise.all([
    Commit.find(commitFilter).lean(),
    PullRequest.find(pullRequestFilter).lean(),
    Issue.find(issueFilter).lean(),
    CodeAnalysis.find(analysisFilter).lean()
  ]);
  
  const totalCommits = commits.length;

  const activeCodingDays =
    calculateActiveCodingDays(commits);

  const totalPullRequests =
    pullRequests.length;

  const mergedPullRequests =
    pullRequests.filter(
      (pr) => pr.status === "merged"
    ).length;

  const issuesOpened = issues.length;

  const issuesClosed =
    issues.filter(
      (issue) => issue.status === "closed"
    ).length;

  const averageMergeTime =
    calculateAverageMergeTime(pullRequests);

  const codeQuality =
    getAverageCodeQuality(analyses);
  const totalDays =
    period === "daily"
      ? 1
      : period === "weekly"
        ? 7
        : 30;

  const scores = calculateProductivityScore({
    totalCommits,
    activeCodingDays,
    totalPullRequests,
    mergedPullRequests,
    issuesOpened,
    issuesClosed,
    codeQualityScore:
      codeQuality.qualityScore,
    securityScore:
      codeQuality.securityScore,
    maintainabilityScore:
      codeQuality.maintainabilityScore,
    readabilityScore:
      codeQuality.readabilityScore,
    totalDays
  });

  const result = {
    userId,
    repositoryId,
    period,
    startDate,
    endDate,
    ...scores,

    qualityScore: Math.round(
      codeQuality.qualityScore
    ),

    securityScore: Math.round(
      codeQuality.securityScore
    ),

    maintainabilityScore: Math.round(
      codeQuality.maintainabilityScore
    ),

    readabilityScore: Math.round(
      codeQuality.readabilityScore
    ),

    totalCommits,
    totalPullRequests,
    mergedPullRequests,
    issuesOpened,
    issuesClosed,
    averagePrMergeTime: averageMergeTime,
    activeCodingDays,
    aiRecommendationsCount: 0,

    codeQualityDetails: {
      qualityScore: Math.round(
        codeQuality.qualityScore
      ),
      securityScore: Math.round(
        codeQuality.securityScore
      ),
      maintainabilityScore: Math.round(
        codeQuality.maintainabilityScore
      ),
      readabilityScore: Math.round(
        codeQuality.readabilityScore
      )
    }
  };
  return result;
};

export {
  getDateRange,
  calculateActiveCodingDays,
  calculateAverageMergeTime,
  getAverageCodeQuality,
  calculateProductivity
};
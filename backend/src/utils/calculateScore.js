const clamp = (value, min = 0, max = 100) => {
  const number = Number(value) || 0;
  return Math.min(Math.max(number, min), max);
};

const calculateCommitScore = ({
  totalCommits = 0,
  activeCodingDays = 0
}) => {
  if (totalCommits <= 0) {
    return 0;
  }

  const commitActivity = Math.min(
    totalCommits * 4,
    80
  );

  const consistencyBonus = Math.min(
    activeCodingDays * 2,
    20
  );

  return clamp(
    commitActivity + consistencyBonus
  );
};

const calculatePullRequestScore = ({
  totalPullRequests = 0,
  mergedPullRequests = 0
}) => {
  if (totalPullRequests <= 0) {
    return 0;
  }

  const mergeRate = Math.min(
    Math.max(
      mergedPullRequests / totalPullRequests,
      0
    ),
    1
  );

  const activityScore = Math.min(
    totalPullRequests * 5,
    50
  );

  const mergeScore = mergeRate * 50;

  return clamp(
    activityScore + mergeScore
  );
};

const calculateIssueScore = ({
  issuesOpened = 0,
  issuesClosed = 0
}) => {
  const opened = Math.max(
    Number(issuesOpened) || 0,
    0
  );

  const closed = Math.max(
    Number(issuesClosed) || 0,
    0
  );

  const totalIssues = opened + closed;

  if (totalIssues <= 0) {
    return 0;
  }

  const resolutionRate = Math.min(
    closed / totalIssues,
    1
  );

  const activityScore = Math.min(
    totalIssues * 5,
    50
  );

  const resolutionScore =
    resolutionRate * 50;

  return clamp(
    activityScore + resolutionScore
  );
};

const calculateCodeQualityScore = ({
  codeQualityScore = 0,
  securityScore = 0,
  maintainabilityScore = 0,
  readabilityScore = 0
}) => {
  return clamp(
    Number(codeQualityScore) * 0.4 +
    Number(securityScore) * 0.25 +
    Number(maintainabilityScore) * 0.2 +
    Number(readabilityScore) * 0.15
  );
};

const calculateConsistencyScore = ({
  activeCodingDays = 0,
  totalDays = 1
}) => {
  if (totalDays <= 0) {
    return 0;
  }

  return clamp(
    (Number(activeCodingDays) /
      Number(totalDays)) *
      100
  );
};

const calculateOverallScore = ({
  commitScore = 0,
  pullRequestScore = 0,
  issueScore = 0,
  codeQualityScore = 0,
  consistencyScore = 0,
  totalCommits = 0,
  totalPullRequests = 0,
  issuesOpened = 0,
  issuesClosed = 0,
  activeCodingDays = 0
}) => {
  const hasDevelopmentActivity =
    Number(totalCommits) > 0 ||
    Number(totalPullRequests) > 0 ||
    Number(issuesOpened) > 0 ||
    Number(issuesClosed) > 0 ||
    Number(activeCodingDays) > 0;

  if (!hasDevelopmentActivity) {
    return 0;
  }

  const score =
    Number(commitScore) * 0.2 +
    Number(pullRequestScore) * 0.25 +
    Number(issueScore) * 0.15 +
    Number(codeQualityScore) * 0.25 +
    Number(consistencyScore) * 0.15;

  return Math.round(clamp(score));
};

const calculateProductivityScore = (data = {}) => {
  const totalCommits =
    Number(data.totalCommits) || 0;

  const totalPullRequests =
    Number(data.totalPullRequests) || 0;

  const mergedPullRequests =
    Number(data.mergedPullRequests) || 0;

  const issuesOpened =
    Number(data.issuesOpened) || 0;

  const issuesClosed =
    Number(data.issuesClosed) || 0;

  const activeCodingDays =
    Number(data.activeCodingDays) || 0;

  const commitScore =
    calculateCommitScore({
      totalCommits,
      activeCodingDays
    });

  const pullRequestScore =
    calculatePullRequestScore({
      totalPullRequests,
      mergedPullRequests
    });

  const issueScore =
    calculateIssueScore({
      issuesOpened,
      issuesClosed
    });

  const codeQualityScore =
    calculateCodeQualityScore({
      codeQualityScore:
        Number(data.codeQualityScore) || 0,
      securityScore:
        Number(data.securityScore) || 0,
      maintainabilityScore:
        Number(data.maintainabilityScore) || 0,
      readabilityScore:
        Number(data.readabilityScore) || 0
    });

  const consistencyScore =
    calculateConsistencyScore({
      activeCodingDays,
      totalDays:
        Number(data.totalDays) || 1
    });

  const overallScore =
    calculateOverallScore({
      commitScore,
      pullRequestScore,
      issueScore,
      codeQualityScore,
      consistencyScore,
      totalCommits,
      totalPullRequests,
      issuesOpened,
      issuesClosed,
      activeCodingDays
    });

  return {
    commitScore: Math.round(commitScore),
    pullRequestScore:
      Math.round(pullRequestScore),
    issueScore: Math.round(issueScore),
    codeQualityScore:
      Math.round(codeQualityScore),
    consistencyScore:
      Math.round(consistencyScore),
    overallScore
  };
};

export {
  calculateCommitScore,
  calculatePullRequestScore,
  calculateIssueScore,
  calculateCodeQualityScore,
  calculateConsistencyScore,
  calculateOverallScore,
  calculateProductivityScore
};
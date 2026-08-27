import crypto from "crypto";

const generateCodeHash = (code) => {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
};

const calculateComplexity = (code) => {
  const patterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bswitch\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /&&/g,
    /\|\|/g,
    /\?/g
  ];

  let complexity = 1;

  for (const pattern of patterns) {
    const matches = code.match(pattern);

    if (matches) {
      complexity += matches.length;
    }
  }

  return complexity;
};

const calculateLines = (code) => {
  const lines = code.split("\n");
  const totalLines = lines.length;

  const blankLines = lines.filter(
    (line) => line.trim() === ""
  ).length;

  const commentLines = lines.filter((line) => {
    const trimmed = line.trim();

    return (
      trimmed.startsWith("//") ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("*/")
    );
  }).length;

  return {
    totalLines,
    blankLines,
    commentLines,
    codeLines:
      totalLines -
      blankLines -
      commentLines
  };
};

const calculateReadabilityScore = (code) => {
  const lines = code.split("\n");
  let score = 100;

  const longLines = lines.filter(
    (line) => line.length > 120
  ).length;

  const deeplyNestedLines = lines.filter(
    (line) => {
      const leadingSpaces =
        line.match(/^\s+/)?.[0].length || 0;

      return leadingSpaces >= 16;
    }
  ).length;

  score -= Math.min(longLines * 2, 20);
  score -= Math.min(deeplyNestedLines, 20);

  return Math.max(0, score);
};

const calculateMaintainabilityScore = (
  complexity,
  codeLines
) => {
  let score = 100;

  if (complexity > 10) {
    score -= 20;
  } else if (complexity > 5) {
    score -= 10;
  }

  if (codeLines > 500) {
    score -= 20;
  } else if (codeLines > 250) {
    score -= 10;
  }

  return Math.max(0, score);
};

const calculateSecurityScore = (code) => {
  let score = 100;

  const securityPatterns = [
    /eval\s*\(/gi,
    /child_process/gi,
    /\bexec\s*\(/gi,
    /password\s*=\s*["'`]/gi,
    /api[_-]?key\s*=\s*["'`]/gi,
    /secret\s*=\s*["'`]/gi,
    /token\s*=\s*["'`]/gi
  ];

  for (const pattern of securityPatterns) {
    const matches = code.match(pattern);

    if (matches) {
      score -= matches.length * 15;
    }
  }

  return Math.max(0, score);
};

const calculateCodeQualityScore = ({
  complexity,
  readabilityScore,
  maintainabilityScore,
  securityScore
}) => {
  let complexityScore = 100;

  if (complexity > 20) {
    complexityScore = 40;
  } else if (complexity > 10) {
    complexityScore = 60;
  } else if (complexity > 5) {
    complexityScore = 80;
  }

  const qualityScore =
    complexityScore * 0.25 +
    readabilityScore * 0.25 +
    maintainabilityScore * 0.25 +
    securityScore * 0.25;

  return Math.round(qualityScore);
};

const generateIssues = ({
  complexity,
  readabilityScore,
  maintainabilityScore,
  securityScore,
  codeLines
}) => {
  const issues = [];

  if (complexity > 10) {
    issues.push({
      type: "Complexity",
      severity: "high",
      title: "High code complexity",
      message:
        "This file contains too many decision points.",
      recommendation:
        "Break complex logic into smaller functions."
    });
  } else if (complexity > 5) {
    issues.push({
      type: "Complexity",
      severity: "medium",
      title: "Moderate code complexity",
      message:
        "Some functions may contain complex logic.",
      recommendation:
        "Consider simplifying conditions and splitting large functions."
    });
  }

  if (readabilityScore < 80) {
    issues.push({
      type: "Readability",
      severity: "medium",
      title: "Readability can be improved",
      message:
        "Some lines are too long or deeply nested.",
      recommendation:
        "Keep lines shorter and reduce nesting."
    });
  }

  if (maintainabilityScore < 80) {
    issues.push({
      type: "Maintainability",
      severity: "medium",
      title: "Maintainability concern",
      message:
        "The file may become difficult to maintain as it grows.",
      recommendation:
        "Split large files and complex logic into reusable modules."
    });
  }

  if (securityScore < 100) {
    issues.push({
      type: "Security",
      severity: "high",
      title: "Potential security issue",
      message:
        "Potentially unsafe code or hardcoded sensitive information was detected.",
      recommendation:
        "Avoid hardcoded secrets and unsafe execution functions."
    });
  }

  if (codeLines > 500) {
    issues.push({
      type: "Maintainability",
      severity: "medium",
      title: "Large source file",
      message:
        "This file contains more than 500 lines of code.",
      recommendation:
        "Split the file into smaller modules."
    });
  }

  if (issues.length === 0) {
    issues.push({
      type: "Quality",
      severity: "info",
      title: "No major issues detected",
      message:
        "The static analysis did not detect major problems.",
      recommendation:
        "Continue following clean-code and security best practices."
    });
  }

  return issues;
};

const analyzeCode = (code) => {
  if (!code || typeof code !== "string") {
    throw new Error("Valid code is required.");
  }

  const codeHash = generateCodeHash(code);

  const {
    totalLines,
    blankLines,
    commentLines,
    codeLines
  } = calculateLines(code);

  const complexity = calculateComplexity(code);
  const readabilityScore =
    calculateReadabilityScore(code);

  const maintainabilityScore =
    calculateMaintainabilityScore(
      complexity,
      codeLines
    );

  const securityScore =
    calculateSecurityScore(code);

  const qualityScore =
    calculateCodeQualityScore({
      complexity,
      readabilityScore,
      maintainabilityScore,
      securityScore
    });

  const issues = generateIssues({
    complexity,
    readabilityScore,
    maintainabilityScore,
    securityScore,
    codeLines
  });

  const securityIssues = issues.filter(
    (issue) => issue.type === "Security"
  ).length;

  const codeSmells = issues.filter(
    (issue) =>
      issue.type === "Complexity" ||
      issue.type === "Maintainability"
  ).length;

  return {
    codeHash,
    totalLines,
    blankLines,
    commentLines,
    codeLines,
    complexity,
    readabilityScore,
    maintainabilityScore,
    securityScore,
    qualityScore,
    bugs: 0,
    securityIssues,
    codeSmells,
    duplicationPercentage: 0,
    issues
  };
};

export {
  generateCodeHash,
  calculateComplexity,
  calculateLines,
  calculateReadabilityScore,
  calculateMaintainabilityScore,
  calculateSecurityScore,
  calculateCodeQualityScore,
  analyzeCode
};
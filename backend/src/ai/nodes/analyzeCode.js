const analyzeCode = async (state) => {
  if (!state.code || typeof state.code !== "string") {
    throw new Error("Valid code is required.");
  }

  if (!state.code.trim()) {
    throw new Error("Code is required.");
  }

  if (!state.question || !state.question.trim()) {
    throw new Error("Question is required.");
  }

  if (!process.env.AI_API_KEY) {
    throw new Error(
      "AI_API_KEY is not configured in .env."
    );
  }

  const analysis = state.analysis || {};

  const analysisSummary = {
    complexity:
      analysis.complexity ?? "Not available",

    qualityScore:
      analysis.qualityScore ?? "Not available",

    maintainabilityScore:
      analysis.maintainabilityScore ?? "Not available",

    readabilityScore:
      analysis.readabilityScore ?? "Not available",

    securityScore:
      analysis.securityScore ?? "Not available",

    bugs:
      analysis.bugs ?? 0,

    securityIssues:
      analysis.securityIssues ?? 0,

    codeSmells:
      analysis.codeSmells ?? 0,

    duplicationPercentage:
      analysis.duplicationPercentage ?? 0,

    issues:
      Array.isArray(analysis.issues)
        ? analysis.issues
        : []
  };

  return {
    analysisSummary
  };
};

export default analyzeCode;
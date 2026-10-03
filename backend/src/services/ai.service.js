import aiGraph from "../ai/graph.js";

const generateAIInsight = async ({
  code,
  language,
  analysis,
  question,
  userId,
  repositoryId,
  filePath
}) => {
  if (!code?.trim()) {
    throw new Error(
      "Code is required."
    );
  }

  if (!question?.trim()) {
    throw new Error(
      "Question is required."
    );
  }

  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  if (!repositoryId) {
    throw new Error(
      "Repository ID is required."
    );
  }

  if (!filePath?.trim()) {
    throw new Error(
      "File path is required."
    );
  }

  const result =
    await aiGraph.invoke({
      code,
      language,
      analysis,
      question,
      userId,
      repositoryId,
      filePath
    });

  if (!result?.result) {
    throw new Error(
      "AI workflow did not return a valid result."
    );
  }

  return {
    ...result.result,
    sources:
      result.sources || []
  };
};

export default generateAIInsight;
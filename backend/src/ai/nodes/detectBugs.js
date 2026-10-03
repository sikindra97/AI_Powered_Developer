import { ChatGroq } from "@langchain/groq";

const DEFAULT_MODEL = "openai/gpt-oss-120b";

const detectBugs = async (state) => {
  const model =
    process.env.AI_MODEL || DEFAULT_MODEL;

  if (!process.env.AI_API_KEY) {
    throw new Error(
      "AI_API_KEY is not configured in .env."
    );
  }

  const llm = new ChatGroq({
    apiKey: process.env.AI_API_KEY,
    model,
    temperature: 0.1
  });

  const response = await llm.invoke(
    [
      {
        role: "system",
        content: `
You are an expert software engineer and bug detection specialist.

Your job is to identify realistic bugs and potential runtime problems in the supplied source code.

IMPORTANT RULES:

1. Analyze ONLY the supplied source code.

2. Do NOT invent functions, variables, APIs, libraries, database operations, or bugs.

3. Only report a bug when there is reasonable evidence in the supplied code.

4. Explain why the problem can happen.

5. Consider realistic edge cases.

6. Do not report normal coding style preferences as bugs.

7. Do not suggest unrelated changes.

8. Return ONLY valid JSON.

Use exactly this structure:

{
  "bugs": [
    {
      "title": "short bug title",
      "description": "clear explanation",
      "severity": "low",
      "recommendation": "practical fix"
    }
  ]
}

Severity must be one of:

low
medium
high
critical

If no realistic bugs are found, return:

{
  "bugs": []
}
`
      },
      {
        role: "user",
        content: `
Programming Language:
${state.language || "Unknown"}

Developer Question:
${state.question}

Static Analysis:
${JSON.stringify(
  state.analysisSummary || {},
  null,
  2
)}

SOURCE CODE
==================================================

${state.code}
`
      }
    ],
    {
      response_format: {
        type: "json_object"
      },
      max_completion_tokens: 2500
    }
  );

  const content = response?.content;

  if (!content) {
    throw new Error(
      "Groq returned an empty bug detection response."
    );
  }

  let cleaned =
    typeof content === "string"
      ? content.trim()
      : JSON.stringify(content);

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );
  }

  let result;

  try {
    result = JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "Unable to parse bug detection JSON:"
    );
    console.error(cleaned);

    throw new Error(
      "AI returned invalid bug detection JSON."
    );
  }

  const bugs = Array.isArray(result.bugs)
    ? result.bugs
        .filter(
          (bug) =>
            bug &&
            typeof bug === "object"
        )
        .map((bug) => ({
          title:
            typeof bug.title === "string"
              ? bug.title.trim()
              : "Potential bug",

          description:
            typeof bug.description === "string"
              ? bug.description.trim()
              : "",

          severity: [
            "low",
            "medium",
            "high",
            "critical"
          ].includes(bug.severity)
            ? bug.severity
            : "low",

          recommendation:
            typeof bug.recommendation === "string"
              ? bug.recommendation.trim()
              : ""
        }))
    : [];

  return {
    bugs
  };
};

export default detectBugs;
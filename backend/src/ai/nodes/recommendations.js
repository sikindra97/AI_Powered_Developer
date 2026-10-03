import { ChatGroq } from "@langchain/groq";

const DEFAULT_MODEL = "openai/gpt-oss-120b";

const recommendations = async (state) => {
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
    temperature: 0.2
  });

  const response = await llm.invoke(
    [
      {
        role: "system",
        content: `
You are an expert software engineer, code reviewer and coding mentor.

Analyze ONLY the supplied source code and the supplied analysis information.

Your job is to provide practical code-review feedback.

IMPORTANT RULES:

1. Analyze ONLY the supplied source code.

2. Do not invent functions, variables, APIs, libraries, database operations, vulnerabilities or problems.

3. If something cannot be determined from the source code, clearly say that it cannot be determined.

4. Preserve the existing programming language.

5. Preserve the existing module system.

6. Do not introduce a library unless it is already visible in the supplied code or the developer explicitly asks for it.

7. Do not change the overall functionality unless the developer explicitly asks for a functional change.

8. Recommendations must be practical and directly related to the supplied code.

9. Mention existing bugs when they are supported by the supplied code.

10. If the code is already good in an area, say so.

11. suggestedCode must contain code ONLY when an actual code improvement is useful.

12. If no code change is required, suggestedCode must be an empty string.

13. Do NOT return markdown code fences inside suggestedCode.

14. Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "short title",
  "answer": "detailed answer",
  "summary": "short summary",
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "suggestedCode": "",
  "severity": "low",
  "issues": [
    "issue 1",
    "issue 2"
  ]
}

Severity must be one of:

low
medium
high
critical
`
      },
      {
        role: "user",
        content: `
Developer Question:
${state.question}

Programming Language:
${state.language || "Unknown"}

Static Analysis:
${JSON.stringify(
  state.analysisSummary || {},
  null,
  2
)}

Detected Bugs:
${JSON.stringify(
  state.bugs || [],
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
      max_completion_tokens: 4000
    }
  );

  const content = response?.content;

  if (!content) {
    throw new Error(
      "Groq returned an empty recommendation response."
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
      "Unable to parse recommendation JSON:"
    );
    console.error(cleaned);

    throw new Error(
      "AI returned invalid recommendation JSON."
    );
  }

  return {
    result: {
      title:
        typeof result.title === "string" &&
        result.title.trim()
          ? result.title.trim()
          : "AI Code Analysis",

      answer:
        typeof result.answer === "string" &&
        result.answer.trim()
          ? result.answer.trim()
          : "No answer was generated.",

      summary:
        typeof result.summary === "string"
          ? result.summary.trim()
          : "",

      recommendations:
        Array.isArray(result.recommendations)
          ? result.recommendations.filter(
              (item) =>
                typeof item === "string"
            )
          : [],

      suggestedCode:
        typeof result.suggestedCode === "string"
          ? result.suggestedCode
          : "",

      severity: [
        "low",
        "medium",
        "high",
        "critical"
      ].includes(result.severity)
        ? result.severity
        : "low",

      issues:
        Array.isArray(result.issues)
          ? result.issues.filter(
              (item) =>
                typeof item === "string"
            )
          : [],

      model
    }
  };
};

export default recommendations;
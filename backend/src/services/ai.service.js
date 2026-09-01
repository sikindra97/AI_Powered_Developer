const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const buildPrompt = ({ code, language, analysis, question }) => {
  return `
You are an expert software engineer, code reviewer and coding mentor.

A developer selected one source-code file from a GitHub repository.

The developer's question is:

${question}

Programming language:

${language || "Unknown"}

Static analysis information:

Complexity:
${analysis?.complexity ?? "Not available"}

Quality Score:
${analysis?.qualityScore ?? "Not available"}

Maintainability Score:
${analysis?.maintainabilityScore ?? "Not available"}

Readability Score:
${analysis?.readabilityScore ?? "Not available"}

Security Score:
${analysis?.securityScore ?? "Not available"}

Bugs:
${analysis?.bugs ?? "Not available"}

Security Issues:
${analysis?.securityIssues ?? "Not available"}

Code Smells:
${analysis?.codeSmells ?? "Not available"}

SOURCE CODE
==================================================
${code}
IMPORTANT RULES:

1. Analyze ONLY the supplied source code.

2. Do not invent functions, variables, APIs, libraries, database operations, vulnerabilities or problems that are not present in the supplied code.

3. If something cannot be determined from the source code, clearly say that it cannot be determined.

4. Preserve the existing programming language.

5. Preserve the existing module system.

6. If the supplied project uses ES Modules with import/export, suggested code MUST also use ES Modules.

7. If the supplied project uses CommonJS with require/module.exports, CommonJS can be used.

8. Do not introduce libraries such as Joi, Winston, asyncHandler, express-validator or any other dependency unless that dependency is already visible in the supplied code.

9. Do not change the overall functionality unless the developer explicitly asks for a functional change.

10. Suggestions must be practical and directly related to the supplied code.

11. For code explanation:
- Explain the purpose of the file.
- Explain important imports.
- Explain important variables.
- Explain each important function.
- Explain the execution flow.
- Explain database operations if present.
- Explain API operations if present.
- Explain authentication/authorization if present.
- Use simple language.
- Give small examples when useful.

12. For bug detection:
- Identify only realistic bugs.
- Explain why each issue can happen.
- Explain edge cases.
- Give practical fixes.

13. For security review:
- Identify actual security risks.
- Explain their impact.
- Give practical fixes.

14. For code quality:
- Focus on readability.
- Maintainability.
- Duplication.
- Error handling.
- Naming.
- Structure.
- Practical refactoring.

15. If the existing code is already good in some area, say so.

16. suggestedCode should contain code ONLY when a useful code improvement is actually appropriate.

17. If no code change is required, suggestedCode must be an empty string.

18. Do NOT return markdown code fences inside suggestedCode.

19. Do NOT return markdown outside the JSON response.

20. Return ONLY valid JSON.

The JSON must have exactly this structure:

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
`;
};

const parseAIResponse = (content) => {
  if (!content || typeof content !== "string") {
    throw new Error("Groq returned an empty AI response.");
  }

  let cleaned = content.trim();

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
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Unable to parse AI JSON:");
    console.error(cleaned);
    throw new Error("AI returned invalid JSON content.");
  }
};

const generateAIInsight = async ({
  code,
  language,
  analysis,
  question
}) => {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured in .env.");
  }

  if (!code || !code.trim()) {
    throw new Error("Code is required.");
  }

  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  const prompt = buildPrompt({
    code,
    language,
    analysis,
    question
  });
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert software engineer and coding mentor. Analyze only the supplied source code and return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      response_format: {
        type: "json_object"
      },
      max_completion_tokens: 4000
    })
  });

  const responseText = await response.text();

  if (!response.ok) {
    let message =
      `Groq API request failed with status ${response.status}.`;

    try {
      const errorData = JSON.parse(responseText);
      message = errorData?.error?.message || message;
    } catch {}

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      "Groq returned an invalid HTTP JSON response."
    );
  }

  const content =
    data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty AI response.");
  }

  const result = parseAIResponse(content);

  return {
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
            (item) => typeof item === "string"
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
            (item) => typeof item === "string"
          )
        : [],

    model: data.model || model
  };
};

export default generateAIInsight;
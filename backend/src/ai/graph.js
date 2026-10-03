import {
  StateGraph,
  Annotation,
  START,
  END
} from "@langchain/langgraph";

import analyzeCode from "./nodes/analyzeCode.js";
import detectBugs from "./nodes/detectBugs.js";
import recommendations from "./nodes/recommendations.js";

import {
  retrieveRelevantCode,
  buildRagContext,
  buildSources
} from "../services/rag.service.js";

// --------------------------------------------------
// AI State
// --------------------------------------------------

const AIState =
  Annotation.Root({

    // Current selected file code
    code: Annotation(),

    // Programming language
    language: Annotation(),

    // Static code analysis
    analysis: Annotation(),

    // User question
    question: Annotation(),

    // Original question before RAG context
    originalQuestion: Annotation(),

    // Authenticated user
    userId: Annotation(),

    // Selected repository
    repositoryId: Annotation(),

    // Selected file
    filePath: Annotation(),

    // Retrieved RAG context
    context: Annotation(),

    // RAG sources
    sources: Annotation(),

    // Existing AI workflow state
    analysisSummary: Annotation(),

    bugs: Annotation(),

    result: Annotation()
  });

// --------------------------------------------------
// Node 1: Validate Input
// --------------------------------------------------

const validateInput =
  async (state) => {

    if (
      !state.code ||
      !state.code.trim()
    ) {
      throw new Error(
        "Code is required."
      );
    }

    if (
      !state.question ||
      !state.question.trim()
    ) {
      throw new Error(
        "Question is required."
      );
    }

    if (!state.userId) {
      throw new Error(
        "User ID is required."
      );
    }

    if (!state.repositoryId) {
      throw new Error(
        "Repository ID is required."
      );
    }

    if (!state.filePath) {
      throw new Error(
        "File path is required."
      );
    }

    if (!process.env.AI_API_KEY) {
      throw new Error(
        "AI_API_KEY is not configured in .env."
      );
    }

    return {
      originalQuestion:
        state.question.trim()
    };
  };

// --------------------------------------------------
// Node 2: Retrieve Relevant Context
// --------------------------------------------------

const retrieveContext =
  async (state) => {

    const question =
      state.originalQuestion ||
      state.question;

    // ----------------------------------------------
    // Retrieve only from selected file
    // ----------------------------------------------

    const documents =
      await retrieveRelevantCode({

        question,

        userId:
          state.userId,

        repositoryId:
          state.repositoryId,

        filePath:
          state.filePath,

        k: 5
      });

    // ----------------------------------------------
    // Build context
    // ----------------------------------------------

    const context =
      buildRagContext(
        documents
      );

    // ----------------------------------------------
    // Build sources
    // ----------------------------------------------

    const sources =
      buildSources(
        documents
      );

    // ----------------------------------------------
    // Enhanced AI prompt
    // ----------------------------------------------

    const enhancedQuestion = `
User Question:
${question}

Selected File:
${state.filePath}

Selected File Code:
${state.code}

Relevant Context From Selected File:
${
  context ||
  "No additional vector context was found."
}

Instructions:

1. Focus primarily on the selected file.

2. Treat the selected file code as the
   primary source of truth.

3. Use retrieved context only when it
   belongs to the selected file.

4. Do not use unrelated repository files
   to make conclusions about this code.

5. Do not invent repository-specific
   information.

6. If the code is correct, clearly state
   that there are no functional bugs.

7. Do not invent bugs just to provide
   an issue list.

8. Clearly distinguish:
   - Actual bugs
   - Edge cases
   - Security risks
   - Performance issues
   - Optional improvements

9. Explain everything in simple terms.

10. Provide practical fixes when an issue
    actually exists.
`;

    return {
      question:
        enhancedQuestion,

      context,

      sources
    };
  };

// --------------------------------------------------
// LangGraph Workflow
// --------------------------------------------------

const workflow =
  new StateGraph(
    AIState
  )

    // ----------------------------------------------
    // Validate
    // ----------------------------------------------

    .addNode(
      "validateInput",
      validateInput
    )

    // ----------------------------------------------
    // RAG
    // ----------------------------------------------

    .addNode(
      "retrieveContext",
      retrieveContext
    )

    // ----------------------------------------------
    // Code Analysis
    // ----------------------------------------------

    .addNode(
      "analyzeCode",
      analyzeCode
    )

    // ----------------------------------------------
    // Bug Detection
    // ----------------------------------------------

    .addNode(
      "detectBugs",
      detectBugs
    )

    // ----------------------------------------------
    // Recommendations
    // ----------------------------------------------

    .addNode(
      "recommendations",
      recommendations
    )

    // ----------------------------------------------
    // START
    // ----------------------------------------------

    .addEdge(
      START,
      "validateInput"
    )

    // ----------------------------------------------
    // Validate → RAG
    // ----------------------------------------------

    .addEdge(
      "validateInput",
      "retrieveContext"
    )

    // ----------------------------------------------
    // RAG → Analyze
    // ----------------------------------------------

    .addEdge(
      "retrieveContext",
      "analyzeCode"
    )

    // ----------------------------------------------
    // Analyze → Bug Detection
    // ----------------------------------------------

    .addEdge(
      "analyzeCode",
      "detectBugs"
    )

    // ----------------------------------------------
    // Bug Detection → Recommendations
    // ----------------------------------------------

    .addEdge(
      "detectBugs",
      "recommendations"
    )

    // ----------------------------------------------
    // Recommendations → END
    // ----------------------------------------------

    .addEdge(
      "recommendations",
      END
    );

// --------------------------------------------------
// Compile Graph
// --------------------------------------------------

const aiGraph =
  workflow.compile();

export default aiGraph;
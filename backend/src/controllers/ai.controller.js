import crypto from "crypto";

import User from "../models/User.js";
import Repository from "../models/Repository.js";
import CodeAnalysis from "../models/CodeAnalysis.js";
import AIInsight from "../models/AIInsight.js";

import {
  getRepositoryFile
} from "../services/github.service.js";

import generateAIInsight from "../services/ai.service.js";

import {
  indexCodeFile
} from "../services/rag.service.js";

// --------------------------------------------------
// Analyze With AI
// --------------------------------------------------

const analyzeWithAI = async (req, res) => {
  try {
    const {
      question,
      repositoryId,
      filePath
    } = req.body;

    // ------------------------------------------------
    // Validate request
    // ------------------------------------------------

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required."
      });
    }

    if (!repositoryId) {
      return res.status(400).json({
        success: false,
        message:
          "Repository ID is required."
      });
    }

    if (!filePath?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "File path is required."
      });
    }

    // ------------------------------------------------
    // Get user
    // ------------------------------------------------

    const user =
      await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // ------------------------------------------------
    // Check GitHub
    // ------------------------------------------------

    if (!user.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message:
          "GitHub account is not connected."
      });
    }

    // ------------------------------------------------
    // Verify repository belongs to user
    // ------------------------------------------------

    const repository =
      await Repository.findOne({
        _id: repositoryId,
        userId: req.user._id
      });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message:
          "Repository not found."
      });
    }

    // ------------------------------------------------
    // Get owner/repository
    // ------------------------------------------------

    const [
      owner,
      repoName
    ] = (
      repository.fullName ||
      ""
    ).split("/");

    if (!owner || !repoName) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid repository information."
      });
    }

    // ------------------------------------------------
    // Fetch file from GitHub
    // ------------------------------------------------

    const file =
      await getRepositoryFile(
        user.githubAccessToken,

        owner,

        repoName,

        filePath,

        repository.defaultBranch ||
          "main"
      );

    if (!file?.code?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Selected file is empty or could not be loaded."
      });
    }

    // ------------------------------------------------
    // Hash code
    // ------------------------------------------------

    const codeHash =
      crypto
        .createHash("sha256")
        .update(file.code)
        .digest("hex");

    // ------------------------------------------------
    // Detect language
    // ------------------------------------------------

    const language =
      detectLanguage(file.path);

    // ------------------------------------------------
    // Hash question
    // ------------------------------------------------

    const questionHash =
      crypto
        .createHash("sha256")
        .update(
          question
            .trim()
            .toLowerCase()
        )
        .digest("hex");

    // ------------------------------------------------
    // Check cached AI response
    // ------------------------------------------------

    const existingInsight =
      await AIInsight.findOne({
        userId: user._id,

        repositoryId:
          repository._id,

        filePath: file.path,

        codeHash,

        questionHash,

        type: "code_explanation"
      }).sort({
        createdAt: -1
      });

    if (existingInsight?.description) {
      return res.status(200).json({
        success: true,

        cached: true,

        message:
          "Existing AI response returned.",

        answer:
          existingInsight.description,

        data: {
          insight:
            existingInsight,

          title:
            existingInsight.title,

          summary:
            existingInsight.summary ||
            "",

          recommendations:
            existingInsight.recommendation
              ? existingInsight
                  .recommendation
                  .split("\n")
                  .filter(Boolean)
              : [],

          suggestedCode:
            existingInsight.suggestedCode ||
            "",

          severity:
            existingInsight.severity ||
            "low",

          issues:
            existingInsight.issues ||
            [],

          model:
            existingInsight.model ||
            null
        }
      });
    }

    // ------------------------------------------------
    // Get static code analysis
    // ------------------------------------------------

    const codeAnalysis =
      await CodeAnalysis.findOne({
        repositoryId:
          repository._id,

        filePath:
          file.path,

        codeHash
      });

    // ------------------------------------------------
    // RAG: Index current file
    // ------------------------------------------------

    const vectorResult =
      await indexCodeFile({
        userId:
          user._id,

        repositoryId:
          repository._id,

        filePath:
          file.path,

        language,

        code:
          file.code
      });

    console.log(
      "RAG indexing:",
      vectorResult
    );

    // ------------------------------------------------
    // Generate AI response
    // ------------------------------------------------

   const aiResult =
  await generateAIInsight({
    code: file.code,

    language,

    analysis:
      codeAnalysis || {},

    question:
      question.trim(),

    userId:
      user._id,

    repositoryId:
      repository._id,

    filePath:
      file.path
  });

    // ------------------------------------------------
    // Save AI Insight
    // ------------------------------------------------

    const insight =
      await AIInsight.create({
        userId:
          user._id,

        repositoryId:
          repository._id,

        codeAnalysisId:
          codeAnalysis?._id ||
          null,

        filePath:
          file.path,

        codeHash,

        questionHash,

        type:
          "code_explanation",

        title:
          aiResult.title ||
          "AI Code Analysis",

        description:
          aiResult.answer ||
          "",

        summary:
          aiResult.summary ||
          "",

        recommendation:
          Array.isArray(
            aiResult.recommendations
          )
            ? aiResult.recommendations.join(
                "\n"
              )
            : "",

        suggestedCode:
          aiResult.suggestedCode ||
          "",

        severity:
          aiResult.severity ||
          "low",

        issues:
          Array.isArray(
            aiResult.issues
          )
            ? aiResult.issues
            : [],

        model:
          aiResult.model ||
          null,

        promptVersion:
          "4.0",

        status:
          "generated"
      });

    // ------------------------------------------------
    // Response
    // ------------------------------------------------

    return res.status(200).json({
      success: true,

      cached: false,

      message:
        "AI analysis completed successfully.",

      answer:
        aiResult.answer,

      data: {
        insight,

        title:
          aiResult.title,

        summary:
          aiResult.summary,

        recommendations:
          aiResult.recommendations,

        suggestedCode:
          aiResult.suggestedCode,

        severity:
          aiResult.severity,

        issues:
          aiResult.issues,

        model:
          aiResult.model,

        sources:
          aiResult.sources || [],

        rag: {
          enabled: true,

          chunksIndexed:
            vectorResult.chunksIndexed
        }
      }
    });
  } catch (error) {
    console.error(
      "AI Analysis Error:",
      error
    );

    return res.status(
      error.status || 500
    ).json({
      success: false,

      message:
        "Failed to generate AI response.",

      error:
        error.message
    });
  }
};

// --------------------------------------------------
// Get AI Insights
// --------------------------------------------------

const getAIInsights = async (
  req,
  res
) => {
  try {
    const repository =
      await Repository.findOne({
        _id:
          req.params.repositoryId,

        userId:
          req.user._id
      });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message:
          "Repository not found."
      });
    }

    const filter = {
      userId:
        req.user._id,

      repositoryId:
        repository._id
    };

    if (req.query.type) {
      filter.type =
        req.query.type;
    }

    if (req.query.severity) {
      filter.severity =
        req.query.severity;
    }

    const insights =
      await AIInsight.find(filter)
        .sort({
          createdAt: -1
        });

    return res.status(200).json({
      success: true,

      count:
        insights.length,

      data:
        insights
    });
  } catch (error) {
    console.error(
      "Get AI Insights Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch AI insights.",

      error:
        error.message
    });
  }
};

// --------------------------------------------------
// Get AI Insight By ID
// --------------------------------------------------

const getAIInsightById = async (
  req,
  res
) => {
  try {
    const insight =
      await AIInsight.findOne({
        _id:
          req.params.insightId,

        userId:
          req.user._id,

        repositoryId:
          req.params.repositoryId
      });

    if (!insight) {
      return res.status(404).json({
        success: false,
        message:
          "AI insight not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error(
      "Get AI Insight Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch AI insight.",

      error:
        error.message
    });
  }
};

// --------------------------------------------------
// Update AI Insight Status
// --------------------------------------------------

const updateAIInsightStatus = async (
  req,
  res
) => {
  try {
    const { status } =
      req.body;

    const allowedStatuses = [
      "generated",
      "accepted",
      "dismissed"
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Status must be generated, accepted or dismissed."
      });
    }

    const insight =
      await AIInsight.findOneAndUpdate(
        {
          _id:
            req.params.insightId,

          userId:
            req.user._id,

          repositoryId:
            req.params.repositoryId
        },

        {
          status
        },

         {
  returnDocument: "after"
         },

        
      );

    if (!insight) {
      return res.status(404).json({
        success: false,

        message:
          "AI insight not found."
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "AI insight status updated.",

      data:
        insight
    });
  } catch (error) {
    console.error(
      "Update AI Insight Status Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to update AI insight status.",

      error:
        error.message
    });
  }
};

// --------------------------------------------------
// Detect Language
// --------------------------------------------------

const detectLanguage = (
  filePath
) => {
  const extension =
    filePath
      .split(".")
      .pop()
      ?.toLowerCase();

  const languages = {
    js: "JavaScript",
    jsx: "JavaScript",

    ts: "TypeScript",
    tsx: "TypeScript",

    java: "Java",

    py: "Python",

    cpp: "C++",
    cc: "C++",
    cxx: "C++",

    c: "C",

    h: "C",
    hpp: "C++",

    go: "Go",

    rs: "Rust",

    php: "PHP",

    rb: "Ruby",

    swift: "Swift",

    kt: "Kotlin",

    dart: "Dart",

    cs: "C#",

    html: "HTML",

    css: "CSS",

    scss: "SCSS",

    sql: "SQL",

    json: "JSON",

    sh: "Shell",
    bash: "Shell",

    yml: "YAML",
    yaml: "YAML",

    xml: "XML"
  };

  return (
    languages[extension] ||
    "Unknown"
  );
};

export {
  analyzeWithAI,
  getAIInsights,
  getAIInsightById,
  updateAIInsightStatus
};
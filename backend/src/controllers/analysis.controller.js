import CodeAnalysis from "../models/CodeAnalysis.js";
import Repository from "../models/Repository.js";
import User from "../models/User.js";
import {
  getRepositoryFiles,
  getRepositoryFile
} from "../services/github.service.js";
import { analyzeCode } from "../services/analysis.service.js";

const getLanguageFromFile = (filePath) => {
  const extension = filePath
    .split(".")
    .pop()
    ?.toLowerCase();

  const languages = {
    js: "JavaScript",
    jsx: "JavaScript",
    ts: "TypeScript",
    tsx: "TypeScript",
    java: "Java",
    c: "C",
    h: "C",
    cpp: "C++",
    cc: "C++",
    cxx: "C++",
    hpp: "C++",
    py: "Python",
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
    json: "JSON",
    sql: "SQL",
    sh: "Shell",
    bash: "Shell",
    yml: "YAML",
    yaml: "YAML",
    xml: "XML"
  };

  return languages[extension] || "Unknown";
};

const findUserRepository = async (repositoryId, userId) => {
  return Repository.findOne({
    _id: repositoryId,
    userId
  });
};

const getGithubUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.githubAccessToken) {
    throw new Error("GitHub account is not connected.");
  }

  return user;
};

const getAnalysisFiles = async (req, res) => {
  try {
    const { repositoryId } = req.params;

    const repository = await findUserRepository(
      repositoryId,
      req.user._id
    );

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found."
      });
    }

    if (!repository.fullName) {
      return res.status(400).json({
        success: false,
        message: "Repository GitHub information is missing."
      });
    }

    const user = await getGithubUser(req.user._id);
    const [owner, repoName] = repository.fullName.split("/");

    if (!owner || !repoName) {
      return res.status(400).json({
        success: false,
        message: "Invalid repository information."
      });
    }

    const files = await getRepositoryFiles(
      user.githubAccessToken,
      owner,
      repoName,
      repository.defaultBranch || "main"
    );

    return res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    console.error("Get Analysis Files Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch repository files.",
      error: error.message
    });
  }
};

const analyzeRepositoryCode = async (req, res) => {
  try {
    const { repositoryId } = req.params;
    const { filePath } = req.body;

    if (!filePath?.trim()) {
      return res.status(400).json({
        success: false,
        message: "File path is required."
      });
    }

    const repository = await findUserRepository(
      repositoryId,
      req.user._id
    );

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found."
      });
    }

    if (!repository.fullName) {
      return res.status(400).json({
        success: false,
        message: "Repository GitHub information is missing."
      });
    }

    const user = await getGithubUser(req.user._id);
    const [owner, repoName] = repository.fullName.split("/");

    if (!owner || !repoName) {
      return res.status(400).json({
        success: false,
        message: "Invalid repository information."
      });
    }

    const file = await getRepositoryFile(
      user.githubAccessToken,
      owner,
      repoName,
      filePath.trim(),
      repository.defaultBranch || "main"
    );

    if (!file?.code?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Selected file is empty."
      });
    }

    const language = getLanguageFromFile(file.path);
    const analysis = analyzeCode(file.code);

    const codeAnalysis = await CodeAnalysis.findOneAndUpdate(
      {
        repositoryId: repository._id,
        filePath: file.path,
        codeHash: analysis.codeHash
      },
      {
        repositoryId: repository._id,
        filePath: file.path,
        language,
        codeHash: analysis.codeHash,
        complexity: analysis.complexity,
        qualityScore: analysis.qualityScore,
        maintainabilityScore: analysis.maintainabilityScore,
        readabilityScore: analysis.readabilityScore,
        securityScore: analysis.securityScore,
        bugs: analysis.bugs || 0,
        securityIssues: analysis.securityIssues || 0,
        codeSmells: analysis.codeSmells || 0,
        duplicationPercentage: analysis.duplicationPercentage || 0,
        issues: analysis.issues || [],
        analysisStatus: "completed",
        analyzedAt: new Date()
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Code analyzed successfully.",
      data: {
        ...codeAnalysis.toObject(),
        metrics: {
          totalLines: analysis.totalLines,
          blankLines: analysis.blankLines,
          commentLines: analysis.commentLines,
          codeLines: analysis.codeLines
        },
        issues: analysis.issues || []
      }
    });
  } catch (error) {
    console.error("Code Analysis Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze code.",
      error: error.message
    });
  }
};

const getAnalyses = async (req, res) => {
  try {
    const { repositoryId } = req.params;

    const repository = await findUserRepository(
      repositoryId,
      req.user._id
    );

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found."
      });
    }

    const analyses = await CodeAnalysis.find({
      repositoryId: repository._id
    }).sort({
      analyzedAt: -1
    });

    return res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    console.error("Get Code Analyses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch code analyses.",
      error: error.message
    });
  }
};

const getAnalysisById = async (req, res) => {
  try {
    const { repositoryId, analysisId } = req.params;

    const repository = await findUserRepository(
      repositoryId,
      req.user._id
    );

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found."
      });
    }

    const analysis = await CodeAnalysis.findOne({
      _id: analysisId,
      repositoryId: repository._id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Code analysis not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error("Get Code Analysis Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch code analysis.",
      error: error.message
    });
  }
};

export {
  getAnalysisFiles,
  analyzeRepositoryCode,
  getAnalyses,
  getAnalysisById
};
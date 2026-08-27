import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "General"
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "info"],
      default: "info"
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    recommendation: {
      type: String,
      required: true
    }
  },
  {
    _id: false
  }
);

const codeAnalysisSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true
    },

    filePath: {
      type: String,
      required: true,
      trim: true
    },

    language: {
      type: String,
      default: null
    },

    codeHash: {
      type: String,
      required: true
    },

    complexity: {
      type: Number,
      default: 0
    },

    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    maintainabilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    readabilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    securityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    bugs: {
      type: Number,
      default: 0
    },

    securityIssues: {
      type: Number,
      default: 0
    },

    codeSmells: {
      type: Number,
      default: 0
    },

    duplicationPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    issues: {
      type: [issueSchema],
      default: []
    },

    analysisStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed"
      ],
      default: "pending"
    },

    analyzedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

codeAnalysisSchema.index(
  {
    repositoryId: 1,
    filePath: 1,
    codeHash: 1
  },
  {
    unique: true
  }
);

codeAnalysisSchema.index({
  repositoryId: 1,
  analyzedAt: -1
});

const CodeAnalysis = mongoose.model(
  "CodeAnalysis",
  codeAnalysisSchema
);

export default CodeAnalysis;
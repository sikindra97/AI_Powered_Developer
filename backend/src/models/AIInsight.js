import mongoose from "mongoose";

const aiInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true
    },

    codeAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeAnalysis",
      default: null
    },

    filePath: {
      type: String,
      default: null,
      trim: true
    },

    codeHash: {
      type: String,
      default: null
    },

    questionHash: {
      type: String,
      default: null
    },

    type: {
      type: String,
      enum: [
        "code_review",
        "bug_detection",
        "security",
        "performance",
        "code_explanation",
        "productivity"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: null
    },

    summary: {
      type: String,
      default: null
    },

    severity: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "critical"
      ],
      default: "low"
    },

    recommendation: {
      type: String,
      default: null
    },

    suggestedCode: {
      type: String,
      default: null
    },

    issues: {
      type: [String],
      default: []
    },

    promptVersion: {
      type: String,
      default: "3.0"
    },

    model: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: [
        "generated",
        "accepted",
        "dismissed"
      ],
      default: "generated"
    }
  },
  {
    timestamps: true
  }
);

aiInsightSchema.index({
  userId: 1,
  repositoryId: 1,
  filePath: 1,
  codeHash: 1,
  questionHash: 1,
  type: 1
});

aiInsightSchema.index({
  repositoryId: 1,
  createdAt: -1
});

aiInsightSchema.index({
  userId: 1,
  createdAt: -1
});

const AIInsight = mongoose.model(
  "AIInsight",
  aiInsightSchema
);

export default AIInsight;
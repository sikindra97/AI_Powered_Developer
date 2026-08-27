import mongoose from "mongoose";

const productivityScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      default: null
    },

    period: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    commitScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    pullRequestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    issueScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    consistencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    qualityScore: {
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

    codeQualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    totalCommits: {
      type: Number,
      min: 0,
      default: 0
    },

    totalPullRequests: {
      type: Number,
      min: 0,
      default: 0
    },

    mergedPullRequests: {
      type: Number,
      min: 0,
      default: 0
    },

    issuesOpened: {
      type: Number,
      min: 0,
      default: 0
    },

    issuesClosed: {
      type: Number,
      min: 0,
      default: 0
    },

    averagePrMergeTime: {
      type: Number,
      min: 0,
      default: 0
    },

    activeCodingDays: {
      type: Number,
      min: 0,
      default: 0
    },

    aiRecommendationsCount: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

productivityScoreSchema.index(
  {
    userId: 1,
    repositoryId: 1,
    period: 1,
    startDate: 1
  },
  {
    unique: true
  }
);

productivityScoreSchema.index({
  userId: 1,
  repositoryId: 1,
  period: 1,
  startDate: -1
});

const ProductivityScore = mongoose.model(
  "ProductivityScore",
  productivityScoreSchema
);

export default ProductivityScore;
import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    githubRepoId: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: null
    },

    url: {
      type: String,
      required: true
    },

    language: {
      type: String,
      default: null
    },

    stars: {
      type: Number,
      default: 0
    },

    forks: {
      type: Number,
      default: 0
    },

    openIssues: {
      type: Number,
      default: 0
    },

    isPrivate: {
      type: Boolean,
      default: false
    },

    defaultBranch: {
      type: String,
      default: "main"
    },

    lastSyncedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

repositorySchema.index(
  {
    userId: 1,
    githubRepoId: 1
  },
  {
    unique: true
  }
);

const Repository = mongoose.model(
  "Repository",
  repositorySchema
);

export default Repository;
import mongoose from "mongoose";

const commitSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true
    },

    githubCommitId: {
      type: String,
      required: true
    },

    sha: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    authorName: {
      type: String,
      default: null
    },

    authorEmail: {
      type: String,
      default: null
    },

    authorGithubUsername: {
      type: String,
      default: null
    },

    additions: {
      type: Number,
      default: 0
    },

    deletions: {
      type: Number,
      default: 0
    },

    changedFiles: {
      type: Number,
      default: 0
    },

    branch: {
      type: String,
      default: null
    },

    committedAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

commitSchema.index(
  {
    repositoryId: 1,
    githubCommitId: 1
  },
  {
    unique: true
  }
);

commitSchema.index({
  repositoryId: 1,
  committedAt: -1
});

const Commit = mongoose.model("Commit", commitSchema);

export default Commit;
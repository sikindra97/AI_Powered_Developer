import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true
    },

    githubIssueId: {
      type: Number,
      required: true
    },

    number: {
      type: Number,
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

    authorGithubUsername: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },

    labels: {
      type: [String],
      default: []
    },

    commentsCount: {
      type: Number,
      default: 0
    },

    createdAtGithub: {
      type: Date,
      required: true
    },

    closedAtGithub: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

issueSchema.index(
  {
    repositoryId: 1,
    githubIssueId: 1
  },
  {
    unique: true
  }
);

issueSchema.index({
  repositoryId: 1,
  status: 1
});

issueSchema.index({
  repositoryId: 1,
  createdAtGithub: -1
});

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;
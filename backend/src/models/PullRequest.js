import mongoose from "mongoose"; 
 
const pullRequestSchema = new mongoose.Schema( 
  { 
    repositoryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Repository", 
      required: true 
    }, 
 
    githubPrId: { 
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
      enum: ["open", "closed", "merged"], 
      default: "open" 
    }, 
 
    sourceBranch: { 
      type: String, 
      default: null 
    }, 
 
    targetBranch: { 
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
 
    reviewCount: { 
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
    }, 
 
    mergedAtGithub: { 
      type: Date, 
      default: null 
    } 
  }, 
  { 
    timestamps: true 
  } 
); 
 
pullRequestSchema.index( 
  { repositoryId: 1, githubPrId: 1 }, 
  { unique: true } 
); 
 
pullRequestSchema.index({ 
  repositoryId: 1, 
  createdAtGithub: -1 
}); 
 
const PullRequest = mongoose.model( 
  "PullRequest", 
  pullRequestSchema 
); 
 
export default PullRequest; 
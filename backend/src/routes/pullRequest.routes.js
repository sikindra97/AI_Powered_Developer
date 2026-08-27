import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
  syncPullRequests,
  getPullRequests,
  getPullRequestById
} from "../controllers/pullRequest.controller.js";

const router = express.Router();

// Sync Pull Requests from GitHub
router.post(
  "/:repositoryId/sync",
  protect,
  syncPullRequests
);

// Get all Pull Requests of a repository
router.get(
  "/:repositoryId",
  protect,
  getPullRequests
);

// Get single Pull Request
router.get(
  "/:repositoryId/:pullRequestId",
  protect,
  getPullRequestById
);

export default router;
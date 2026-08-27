import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
  syncCommits,
  getCommits,
  getCommitById
} from "../controllers/commit.controller.js";

const router = express.Router();

// Sync commits from GitHub
router.post(
  "/:repositoryId/sync",
  protect,
  syncCommits
);

// Get commits of a repository
router.get(
  "/:repositoryId",
  protect,
  getCommits
);

// Get single commit
router.get(
  "/:repositoryId/:commitId",
  protect,
  getCommitById
);

export default router;
import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
  syncIssues,
  getIssues,
  getIssueById
} from "../controllers/issue.controller.js";

const router = express.Router();

// Sync issues from GitHub
router.post(
  "/:repositoryId/sync",
  protect,
  syncIssues
);

// Get all issues of a repository
router.get(
  "/:repositoryId",
  protect,
  getIssues
);

// Get single issue
router.get(
  "/:repositoryId/:issueId",
  protect,
  getIssueById
);

export default router;
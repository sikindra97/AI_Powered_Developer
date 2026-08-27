import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  githubLogin,
  githubCallback,
  connectGithub,
  getGithubProfile,
  getGithubRepositories,
  getGithubRepository,
  getGithubCommits,
  getGithubPullRequests,
  getGithubIssues
} from "../controllers/github.controller.js";

const router = express.Router();

router.get("/login", protect, githubLogin);

router.get("/callback", githubCallback);

router.post("/connect", protect, connectGithub);

router.get("/profile", protect, getGithubProfile);

router.get(
  "/repositories",
  protect,
  getGithubRepositories
);

router.get(
  "/repositories/:owner/:repo",
  protect,
  getGithubRepository
);

router.get(
  "/repositories/:owner/:repo/commits",
  protect,
  getGithubCommits
);

router.get(
  "/repositories/:owner/:repo/pulls",
  protect,
  getGithubPullRequests
);

router.get(
  "/repositories/:owner/:repo/issues",
  protect,
  getGithubIssues
);

export default router;
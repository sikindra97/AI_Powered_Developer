import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  calculateUserProductivity,
  calculateRepositoryProductivity,
  getProductivityHistory,
  getRepositoryProductivityHistory
} from "../controllers/productivity.controller.js";

const router = express.Router();

router.get(
  "/",
  protect,
  calculateUserProductivity
);

router.get(
  "/history",
  protect,
  getProductivityHistory
);

router.get(
  "/repository/:repositoryId",
  protect,
  calculateRepositoryProductivity
);

router.get(
  "/repository/:repositoryId/history",
  protect,
  getRepositoryProductivityHistory
);

export default router;
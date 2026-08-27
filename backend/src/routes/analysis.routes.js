import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  getAnalysisFiles,
  analyzeRepositoryCode,
  getAnalyses,
  getAnalysisById
} from "../controllers/analysis.controller.js";

const router = express.Router();

router.get(
  "/:repositoryId/files",
  protect,
  getAnalysisFiles
);

router.post(
  "/:repositoryId",
  protect,
  analyzeRepositoryCode
);

router.get(
  "/:repositoryId",
  protect,
  getAnalyses
);

router.get(
  "/:repositoryId/:analysisId",
  protect,
  getAnalysisById
);

export default router;
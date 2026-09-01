import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  analyzeWithAI,
  getAIInsights,
  getAIInsightById,
  updateAIInsightStatus
} from "../controllers/ai.controller.js";

const router = express.Router();
router.post("/ask", protect, analyzeWithAI);

router.get("/:repositoryId", protect, getAIInsights);

router.get(
  "/:repositoryId/:insightId",
  protect,
  getAIInsightById
);

router.patch(
  "/:repositoryId/:insightId/status",
  protect,
  updateAIInsightStatus
);

export default router;
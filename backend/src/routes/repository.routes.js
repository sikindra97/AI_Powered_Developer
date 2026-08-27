import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
  sync,
  getAll,
  getOne,
  refresh,
  remove
} from "../controllers/repository.controller.js";

const router = express.Router();

router.post("/sync", protect, sync);

router.get("/", protect, getAll);

router.get("/:id", protect, getOne);

router.put("/:id/refresh", protect, refresh);

router.delete("/:id", protect, remove);

export default router;
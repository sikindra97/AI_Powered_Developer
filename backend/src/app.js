import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import githubRoutes from "./routes/github.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import commitRoutes from "./routes/commit.routes.js";
import pullRequestRoutes from "./routes/pullRequest.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import productivityRoutes from "./routes/productivity.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Developer Productivity API is running."
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/commits", commitRoutes);
app.use("/api/pull-requests", pullRequestRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/productivity", productivityRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error."
  });
});

export default app;
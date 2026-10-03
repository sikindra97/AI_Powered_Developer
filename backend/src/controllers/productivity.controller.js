import mongoose from "mongoose";

import Repository from "../models/Repository.js";
import ProductivityScore from "../models/ProductivityScore.js";

import {
  calculateProductivity
} from "../services/productivity.service.js";

import {
  syncRepositories
} from "../services/repository.service.js";

import {
  syncRepositoryActivity
} from "../services/github.service.js";
// Allowed Periods
const ALLOWED_PERIODS = [
  "daily",
  "weekly",
  "monthly"
];

const validatePeriod = (period) =>
  ALLOWED_PERIODS.includes(period);
// Sync All User Repository Activity


const syncAllUserRepositories = async (
  userId
) => {
  const repositories =
    await syncRepositories(userId);

  const syncResults = [];

  for (const repository of repositories) {
    try {
      const result =
        await syncRepositoryActivity({
          userId,
          repositoryId:
            repository._id
        });

      syncResults.push({
        repositoryId:
          repository._id,

        name:
          repository.name,

        success: true,

        commits:
          result?.commits || 0,

        pullRequests:
          result?.pullRequests || 0,

        issues:
          result?.issues || 0
      });
    } catch (error) {
      console.error(
        `Failed to sync repository ${repository.name}:`,
        error.message
      );

      syncResults.push({
        repositoryId:
          repository._id,

        name:
          repository.name,

        success: false,

        error:
          error.message
      });
    }
  }

  return {
    repositoryCount:
      repositories.length,

    repositories:
      syncResults
  };
};

const calculateUserProductivity = async (
  req,
  res
) => {
  try {
    const {
      period = "weekly"
    } = req.query;

    if (!validatePeriod(period)) {
      return res.status(400).json({
        success: false,
        message:
          "Period must be daily, weekly or monthly."
      });
    }

    // Sync repositories + GitHub activity
    const syncResult =
      await syncAllUserRepositories(
        req.user._id
      );

    // Calculate productivity
    const productivity =
      await calculateProductivity({
        userId: req.user._id,

        repositoryId: null,

        period
      });

    // Save/update productivity
    const score =
      await ProductivityScore.findOneAndUpdate(
        {
          userId: req.user._id,

          repositoryId: null,

          period,

          startDate:
            productivity.startDate
        },
        {
          $set: productivity
        },
        {
  returnDocument: "after",

  upsert: true,

  setDefaultsOnInsert: true
}
      );

    return res.status(200).json({
      success: true,

      message:
        "Productivity score calculated successfully.",

      sync: syncResult,

      data: score
    });
  } catch (error) {
    console.error(
      "Calculate Productivity Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to calculate productivity score.",

      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message
    });
  }
};
const calculateRepositoryProductivity =
  async (req, res) => {
    try {
      const {
        period = "weekly"
      } = req.query;

      const {
        repositoryId
      } = req.params;

      if (!validatePeriod(period)) {
        return res.status(400).json({
          success: false,
          message:
            "Period must be daily, weekly or monthly."
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          repositoryId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid repository ID."
        });
      }

      // Make sure repository belongs to user
      const repository =
        await Repository.findOne({
          _id: repositoryId,

          userId: req.user._id
        });

      if (!repository) {
        return res.status(404).json({
          success: false,
          message:
            "Repository not found."
        });
      }

      // Sync repository activity
      const syncResult =
        await syncRepositoryActivity({
          userId: req.user._id,

          repositoryId:
            repository._id
        });

      // Calculate productivity
      const productivity =
        await calculateProductivity({
          userId: req.user._id,

          repositoryId:
            repository._id,

          period
        });

      // Save/update
      const score =
        await ProductivityScore.findOneAndUpdate(
          {
            userId: req.user._id,

            repositoryId:
              repository._id,

            period,

            startDate:
              productivity.startDate
          },
          {
            $set: productivity
          },
          {
             returnDocument: "after",

            upsert: true,

            setDefaultsOnInsert: true
          }
        );

      return res.status(200).json({
        success: true,

        message:
          "Repository productivity score calculated successfully.",

        sync: {
          commits:
            syncResult?.commits || 0,

          pullRequests:
            syncResult?.pullRequests || 0,

          issues:
            syncResult?.issues || 0,

          syncedAt:
            syncResult?.syncedAt ||
            new Date()
        },

        data: score
      });
    } catch (error) {
      console.error(
        "Repository Productivity Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to calculate repository productivity.",

        error:
          process.env.NODE_ENV ===
          "production"
            ? undefined
            : error.message
      });
    }
  };

const getProductivityHistory = async (
  req,
  res
) => {
  try {
    const {
      period = "weekly"
    } = req.query;

    if (!validatePeriod(period)) {
      return res.status(400).json({
        success: false,
        message:
          "Period must be daily, weekly or monthly."
      });
    }

    const scores =
      await ProductivityScore.find({
        userId: req.user._id,

        repositoryId: null,

        period
      })
        .sort({
          startDate: -1
        })
        .limit(30)
        .lean();

    return res.status(200).json({
      success: true,

      count: scores.length,

      data: scores
    });
  } catch (error) {
    console.error(
      "Productivity History Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch productivity history.",

      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message
    });
  }
};
const getRepositoryProductivityHistory =
  async (req, res) => {
    try {
      const {
        period = "weekly"
      } = req.query;

      const {
        repositoryId
      } = req.params;

      if (!validatePeriod(period)) {
        return res.status(400).json({
          success: false,
          message:
            "Period must be daily, weekly or monthly."
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          repositoryId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid repository ID."
        });
      }

      const repository =
        await Repository.findOne({
          _id: repositoryId,

          userId: req.user._id
        });

      if (!repository) {
        return res.status(404).json({
          success: false,
          message:
            "Repository not found."
        });
      }

      const scores =
        await ProductivityScore.find({
          userId: req.user._id,

          repositoryId:
            repository._id,

          period
        })
          .sort({
            startDate: -1
          })
          .limit(30)
          .lean();

      return res.status(200).json({
        success: true,

        count: scores.length,

        data: scores
      });
    } catch (error) {
      console.error(
        "Repository Productivity History Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch repository productivity history.",

        error:
          process.env.NODE_ENV ===
          "production"
            ? undefined
            : error.message
      });
    }
  };
export {
  calculateUserProductivity,
  calculateRepositoryProductivity,
  getProductivityHistory,
  getRepositoryProductivityHistory
};
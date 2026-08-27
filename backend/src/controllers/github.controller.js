import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  getGithubOAuthUrl,
  exchangeCodeForToken,
  getGithubUser,
  getUserRepositories,
  getRepository,
  getRepositoryCommits,
  getRepositoryPullRequests,
  getRepositoryIssues,
  connectGithubAccount
} from "../services/github.service.js";

const githubLogin = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required."
      });
    }

    const state = jwt.sign(
      { userId: String(userId) },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const githubUrl = getGithubOAuthUrl(state);

    return res.status(200).json({
      success: true,
      data: {
        url: githubUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

const githubCallback = async (req, res, next) => {
  try {
    const {
      code,
      state,
      error: githubError
    } = req.query;

    if (githubError || !code || !state) {
      return res.redirect(
        `${process.env.CLIENT_URL}/github/connect?status=error`
      );
    }

    let decodedState;

    try {
      decodedState = jwt.verify(
        state,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.redirect(
        `${process.env.CLIENT_URL}/github/connect?status=error`
      );
    }

    const userId = decodedState?.userId;

    if (!userId) {
      return res.redirect(
        `${process.env.CLIENT_URL}/github/connect?status=error`
      );
    }

    const accessToken = await exchangeCodeForToken(code);

    await connectGithubAccount(
      userId,
      accessToken
    );

    return res.redirect(
      `${process.env.CLIENT_URL}/github/connect?status=success`
    );
  } catch (error) {
    console.error("GitHub callback error:", error);

    return res.redirect(
      `${process.env.CLIENT_URL}/github/connect?status=error`
    );
  }
};

const connectGithub = async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub access token is required."
      });
    }

    const user = await connectGithubAccount(
      req.user._id,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "GitHub account connected successfully.",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const getGithubProfile = async (req, res, next) => {
  try {
    const user = await User.findById(
      req.user._id
    ).select("+githubAccessToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (!user.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub account is not connected."
      });
    }

    const profile = await getGithubUser(
      user.githubAccessToken
    );

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

const getGithubRepositories = async (req, res, next) => {
  try {
    const user = await User.findById(
      req.user._id
    ).select("+githubAccessToken");

    if (!user?.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub account is not connected."
      });
    }

    const repositories = await getUserRepositories(
      user.githubAccessToken
    );

    return res.status(200).json({
      success: true,
      data: repositories
    });
  } catch (error) {
    next(error);
  }
};

const getGithubRepository = async (req, res, next) => {
  try {
    const { owner, repo } = req.params;

    const user = await User.findById(
      req.user._id
    ).select("+githubAccessToken");

    if (!user?.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub account is not connected."
      });
    }

    const repository = await getRepository(
      user.githubAccessToken,
      owner,
      repo
    );

    return res.status(200).json({
      success: true,
      data: repository
    });
  } catch (error) {
    next(error);
  }
};

const getGithubCommits = async (req, res, next) => {
  try {
    const {
      owner,
      repo
    } = req.params;

    const {
      page = 1,
      perPage = 100
    } = req.query;

    const user = await User.findById(
      req.user._id
    ).select("+githubAccessToken");

    if (!user?.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub account is not connected."
      });
    }

    const commits = await getRepositoryCommits(
      user.githubAccessToken,
      owner,
      repo,
      Number(page),
      Number(perPage)
    );

    return res.status(200).json({
      success: true,
      data: commits
    });
  } catch (error) {
    next(error);
  }
};

const getGithubPullRequests = async (req, res, next) => {
  try {
    const {
      owner,
      repo
    } = req.params;

    const {
      state = "all",
      page = 1,
      perPage = 100
    } = req.query;

    const user = await User.findById(
      req.user._id
    ).select("+githubAccessToken");

    if (!user?.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub account is not connected."
      });
    }

    const pullRequests = await getRepositoryPullRequests(
      user.githubAccessToken,
      owner,
      repo,
      state,
      Number(page),
      Number(perPage)
    );

    return res.status(200).json({
      success: true,
      data: pullRequests
    });
  } catch (error) {
    next(error);
  }
};

const getGithubIssues = async (req, res, next) => {
  try {
    const {
      owner,
      repo
    } = req.params;

    const {
      state = "all",
      page = 1,
      perPage = 100
    } = req.query;

    const user = await User.findById(
      req.user._id
    ).select("+githubAccessToken");

    if (!user?.githubAccessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub account is not connected."
      });
    }

    const issues = await getRepositoryIssues(
      user.githubAccessToken,
      owner,
      repo,
      state,
      Number(page),
      Number(perPage)
    );

    return res.status(200).json({
      success: true,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

export {
  githubLogin,
  githubCallback,
  connectGithub,
  getGithubProfile,
  getGithubRepositories,
  getGithubRepository,
  getGithubCommits,
  getGithubPullRequests,
  getGithubIssues
};
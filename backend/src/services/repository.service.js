import Repository from "../models/Repository.js";
import User from "../models/User.js";

import {
  getUserRepositories,
  getRepository
} from "./github.service.js";

const syncRepositories = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.githubAccessToken) {
    throw new Error("GitHub account is not connected.");
  }

  const githubRepositories = await getUserRepositories(
    user.githubAccessToken
  );

  const repositories = [];

  for (const repo of githubRepositories) {
    const repositoryData = {
      userId: user._id,
      githubRepoId: String(repo.id),
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || null,
      url: repo.html_url,
      language: repo.language || null,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      openIssues: repo.open_issues_count || 0,
      isPrivate: repo.private || false,
      defaultBranch: repo.default_branch || "main",
      lastSyncedAt: new Date()
    };

    const repository = await Repository.findOneAndUpdate(
      {
        userId: user._id,
        githubRepoId: String(repo.id)
      },
      repositoryData,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    repositories.push(repository);
  }

  return repositories;
};

const getRepositories = async (userId) => {
  return Repository.find({ userId }).sort({
    updatedAt: -1
  });
};

const getRepositoryById = async (
  userId,
  repositoryId
) => {
  return Repository.findOne({
    _id: repositoryId,
    userId
  });
};

const refreshRepository = async (
  userId,
  repositoryId
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.githubAccessToken) {
    throw new Error(
      "GitHub account is not connected."
    );
  }

  const repository = await Repository.findOne({
    _id: repositoryId,
    userId
  });

  if (!repository) {
    throw new Error("Repository not found.");
  }

  if (!repository.fullName) {
    throw new Error(
      "Repository GitHub information is missing."
    );
  }

  const [owner, repoName] =
    repository.fullName.split("/");

  if (!owner || !repoName) {
    throw new Error(
      "Invalid repository full name."
    );
  }

  const githubRepository = await getRepository(
    user.githubAccessToken,
    owner,
    repoName
  );

  repository.name = githubRepository.name;
  repository.fullName =
    githubRepository.full_name;
  repository.description =
    githubRepository.description || null;
  repository.url =
    githubRepository.html_url;
  repository.language =
    githubRepository.language || null;
  repository.stars =
    githubRepository.stargazers_count || 0;
  repository.forks =
    githubRepository.forks_count || 0;
  repository.openIssues =
    githubRepository.open_issues_count || 0;
  repository.isPrivate =
    githubRepository.private || false;
  repository.defaultBranch =
    githubRepository.default_branch || "main";
  repository.lastSyncedAt = new Date();

  await repository.save();

  return repository;
};

const deleteRepository = async (
  userId,
  repositoryId
) => {
  return Repository.findOneAndDelete({
    _id: repositoryId,
    userId
  });
};

export {
  syncRepositories,
  getRepositories,
  getRepositoryById,
  refreshRepository,
  deleteRepository
};
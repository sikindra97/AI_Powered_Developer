import {
  syncRepositories,
  getRepositories,
  getRepositoryById,
  refreshRepository,
  deleteRepository
} from "../services/repository.service.js";

const sync = async (req, res) => {
  try {
    const repositories = await syncRepositories(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Repositories synchronized successfully.",
      count: repositories.length,
      data: repositories
    });
  } catch (error) {
    console.error("Sync Repositories Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAll = async (req, res) => {
  try {
    const repositories = await getRepositories(req.user._id);

    return res.status(200).json({
      success: true,
      count: repositories.length,
      data: repositories
    });
  } catch (error) {
    console.error("Get Repositories Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getOne = async (req, res) => {
  try {
    const repository = await getRepositoryById(
      req.user._id,
      req.params.id
    );

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: repository
    });
  } catch (error) {
    console.error("Get Repository Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const refresh = async (req, res) => {
  try {
    const repository = await refreshRepository(
      req.user._id,
      req.params.id
    );

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Repository refreshed successfully.",
      data: repository
    });
  } catch (error) {
    console.error("Refresh Repository Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const remove = async (req, res) => {
  try {
    const repository = await deleteRepository(
      req.user._id,
      req.params.id
    );

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Repository removed successfully."
    });
  } catch (error) {
    console.error("Delete Repository Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
  sync,
  getAll,
  getOne,
  refresh,
  remove
};
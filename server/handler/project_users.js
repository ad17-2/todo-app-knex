const userQuery = require("../database/queries/users");
const projectQuery = require("../database/queries/projects");
const projectUserQuery = require("../database/queries/project_users");

const { NotFoundError, BadRequestError } = require("../errors/app-error");

const { uuidv7 } = require("uuidv7");

async function createProjectUser(req, res, next) {
  const { projectId, userId } = req.body;

  const project = await projectQuery.getProjectById(projectId);

  if (!project) {
    return next(new NotFoundError("Project not found"));
  }

  const user = await userQuery.getUserById(userId);

  if (!user) {
    return next(new NotFoundError("User not found"));
  }

  const existstingProjectUser = await projectUserQuery.getProjectUser(
    projectId,
    userId
  );

  if (existstingProjectUser) {
    return next(new BadRequestError("User is already a member of the project"));
  }

  const projectUser = {
    project_id: projectId,
    user_id: userId,
    id: uuidv7(),
  };

  try {
    await projectUserQuery.createProjectUser(projectUser);
    res.status(201).json({
      status: "success",
      data: projectUser,
    });
  } catch (err) {
    next(err);
  }
}

async function removeProjectUser(req, res, next) {
  const { projectId, userId } = req.params;

  try {
    await projectUserQuery.removeProjectUser(projectId, userId);
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProjectUser,
  removeProjectUser,
};

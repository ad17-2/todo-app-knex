const organizationQuery = require("../database/queries/organizations");
const projectQuery = require("../database/queries/projects");

const { NotFoundError, BadRequestError } = require("../errors/app-error");

const { uuidv7 } = require("uuidv7");

async function createProject(req, res, next) {
  try {
    const { name, description, organizationId } = req.body;

    if (!name || !description || !organizationId) {
      throw new BadRequestError(
        "Name, description, and organization ID are required"
      );
    }

    if (name.length < 3) {
      throw new BadRequestError(
        "Organization Name must be at least 3 characters long"
      );
    }

    const existingOrganization = await organizationQuery.getOrganizationById(
      organizationId
    );

    if (!existingOrganization) {
      throw new BadRequestError("Organization does not exists");
    }

    const existingProject = await projectQuery.getProjectByName(name);

    if (existingProject.length > 0) {
      throw new BadRequestError("Project with same name already exists");
    }

    const projectObject = {
      id: uuidv7(),
      name,
      description,
      organization_id: organizationId,
    };

    const [project] = await projectQuery.createProject(projectObject);

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

async function getProjects(req, res, next) {
  try {
    const project = await projectQuery.getProjects();

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
async function getProjectById(req, res, next) {
  try {
    const projectId = req.params.id;

    const [project] = await projectQuery.getProjectById(projectId);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}
async function updateProjectById(req, res, next) {
  try {
    const { name, description, organizationId } = req.body;

    const id = req.params.id;

    if (!name || !description || !organizationId) {
      throw new BadRequestError(
        "Name, description, and organization ID are required"
      );
    }

    if (name.length < 3) {
      throw new BadRequestError(
        "Organization Name must be at least 3 characters long"
      );
    }

    const existingOrganization = await organizationQuery.getOrganizationById(
      organizationId
    );

    if (!existingOrganization) {
      throw new BadRequestError("Organization does not exists");
    }

    const projectObject = {
      id: uuidv7(),
      name,
      description,
      organization_id: organizationId,
    };

    const [project] = await projectQuery.updateProject(id, projectObject);

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}
async function deleteProjectById(req, res, next) {
  try {
    const projectId = req.params.id;

    await projectQuery.deleteProject(projectId);

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

async function getProjectUsers(req, res, next) {
  try {
    const projectId = req.params.id;

    const projects = await projectQuery.getProjectUsers(projectId);

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

async function getProjectTodos(req, res, next) {
  try {
    const projectId = req.params.id;

    const todos = await projectQuery.getProjectTodos(projectId);

    res.json({
      success: true,
      data: todos,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
  getProjectUsers,
  getProjectTodos,
};

const { get } = require("lodash");
const organizationQueries = require("../database/queries/organizations");

const { NotFoundError, BadRequestError } = require("../errors/app-error");

const { uuidv7 } = require("uuidv7");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
async function createOrganization(req, res, next) {
  try {
    const { name } = req.body;

    if (!name) {
      throw new BadRequestError("Organization name is required");
    }

    if (name.length < 3) {
      throw new BadRequestError("Organization name is too short");
    }

    const organization = {
      id: uuidv7(),
      name,
    };

    const [createdOrganization] = await organizationQueries.createOrganization(
      organization
    );

    res.status(201).json({
      success: true,
      data: createdOrganization,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrganizations(req, res, next) {
  try {
    const organizations = await organizationQueries.getOrganizations();

    res.json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrganizationById(req, res, next) {
  try {
    const organizationId = req.params.id;

    const organization = await organizationQueries.getOrganizationById(
      organizationId
    );

    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
}

async function updateOrganizationById(req, res, next) {
  try {
    const organizationId = req.params.id;

    const { name } = req.body;

    if (!name) {
      throw new BadRequestError("Organization name is required");
    }

    if (name.length < 3) {
      throw new BadRequestError("Organization name is too short");
    }

    const organization = {
      name,
    };

    const updatedOrganization = await organizationQueries.updateOrganization(
      organizationId,
      organization
    );

    res.status(200).json({
      success: true,
      data: updatedOrganization,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteOrganizationById(req, res, next) {
  try {
    const organizationId = req.params.id;

    await organizationQueries.deleteOrganization(organizationId);

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrganizationUsers(req, res, next) {
  try {
    const organizationId = req.params.id;

    const organization = await organizationQueries.getOrganizationById(
      organizationId
    );

    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    const users = await organizationQueries.getOrganizationUsers(
      organizationId
    );

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrganizationProjects(req, res, next) {
  try {
    const organizationId = req.params.id;

    const organization = await organizationQueries.getOrganizationById(
      organizationId
    );

    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    const users = await organizationQueries.getOrganizationProjects(
      organizationId
    );

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganizationById,
  deleteOrganizationById,
  getOrganizationUsers,
  getOrganizationProjects,
};

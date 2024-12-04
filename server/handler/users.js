const userQuery = require("../database/queries/users");
const organizationQuery = require("../database/queries/organizations");

const { NotFoundError, BadRequestError } = require("../errors/app-error");

const { uuidv7 } = require("uuidv7");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TOKEN_EXPIRY = "24h";

const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[^\s]).{8,}$/;
  return passwordRegex.test(password);
};

async function createUsers(req, res, next) {
  try {
    const { name, email, organizationId, password, role } = req.body;

    if (!name || !email || !organizationId || !password || !role) {
      throw new BadRequestError(
        "Name, email, password, role, and organization ID are required"
      );
    }

    if (role !== "admin" && role !== "staff") {
      throw new BadRequestError("Role must be either admin or staff");
    }

    if (password.length > 72) {
      throw new BadRequestError("Password must be less than 72");
    }

    const isPasswordValid = validatePassword(password);

    if (!isPasswordValid) {
      throw new BadRequestError(
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and must be at least 8 characters long"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (name.length < 3) {
      throw new BadRequestError("Name must be at least 3 characters long");
    }

    const existstingUserWithSameEmail = await userQuery.getUserByEmail(email);

    if (existstingUserWithSameEmail) {
      throw new BadRequestError("User with the same email already exists");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new BadRequestError("Invalid email format");
    }

    const existingOrganization = await organizationQuery.getOrganizationById(
      organizationId
    );

    if (!existingOrganization) {
      throw new NotFoundError("Organization not found");
    }

    const userObj = {
      id: uuidv7(),
      name,
      email,
      organization_id: organizationId,
      password: hashedPassword,
      role,
    };

    const [user] = await userQuery.createUser(userObj);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const user = await userQuery.getUserByEmail(email);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestError("Invalid email or password");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        organizationId: user.organization_id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      success: true,
      data: token,
    });
  } catch (error) {
    next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await userQuery.getUsers();

    res.json({
      success: true,
      data: users,
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
async function getUserById(req, res, next) {
  try {
    const userId = req.params.id;

    const [user] = await userQuery.getUserById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserById(req, res, next) {
  try {
    const userId = req.params.id;
    const { name, email, organizationId } = req.body;

    if (!name || !email || !organizationId) {
      throw new BadRequestError(
        "Name, email, and organization ID are required"
      );
    }

    if (name.length < 3) {
      throw new BadRequestError("Name must be at least 3 characters long");
    }

    const existingUser = await userQuery.getUserById(userId);

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    const existingOrganization = await organizationQuery.getOrganizationById(
      organizationId
    );

    if (!existingOrganization) {
      throw new NotFoundError("Organization not found");
    }

    const userObj = {
      name,
      email,
      organization_id: organizationId,
    };

    const [user] = await userQuery.updateUser(userId, userObj);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUserById(req, res, next) {
  try {
    const userId = req.params.id;

    await userQuery.deleteUserById(userId);

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserProjects(req, res, next) {
  try {
    const userId = req.params.id;

    const projects = await userQuery.getUserProjects(userId);

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserTodos(req, res, next) {
  try {
    const userId = req.params.id;

    const todos = await userQuery.getUserTodos(userId);

    res.json({
      success: true,
      data: todos,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserById,
  createUsers,
  getUsers,
  updateUserById,
  deleteUserById,
  getUserProjects,
  getUserTodos,
  login,
};

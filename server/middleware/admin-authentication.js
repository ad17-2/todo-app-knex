const { UnauthorizedError } = require("../errors/app-error");

const adminOnly = async (req, res, next) => {
  try {
    // req.user is set by the previous authenticateToken middleware
    if (!req.user || req.user.role !== "admin") {
      throw new UnauthorizedError("Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminOnly;

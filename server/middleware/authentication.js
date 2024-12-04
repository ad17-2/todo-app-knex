// middleware/auth.js
const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors/app-error");

const PUBLIC_ROUTES = ["/users/login", "/users/register"];

const authenticateToken = async (req, res, next) => {
  try {
    console.log("req path => ", req.path);

    // Check if the route is public
    if (PUBLIC_ROUTES.includes(req.path)) {
      console.log("public route here");
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization token required");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired token");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authenticateToken;

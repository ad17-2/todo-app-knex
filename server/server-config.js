require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/users");
const organizationRoutes = require("./routes/organizations");
const projectRoutes = require("./routes/projects");
const todoRoutes = require("./routes/todos");
const commentRoutes = require("./routes/comments");
const errorHandler = require("./middleware/error-handler");
const authenticateToken = require("./middleware/authentication");

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Apply authentication middleware to all routes
app.use("/api/v1", authenticateToken);

// All routes will be protected except for login and register
app.use("/api/v1", userRoutes);
app.use("/api/v1", organizationRoutes);
app.use("/api/v1", projectRoutes);
app.use("/api/v1", todoRoutes);
app.use("/api/v1", commentRoutes);

app.use(errorHandler);

module.exports = app;

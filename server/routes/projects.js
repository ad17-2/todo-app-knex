const express = require("express");
const router = express.Router();
const projectHandler = require("../handler/projects");
const projectUserHandler = require("../handler/project_users");

router.post("/projects", projectHandler.createProject);
router.get("/projects", projectHandler.getProjects);
router.get("/projects/:id", projectHandler.getProjectById);
router.put("/projects/:id", projectHandler.updateProjectById);
router.delete("/projects/:id", projectHandler.deleteProjectById);
router.get("/projects/:id/users", projectHandler.getProjectUsers);
router.get("/projects/:id/todos", projectHandler.getProjectTodos);
router.post("/projects/:id/users", projectUserHandler.createProjectUser);
router.delete(
  "/projects/:projectId/users/:userId",
  projectUserHandler.removeProjectUser
);

module.exports = router;

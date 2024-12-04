const express = require("express");
const router = express.Router();
const userHandler = require("../handler/users");

router.post("/users/register", userHandler.createUsers);
router.post("/users/login", userHandler.login);
router.get("/users/:id", userHandler.getUserById);
router.get("/users", userHandler.getUsers);
router.put("/users/:id", userHandler.updateUserById);
router.delete("/users/:id", userHandler.deleteUserById);
router.get("/users/:id/projects", userHandler.getUserProjects);
router.get("/users/:id/todos", userHandler.getUserTodos);

module.exports = router;

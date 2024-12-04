const express = require("express");
const router = express.Router();
const todoHandler = require("../handler/todos");

router.post("/todos", todoHandler.createTodo);
router.get("/todos", todoHandler.getTodos);
router.get("/todos/:todoId", todoHandler.getTodoById);
router.put("/todos/:todoId", todoHandler.updateTodoById);
router.delete("/todos/:todoId", todoHandler.deleteTodoById);
router.get("/todos/:todoId/comments", todoHandler.getTodoComments);
router.patch("/todos/:todoId/status", todoHandler.updateTodoStatus);
router.patch("/todos/:todoId/assign", todoHandler.updateTodoAssignee);

module.exports = router;

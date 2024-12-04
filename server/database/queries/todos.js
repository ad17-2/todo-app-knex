const knex = require("../connection");

function createTodo(todo) {
  return knex("todos").insert(todo).returning("*");
}

function getTodos() {
  return knex("todos").select([
    "id",
    "title",
    "description",
    "status",
    "due_date",
    "created_at",
  ]);
}

function getTodoById(todoId) {
  return knex("todos")
    .where({ id: todoId })
    .select(["id", "title", "description", "status", "due_date", "created_at"]);
}

function updateTodo(id, todo) {
  return knex("todos").update(todo).where({ id: id }).returning("*");
}

function deleteTodoById(todoId) {
  return knex("todos").where({ id: todoId }).del();
}

function getTodoComments(todoId) {
  return knex("comments")
    .where("todo_id", todoId)
    .select(["id", "content", "created_at"]);
}

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodoById,
  getTodoComments,
};

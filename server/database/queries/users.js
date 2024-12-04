const knex = require("../connection");

function createUser(user) {
  return knex("users")
    .insert(user)
    .returning(["id", "name", "email", "role", "created_at"]);
}

function getUserByEmail(email) {
  return knex("users")
    .select(["id", "name", "email", "password", "role", "created_at"])
    .where({ email: email })
    .first();
}

function getUsers() {
  return knex("users").select(["id", "name", "email", "created_at"]);
}

function getUserById(userId) {
  return knex("users")
    .where({ id: userId })
    .select(["id", "name", "email", "role", "created_at"]);
}

function updateUser(id, user) {
  return knex("users").update(user).where({ id: id }).returning("*");
}

function deleteUserById(userId) {
  return knex("users").where({ id: userId }).del();
}

function getUserProjects(userId) {
  return knex("project_users")
    .join("projects", "project_users.project_id", "projects.id")
    .where("project_users.user_id", userId)
    .select(["projects.id", "projects.name"]);
}

function getUserTodos(userId) {
  return knex("todos")
    .where("assigned_user_id", userId)
    .select(["id", "title", "description", "status", "due_date"]);
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
  deleteUserById,
  getUserProjects,
  getUserTodos,
};

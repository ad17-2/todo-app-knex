const knex = require("../connection");

function createProject(project) {
  return knex("projects").insert(project).returning("*");
}

function getProjects() {
  return knex("projects").select(["id", "name", "description", "created_at"]);
}

function getProjectById(projectId) {
  return knex("projects")
    .where({ id: projectId })
    .select(["id", "name", "description", "created_at"]);
}

function getProjectByName(projectName) {
  return knex("projects")
    .where({ name: projectName })
    .select(["id", "name", "description", "created_at"]);
}

function updateProject(id, project) {
  return knex("projects").update(project).where({ id: id }).returning("*");
}

function deleteProject(projectId) {
  return knex("projects").where({ id: projectId }).del();
}

function getProjectUsers(userId) {
  return knex("project_users")
    .join("users", "project_users.user_id", "users.id")
    .where("project_users.project_id", userId)
    .select(["users.id", "users.email", "users.name"]);
}

function getProjectTodos(userId) {
  return knex("todos")
    .where("project_id", userId)
    .select(["id", "title", "description", "status", "due_date"]);
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectUsers,
  getProjectTodos,
  getProjectByName,
};

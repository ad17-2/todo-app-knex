const knex = require("../connection");

function createProjectUser(projectUser) {
  return knex("project_users").insert(projectUser).returning("*");
}

function getProjectUser(projectId, userId) {
  return knex("project_users")
    .where({ project_id: projectId, user_id: userId })
    .first();
}

function removeProjectUser(projectId, userId) {
  return knex("project_users")
    .where({ project_id: projectId, user_id: userId })
    .del();
}

module.exports = {
  createProjectUser,
  removeProjectUser,
  getProjectUser,
};

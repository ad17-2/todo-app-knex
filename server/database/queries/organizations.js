const { get } = require("lodash");
const knex = require("../connection");

function createOrganization(organization) {
  return knex("organizations").insert(organization).returning("*");
}

function getOrganizations() {
  return knex("organizations").select(["id", "name"]);
}

function getOrganizationById(id) {
  return knex("organizations")
    .select(["id", "name", "created_at"])
    .where({ id: id })
    .first();
}

function getOrganizationByName(name) {
  return knex("organizations")
    .select(["id", "name", "created_at"])
    .where({ name: name })
    .first();
}

function updateOrganization(id, organization) {
  return knex("organizations")
    .update(organization)
    .where({ id: id })
    .returning("*");
}

function deleteOrganization(id) {
  return knex("organizations").where({ id: id }).del();
}

function getOrganizationUsers(organizationId) {
  return knex("users")
    .select(["id", "name", "email"])
    .where({ organization_id: organizationId });
}

function getOrganizationProjects(organizationId) {
  return knex("projects")
    .select(["id", "name", "description"])
    .where({ organization_id: organizationId });
}

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
  getOrganizationProjects,
  getOrganizationByName,
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("project_users", (table) => {
    table.text("id").primary();
    table.text("project_id").notNullable();
    table.text("user_id").notNullable();
    table.foreign("project_id").references("projects.id").onDelete("CASCADE");
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.timestamps(true, true);
    table.unique(["project_id", "user_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("project_users");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("todos", (table) => {
    table.text("id").primary();
    table.string("title").notNullable();
    table.text("description");
    table.string("status").notNullable().defaultTo("pending");
    table.datetime("due_date");
    table.text("project_id").notNullable();
    table.text("assigned_user_id").nullable();
    table.foreign("project_id").references("projects.id").onDelete("CASCADE");
    table
      .foreign("assigned_user_id")
      .references("users.id")
      .onDelete("SET NULL");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("todos");
};

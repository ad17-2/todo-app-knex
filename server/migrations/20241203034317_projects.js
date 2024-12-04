/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("projects", (table) => {
    table.text("id").primary();
    table.string("name").notNullable();
    table.text("description");
    table.text("organization_id").notNullable();
    table
      .foreign("organization_id")
      .references("organizations.id")
      .onDelete("CASCADE");
    table.timestamps(true, true);
  });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("projects");
};

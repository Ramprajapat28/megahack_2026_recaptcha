const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const { addDefaultColumns } = require("../utilities/MigrationUtilities");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {

  // Add enum values if missing
  await knex.raw(`
    ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'admin';
  `);

  await knex.raw(`
    ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'user';
  `);

  // Create organizations table
  await knex.schema
    .withSchema(PUBLIC_SCHEMA)
    .createTable("organizations", (table) => {
      table.increments("org_id").primary();
      table.string("org_name", 100).notNullable();
      table.string("org_code", 50).unique();

      addDefaultColumns(table);
    });

  // Add org_id to users
  await knex.schema
    .withSchema(PUBLIC_SCHEMA)
    .alterTable("users", (table) => {
      table
        .integer("org_id")
        .unsigned()
        .references("org_id")
        .inTable(`${PUBLIC_SCHEMA}.organizations`)
        .onDelete("CASCADE");
    });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
};

const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const { addDefaultColumns } = require("../utilities/MigrationUtilities");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("coding_exams", (table) => {
    table.increments("coding_exam_id").primary();
    table.string("exam_name", 50).notNullable();
    table.integer("duration"); // minutes
    table.timestamp("start_time");
    table.timestamp("end_time");
    table.specificType("status", "exam_status").defaultTo("draft");
    table.specificType("target_years", "year_enum[]").notNullable();
    table.specificType("target_branches", "branch_enum[]").notNullable();
    table.specificType("exam_for", "role_enum").defaultTo("Student");
    addDefaultColumns(table);
  });
};

exports.down = function(knex) {
  
};

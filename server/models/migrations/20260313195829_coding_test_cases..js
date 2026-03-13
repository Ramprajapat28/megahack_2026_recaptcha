const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const { addDefaultColumns } = require("../utilities/MigrationUtilities");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("coding_test_cases", (table) => {
    table.increments("test_case_id").primary();
    table.integer("coding_question_id")
         .references("coding_question_id")
         .inTable("coding_questions")
         .onDelete("CASCADE");
    table.text("input").notNullable();
    table.text("expected_output").notNullable();
    table.boolean("is_sample").defaultTo(false);
    table.integer("order").defaultTo(0);
    addDefaultColumns(table);
  });
};

exports.down = function(knex) {
 
};

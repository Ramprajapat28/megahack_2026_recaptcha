const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const { addDefaultColumns } = require("../utilities/MigrationUtilities");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("coding_submissions", (table) => {
    table.increments("submission_id").primary();
    table.integer("student_id").references("user_id").inTable("users").onDelete("CASCADE");
    table.integer("coding_question_id").references("coding_question_id").inTable("coding_questions").onDelete("CASCADE");
    table.string("language").notNullable(); 
    table.text("source_code").notNullable();
    table.jsonb("results").defaultTo('{}'); 
    table.string("overall_status").defaultTo("Pending"); 
    table.timestamp("submitted_at").defaultTo(knex.fn.now());
    addDefaultColumns(table);
  });
};

exports.down = function(knex) {
 
};

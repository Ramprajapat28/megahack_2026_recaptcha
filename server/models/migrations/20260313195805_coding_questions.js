const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const { addDefaultColumns } = require("../utilities/MigrationUtilities");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("coding_questions", (table) => {
    table.increments("coding_question_id").primary();
    table.integer("coding_exam_id").references("coding_exam_id").inTable("coding_exams").onDelete("CASCADE");
    table.string("title").notNullable();
    table.text("description").notNullable();
    table.string("difficulty").defaultTo("Easy");
    table.jsonb("starter_code").defaultTo('{}'); // { "python":"...", "java":"...", "cpp":"...", "js":"..." }
    table.specificType("languages", "text[]").defaultTo('{python,java,cpp,js}');
    addDefaultColumns(table);
  });
};

exports.down = function(knex) {
  
};

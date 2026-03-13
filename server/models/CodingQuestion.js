const { dbWrite } = require("../config/db");

const CodingQuestion = {
  async create(data) {
    return dbWrite("coding_questions").insert(data).returning("*");
  },
  async findByExamId(examId) {
    return dbWrite("coding_questions").where({ coding_exam_id: examId });
  },
  async findById(id) {
    return dbWrite("coding_questions").where({ coding_question_id: id }).first();
  }
};

module.exports = CodingQuestion;

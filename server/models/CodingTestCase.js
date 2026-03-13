const { dbWrite } = require("../config/db");

const CodingTestCase = {
  async create(data) {
    return dbWrite("coding_test_cases").insert(data).returning("*");
  },
  async findByQuestionId(questionId, onlySample = false) {
    const query = dbWrite("coding_test_cases").where({ coding_question_id: questionId });
    if (onlySample) query.andWhere("is_sample", true);
    return query;
  },

  async findAllByQuestionId(questionId) {
    return dbWrite("coding_test_cases").where({ coding_question_id: questionId, is_deleted: false });
  }
};

module.exports = CodingTestCase;

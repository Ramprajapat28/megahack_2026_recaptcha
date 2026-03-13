const { dbWrite } = require("../config/db");

const CodingSubmission = {
  async create(data) {
    return dbWrite("coding_submissions").insert(data).returning("*");
  },
  async findByStudentAndQuestion(studentId, questionId) {
    return dbWrite("coding_submissions")
      .where({ student_id: studentId, coding_question_id: questionId })
      .orderBy("submitted_at", "desc");
  }
};

module.exports = CodingSubmission;

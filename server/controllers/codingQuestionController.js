const { dbWrite } = require("../config/db");

const CodingQuestionController = {

  // Create a new coding question
  async createQuestion(req, res) {
    try {
      const { coding_exam_id, title, description, difficulty, starter_code, languages } = req.body;

      const [question] = await dbWrite("coding_questions")
        .insert({
          coding_exam_id,
          title,
          description,
          difficulty: difficulty || "Easy",
          starter_code: JSON.stringify(starter_code || { js: "" }),
          languages: languages || ['js']
        })
        .returning("*");

      res.status(201).json({ success: true, question });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error creating question", error: err.message });
    }
  }

};

module.exports = CodingQuestionController;

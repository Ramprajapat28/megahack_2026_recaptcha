const { dbWrite } = require("../config/db");

const CodingExamController = {

  // Create a new coding exam
  async createExam(req, res) {
    try {
      const { exam_name, duration, start_time, end_time, target_years, target_branches, exam_for } = req.body;

      // Insert into coding_exams table
      const [exam] = await dbWrite("coding_exams")
        .insert({
          exam_name,
          duration,
          start_time,
          end_time,
          target_years,
          target_branches,
          exam_for
        })
        .returning("*");

      res.status(201).json({ success: true, exam });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error creating exam", error: err.message });
    }
  }

};

module.exports = CodingExamController;

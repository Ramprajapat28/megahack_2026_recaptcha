const { dbWrite } = require("../config/db");


const viewResult = async (exam_id, page = 1, limit = 10) => {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch results using Knex
    const results = await dbWrite("results as r")
      .join("users as u", "r.student_id", "u.user_id")
      .join("exams as e", "r.exam_id", "e.exam_id")
      .select(
        "u.name as student_name",
        "u.email as student_email",
        "r.total_score",
        "r.max_score",
        "r.completed_at",
        "r.result_id",
        "r.exam_id",
        "e.duration",
        "e.exam_name"
      )
      .where("r.exam_id", exam_id)
      .orderBy("r.result_id", "asc")
      .limit(limit)
      .offset(offset);

    // Helper function to format date to readable format
    const formatToReadableDate = (isoString) => {
      const date = new Date(isoString);
      const options = { day: "2-digit", month: "short", year: "numeric" };
      return date.toLocaleDateString("en-IN", options);
    };

    // Add percentage and pass/fail status
    const resultsWithStatus = results.map((row) => {
      const percentage = ((row.total_score / row.max_score) * 100); // Up to 3 decimal places
      const status = percentage >= 35 ? "Passed" : "Failed"; // Pass/Fail based on 35%
      return {
        student_name: row.student_name,
        student_email: row.student_email,
        total_score: row.total_score,
        max_score: row.max_score,
        duration: row.duration,
        exam_name: row.exam_name,
        Date: formatToReadableDate(row.completed_at),
        percentage: Number(percentage.toFixed(2)),
        status,
      };
    });

    return resultsWithStatus;

  } catch (error) {
    console.error("❌ Error fetching exam results:", error);
    throw error;
  }
};

module.exports = { viewResult };

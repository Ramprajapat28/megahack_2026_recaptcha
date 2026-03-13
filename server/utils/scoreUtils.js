const { dbWrite } = require("../config/db");

async function calculateScoreForMCQs(examId, studentId) {
  try {

    // Step 1: Max score
    const maxScoreRow = await dbWrite("questions")
      .where("exam_id", examId)
      .whereNot("question_type", "text")
      .count("question_id as max_score")
      .first();

    const max_score = parseInt(maxScoreRow?.max_score || 0);

    if (max_score === 0) {
      console.error(`No MCQ questions found for exam_id ${examId}`);
      return;
    }

    // Step 2: Total correct responses
    const totalScoreRow = await dbWrite("responses as r")
      .join("questions as q", "r.question_id", "q.question_id")
      .where("r.exam_id", examId)
      .where("r.student_id", studentId)
      .where(function () {

        // single choice correct
        this.where(function () {
          this.where("q.question_type", "single_choice")
            .whereRaw("r.selected_option = q.correct_option");
        })

        // multiple choice correct
        .orWhere(function () {
          this.where("q.question_type", "multiple_choice")
            .whereRaw(`
              (
                SELECT ARRAY_AGG(val ORDER BY val)
                FROM jsonb_array_elements_text(r.selected_options) val
              ) = (
                SELECT ARRAY_AGG(val ORDER BY val)
                FROM jsonb_array_elements_text(q.correct_options) val
              )
            `);
        });

      })
      .count("q.question_id as correct_responses")
      .first();

    const total_score = parseInt(totalScoreRow?.correct_responses || 0);

    // Step 3: Category wise score
    const categoryRows = await dbWrite("responses as r")
      .join("questions as q", "r.question_id", "q.question_id")
      .where("r.exam_id", examId)
      .where("r.student_id", studentId)
      .select("q.category")
      .count("* as max_score")
      .count({
        score: dbWrite.raw(`
          CASE
            WHEN q.question_type = 'single_choice'
              AND r.selected_option = q.correct_option
            THEN 1
            WHEN q.question_type = 'multiple_choice'
              AND (
                SELECT ARRAY_AGG(val ORDER BY val)
                FROM jsonb_array_elements_text(r.selected_options) val
              ) = (
                SELECT ARRAY_AGG(val ORDER BY val)
                FROM jsonb_array_elements_text(q.correct_options) val
              )
            THEN 1
          END
        `)
      })
      .groupBy("q.category");

    const category_score = {};

    for (const row of categoryRows) {
      category_score[row.category] = {
        score: parseInt(row.score || 0),
        max_score: parseInt(row.max_score || 0),
      };
    }

    // Step 4: Store result
    const completed_at = new Date();

    await dbWrite("results")
      .insert({
        student_id: studentId,
        exam_id: examId,
        total_score,
        max_score,
        completed_at,
        category_score: JSON.stringify(category_score)
      });

    console.log(`✅ Result stored for student ${studentId} exam ${examId}`);

    return {
      student_id: studentId,
      exam_id: examId,
      total_score,
      max_score,
      completed_at,
      category_score
    };

  } catch (err) {
    console.error("❌ Error in calculateScoreForMCQs:", {
      examId,
      studentId,
      error: err.stack
    });
    throw err;
  }
}

module.exports = { calculateScoreForMCQs };

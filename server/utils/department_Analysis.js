const { dbWrite } = require('../config/db');

async function department_analysis(studentAnalysis, examId, examName) {
  try {

    const {
      department_name,
      year,
      accuracy_rate,
      category,
      performance_over_time,
      total_score,
      max_score,
    } = studentAnalysis;

    console.log(examName);

    if (!department_name || !year) {
      throw new Error('department_name or year is missing');
    }

    const studentCategory =
      typeof category === "string" ? JSON.parse(category) : category || {};

    const examEntry = {
      exam_id: examId,
      avg_score: Number(total_score) || 0,
      max_score: Number(max_score) || 0,
      date: new Date().toISOString().slice(0, 10),
      exam: examName
    };

    // Get existing department analysis
    const existing = await dbWrite("department_analysis")
      .where({
        department_name,
        year
      })
      .first();

    let subjectPerf = {};
    let performance = [];
    let totalScore = Number(total_score) || 0;
    let totalMaxScore = Number(max_score) || 0;
    let studentCount = 1;

    if (existing) {

      try {
        subjectPerf =
          typeof existing.subject_performance === "string"
            ? JSON.parse(existing.subject_performance)
            : existing.subject_performance || {};
      } catch {
        subjectPerf = {};
      }

      try {
        performance =
          typeof existing.performance_over_time === "string"
            ? JSON.parse(existing.performance_over_time)
            : existing.performance_over_time || [];
      } catch {
        performance = [];
      }

      totalScore += Number(existing.total_score) || 0;
      totalMaxScore += Number(existing.max_score) || 0;
      studentCount = (Number(existing.student_count) || 0) + 1;

      // merge category performance
      for (const subject in studentCategory) {
        const { score = 0, max_score = 0 } = studentCategory[subject];

        if (!subjectPerf[subject]) {
          subjectPerf[subject] = { score: 0, max_score: 0 };
        }

        subjectPerf[subject].score += Number(score);
        subjectPerf[subject].max_score += Number(max_score);
      }

      // merge performance history
      const index = performance.findIndex(e => e.exam_id == examId);

      if (index !== -1) {
        performance[index] = examEntry;
      } else {
        performance.push(examEntry);
      }

    } else {

      subjectPerf = studentCategory;
      performance = [examEntry];

    }

    const finalAccuracy =
      totalMaxScore > 0 ? totalScore / totalMaxScore : 0;

    // UPSERT using knex
    await dbWrite("department_analysis")
      .insert({
        department_name,
        year,
        accuracy_rate: finalAccuracy,
        subject_performance: JSON.stringify(subjectPerf),
        performance_over_time: JSON.stringify(performance),
        total_score: totalScore,
        max_score: totalMaxScore,
        student_count: studentCount,
        updated_at: dbWrite.fn.now()
      })
      .onConflict(["department_name", "year"])
      .merge({
        accuracy_rate: finalAccuracy,
        subject_performance: JSON.stringify(subjectPerf),
        performance_over_time: JSON.stringify(performance),
        total_score: totalScore,
        max_score: totalMaxScore,
        student_count: studentCount,
        updated_at: dbWrite.fn.now()
      });

    console.log(`✅ Department analysis updated for ${department_name} - ${year}`);

  } catch (err) {
    console.error('❌ Error in department_analysis:', err.message);
  }
}

module.exports = { department_analysis };

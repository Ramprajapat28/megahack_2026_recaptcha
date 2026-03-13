const { getLastExam } = require('../models/examModel');
const { logActivity } = require('../utils/logActivity');
const { dbWrite } = require('../config/db');

const getLastExamStats = async (req, res) => {
  const user_id = req.user.id;
  const exam_for = req.query.exam_for;

  try {
    const lastExam = await getLastExam(exam_for);
    if (!lastExam) {
      await logActivity({
        user_id,
        activity: 'Get Last Exam Stats',
        status: 'failure',
        details: 'No last exam found',
      });
      return res.status(404).json({ error: 'No last exam found' });
    }

    const studentCount = await getStudentCountForExam(lastExam.exam_id, lastExam.exam_for);

    await logActivity({
      user_id,
      activity: 'Get Last Exam Stats',
      status: 'success',
      details: 'Last exam stats fetched successfully',
    });

    return res.status(200).json({
      examDetails: lastExam,
      studentCount
    });
  } catch (err) {
    console.error('Error fetching last exam stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStudentCountForExam = async (exam_id, exam_for) => {
  let query;
  if (exam_for === 'user') {
    query = 'SELECT COUNT(*) FROM responses WHERE exam_id = $1';
  }
  else if (exam_for === 'Teacher') {
    query = 'SELECT COUNT(*) FROM teacher_responses WHERE exam_id = $1';
  }
  const values = [exam_id];
  const result = await dbWrite.raw(query, [exam_id]);
  return parseInt(result.rows[0].count, 10);
};

const getAllTestsStats = async (req, res) => {
  const user_id = req.user.id;
  const exam_for = req.query.exam_for;
  const user_role = req.user.role;
  const user_branch = req.user.branch;

  try {
    const liveTestsResult = await dbWrite('exams').count('* as count').where({ status: 'live', exam_for });
    const scheduledTestsResult = await dbWrite('exams').count('* as count').where({ status: 'scheduled', exam_for });
    const pastTestsResult = await dbWrite('exams').count('* as count').where({ status: 'past', exam_for });

    const liveTestsCount = parseInt(liveTestsResult[0].count, 10);
    const scheduledTestsCount = parseInt(scheduledTestsResult[0].count, 10);
    const pastTestsCount = parseInt(pastTestsResult[0].count, 10);

    await logActivity({
      user_id,
      activity: 'Get All Tests Stats',
      status: 'success',
      details: 'All tests stats fetched successfully',
    });

    return res.status(200).json({
      liveTestsCount,
      scheduledTestsCount,
      pastTestsCount,
    });
  } catch (err) {
    console.error('Error fetching all tests stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllStudentsStats = async (req, res) => {
  const user_id = req.user.id;
  const user_role = req.user.role;      // ✅ this line was missing
  const user_branch = req.user.department;
  const exam_for = req.query.exam_for;

  try {
    const totalStudentsResult = await dbWrite('users').count('* as count').where({ role: exam_for, status: 'ACTIVE' });
    const totalStudentsCount = parseInt(totalStudentsResult[0].count, 10);

    await logActivity({
      user_id,
      activity: 'Get All Students Stats',
      status: 'success',
      details: 'All students stats fetched successfully',
    });

    return res.status(200).json({
      totalStudentsCount
    });
  } catch (err) {
    console.error('Error fetching all students stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllStudentsStatsForDepartment = async (req, res) => {
  const user_id = req.user.id;
  const { department, role } = req.query;
  console.log(req.query);


  try {
    const totalStudentsResult = await dbWrite('users').count('* as count').where({ department, status: 'ACTIVE', role });
    const totalStudentsCount = parseInt(totalStudentsResult[0].count, 10);

    await logActivity({
      user_id,
      activity: 'Get All Students Stats for Department',
      status: 'success',
      details: `All students stats for department ${department} fetched successfully`,
    });

    return res.status(200).json({
      totalStudentsCount
    });
  } catch (err) {
    console.error('Error fetching all students stats for department:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getLastExamStats, getAllTestsStats, getAllStudentsStats, getAllStudentsStatsForDepartment };
const express = require("express");
const router = express.Router();
const CodingController = require("../controllers/dsaController");
const CodingExamController = require("../controllers/codingExamController");
const CodingQuestionController = require("../controllers/codingQuestionController");
const CodingSubmissionController = require("../controllers/codingSubmissionController");



router.post("/submit-full", CodingSubmissionController.submitCode);

router.post("/questions/:questionId/test-cases", CodingController.createTestCases);
// Create a new coding question
router.post("/coding-question/create", CodingQuestionController.createQuestion);
// Create a new coding exam
router.post("/coding-exam/create", CodingExamController.createExam);
router.get("/exam/:examId/questions", CodingController.getQuestions);
router.get("/question/:id", CodingController.getQuestion);

module.exports = router;

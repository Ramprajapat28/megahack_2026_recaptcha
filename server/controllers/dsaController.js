const { NodeVM } = require('vm2');
const CodingQuestion = require("../models/CodingQuestion");
const CodingTestCase = require("../models/CodingTestCase");
const CodingSubmission = require("../models/CodingSubmission");

const CodingController = {

  async getQuestions(req, res) {
    const { examId } = req.params;
    const questions = await CodingQuestion.findByExamId(examId);
    res.json(questions);
  },

  async getQuestion(req, res) {
    const { id } = req.params;
    const question = await CodingQuestion.findById(id);
    const sampleTestCases = await CodingTestCase.findByQuestionId(id, true);
    res.json({ ...question, sampleTestCases });
  },

  async submitCode(req, res) {
  const { studentId, questionId, source_code } = req.body;

  try {
    // Fetch all test cases for the question
    const testCases = await CodingTestCase.findByQuestionId(questionId);

    if (!testCases || testCases.length === 0) {
      return res.status(404).json({ message: "No test cases found for this question" });
    }

    const results = [];

    for (const testCase of testCases) {
      const vm = new NodeVM({
        console: 'redirect',
        timeout: 1000, // 1 second max per test case
        sandbox: {}
      });

      let output = null;
      let error = null;

      try {
        // Wrap user code in a function that takes `input` as argument
        const wrappedCode = `
          module.exports = function(input) {
            return (function() {
              ${source_code}
            })();
          }
        `;
        const fn = vm.run(wrappedCode);

        // Parse input safely
        let parsedInput;
        try {
          parsedInput = JSON.parse(testCase.input);
        } catch {
          parsedInput = testCase.input; // if input is a primitive/string
        }

        // Execute code with input
        const result = fn(parsedInput);

        // Capture output as string (for comparison)
        output = result !== undefined ? String(result) : "";

        // Compare output with expected output
        const expected = testCase.expected_output;
        const status = output.trim() === expected.trim() ? "Passed" : "Failed";

        results.push({
          test_case_id: testCase.test_case_id,
          status,
          output,
          error: null
        });

      } catch (err) {
        results.push({
          test_case_id: testCase.test_case_id,
          status: "Error",
          output: null,
          error: err.message
        });
      }
    }

    // Determine overall status
    const overall_status = results.every(r => r.status === "Passed") ? "Accepted" : "Wrong Answer";

    // Save submission (results as valid JSON)
   const submission = await CodingSubmission.create({
  student_id: studentId,
  coding_question_id: questionId,
  language: "js",
  source_code,
  results,  // pass the array directly
  overall_status
});

    res.json({ submission: submission[0], results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error executing submission", error: err.message });
  }
},

  async createTestCases(req, res) {
    const { questionId } = req.params;
    const { testCases, createdBy } = req.body;
    // testCases: [{ input: "...", expected_output: "...", is_sample: true/false, order: 1 }, ...]

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ message: "No test cases provided" });
    }

    try {
      const createdCases = [];
      for (const tc of testCases) {
        const data = {
          coding_question_id: questionId,
          input: tc.input,
          expected_output: tc.expected_output,
          is_sample: tc.is_sample || false,
          order: tc.order || 0,
          created_by: createdBy,
          last_modified_by: createdBy
        };
        const [created] = await CodingTestCase.create(data);
        createdCases.push(created);
      }

      res.status(201).json({ message: "Test cases created", testCases: createdCases });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create test cases", error: err.message });
    }
  }
};

module.exports = CodingController;

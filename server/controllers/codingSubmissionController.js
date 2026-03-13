const { NodeVM } = require("vm2");
const CodingTestCase = require("../models/CodingTestCase");
const CodingSubmission = require("../models/CodingSubmission");

const CodingSubmissionController = {

  async submitCode(req, res) {
    const { studentId, questionId, source_code } = req.body;

    try {
      const testCases = await CodingTestCase.findByQuestionId(questionId);

      if (!testCases || testCases.length === 0) {
        return res.status(404).json({ message: "No test cases found for this question" });
      }

      const results = [];

      for (const testCase of testCases) {
        const vm = new NodeVM({
          console: "redirect",
          timeout: 1000,
          sandbox: {}
        });

        let output = "";
        let error = null;

        try {
          const wrappedCode = `
            module.exports = function(input) {
              return (function() {
                ${source_code}
              })();
            }
          `;
          const fn = vm.run(wrappedCode);

          let parsedInput;
          try {
            parsedInput = JSON.parse(testCase.input);
          } catch {
            parsedInput = testCase.input;
          }

          const result = fn(parsedInput);
          output = result !== undefined && result !== null ? String(result) : "";

          const expected = testCase.expected_output !== null ? String(testCase.expected_output) : "";
          const status = output.trim() === expected.trim() ? "Passed" : "Failed";

          results.push({
            test_case_id: testCase.test_case_id,
            status,
            output,
            error: error !== null ? String(error) : null // ensure JSON-safe
          });

        } catch (err) {
          results.push({
            test_case_id: testCase.test_case_id,
            status: "Error",
            output: "",
            error: err.message ? String(err.message) : "Unknown error"
          });
        }
      }

      const overall_status = results.every(r => r.status === "Passed") ? "Accepted" : "Wrong Answer";

      // --- Critical fix: stringify the results before saving to jsonb ---
      const submission = await CodingSubmission.create({
        student_id: studentId,
        coding_question_id: questionId,
        language: "js",
        source_code,
        results: JSON.stringify(results), // <-- must be string for jsonb insert
        overall_status
      });

      res.json({ submission: submission[0], results });

    } catch (err) {
      console.error("Error submitting code:", err);
      res.status(500).json({ message: "Error executing submission", error: err.message });
    }
  }

};

module.exports = CodingSubmissionController;

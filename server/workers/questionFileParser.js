const { parentPort, workerData } = require("worker_threads");
const ExcelJS = require("exceljs");
const fs = require("fs");
const csvParser = require("csv-parser");
const knex = require("knex");
const knexConfig = require("../knexfile");
const db = knex(knexConfig.api_write);
if (!workerData || !workerData.filePath || !workerData.fileExtension || !workerData.examId) {
    parentPort.postMessage({ status: "error", message: "Invalid worker data provided" });
    return;
}

const validCategories = ["quantitative aptitude", "logical reasoning", "verbal ability", "technical", "general knowledge"];
const validQuestionTypes = ["single_choice", "multiple_choice", "text", "image"];

const parseExcelQuestion = async (filePath, examId) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        const warnings = [];

        const jsonData = [];
        let headers = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                // Read headers from the first row
                headers = row.values.slice(1).map(h => String(h || "").trim().toLowerCase());
                return;
            }
            const values = row.values.slice(1); // skip index 0 (ExcelJS uses 1-based)
            const rowData = {};
            headers.forEach((header, i) => {
                rowData[header] = values[i] ?? null;
            });
            jsonData.push(rowData);
        });

        for (let index = 0; index < jsonData.length; index++) {
            const row = jsonData[index];

            let { question_text, question_type, options_a, options_b, options_c, options_d, correct_option, correct_options, image_url, category } = row;

            if (!question_text || !question_type || !category) {
                warnings.push(`Row ${index + 1}: Skipped due to missing fields.`);
                continue;
            }
            if (image_url === "NULL") image_url = null;

            const categoryType = category.toLowerCase();
            if (!validCategories.includes(categoryType)) {
                warnings.push(`Row ${index + 1}: Invalid category - ${category}`);
                continue;
            }

            if (!validQuestionTypes.includes(question_type)) {
                warnings.push(`Row ${index + 1}: Invalid question type - ${question_type}`);
                continue;
            }

            let optionsObject = null;
            let correctAnswer = null;
            let correctAnswers = null;

            if (question_type === "single_choice") {
                optionsObject = { a: options_a || "", b: options_b || "", c: options_c || "", d: options_d || "" };
                if (!correct_option) {
                    warnings.push(`Row ${index + 1}: Missing correct_option for single_choice.`);
                    continue;
                }
                correctAnswer = correct_option;
            } else if (question_type === "multiple_choice") {
                optionsObject = { a: options_a || "", b: options_b || "", c: options_c || "", d: options_d || "" };
                try {
                    correctAnswers = JSON.parse(correct_options);
                } catch (e) {
                    warnings.push(`Row ${index + 1}: Invalid JSON format in correct_options.`);
                    continue;
                }
            }

            const queryText = `
                INSERT INTO questions (exam_id, question_text, question_type, options, correct_option, correct_options, image_url, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                parseInt(examId) || String(examId),
                question_text, 
                question_type, 
                optionsObject ? JSON.stringify(optionsObject) : null, 
                correctAnswer, 
                correctAnswers ? JSON.stringify(correctAnswers) : null, 
                image_url || null, 
                categoryType
            ];
            
            console.log("Inserting values:", JSON.stringify(values));
            try {
                await db.raw(queryText, values);
            } catch (insertError) {
                console.error("Row insert error:", insertError.message, "Values:", values);
                warnings.push(`Row ${index + 1}: Failed to insert - ${insertError.message}`);
            }
        }

        console.log("All Excel data inserted successfully. Warnings:", warnings);
        return { status: "success", message: "Excel file processed successfully", warnings };
    } catch (err) {
        console.error("Error inserting Excel data:", err.message, err.stack);
        throw err;
    } finally {
        await db.destroy();
    }
};

async function main() {
    try {
        console.log("Starting question file processing...", workerData);

        let result;
        if (workerData.fileExtension === ".xlsx") {
            result = await parseExcelQuestion(workerData.filePath, workerData.examId);
        } else if (workerData.fileExtension === ".csv") {
            result = await parseCSVQuestions(workerData.filePath, workerData.examId);
        } else {
            throw new Error("Invalid file format. Only Excel and CSV are supported.");
        }
        console.log("Processing complete, sending result:", result);
        parentPort.postMessage(result);

        setTimeout(() => {
            try {
                fs.unlinkSync(workerData.filePath);
                console.log("File deleted successfully:", workerData.filePath);
            } catch (err) {
                console.error("Error deleting file:", err);
            }
        }, 5000);
    } catch (error) {
        console.error("Worker main error exact:", error.message, error.stack);
        parentPort.postMessage({ status: "error", message: error.message || "Unknown error in worker" });
    }
}

main().catch((error) => {
    console.error("Unhandled worker error exact:", error.message, error.stack);
    parentPort.postMessage({ status: "error", message: "Unhandled worker error" });
});

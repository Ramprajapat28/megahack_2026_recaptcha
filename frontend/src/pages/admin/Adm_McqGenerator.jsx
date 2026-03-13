import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  MessageCircle,
  Upload,
  Send,
  X,
  FileText,
  Settings,
  ChevronDown,
  FileQuestion,
  Clock,
  Tag,
  Trash2,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import McqSet from "../../components/mcqgenerator/McqSet"; // Import the McqSet component
import InputAreaComponent from "../../components/mcqgenerator/InputArea"; // Import the InputAreaComponent
import {
  setGenerating,
  setError,
  addMcqSet,
  deleteMcqSet,
  clearAllMcqSets,
} from "../../redux/mcqSlice";

const Adm_McqGenerator = ({ onClose }) => {
  const dispatch = useDispatch();
  const { mcqSets, isGenerating, error } = useSelector((state) => state.mcq);

  const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://127.0.0.1:8000";

  const [activeTab, setActiveTab] = useState("topic"); // "topic" | "jd" | "company"

  // shared
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSets, setCollapsedSets] = useState(new Set());
  const [testsData, setTestsData] = useState({ drafted: [], scheduled: [], past: [], live: [] });
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const sidebarRef = useRef(null);

  // Topic tab
  const [topic, setTopic] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // JD tab
  const [jdRole, setJdRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("0-2 years");

  // Company tab
  const [company, setCompany] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [category, setCategory] = useState("technical");

  console.log(mcqSets);
  console.log(selectedQuestions);

  const handleExport = async () => {
    const questions = [];

    mcqSets.forEach((set) => {
      const selected = selectedQuestions[set.id];
      if (selected && selected.size > 0) {
        set.mcqs.forEach((mcq) => {
          if (selected.has(mcq.id)) {
            questions.push({
              question_text: mcq.question,
              question_type: "single_choice", // assuming constant, or replace with `mcq.question_type` if dynamic
              options_a: mcq.options[0] || "",
              options_b: mcq.options[1] || "",
              options_c: mcq.options[2] || "",
              options_d: mcq.options[3] || "",
              correct_option: String.fromCharCode(97 + mcq.correct_answer),
              correct_options: null,
              image_url: mcq.image_url || "", // if available
              category: mcq.category, // fallback
            });
          }
        });
      }
    });

    const payload = { questions };

    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
      const url = `${API_BASE_URL}/api/export/ai_generated_questions`;

      const response = await axios.post(url, payload, {
        withCredentials: true,
        responseType: "blob", // 👈 important for binary Excel file
      });

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "ai_mcq_export.xlsx"; // Set default filename
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log("Export successful and file downloaded.");
    } catch (error) {
      console.error("Export failed", error.response?.data || error.message);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size > 16 * 1024 * 1024) {
        dispatch(setError("File size must be less than 16MB"));
        return;
      }
      setUploadedFile(file);
      dispatch(setError(""));
    } else {
      dispatch(setError("Please upload a PDF file only"));
    }
  };

  // ── Helper: map raw API questions to internal MCQ format ──
  const transformQuestions = (mcqData, topicLabel, catLabel) => {
    return mcqData.map((mcq, index) => {
      const opts = mcq.options || {};
      let options;
      if (opts.A !== undefined) {
        options = [opts.A || "", opts.B || "", opts.C || "", opts.D || ""];
      } else if (Array.isArray(mcq.options)) {
        options = mcq.options;
      } else {
        options = ["Option A", "Option B", "Option C", "Option D"];
      }
      const answerLetter = String(mcq.correct_answer || "A").toUpperCase();
      const correctIndex = { A: 0, B: 1, C: 2, D: 3 }[answerLetter] ?? 0;
      return {
        id: mcq.id || index + 1,
        question: mcq.question || "No question provided",
        options,
        correct_answer: correctIndex,
        explanation: mcq.explanation || "",
        bloom_level: "",
        estimated_time_seconds: 0,
        tags: [],
        category: catLabel,
      };
    });
  };

  // ── Topic generate ──
  const handleTopicGenerate = async () => {
    if (!topic.trim()) {
      dispatch(setError("Please enter a topic"));
      return;
    }
    dispatch(setGenerating(true));
    dispatch(setError(""));
    try {
      // Build payload matching exact required fields
      const payload = { 
        topic: topic.trim(), 
        difficulty: difficulty, 
        category: category,
        num_questions: parseInt(numQuestions) 
      };
      
      // Only attach job_description if it was actually provided
      if (jobDescription.trim()) {
        payload.job_description = jobDescription.trim();
      }

      const response = await axios.post(
        `${AI_API_URL}/api/generate-questions`,
        payload,
        { headers: { "Content-Type": "application/json" }, timeout: 120000 }
      );
      const mcqData = response.data?.questions || response.data;
      if (!Array.isArray(mcqData) || mcqData.length === 0) throw new Error("No questions returned");
      dispatch(addMcqSet({ topic: topic.trim(), difficulty, questionType: "topic", mcqs: transformQuestions(mcqData, topic, "technical"), fileName: null }));
      setTopic("");
      setJobDescription("");
    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message || "Failed to generate questions"));
    } finally {
      dispatch(setGenerating(false));
    }
  };

  // ── JD generate ──
  const handleJdGenerate = async () => {
    if (!jdRole.trim() || !skills.trim()) {
      dispatch(setError("Please enter Role and Skills"));
      return;
    }
    dispatch(setGenerating(true));
    dispatch(setError(""));
    try {
      const response = await axios.post(
        `${AI_API_URL}/api/generate/jd`,
        { 
          role: jdRole.trim(), 
          skills: skills.trim(), 
          experience: experience, 
          difficulty: difficulty, 
          category: category,
          num_questions: parseInt(numQuestions) 
        },
        { headers: { "Content-Type": "application/json" }, timeout: 120000 }
      );
      const mcqData = response.data?.questions || response.data;
      if (!Array.isArray(mcqData) || mcqData.length === 0) throw new Error("No questions returned");
      dispatch(addMcqSet({ topic: `${jdRole} (JD)`, difficulty, questionType: "jd", mcqs: transformQuestions(mcqData, jdRole, "technical"), fileName: null }));
      setJdRole("");
      setSkills("");
    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message || "Failed to generate questions"));
    } finally {
      dispatch(setGenerating(false));
    }
  };

  // ── Company generate ──
  const handleCompanyGenerate = async () => {
    if (!company.trim() || !companyRole.trim()) {
      dispatch(setError("Please enter both Company and Role"));
      return;
    }
    if (numQuestions < 1 || numQuestions > 20) {
      dispatch(setError("Number of questions must be between 1 and 20"));
      return;
    }
    dispatch(setGenerating(true));
    dispatch(setError(""));
    try {
      const response = await axios.post(
        `${AI_API_URL}/api/generate/company`,
        { 
          company: company.trim(), 
          role: companyRole.trim(), 
          difficulty: difficulty, 
          category: category,
          num_questions: parseInt(numQuestions) 
        },
        { headers: { "Content-Type": "application/json" }, timeout: 120000 }
      );
      const mcqData = response.data?.questions;
      if (!Array.isArray(mcqData) || mcqData.length === 0) throw new Error("No questions returned from the API");
      dispatch(addMcqSet({ topic: `${company} – ${companyRole}`, difficulty, questionType: category, mcqs: transformQuestions(mcqData, company, category), fileName: null }));
      setCompany("");
      setCompanyRole("");
    } catch (error) {
      dispatch(setError(error.response?.data?.message || error.message || "Failed to generate questions"));
    } finally {
      dispatch(setGenerating(false));
    }
  };




  const toggleSetCollapse = (setId) => {
    const newCollapsed = new Set(collapsedSets);
    if (newCollapsed.has(setId)) {
      newCollapsed.delete(setId);
    } else {
      newCollapsed.add(setId);
    }
    setCollapsedSets(newCollapsed);
  };

  const handleDeleteSet = (setId) => {
    if (window.confirm("Are you sure you want to delete this MCQ set?")) {
      dispatch(deleteMcqSet(setId));
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all MCQ sets?")) {
      dispatch(clearAllMcqSets());
    }
  };

  // Toggle selection for a single question
  const handleQuestionCheckbox = (setId, questionId) => {
    setSelectedQuestions((prev) => {
      const setSelected = new Set(prev[setId] || []);
      if (setSelected.has(questionId)) {
        setSelected.delete(questionId);
      } else {
        setSelected.add(questionId);
      }
      return { ...prev, [setId]: setSelected };
    });
  };

  // Toggle select all for a set
  const handleSelectAllSet = (setId, allQuestionIds) => {
    setSelectedQuestions((prev) => {
      const setSelected = new Set(prev[setId] || []);
      if (setSelected.size === allQuestionIds.length) {
        // Unselect all
        return { ...prev, [setId]: new Set() };
      } else {
        // Select all
        return { ...prev, [setId]: new Set(allQuestionIds) };
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-100 text-white z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <div>
          <Adm_Sidebar testsData={testsData} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="bg-white">
          <Adm_Navbar setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Header with Mobile Menu */}
        <div className="flex items-center justify-between p-5 bg-gray-100">
          <button
            className="xl:hidden text-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="w-7 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  sidebarOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-700">MCQ Generator</h1>
          <div className="flex items-center gap-3">
            {mcqSets.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-800 flex items-center space-x-1 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
            {/* Export Selected Button */}
            <button
              onClick={handleExport}
              className="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center text-sm"
              disabled={
                !Object.values(selectedQuestions).some(
                  (set) => set && set.size > 0
                )
              }
              title="Export selected questions as JSON"
            >
              <Download className="w-4 h-4 mr-1" />
              Export Selected
            </button>
          </div>
        </div>

        {/* MCQ Generator Content */}
        <div className="flex-1 flex flex-col bg-white mx-5 mb-5 rounded-lg shadow-sm">
          {/* Content Header */}
          <div className="bg-white shadow-sm border-b px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileQuestion className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Generate MCQ Questions
                </h2>
              </div>
              {mcqSets.length > 0 && (
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {mcqSets.length} set{mcqSets.length !== 1 ? "s" : ""}{" "}
                  generated
                </span>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Welcome Message */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileQuestion className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-blue-50 rounded-lg px-4 py-3 shadow-sm border border-blue-200 max-w-2xl">
                <p className="text-gray-700">
                  Hi! I'm here to help you generate MCQ questions. You can
                  either upload a PDF file or provide a topic manually. All your
                  generated MCQ sets will be preserved here.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-2xl">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Generated MCQ Sets */}
            {mcqSets.map((mcqSet) => (
              <McqSet
                key={mcqSet.id}
                mcqSet={mcqSet}
                selectedQuestions={selectedQuestions}
                collapsedSets={collapsedSets}
                onQuestionCheckbox={handleQuestionCheckbox}
                onSelectAllSet={handleSelectAllSet}
                onToggleSetCollapse={toggleSetCollapse}
                onDeleteSet={handleDeleteSet}
                formatTime={formatTime}
                formatDate={formatDate}
              />
            ))}

            {/* Loading State */}
            {isGenerating && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileQuestion className="w-4 h-4 text-blue-600 animate-spin" />
                </div>
                <div className="bg-blue-50 rounded-lg px-4 py-3 shadow-sm border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-blue-700 text-sm font-medium">
                      Generating MCQs... Please wait
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area Component */}
          <InputAreaComponent
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            numQuestions={numQuestions}
            setNumQuestions={setNumQuestions}
            isGenerating={isGenerating}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            topic={topic}
            setTopic={setTopic}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            handleTopicGenerate={handleTopicGenerate}
            jdRole={jdRole}
            setJdRole={setJdRole}
            skills={skills}
            setSkills={setSkills}
            experience={experience}
            setExperience={setExperience}
            handleJdGenerate={handleJdGenerate}
            company={company}
            setCompany={setCompany}
            companyRole={companyRole}
            setCompanyRole={setCompanyRole}
            category={category}
            setCategory={setCategory}
            handleCompanyGenerate={handleCompanyGenerate}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            handleFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default Adm_McqGenerator;
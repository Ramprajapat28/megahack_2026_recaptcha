import React from "react";
import { Upload, Send, ChevronDown, FileText, X, Building2, BookOpen, BriefcaseBusiness } from "lucide-react";

const CATEGORIES = [
  "quantitative aptitude",
  "logical reasoning",
  "verbal ability",
  "technical",
  "general knowledge",
];

const EXPERIENCE_OPTIONS = ["0-2 years", "2-5 years", "5-8 years", "8+ years"];

const InputAreaComponent = ({
  // shared
  difficulty,
  setDifficulty,
  numQuestions,
  setNumQuestions,
  isGenerating,
  activeTab,          // "topic" | "jd" | "company"
  setActiveTab,

  // topic tab
  topic,
  setTopic,
  jobDescription,
  setJobDescription,
  handleTopicGenerate,

  // jd tab
  jdRole,
  setJdRole,
  skills,
  setSkills,
  experience,
  setExperience,
  handleJdGenerate,

  // company tab
  company,
  setCompany,
  companyRole,
  setCompanyRole,
  category,
  setCategory,
  handleCompanyGenerate,

  // legacy PDF (topic/pdf mode)
  uploadedFile,
  setUploadedFile,
  handleFileUpload,
}) => {
  const tabClass = (name) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
      activeTab === name
        ? name === "company"
          ? "bg-white text-purple-700 shadow"
          : name === "jd"
          ? "bg-white text-green-700 shadow"
          : "bg-white text-blue-700 shadow"
        : "text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div className="bg-gray-50 border-t px-6 py-4 rounded-b-lg">
      {/* Tab Switcher */}
      <div className="flex space-x-1 mb-4 bg-gray-200 rounded-lg p-1 w-fit">
        <button onClick={() => setActiveTab("topic")} className={tabClass("topic")}>
          <BookOpen size={14} />
          Topic
        </button>
        <button onClick={() => setActiveTab("jd")} className={tabClass("jd")}>
          <BriefcaseBusiness size={14} />
          Job Description
        </button>
        <button onClick={() => setActiveTab("company")} className={tabClass("company")}>
          <Building2 size={14} />
          Company
        </button>
      </div>

      {/* ── TOPIC MODE ── */}
      {activeTab === "topic" && (
        <div className="flex flex-col lg:flex-row items-end space-y-3 lg:space-y-0 lg:space-x-3">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. SQL, Data Structures"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Job Description (optional)</label>
              <input
                type="text"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="e.g. Data Analyst"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Questions (1-20)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex items-end space-x-2">
            {/* PDF Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">PDF (optional)</label>
              <label className="flex items-center justify-center w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <Upload size={18} className="text-gray-400" />
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-transparent mb-1">Send</label>
              <button
                onClick={handleTopicGenerate}
                disabled={isGenerating}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center transition-colors shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── JD MODE ── */}
      {activeTab === "jd" && (
        <div className="flex flex-col lg:flex-row items-end space-y-3 lg:space-y-0 lg:space-x-3">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={jdRole}
                onChange={(e) => setJdRole(e.target.value)}
                placeholder="e.g. Backend Developer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Skills <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Node.js, SQL, REST"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Experience</label>
              <div className="relative">
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm appearance-none bg-white"
                >
                  {EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm appearance-none bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Questions (1-20)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>

          <div className="flex items-end">
            <div>
              <label className="block text-xs font-medium text-transparent mb-1">Generate</label>
              <button
                onClick={handleJdGenerate}
                disabled={isGenerating}
                className="px-4 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md text-sm font-medium"
              >
                <BriefcaseBusiness size={16} />
                {isGenerating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPANY MODE ── */}
      {activeTab === "company" && (
        <div className="flex flex-col lg:flex-row items-end space-y-3 lg:space-y-0 lg:space-x-3">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. TCS, Amazon"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyRole}
                onChange={(e) => setCompanyRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm appearance-none bg-white capitalize"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm appearance-none bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Questions (1-20)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>

          <div className="flex items-end">
            <div>
              <label className="block text-xs font-medium text-transparent mb-1">Generate</label>
              <button
                onClick={handleCompanyGenerate}
                disabled={isGenerating}
                className="px-4 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md text-sm font-medium"
              >
                <Building2 size={16} />
                {isGenerating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Upload Status */}
      {uploadedFile && activeTab === "topic" && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 bg-white p-3 rounded-lg border">
          <FileText size={16} className="text-blue-600" />
          <span>
            Uploaded: <strong>{uploadedFile.name}</strong> ({(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)
          </span>
          <button onClick={() => setUploadedFile(null)} className="text-red-500 hover:text-red-700 ml-auto">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default InputAreaComponent;
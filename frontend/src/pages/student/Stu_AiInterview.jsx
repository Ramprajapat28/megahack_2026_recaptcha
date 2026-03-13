import React from "react";
import Stu_Sidebar from "../../components/student/Stu_Sidebar";

function Stu_AiInterview() {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Stu_Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">AI Interview</h1>
        </div>

        {/* Embedded AI Interview Page */}
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
          <iframe
            src="https://megahack-2026-recaptcha.onrender.com/"
            title="AI Interview"
            className="absolute inset-0 w-full h-full border-0"
            allow="camera *; microphone *"
          />
        </div>
      </div>
    </div>
  );
}

export default Stu_AiInterview;

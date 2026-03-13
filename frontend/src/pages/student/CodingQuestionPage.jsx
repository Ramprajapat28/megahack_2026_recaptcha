import React, { useState, useEffect } from 'react';
import ProblemDescription from '../../components/coding_test/ProblemDescription';
import CodeEditorPanel from '../../components/coding_test/CodeEditorPanel';
import NoCopyComponent from '../../components/student/mcqexampage/NoCopyComponent';
import { dummyCodingQuestion } from '../../data/dummyCodingQuestion';
import { useNavigate } from 'react-router-dom';

const CodingQuestionPage = () => {
  const navigate = useNavigate();
  const [fullscreenError, setFullscreenError] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  
  const enableFullscreen = () => {
    const rootElement = document.documentElement;
    if (rootElement.requestFullscreen) {
      rootElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      console.warn("Fullscreen API is not supported in this browser.");
    }
  };

  const handleEndTest = () => {
    setTestSubmitted(true);
    alert("Coding Test submitted successfully!");
    navigate("/home", { replace: true });
  };

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !testSubmitted) {
        setFullscreenError(true);
      }
    };
    if (!testSubmitted) {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testSubmitted]);

  // Tab switch detection (Local State for Prototype instead of Redux)
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.hidden && !testSubmitted) {
  //       setTabSwitchCount((prev) => prev + 1);
  //     }
  //   };
  //   document.addEventListener("visibilitychange", handleVisibilityChange);
  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, [testSubmitted]);

  // Tab switch limit enforcement
  useEffect(() => {
    const MAX_TAB_SWITCHES = 5;
    const remainingAttempts = MAX_TAB_SWITCHES - tabSwitchCount;

    if (tabSwitchCount > 0 && tabSwitchCount < MAX_TAB_SWITCHES && !testSubmitted) {
      alert(
        `Switching tabs is not allowed.\nYou have ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} left before the test is auto-submitted.`
      );
    }

    if (tabSwitchCount >= MAX_TAB_SWITCHES && !testSubmitted) {
      alert("You switched tabs too many times. The test will be submitted now.");
      handleEndTest();
    }
  }, [tabSwitchCount, testSubmitted]);

  return (
    <div className="flex flex-col h-screen bg-[#F5F6F8] overflow-hidden font-sans">
      <NoCopyComponent onPermissionGranted={enableFullscreen} />
      
      {fullscreenError && !testSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4 text-red-500">
              Fullscreen Mode Required
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              You have exited fullscreen mode. Please return to fullscreen to continue the exam.
            </p>
            <button
              onClick={() => {
                setFullscreenError(false);
                enableFullscreen();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Re-enter Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 z-10 shadow-sm relative">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-tight text-[#1B2E58]">
            Coding Assessment Mode
          </div>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-sm text-gray-600">
            {dummyCodingQuestion.title}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium bg-[#F1F4F8] text-[#1B2E58] px-4 py-2 rounded border border-gray-200 shadow-sm font-mono flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Time Left: 120:00
          </div>
          <button 
            onClick={handleEndTest}
            className="px-5 py-2 text-sm font-semibold rounded bg-[#4D71C3] text-white hover:bg-blue-600 transition shadow-sm"
          >
            End Test
          </button>
        </div>
      </header>

      {/* Main Workspace Area layout (Split pane style) */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Side: Problem Description */}
        <div className="w-1/2 flex flex-col rounded-lg overflow-hidden border border-gray-200 bg-white shadow-md">
          <ProblemDescription problem={dummyCodingQuestion} />
        </div>

        {/* Right Side: Editor and Console */}
        <div className="w-1/2 flex flex-col rounded-lg overflow-hidden border border-gray-200 bg-white shadow-md">
          <CodeEditorPanel />
        </div>
      </div>
    </div>
  );
};

export default CodingQuestionPage;

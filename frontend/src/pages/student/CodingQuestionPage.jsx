import React, { useState } from 'react';
import ProblemDescription from '../../components/coding/ProblemDescription';
import CodeEditorPanel from '../../components/coding/CodeEditorPanel';
import OutputConsole from '../../components/coding/OutputConsole';

const DUMMY_PROBLEM = {
  id: 1,
  title: "1. Two Sum",
  difficulty: "Easy",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
  inputFormat: "Line 1: An integer N representing the size of the array.\nLine 2: N space-separated integers representing the array elements.\nLine 3: An integer representing the target sum.",
  outputFormat: "Two space-separated integers representing the indices of the two numbers that add up to the target.",
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists."
  ],
  samples: [
    {
      input: "4\n2 7 11 15\n9",
      output: "0 1",
      explanation: "Because nums[0] + nums[1] == 9, we return 0 1."
    },
    {
      input: "3\n3 2 4\n6",
      output: "1 2"
    }
  ]
};

const CodingQuestionPage = () => {
  const [consoleState, setConsoleState] = useState({
    output: '',
    status: null, // 'Pending', 'Accepted', 'Wrong Answer', 'Run Error', etc.
    error: ''
  });

  const handleRunCode = (code, language) => {
    setConsoleState({ output: '', status: 'Pending', error: '' });
    
    // Simulate API call for running code
    setTimeout(() => {
      setConsoleState({
        output: "Test Case 1: Passed\nTest Case 2: Passed\n\nCode executed successfully.",
        status: null,
        error: ''
      });
    }, 1500);
  };

  const handleSubmitCode = (code, language) => {
    setConsoleState({ output: '', status: 'Pending', error: '' });

    // Simulate API call for submitting code
    setTimeout(() => {
      // Randomize result for demo purposes
      const results = [
        { status: 'Accepted', output: 'All test cases passed!\nRuntime: 12ms\nMemory: 4.2MB' },
        { status: 'Wrong Answer', error: 'Failed on Test Case 3.\nExpected: "0 1"\nOutput: "1 2"' },
        { status: 'Time Limit Exceeded', error: 'Execution took longer than 2000ms.' }
      ];
      
      const randomResult = results[0]; // Always make it accepted for a pleasant first experience
      
      setConsoleState({
        output: randomResult.output || '',
        status: randomResult.status,
        error: randomResult.error || ''
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen px-8 py-6 bg-[#F5F6F8] font-sans">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          Coding Assessment
        </h1>
      </div>

      <div className="flex xl:flex-row flex-col h-5/6 flex-1 bg-white p-6 rounded-xl shadow-lg overflow-hidden gap-6">
        {/* Left Panel: Problem Description */}
        <div className="xl:w-1/2 w-full xl:h-full h-1/2 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          <ProblemDescription problem={DUMMY_PROBLEM} />
        </div>

        {/* Right Panel: Editor + Console */}
        <div className="xl:w-1/2 w-full xl:h-full h-1/2 flex flex-col gap-4">
          {/* Editor Section */}
          <div className="flex-1 overflow-hidden rounded-lg border border-gray-200" style={{ minHeight: "50%" }}>
            <CodeEditorPanel onRun={handleRunCode} onSubmit={handleSubmitCode} />
          </div>
          
          {/* Console Section */}
          <div className="h-1/3 min-h-[150px] xl:min-h-[200px] border border-gray-200 rounded-lg overflow-hidden">
            <OutputConsole 
              output={consoleState.output} 
              status={consoleState.status} 
              error={consoleState.error} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingQuestionPage;

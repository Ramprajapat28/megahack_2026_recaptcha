import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import OutputConsole from './OutputConsole';

const DEFAULT_CODE = {
  javascript: 'function twoSum(nums, target) {\n  // Write your code here\n}\n',
  python: 'def twoSum(nums, target):\n    # Write your code here\n    pass\n',
  java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n    }\n}\n',
  cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};\n',
};

const CodeEditorPanel = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE['javascript']);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [resultType, setResultType] = useState('');
  
  // Toggle for exclusively toggling the editor block
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang] || '');
  };

  const handleRunCode = () => {
    setLoading(true);
    setError('');
    setOutput('');
    setResultType('');
    
    // Simulate API call to run code
    setTimeout(() => {
      setLoading(false);
      setOutput('Running test case 1...\nOutput: [0, 1]\nExpected: [0, 1]\nTest case passed!');
    }, 1500);
  };

  const handleSubmitCode = () => {
    setLoading(true);
    setError('');
    setOutput('');
    setResultType('');
    
    // Simulate API call to submit code against hidden test cases
    setTimeout(() => {
      setLoading(false);
      // Randomly simulate pass or fail for demo purposes
      const isAccepted = Math.random() > 0.3; 
      
      if (isAccepted) {
        setResultType('Accepted');
        setOutput('All 54 test cases passed.\nRuntime: 54 ms\nMemory: 41.2 MB');
      } else {
        setResultType('Wrong Answer');
        setOutput('Failed at testcase 12/54.\nInput: nums = [3,2,4], target = 6\nOutput: [0,1]\nExpected: [1,2]');
      }
    }, 2000);
  };

  return (
    <div className={`flex flex-col h-full w-full transition-colors duration-300 ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
      <div className={`flex justify-between items-center px-4 py-3 border-b ${isDarkMode ? 'bg-[#252526] border-[#333]' : 'bg-[#F1F4F8] border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <label htmlFor="language" className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-[#1B2E58]'}`}>
            Language:
          </label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className={`font-medium text-sm rounded shadow-sm px-3 py-1.5 outline-none border focus:ring-2 focus:ring-[#4D71C3] cursor-pointer ${
              isDarkMode 
                ? 'bg-[#333] text-white border-[#444]' 
                : 'bg-white text-[#1B2E58] border-gray-300'
            }`}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Switch to Light Editor" : "Switch to Dark Editor"}
            className={`ml-2 p-1.5 rounded-md flex items-center justify-center transition-colors border ${
              isDarkMode 
                ? 'bg-[#333] text-yellow-400 hover:bg-[#444] border-[#444]' 
                : 'bg-white text-gray-500 hover:bg-gray-100 border-gray-300 shadow-sm'
            }`}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRunCode}
            disabled={loading}
            className={`px-5 py-2 text-sm font-semibold rounded border transition-colors focus:outline-none disabled:opacity-50 ${
              isDarkMode 
                ? 'border-gray-500 text-gray-300 hover:bg-[#333] bg-[#252526]' 
                : 'border-[#4D71C3] text-[#4D71C3] hover:bg-[#F1F4F8] bg-white'
            }`}
          >
            Run Code
          </button>
          <button
            onClick={handleSubmitCode}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold rounded bg-[#4D71C3] text-white hover:opacity-90 transition-opacity focus:outline-none disabled:opacity-50 flex items-center gap-2 shadow-md"
          >
            Submit
          </button>
        </div>
      </div>

      <div className={`flex-1 min-h-[300px] border-b ${isDarkMode ? 'border-[#333] bg-[#1e1e1e]' : 'border-gray-200 bg-[#FAFAFA]'}`}>
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          theme={isDarkMode ? 'vs-dark' : 'vs-light'}
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          }}
        />
      </div>

      <div className={`h-1/3 min-h-[240px] border-t-4 ${isDarkMode ? 'border-[#2d2d2d] bg-[#1e1e1e]' : 'border-[#F5F6F8] bg-white'}`}>
        <OutputConsole 
          output={output} 
          error={error} 
          loading={loading} 
          resultType={resultType}
          isDarkMode={isDarkMode}
          onClear={() => { setOutput(''); setError(''); setResultType(''); }}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;

import React from 'react';

const OutputConsole = ({ output, loading, error, resultType, onClear, isDarkMode }) => {
  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-[#1e1e1e] text-gray-300' : 'bg-white text-gray-800'}`}>
      <div className={`flex justify-between items-center px-5 py-3 border-b ${isDarkMode ? 'bg-[#252526] border-[#333]' : 'bg-[#F1F4F8] border-gray-200'}`}>
        <span className={`font-bold text-sm tracking-wide uppercase ${isDarkMode ? 'text-gray-300' : 'text-[#1B2E58]'}`}>
          Execution Console
        </span>
        <button 
          onClick={onClear}
          className={`text-xs font-semibold px-3 py-1 rounded border flex items-center gap-1 transition-colors shadow-sm ${
            isDarkMode 
              ? 'border-[#444] bg-[#333] text-gray-300 hover:bg-[#444]' 
              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 font-mono text-[14px]">
        {loading ? (
          <div className={`flex items-center font-semibold text-sm ${isDarkMode ? 'text-blue-400' : 'text-[#4D71C3]'}`}>
            <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-[#4D71C3]'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Running your code...
          </div>
        ) : output || error || resultType ? (
          <div className="flex flex-col gap-3">
            {resultType && (
              <div className={`text-lg font-bold mb-1 ${
                resultType === 'Accepted' ? (isDarkMode ? 'text-green-400' : 'text-green-600') : 
                resultType === 'Wrong Answer' ? (isDarkMode ? 'text-red-400' : 'text-red-500') :
                (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')
              }`}>
                {resultType}
              </div>
            )}
            
            {error ? (
              <pre className={`whitespace-pre-wrap font-mono p-3 rounded border ${
                isDarkMode ? 'text-red-400 bg-red-900/20 border-red-900/50' : 'text-red-600 bg-red-50 border-red-200'
              }`}>{error}</pre>
            ) : output ? (
              <div className="flex flex-col gap-2">
                <span className={`font-bold text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-[#1B2E58]'}`}>Output Logs</span>
                <pre className={`whitespace-pre-wrap p-4 rounded text-sm leading-relaxed overflow-x-auto ${
                  isDarkMode ? 'bg-[#252526] border border-[#333] text-gray-300' : 'bg-[#f8f9fa] border border-gray-200 text-gray-800 shadow-inner'
                }`}>{output}</pre>
              </div>
            ) : null}
          </div>
        ) : (
          <div className={`h-full flex flex-col items-center justify-center opacity-60 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Run or Submit code to see output logs</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;

import React from 'react';

const OutputConsole = ({ output, status, error }) => {
  return (
    <div className="h-full bg-[#1e1e1e] text-white p-4 font-mono text-sm overflow-y-auto border-t border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-300 font-semibold uppercase tracking-wider text-xs">Console</h3>
        {status && (
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            status === 'Accepted' ? 'bg-green-600 text-white' : 
            status === 'Pending' ? 'bg-yellow-600 text-white' :
            'bg-red-600 text-white'
          }`}>
            {status}
          </span>
        )}
      </div>
      
      <div className="bg-[#2d2d2d] p-3 rounded min-h-[100px]">
        {error ? (
          <pre className="text-red-400 whitespace-pre-wrap font-mono">{error}</pre>
        ) : output ? (
          <pre className="text-green-400 whitespace-pre-wrap font-mono">{output}</pre>
        ) : (
          <span className="text-gray-500 italic">Run or submit code to see output...</span>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;

import React from 'react';

const ProblemDescription = ({ problem }) => {
  if (!problem) return null;

  return (
    <div className="h-full overflow-y-auto p-8 bg-white text-gray-800">
      <div className="flex flex-col mb-6 gap-2">
        <h1 className="text-3xl font-bold text-[#1B2E58]">{problem.id}. {problem.title}</h1>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 text-xs font-bold rounded ${
            problem.difficulty === 'Easy' ? 'bg-[#e5f4eb] text-[#2db55d]' :
            problem.difficulty === 'Medium' ? 'bg-[#fff5e5] text-[#f2a22c]' :
            'bg-[#ffebe5] text-[#f2332c]'
          }`}>
            {problem.difficulty}
          </span>
        </div>
      </div>

      {/* Separator line */}
      <hr className="border-gray-200 mb-6" />

      <div className="mb-8">
        <div className="prose max-w-none text-[15px] leading-relaxed whitespace-pre-wrap text-gray-700">
          {problem.description}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-[#1B2E58]">Input Format</h2>
        <div className="text-[15px] whitespace-pre-wrap bg-[#F1F4F8] p-4 rounded border border-gray-200 text-gray-700">
          {problem.inputFormat}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-[#1B2E58]">Output Format</h2>
        <div className="text-[15px] whitespace-pre-wrap bg-[#F1F4F8] p-4 rounded border border-gray-200 text-gray-700">
          {problem.outputFormat}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-[#1B2E58]">Constraints</h2>
        <ul className="list-none space-y-2">
          {problem.constraints.map((constraint, idx) => (
            <li key={idx}>
              <code className="bg-[#F1F4F8] text-[#1349C5] px-3 py-1.5 rounded text-sm font-semibold inline-block border border-gray-200">
                {constraint}
              </code>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6 border-t border-gray-200 pt-8 mt-8">
        <h2 className="text-xl font-bold mb-5 text-[#1B2E58]">Examples</h2>
        
        <div className="bg-[#F1F4F8] border-l-4 border-[#4D71C3] p-5 mb-4 rounded-r-lg shadow-sm">
          <h3 className="font-bold text-[#1B2E58] mb-3 text-sm flex items-center gap-2">
            Example 1
          </h3>
          <div className="font-mono text-[14px] text-gray-800 space-y-4">
            <div>
              <strong className="text-gray-500 font-sans text-xs uppercase tracking-wider block mb-1">Input</strong>
              <pre className="bg-white p-3 rounded border border-gray-200 text-gray-800">{problem.sampleInput}</pre>
            </div>
            <div>
              <strong className="text-gray-500 font-sans text-xs uppercase tracking-wider block mb-1">Output</strong>
              <pre className="bg-white p-3 rounded border border-gray-200 text-gray-800">{problem.sampleOutput}</pre>
            </div>
            {problem.explanation && (
              <div className="font-sans text-[14px] leading-relaxed border-t border-gray-200 pt-3 mt-3">
                <strong className="text-gray-700">Explanation:</strong> 
                <span className="ml-2 text-gray-600">{problem.explanation}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDescription;

import React from 'react';

const ProblemDescription = ({ problem }) => {
  return (
    <div className="h-full overflow-y-auto p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{problem.title}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold 
          ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'}`}>
          {problem.difficulty}
        </span>
      </div>
      
      <div className="prose max-w-none text-gray-700">
        <div className="mb-6 whitespace-pre-wrap">
          <p>{problem.description}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Input Format:</h3>
          <p className="whitespace-pre-wrap">{problem.inputFormat}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Output Format:</h3>
          <p className="whitespace-pre-wrap">{problem.outputFormat}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Constraints:</h3>
          <ul className="list-disc pl-5">
            {problem.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Examples:</h3>
          {problem.samples.map((sample, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-semibold mb-1">Sample Input {index + 1}:</p>
              <pre className="bg-gray-100 p-2 rounded text-sm mb-3 font-mono text-black whitespace-pre-wrap">{sample.input}</pre>
              <p className="font-semibold mb-1">Sample Output {index + 1}:</p>
              <pre className="bg-gray-100 p-2 rounded text-sm font-mono text-black whitespace-pre-wrap">{sample.output}</pre>
              {sample.explanation && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold">Explanation: </span>
                  {sample.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProblemDescription;

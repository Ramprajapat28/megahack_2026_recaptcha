import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGES = {
  cpp: { name: 'C++', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}' },
  java: { name: 'Java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}' },
  python: { name: 'Python', defaultCode: 'def solve():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solve()' },
  javascript: { name: 'JavaScript', defaultCode: 'function solve() {\n    // Write your code here\n}\n\nsolve();' }
};

const CodeEditorPanel = ({ onRun, onSubmit }) => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(LANGUAGES['python'].defaultCode);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(LANGUAGES[newLang].defaultCode);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center gap-3">
          <label htmlFor="language" className="text-sm font-medium text-gray-300">Language:</label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="bg-[#3c3c3c] text-white text-sm rounded border border-gray-600 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key}>{lang.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onRun(code, language)}
            className="px-4 py-1.5 bg-[#4D71C3] hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Run Code
          </button>
          <button
            onClick={() => onSubmit(code, language)}
            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Submit Code
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value)}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;

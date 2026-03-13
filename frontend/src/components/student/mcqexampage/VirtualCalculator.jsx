import React, { useState, useRef, useEffect } from 'react';

const VirtualCalculator = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  useEffect(() => {
    // Initial position to be centered relative to the Question container
    setPosition({
      x: window.innerWidth / 2 - 170, // half of 340px width
      y: window.innerHeight / 2 - 200,
    });
  }, []);

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition((prevPos) => ({
        x: prevPos.x + e.movementX,
        y: prevPos.y + e.movementY,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleButtonClick = (value) => {
    if (value === '=') {
      if (!input.trim()) return;
      try {
        let expr = input
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/√\(/g, 'Math.sqrt(')
          .replace(/\^/g, '**');

        const result = new Function('return ' + expr)();
        
        if (!isFinite(result) || isNaN(result)) {
           setInput('Error');
        } else {
           setInput(String(Math.round(result * 100000000) / 100000000));
        }
      } catch (error) {
        setInput('Error');
      }
    } else if (value === 'C') {
      setInput('');
    } else if (value === '←') {
      setInput(input.slice(0, -1));
    } else if (['sin', 'cos', 'tan', 'log', 'ln', '√'].includes(value)) {
      if (input === 'Error') {
        setInput(value + '(');
      } else {
        setInput(input + value + '(');
      }
    } else {
      if (input === 'Error') {
        setInput(value);
      } else {
        setInput(input + value);
      }
    }
  };

  const buttons = [
    ['sin', 'cos', 'tan', 'C', '←'],
    ['log', 'ln', '√', '(', ')'],
    ['π', 'e', '^', '%', '÷'],
    ['7', '8', '9', '×', '-'],
    ['4', '5', '6', '+', '='],
    ['1', '2', '3', '0', '.']
  ];

  return (
    <div
      className="fixed z-[100] bg-white border border-gray-300 shadow-xl rounded-lg w-[340px] overflow-hidden select-none"
      style={{ left: position.x, top: position.y }}
    >
      {/* Header / Drag Handle */}
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        className="bg-[#1B2E58] text-white px-4 py-2 flex justify-between items-center cursor-move"
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="font-semibold text-sm">Calculator</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-white hover:text-red-400 font-bold focus:outline-none p-1 transition-colors"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Display */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <input
          type="text"
          value={input}
          readOnly
          className="w-full bg-white text-right p-2 border-b-2 border-transparent focus:border-blue-500 shadow-sm text-xl font-mono tracking-wider outline-none text-gray-800"
          placeholder="0"
        />
      </div>

      {/* Keystrokes */}
      <div className="p-3 grid grid-cols-5 gap-2 bg-white">
        {buttons.flat().map((btn, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(btn === '%' ? '*(0.01)' : btn)}
            className={`p-2 text-sm font-semibold rounded-md shadow-sm active:scale-95 transition-all
              ${
                ['÷', '×', '-', '+', '=', '%'].includes(btn)
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                  : btn === 'C' || btn === '←'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                  : ['sin', 'cos', 'tan', 'log', 'ln', '√', 'π', 'e', '^', '(', ')'].includes(btn)
                  ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VirtualCalculator;

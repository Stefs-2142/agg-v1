import React from 'react';

export function Logo() {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="text-blue-600"
    >
      {/* Outer hexagon */}
      <path
        d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z"
        className="fill-current opacity-20"
      />
      {/* Inner hexagon */}
      <path
        d="M12 5L17.5 8.5V15.5L12 19L6.5 15.5V8.5L12 5Z"
        className="fill-current opacity-40"
      />
      {/* Center circle */}
      <circle
        cx="12"
        cy="12"
        r="3"
        className="fill-current"
      />
      {/* Connection lines */}
      <path
        d="M12 9L15 10.5M12 9L9 10.5M12 15L15 13.5M12 15L9 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
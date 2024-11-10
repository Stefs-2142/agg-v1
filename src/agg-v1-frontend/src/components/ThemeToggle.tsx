import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative flex items-center w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute left-1 flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          isDark ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-500" />
        ) : (
          <Moon className="w-4 h-4 text-gray-600" />
        )}
      </div>
      <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </button>
  );
}
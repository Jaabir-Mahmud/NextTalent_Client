import React from 'react';
import { motion } from 'framer-motion';

const SectionNavigation = ({ sections, activeSection, setActiveSection, isDark }) => {
  return (
    <div className={`rounded-xl p-2 sm:p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Sections</h3>
      <div className="flex overflow-x-auto sm:flex-wrap gap-1 sm:gap-2 pb-2 sm:pb-0">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeSection === section.id
                ? isDark
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-indigo-500 text-white shadow-lg'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {section.icon} {section.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SectionNavigation; 
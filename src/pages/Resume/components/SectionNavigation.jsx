import React from 'react';
import { motion } from 'framer-motion';

const SectionNavigation = ({ sections = [], activeSection, onSectionChange, isDark }) => {
  // Handle case where sections might be empty or undefined
  if (!sections || sections.length === 0) {
    return (
      <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <p className="text-gray-500 text-sm">No sections available</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl p-2 sm:p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
    >
      <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Sections</h3>
      <div className="flex overflow-x-auto sm:flex-wrap gap-1 sm:gap-2 pb-2 sm:pb-0">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            onClick={() => onSectionChange?.(section.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
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
            {section.icon} {section.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default SectionNavigation; 
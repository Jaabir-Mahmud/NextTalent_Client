import React from 'react';
import { motion } from 'framer-motion';

const TemplateSwitcher = ({ selectedTemplate, setSelectedTemplate, templates, isDark }) => {
  return (
    <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Choose Template</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-xs sm:text-sm ${
              selectedTemplate === template.id
                ? isDark
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-indigo-500 bg-indigo-500 text-white'
                : isDark
                ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
            }`}
          >
            <div className="font-medium mb-1">{template.icon}</div>
            <div className="font-medium">{template.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSwitcher; 
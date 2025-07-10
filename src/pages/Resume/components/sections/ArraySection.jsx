import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sectionDefaults } from '../../data/resumeData';

const ArraySection = ({ section, data, addItem, removeItem, updateItem, isDark }) => {
  const getDefaultItem = () => {
    return sectionDefaults[section] || {};
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {data.map((item, index) => (
        <div key={index} className={`p-3 sm:p-4 rounded-lg border ${
          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm sm:text-base">
              {section.charAt(0).toUpperCase() + section.slice(1)} #{index + 1}
            </h4>
            <button
              onClick={() => removeItem(section, index)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                isDark 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              Remove
            </button>
          </div>
          
          <div className="space-y-3">
            {Object.keys(item).map((field) => (
              <div key={field}>
                <label className={`block text-xs sm:text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                </label>
                {field === 'description' || field === 'achievements' ? (
                  <textarea
                    value={item[field] || ''}
                    onChange={(e) => updateItem(section, index, field, e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={`Enter ${field}...`}
                  />
                ) : field === 'level' || field === 'proficiency' ? (
                  <select
                    value={item[field] || ''}
                    onChange={(e) => updateItem(section, index, field, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select level...</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={item[field] || ''}
                    onChange={(e) => updateItem(section, index, field, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={`Enter ${field}...`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <button
        onClick={() => addItem(section)}
        className={`w-full py-3 px-4 rounded-lg border-2 border-dashed transition-all duration-200 text-sm font-medium ${
          isDark 
            ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700' 
            : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        + Add {section.charAt(0).toUpperCase() + section.slice(1)}
      </button>
    </div>
  );
};

export default ArraySection; 
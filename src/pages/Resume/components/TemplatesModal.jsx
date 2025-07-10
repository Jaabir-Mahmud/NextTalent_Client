import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TemplatesModal = ({ open, onClose, onLoad, onDelete, isDark }) => {
  const templates = JSON.parse(localStorage.getItem('resumeTemplates') || '[]');
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        >
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Your Templates</h3>
              <button onClick={onClose} className="text-lg font-bold">✕</button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {templates.length === 0 ? (
                <div className="text-sm opacity-70">No saved templates.</div>
              ) : (
                templates.map((template, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs opacity-70">{new Date(template.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-800'}`}
                        onClick={() => onLoad(template.data)}
                      >
                        Load
                      </button>
                      <button
                        className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800'}`}
                        onClick={() => onDelete(template.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplatesModal; 
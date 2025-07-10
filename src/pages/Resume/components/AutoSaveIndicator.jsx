import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AutoSaveIndicator = ({ isDark, lastSaved, isSaving }) => {
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (isSaving || lastSaved) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50 ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } border ${
            isDark ? 'border-gray-600' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                <span className="text-sm">Saving...</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Saved at {formatTime(lastSaved)}</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AutoSaveIndicator; 
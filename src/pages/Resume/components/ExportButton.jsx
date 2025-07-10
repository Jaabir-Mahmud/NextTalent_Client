import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';

const SaveAsButton = ({ isDark }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleExportPDF = () => {
    const element = document.getElementById('resume-preview');
    if (!element) {
      alert('Resume preview not found!');
      return;
    }
    html2pdf()
      .set({
        margin: 0.5,
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .from(element)
      .save();
    setOpen(false);
  };

  const handleExportDOC = () => {
    const element = document.getElementById('resume-preview');
    if (!element) {
      alert('Resume preview not found!');
      return;
    }
    const html = element.outerHTML;
    const blob = new Blob([
      `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Resume</title></head><body>${html}</body></html>`
    ], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume.doc';
    link.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((o) => !o)}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
          isDark
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
            : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
        } shadow-lg hover:shadow-xl`}
      >
        💾 Save As
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute left-0 mt-2 w-full z-10 rounded-xl shadow-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <button
              onClick={handleExportPDF}
              className="w-full text-left px-6 py-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-t-xl"
            >
              📄 Save as PDF
            </button>
            <button
              onClick={handleExportDOC}
              className="w-full text-left px-6 py-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-b-xl"
            >
              📝 Save as DOC
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SaveAsButton; 
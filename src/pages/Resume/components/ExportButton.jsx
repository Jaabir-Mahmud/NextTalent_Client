import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';

const SaveAsButton = ({ isDark }) => {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('resume-preview');
      if (!element) {
        alert('Resume preview not found! Please make sure you have created a resume first.');
        return;
      }

      // Create a clone of the element for PDF generation
      const clone = element.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '8.5in';
      clone.style.height = '11in';
      clone.style.margin = '0';
      clone.style.padding = '0.5in';
      clone.style.backgroundColor = 'white';
      clone.style.color = 'black';
      document.body.appendChild(clone);

      await html2pdf()
        .set({
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: 'resume.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff',
            width: 816, // 8.5 inches * 96 DPI
            height: 1056 // 11 inches * 96 DPI
          },
          jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          }
        })
        .from(clone)
        .save();

      // Clean up the clone
      document.body.removeChild(clone);
      setOpen(false);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDOC = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('resume-preview');
      if (!element) {
        alert('Resume preview not found! Please make sure you have created a resume first.');
        return;
      }

      // Create a clean HTML document for Word export
      const html = element.outerHTML;
      const cleanHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset='utf-8'>
            <title>Resume</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 1in; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `;
      
      const blob = new Blob([cleanHtml], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'resume.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (error) {
      console.error('DOC export error:', error);
      alert('Failed to export DOC. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
        disabled={isExporting}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
          isDark
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
            : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
        } shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isExporting ? '⏳ Exporting...' : '💾 Save As'}
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
              disabled={isExporting}
              className="w-full text-left px-6 py-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-t-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📄 Save as PDF
            </button>
            <button
              onClick={handleExportDOC}
              disabled={isExporting}
              className="w-full text-left px-6 py-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-b-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
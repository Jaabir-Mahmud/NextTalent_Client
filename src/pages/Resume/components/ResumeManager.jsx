import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import TemplatesModal from './TemplatesModal';
import PDFEditModal from './PDFEditModal';

const ResumeManager = ({ onLoadResume, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('uploadedResumeFiles') || '[]');
    } catch {
      // localStorage unavailable or corrupted
      return [];
    }
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [editPdf, setEditPdf] = useState(null);
  const [resumeName, setResumeName] = useState('');

  const handleDeleteTemplate = (name) => {
    let templates = [];
    try {
      templates = JSON.parse(localStorage.getItem('resumeTemplates') || '[]');
    } catch {
      // localStorage unavailable or corrupted
    }
    const filtered = templates.filter(t => t.name !== name);
    localStorage.setItem('resumeTemplates', JSON.stringify(filtered));
    setMessage('Template deleted!');
    setMessageType('success');
    // If modal is open, force re-render
    setShowTemplates(false); setTimeout(() => setShowTemplates(true), 10);
  };

  const handleExport = () => {
    const data = JSON.stringify(uploadedFiles, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeName || 'resume'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage('Resume exported!');
    setMessageType('success');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setUploadedFiles(data);
          localStorage.setItem('uploadedResumeFiles', JSON.stringify(data));
          setMessage('Resume imported!');
          setMessageType('success');
        } catch (error) {
          setMessage('Error importing resume: Invalid JSON file.');
          setMessageType('error');
        }
      };
      reader.readAsText(file);
    } else if (ext === 'pdf' || ext === 'doc' || ext === 'docx') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const files = [...uploadedFiles, {
          name: file.name,
          type: file.type,
          data: e.target.result,
          uploadedAt: new Date().toISOString()
        }];
        setUploadedFiles(files);
        localStorage.setItem('uploadedResumeFiles', JSON.stringify(files));
        setMessage('File uploaded!');
        setMessageType('success');
      };
      reader.readAsDataURL(file);
    } else {
      setMessage('Unsupported file type. Only JSON, PDF, and DOC/DOCX are allowed.');
      setMessageType('error');
    }
  };

  const handleShare = () => {
    const data = JSON.stringify(uploadedFiles, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const shareUrl = `${window.location.origin}/resume?data=${encodeURIComponent(url)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setMessage('Resume shared!');
      setMessageType('success');
    }).catch(() => {
      setMessage('Failed to copy share link.');
      setMessageType('error');
    });
  };

  const handleSaveAsTemplate = () => {
    if (!resumeName) {
      setMessage('Please enter a name for the template.');
      setMessageType('error');
      return;
    }
    const template = {
      name: resumeName,
      data: uploadedFiles,
      createdAt: new Date().toISOString(),
    };
    let templates = [];
    try {
      templates = JSON.parse(localStorage.getItem('resumeTemplates') || '[]');
    } catch {}
    templates.push(template);
    localStorage.setItem('resumeTemplates', JSON.stringify(templates));
    setMessage('Template saved!');
    setMessageType('success');
    setShowTemplates(false);
    setResumeName('');
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          isDark 
            ? 'bg-purple-600 text-white hover:bg-purple-700' 
            : 'bg-purple-500 text-white hover:bg-purple-600'
        }`}
      >
        ⚙️ Resume Manager
      </button>
      <TemplatesModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onLoad={(data) => { onLoadResume(data); setShowTemplates(false); setMessage('Template loaded!'); setMessageType('success'); }}
        onDelete={handleDeleteTemplate}
        isDark={isDark}
      />

      {message && (
        <div className={`mt-2 px-4 py-2 rounded-lg text-sm ${
          messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${isDark ? 'dark' : ''}`}
            style={{ backdropFilter: 'blur(2px)' }}
          >
            <div
              className={`rounded-xl shadow-lg w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[98vh] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 relative overflow-auto p-2 sm:p-4`}
              style={{ minWidth: 0, minHeight: 0 }}
            >
              <div className="flex justify-between items-center mb-2 sm:mb-4">
                <h4 className="font-semibold text-base sm:text-lg mb-0">Resume Management</h4>
                <button
                  className="text-2xl font-bold text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >✕</button>
              </div>
              <button
                className={`mb-4 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${isDark ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-800'}`}
                onClick={() => setShowTemplates(true)}
              >
                📁 Your Templates
              </button>
              <div className="space-y-4">
                {/* Resume Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Resume Name
                  </label>
                  <input
                    type="text"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExport}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    📤 Export
                  </button>

                  <label className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isDark ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'
                  }`}>
                    📥 Import (JSON, PDF, DOC)
                    <input
                      type="file"
                      accept=".json,.pdf,.doc,.docx"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleShare}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isDark ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    🔗 Share
                  </button>

                  <button
                    onClick={handleSaveAsTemplate}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isDark ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}
                  >
                    💾 Save Template
                  </button>
                </div>

                {/* Template List */}
                <div>
                  <h5 className="font-medium mb-2">Saved Templates</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(() => {
                      let templates = [];
                      try {
                        templates = JSON.parse(localStorage.getItem('resumeTemplates') || '[]');
                      } catch {}
                      return templates.length > 0 ? (
                        templates.map((template, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              onLoadResume(template.data);
                              setMessage(`Loaded template: ${template.name}`);
                              setMessageType('success');
                            }}
                          >
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs opacity-70">
                              {new Date(template.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm opacity-70">No saved templates</p>
                      );
                    })()}
                  </div>
                </div>

                {/* Uploaded Files List */}
                <div>
                  <h5 className="font-medium mb-2">Uploaded Files (PDF/DOC)</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadedFiles.length > 0 ? (
                      uploadedFiles.map((file, idx) => (
                        <div key={idx} className={`p-2 rounded-lg flex items-center gap-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className="font-medium text-sm">{file.name}</span>
                          <a
                            href={file.data}
                            download={file.name}
                            className="text-indigo-500 underline text-xs"
                          >
                            Download
                          </a>
                          {file.type.startsWith('application/pdf') && (
                            <>
                              <a href={file.data} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">View</a>
                              <button
                                className={`ml-1 px-2 py-1 rounded text-xs ${isDark ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800'}`}
                                onClick={() => {
                                  const files = uploadedFiles.filter(f => f !== file);
                                  setUploadedFiles(files);
                                  localStorage.setItem('uploadedResumeFiles', JSON.stringify(files));
                                  setMessage('PDF deleted!');
                                  setMessageType('success');
                                }}
                              >
                                Delete
                              </button>
                              <button
                                className={`ml-1 px-2 py-1 rounded text-xs ${isDark ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-800'}`}
                                onClick={() => setEditPdf(file)}
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm opacity-70">No uploaded PDF/DOC files</p>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-gray-500">Only JSON files will update your resume. PDF/DOC files are stored for download/viewing only.</p>
                </div>
              </div>
              <PDFEditModal
                open={!!editPdf}
                file={editPdf}
                onClose={() => setEditPdf(null)}
                onSave={(newDataUrl, newName) => {
                  // Update file in uploadedFiles and localStorage
                  const updated = uploadedFiles.map(f =>
                    (f.name === editPdf.name && f.uploadedAt === editPdf.uploadedAt)
                      ? { ...f, data: newDataUrl, name: newName }
                      : f
                  );
                  setUploadedFiles(updated);
                  localStorage.setItem('uploadedResumeFiles', JSON.stringify(updated));
                  setMessage('PDF updated!');
                  setMessageType('success');
                  setEditPdf(null);
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeManager; 
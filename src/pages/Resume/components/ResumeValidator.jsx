import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ResumeValidator = ({ resumeData, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [validationResults, setValidationResults] = useState([]);

  const validateResume = () => {
    const issues = [];
    const suggestions = [];
    let totalChecks = 0;
    let passedChecks = 0;

    // Personal Info
    totalChecks += 3;
    if (!resumeData.personal.fullName) {
      issues.push('Missing full name');
    } else {
      passedChecks++;
    }
    if (!resumeData.personal.email) {
      issues.push('Missing email address');
    } else {
      passedChecks++;
    }
    if (!resumeData.personal.summary) {
      suggestions.push('Add a professional summary to make your resume stand out');
    } else {
      passedChecks++;
    }

    // Experience
    totalChecks++;
    if (resumeData.experience.length === 0) {
      issues.push('No work experience listed');
    } else {
      let allExpOk = true;
      resumeData.experience.forEach((exp, index) => {
        if (!exp.position) {
          issues.push(`Experience ${index + 1}: Missing job title`);
          allExpOk = false;
        }
        if (!exp.company) {
          issues.push(`Experience ${index + 1}: Missing company name`);
          allExpOk = false;
        }
        if (!exp.description) {
          suggestions.push(`Experience ${index + 1}: Add detailed description of your role`);
        }
      });
      if (allExpOk) passedChecks++;
    }

    // Education
    totalChecks++;
    if (resumeData.education.length === 0) {
      suggestions.push('Consider adding your educational background');
    } else {
      let allEduOk = true;
      resumeData.education.forEach((edu, index) => {
        if (!edu.degree) {
          issues.push(`Education ${index + 1}: Missing degree`);
          allEduOk = false;
        }
        if (!edu.institution) {
          issues.push(`Education ${index + 1}: Missing institution`);
          allEduOk = false;
        }
        if (!edu.startDate || !edu.endDate) {
          suggestions.push(`Education ${index + 1}: Add start and end years`);
        }
      });
      if (allEduOk) passedChecks++;
    }

    // Skills
    totalChecks++;
    if (resumeData.skills.length === 0) {
      suggestions.push('Add relevant skills to showcase your expertise');
    } else {
      let allSkillsOk = true;
      resumeData.skills.forEach((skill, index) => {
        if (!skill.name) {
          issues.push(`Skill ${index + 1}: Missing skill name`);
          allSkillsOk = false;
        }
      });
      if (allSkillsOk) passedChecks++;
    }

    // Projects
    totalChecks++;
    if (resumeData.projects.length === 0) {
      suggestions.push('Add projects to demonstrate your practical experience');
    } else {
      let allProjOk = true;
      resumeData.projects.forEach((proj, index) => {
        if (!proj.name) {
          issues.push(`Project ${index + 1}: Missing project name`);
          allProjOk = false;
        }
        if (!proj.description) {
          suggestions.push(`Project ${index + 1}: Add a description for your project`);
        }
      });
      if (allProjOk) passedChecks++;
    }

    // Certifications (optional)
    if (resumeData.certifications.length > 0) {
      resumeData.certifications.forEach((cert, index) => {
        if (!cert.name) {
          issues.push(`Certification ${index + 1}: Missing certification name`);
        }
      });
    }

    // Awards (optional)
    if (resumeData.awards.length > 0) {
      resumeData.awards.forEach((award, index) => {
        if (!award.name) {
          issues.push(`Award ${index + 1}: Missing award name`);
        }
      });
    }

    // Languages (optional)
    if (resumeData.languages.length > 0) {
      resumeData.languages.forEach((lang, index) => {
        if (!lang.language) {
          issues.push(`Language ${index + 1}: Missing language name`);
        }
      });
    }

    // Interests (optional)
    if (resumeData.interests.length > 0) {
      resumeData.interests.forEach((interest, index) => {
        if (!interest.interest) {
          issues.push(`Interest ${index + 1}: Missing interest name`);
        }
      });
    }

    const score = Math.round((passedChecks / totalChecks) * 100);

    setValidationResults({
      score,
      issues,
      suggestions,
      totalChecks,
      passedChecks
    });
  };

  const handleValidate = () => {
    validateResume();
    setIsOpen(true);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="mb-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleValidate}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          isDark 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        🔍 Validate Resume
      </motion.button>

      <AnimatePresence>
        {isOpen && validationResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-3 p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Resume Validation Results</h4>
              <span className={`text-2xl font-bold ${getScoreColor(validationResults.score)}`}>
                {validationResults.score}%
              </span>
            </div>

            <div className="space-y-4">
              {/* Issues */}
              {validationResults.issues.length > 0 && (
                <div>
                  <h5 className="font-medium text-red-500 mb-2">Issues to Fix:</h5>
                  <ul className="space-y-1">
                    {validationResults.issues.map((issue, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <span className="text-red-500">⚠️</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {validationResults.suggestions.length > 0 && (
                <div>
                  <h5 className="font-medium text-blue-500 mb-2">Suggestions:</h5>
                  <ul className="space-y-1">
                    {validationResults.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <span className="text-blue-500">💡</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                <p className="text-sm opacity-70">
                  {validationResults.passedChecks} of {validationResults.totalChecks} checks passed
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeValidator; 
import React from 'react';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import MinimalistTemplate from './templates/MinimalistTemplate';
import CreativeTemplate from './templates/CreativeTemplate';

const LivePreview = ({ resumeData, selectedTemplate, isDark, fontFamily, fontSize }) => {
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate data={resumeData} isDark={isDark} fontFamily={fontFamily} fontSize={fontSize} />;
      case 'classic':
        return <ClassicTemplate data={resumeData} isDark={isDark} fontFamily={fontFamily} fontSize={fontSize} />;
      case 'minimalist':
        return <MinimalistTemplate data={resumeData} isDark={isDark} fontFamily={fontFamily} fontSize={fontSize} />;
      case 'creative':
        return <CreativeTemplate data={resumeData} isDark={isDark} fontFamily={fontFamily} fontSize={fontSize} />;
      default:
        return <ModernTemplate data={resumeData} isDark={isDark} fontFamily={fontFamily} fontSize={fontSize} />;
    }
  };

  return (
    <div id="resume-preview" className={`h-full overflow-y-auto rounded-xl border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-sm sm:text-base">Live Preview</h3>
      </div>
      <div className="p-2 sm:p-4 overflow-auto">
        <div className="min-w-0">
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
};

export default LivePreview; 
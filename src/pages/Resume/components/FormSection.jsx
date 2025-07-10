import React from 'react';
import { motion } from 'framer-motion';
import PersonalSection from './sections/PersonalSection';
import ArraySection from './sections/ArraySection';
import AISuggestions from './AISuggestions';
import { sections } from '../data/resumeData';

const FormSection = ({ 
  section, 
  resumeData, 
  updateSection, 
  addArrayItem, 
  removeArrayItem, 
  updateArrayItem, 
  isDark,
  onAISuggestion
}) => {
  const currentSection = sections.find(s => s.id === section);

  return (
    <div className={`rounded-xl p-3 sm:p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
        {sections.find(s => s.id === section)?.icon} {sections.find(s => s.id === section)?.name}
      </h3>
      
      {section === 'personal' ? (
        <PersonalSection 
          data={resumeData.personal} 
          updateSection={updateSection} 
          isDark={isDark}
          onAISuggestion={onAISuggestion}
        />
      ) : (
        <ArraySection
          section={section}
          data={resumeData[section]}
          addItem={addArrayItem}
          removeItem={removeArrayItem}
          updateItem={updateArrayItem}
          isDark={isDark}
          onAISuggestion={onAISuggestion}
        />
      )}
    </div>
  );
};

export default FormSection; 
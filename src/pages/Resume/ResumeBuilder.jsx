import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../AuthContext';
import SectionNavigation from './components/SectionNavigation';
import TemplateSwitcher from './components/TemplateSwitcher';
import FormSection from './components/FormSection';
import LivePreview from './components/LivePreview';
import SaveAsButton from './components/ExportButton';
import AISuggestions from './components/AISuggestions';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import ResumeValidator from './components/ResumeValidator';
import ResumeManager from './components/ResumeManager';
import { defaultResumeData, sections, templates } from './data/resumeData';

const db = getFirestore();

const ResumeBuilder = ({ isDark }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [resumeFontFamily, setResumeFontFamily] = useState('Arial');
  const [resumeFontSize, setResumeFontSize] = useState(16);

  // Memoized load resume data function
  const loadResumeData = useCallback(async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'resumes', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setResumeData(docSnap.data());
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    }
  }, [user]);

  // Memoized save resume data function
  const saveResumeData = useCallback(async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'resumes', user.uid), resumeData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, resumeData]);

  // Load resume data on mount
  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  // Auto-save with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(saveResumeData, 1000);
    return () => clearTimeout(timeoutId);
  }, [resumeData, saveResumeData]);

  // Memoized update section function
  const updateSection = useCallback((section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  }, []);

  // Memoized get default item function
  const getDefaultItem = useCallback((section) => {
    const defaults = {
      education: { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' },
      experience: { company: '', position: '', startDate: '', endDate: '', description: '', achievements: [] },
      projects: { name: '', description: '', technologies: '', link: '', startDate: '', endDate: '' },
      skills: { name: '', level: 'Intermediate' },
      certifications: { name: '', issuer: '', date: '', link: '' },
      awards: { name: '', issuer: '', date: '', description: '' },
      languages: { language: '', proficiency: 'Intermediate' },
      interests: { interest: '', description: '' }
    };
    return defaults[section] || {};
  }, []);

  // Memoized add array item function
  const addArrayItem = useCallback((section) => {
    const newItem = getDefaultItem(section);
    setResumeData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), newItem]
    }));
  }, [getDefaultItem]);

  // Memoized remove array item function
  const removeArrayItem = useCallback((section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index)
    }));
  }, []);

  // Memoized update array item function
  const updateArrayItem = useCallback((section, index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] || []).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  // Memoized AI suggestion handler
  const handleAISuggestion = useCallback((suggestion) => {
    // Always parse as comma-separated items and filter
    let items = [];
    if (activeSection === 'education') {
      // Expect semicolon-separated entries for education
      items = suggestion
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 100);
    } else {
      items = suggestion
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 60);
    }

    if (items.length === 0) return;

    if (activeSection === 'personal') {
      updateSection('personal', { ...resumeData.personal, summary: items.join('. ') });
    } else if (activeSection === 'skills') {
      const newSkills = items.map(name => ({ name, level: 'Intermediate' }));
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, ...newSkills]
      }));
    } else if (activeSection === 'education') {
      // Parse each item: Degree, Institution, StartYear-EndYear
      const newEntries = items.map(item => {
        const [degree, institution, years] = item.split(',').map(s => s.trim());
        let startDate = '', endDate = '';
        if (years && years.includes('-')) {
          [startDate, endDate] = years.split('-').map(s => s.trim());
        }
        return {
          institution: institution || '',
          degree: degree || '',
          field: '',
          startDate: startDate || '',
          endDate: endDate || '',
          gpa: ''
        };
      });
      setResumeData(prev => ({
        ...prev,
        education: [...prev.education, ...newEntries]
      }));
    } else if (Array.isArray(resumeData[activeSection])) {
      // For array sections (experience, projects, etc.), add as new entries with name/title/description
      const newEntries = items.map(item => {
        if (activeSection === 'experience') return { position: item, company: '', startDate: '', endDate: '', description: '', achievements: [] };
        if (activeSection === 'projects') return { name: item, description: '', technologies: '', link: '', startDate: '', endDate: '' };
        if (activeSection === 'certifications') return { name: item, issuer: '', date: '', link: '' };
        if (activeSection === 'awards') return { name: item, issuer: '', date: '', description: '' };
        if (activeSection === 'languages') return { language: item, proficiency: 'Intermediate' };
        if (activeSection === 'interests') return { interest: item, description: '' };
        return { name: item };
      });
      setResumeData(prev => ({
        ...prev,
        [activeSection]: [...prev[activeSection], ...newEntries]
      }));
    }
  }, [activeSection, resumeData, updateSection]);

  // Memoized load resume handler
  const handleLoadResume = useCallback((data) => {
    setResumeData(data);
  }, []);

  // Memoized section change handler
  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
  }, []);

  // Memoized template change handler
  const handleTemplateChange = useCallback((template) => {
    setSelectedTemplate(template);
  }, []);

  // Memoized font family change handler
  const handleFontFamilyChange = useCallback((fontFamily) => {
    setResumeFontFamily(fontFamily);
  }, []);

  // Memoized font size change handler
  const handleFontSizeChange = useCallback((fontSize) => {
    setResumeFontSize(fontSize);
  }, []);

  // Memoized resume builder props
  const resumeBuilderProps = useMemo(() => ({
    section: activeSection,
    resumeData,
    updateSection,
    addArrayItem,
    removeArrayItem,
    updateArrayItem
  }), [activeSection, resumeData, updateSection, addArrayItem, removeArrayItem, updateArrayItem]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Resume Builder</h1>
          <p className="text-sm sm:text-lg opacity-80">Create a professional resume that stands out</p>
        </div>

        {/* Template Selector */}
        <TemplateSwitcher 
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={handleTemplateChange}
          templates={templates}
          isDark={isDark}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
          <AISuggestions 
            section={activeSection}
            currentData={resumeData[activeSection]}
            onApplySuggestion={handleAISuggestion}
            isDark={isDark}
          />
          <ResumeValidator 
            resumeData={resumeData}
            isDark={isDark}
          />
          <ResumeManager 
            onLoadResume={handleLoadResume}
            isDark={isDark}
          />
          <SaveAsButton 
            resumeData={resumeData}
            selectedTemplate={selectedTemplate}
            resumeFontFamily={resumeFontFamily}
            resumeFontSize={resumeFontSize}
            isDark={isDark}
          />
        </div>

        {/* Auto Save Indicator */}
        <AutoSaveIndicator 
          isSaving={isSaving}
          lastSaved={lastSaved}
          isDark={isDark}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {/* Section Navigation */}
            <SectionNavigation 
              sections={sections}
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              isDark={isDark}
            />

            {/* Form Section */}
            <FormSection 
              {...resumeBuilderProps}
              isDark={isDark}
              onAISuggestion={handleAISuggestion}
            />
          </div>

          {/* Right Panel - Live Preview */}
          <div className="sticky top-4">
            <LivePreview 
              resumeData={resumeData}
              selectedTemplate={selectedTemplate}
              resumeFontFamily={resumeFontFamily}
              resumeFontSize={resumeFontSize}
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ResumeBuilder); 
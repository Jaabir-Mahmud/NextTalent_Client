import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user) {
      loadResumeData();
    }
  }, [user]);

  const loadResumeData = async () => {
    try {
      const docRef = doc(db, 'resumes', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setResumeData(docSnap.data());
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    }
  };

  const saveResumeData = async () => {
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
  };

  useEffect(() => {
    const timeoutId = setTimeout(saveResumeData, 1000);
    return () => clearTimeout(timeoutId);
  }, [resumeData]);

  const updateSection = (section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const addArrayItem = (section) => {
    const newItem = getDefaultItem(section);
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeArrayItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (section, index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getDefaultItem = (section) => {
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
  };

  const handleAISuggestion = (suggestion) => {
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
  };

  const handleLoadResume = (data) => {
    setResumeData(data);
  };

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
          setSelectedTemplate={setSelectedTemplate}
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
            resumeData={resumeData}
            onLoadResume={handleLoadResume}
            onSaveResume={saveResumeData}
            isDark={isDark}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Section Navigation */}
            <SectionNavigation 
              sections={sections}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              isDark={isDark}
            />

            {/* Form Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <FormSection
                  section={activeSection}
                  resumeData={resumeData}
                  updateSection={updateSection}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  updateArrayItem={updateArrayItem}
                  isDark={isDark}
                  onAISuggestion={handleAISuggestion}
                />
              </motion.div>
            </AnimatePresence>

            {/* Save As Button */}
            <SaveAsButton isDark={isDark} />
          </div>

          {/* Right Panel - Preview */}
          <div className="order-1 lg:order-2">
            <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
              <label className="font-semibold text-sm sm:text-base">Font Style:
                <select
                  value={resumeFontFamily}
                  onChange={e => setResumeFontFamily(e.target.value)}
                  className={`ml-2 border rounded px-2 py-1 text-sm ${isDark ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </label>
              <label className="font-semibold text-sm sm:text-base">Font Size:
                <input type="number" min={10} max={32} value={resumeFontSize} onChange={e => setResumeFontSize(Number(e.target.value))} className="ml-2 border rounded px-2 py-1 w-16 text-sm" />
                <span className="ml-1">px</span>
              </label>
            </div>
            <div className="h-[600px] sm:h-[800px] sticky top-4 sm:top-8">
              <LivePreview 
                resumeData={resumeData}
                selectedTemplate={selectedTemplate}
                isDark={isDark}
                fontFamily={resumeFontFamily}
                fontSize={resumeFontSize}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Auto Save Indicator */}
      <AutoSaveIndicator 
        isDark={isDark}
        lastSaved={lastSaved}
        isSaving={isSaving}
      />
    </div>
  );
};

export default ResumeBuilder; 
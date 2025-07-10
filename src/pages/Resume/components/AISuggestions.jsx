import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InferenceClient } from '@huggingface/inference';
import { config, validateConfig } from '../../../config/env';

const AISuggestions = ({ section, currentData, onApplySuggestion, isDark }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState([]);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // Quick suggestions cache for faster initial load
  const getQuickSuggestions = (section) => {
    const quickSuggestionsMap = {
      personal: [
        "Experienced software developer with 5+ years in full-stack development, specializing in React and Node.js applications with a passion for creating scalable solutions.",
        "Results-driven professional with expertise in modern web technologies, committed to delivering high-quality code and innovative solutions.",
        "Passionate developer specializing in React and Node.js applications, with strong problem-solving skills and experience in agile development environments."
      ],
      education: [
        { institution: "Stanford University", degree: "Bachelor of Science", field: "Computer Science", startDate: "2018", endDate: "2022", gpa: "3.8" },
        { institution: "MIT", degree: "Master of Science", field: "Software Engineering", startDate: "2022", endDate: "2024", gpa: "3.9" },
        { institution: "UC Berkeley", degree: "Bachelor of Engineering", field: "Information Technology", startDate: "2017", endDate: "2021", gpa: "3.7" }
      ],
      experience: [
        { company: "Google", position: "Software Engineer", startDate: "2022", endDate: "Present", description: "Developed scalable web applications using React and Node.js", achievements: ["Improved app performance by 40%", "Led team of 5 developers"] },
        { company: "Microsoft", position: "Full Stack Developer", startDate: "2021", endDate: "2022", description: "Built and maintained enterprise applications", achievements: ["Reduced deployment time by 50%", "Implemented CI/CD pipelines"] },
        { company: "Amazon", position: "Frontend Developer", startDate: "2020", endDate: "2021", description: "Created responsive user interfaces", achievements: ["Increased user engagement by 25%", "Optimized loading times"] }
      ],
      projects: [
        { name: "E-commerce Platform", description: "Full-stack e-commerce application with payment integration", technologies: "React, Node.js, MongoDB, Stripe", link: "https://github.com/user/ecommerce", startDate: "2023", endDate: "2024" },
        { name: "Task Management App", description: "Collaborative task management tool with real-time updates", technologies: "React, Express, Socket.io, PostgreSQL", link: "https://github.com/user/taskapp", startDate: "2022", endDate: "2023" },
        { name: "Weather Dashboard", description: "Real-time weather tracking application with data visualization", technologies: "React, Chart.js, Weather API", link: "https://github.com/user/weather", startDate: "2021", endDate: "2022" }
      ],
      skills: [
        { name: "JavaScript", level: "Expert" },
        { name: "React", level: "Expert" },
        { name: "Node.js", level: "Advanced" },
        { name: "Python", level: "Advanced" },
        { name: "TypeScript", level: "Advanced" },
        { name: "MongoDB", level: "Intermediate" },
        { name: "PostgreSQL", level: "Intermediate" },
        { name: "AWS", level: "Intermediate" },
        { name: "Docker", level: "Intermediate" },
        { name: "Git", level: "Expert" }
      ],
      certifications: [
        { name: "AWS Certified Developer", issuer: "Amazon Web Services", date: "2023", link: "https://aws.amazon.com/certification/" },
        { name: "Google Cloud Professional", issuer: "Google Cloud", date: "2022", link: "https://cloud.google.com/certification/" },
        { name: "Microsoft Azure Fundamentals", issuer: "Microsoft", date: "2021", link: "https://docs.microsoft.com/en-us/learn/certifications/" }
      ],
      awards: [
        { name: "Employee of the Month", issuer: "Tech Corp", date: "2023", description: "Recognized for outstanding performance and leadership" },
        { name: "Best Innovation Award", issuer: "StartupXYZ", date: "2022", description: "Awarded for developing innovative solutions" },
        { name: "Dean's List", issuer: "Stanford University", date: "2021", description: "Academic excellence recognition" }
      ],
      languages: [
        { language: "English", proficiency: "Native" },
        { language: "Spanish", proficiency: "Fluent" },
        { language: "French", proficiency: "Intermediate" }
      ],
      interests: [
        { interest: "Open Source Development", description: "Contributing to open source projects and community development" },
        { interest: "Tech Blogging", description: "Writing technical articles and sharing knowledge with the community" },
        { interest: "Mentoring", description: "Guiding junior developers and students in their career growth" }
      ]
    };
    return quickSuggestionsMap[section] || [];
  };

  // Initialize quick suggestions
  useEffect(() => {
    setQuickSuggestions(getQuickSuggestions(section));
  }, [section]);

  // Debounced content generation based on user input
  useEffect(() => {
    if (suggestion.trim().length > 3) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        generateRelatedContent(suggestion);
      }, 800); // 800ms debounce
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [suggestion]);

  // Generate related content based on user input
  const generateRelatedContent = async (input) => {
    if (!input.trim()) return;
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    
    try {
      if (!validateConfig()) {
        throw new Error('Missing Hugging Face API token');
      }
      
      const client = new InferenceClient(config.HF_TOKEN);
      
      // Create context-aware prompt based on user input
      const prompt = createContextualPrompt(section, input, currentData);
      
      const chatCompletion = await client.chatCompletion({
        provider: "featherless-ai",
        model: "Qwen/Qwen2-7B-Instruct",
        messages: [{ role: "user", content: prompt }],
        signal: abortControllerRef.current.signal
      });

      const response = chatCompletion.choices[0].message.content;
      const parsedSuggestions = parseSuggestions(response, section);
      
      setSuggestions(parsedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error generating related content:", error);
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create contextual prompts based on user input
  const createContextualPrompt = (section, input, currentData) => {
    const basePrompts = {
      personal: `Based on "${input}", generate 3 professional summary variations that expand on this concept. Keep each 2-3 sentences, professional tone. Return only the summaries, separated by newlines.`,
      education: `Based on "${input}", suggest 3 educational entries. Format each as: Institution|Degree|Field|StartYear|EndYear|GPA. Example: "Stanford University|Bachelor of Science|Computer Science|2018|2022|3.8". Focus on relevant institutions and fields. Return only the formatted entries, separated by newlines.`,
      experience: `Based on "${input}", suggest 3 job positions. Format each as: Company|Position|StartYear|EndYear|Description|Achievement1,Achievement2. Example: "Google|Software Engineer|2022|Present|Developed scalable applications|Improved performance by 40%,Led team of 5". Return only the formatted entries, separated by newlines.`,
      projects: `Based on "${input}", suggest 3 project ideas. Format each as: Name|Description|Technologies|Link|StartYear|EndYear. Example: "E-commerce Platform|Full-stack application with payment integration|React, Node.js, MongoDB|https://github.com/user/project|2023|2024". Return only the formatted entries, separated by newlines.`,
      skills: `Based on "${input}", suggest 5 related skills. Format each as: SkillName|Level. Example: "JavaScript|Expert". Use levels: Beginner, Intermediate, Advanced, Expert. Return only the formatted entries, separated by newlines.`,
      certifications: `Based on "${input}", suggest 3 certifications. Format each as: Name|Issuer|Year|Link. Example: "AWS Certified Developer|Amazon Web Services|2023|https://aws.amazon.com/certification/". Return only the formatted entries, separated by newlines.`,
      awards: `Based on "${input}", suggest 3 awards. Format each as: Name|Issuer|Year|Description. Example: "Employee of the Month|Tech Corp|2023|Recognized for outstanding performance". Return only the formatted entries, separated by newlines.`,
      languages: `Based on "${input}", suggest 3 languages. Format each as: Language|Proficiency. Example: "English|Native". Use proficiency levels: Beginner, Intermediate, Advanced, Fluent, Native. Return only the formatted entries, separated by newlines.`,
      interests: `Based on "${input}", suggest 3 interests. Format each as: Interest|Description. Example: "Open Source Development|Contributing to community projects". Return only the formatted entries, separated by newlines.`
    };
    
    return basePrompts[section] || `Based on "${input}", suggest 3 related items for a resume ${section} section.`;
  };

  // Parse suggestions based on section type
  const parseSuggestions = (response, section) => {
    const lines = response.split('\n').filter(s => s.trim().length > 0);
    
    if (section === 'personal') {
      return lines.slice(0, 3);
    }
    
    return lines.slice(0, 5).map(line => {
      const parts = line.split('|');
      
      switch (section) {
        case 'education':
          if (parts.length >= 6) {
            return {
              institution: parts[0]?.trim() || '',
              degree: parts[1]?.trim() || '',
              field: parts[2]?.trim() || '',
              startDate: parts[3]?.trim() || '',
              endDate: parts[4]?.trim() || '',
              gpa: parts[5]?.trim() || ''
            };
          }
          break;
        case 'experience':
          if (parts.length >= 6) {
            const achievements = parts[5]?.split(',').map(a => a.trim()) || [];
            return {
              company: parts[0]?.trim() || '',
              position: parts[1]?.trim() || '',
              startDate: parts[2]?.trim() || '',
              endDate: parts[3]?.trim() || '',
              description: parts[4]?.trim() || '',
              achievements: achievements
            };
          }
          break;
        case 'projects':
          if (parts.length >= 6) {
            return {
              name: parts[0]?.trim() || '',
              description: parts[1]?.trim() || '',
              technologies: parts[2]?.trim() || '',
              link: parts[3]?.trim() || '',
              startDate: parts[4]?.trim() || '',
              endDate: parts[5]?.trim() || ''
            };
          }
          break;
        case 'skills':
          if (parts.length >= 2) {
            return {
              name: parts[0]?.trim() || '',
              level: parts[1]?.trim() || 'Intermediate'
            };
          }
          break;
        case 'certifications':
          if (parts.length >= 4) {
            return {
              name: parts[0]?.trim() || '',
              issuer: parts[1]?.trim() || '',
              date: parts[2]?.trim() || '',
              link: parts[3]?.trim() || ''
            };
          }
          break;
        case 'awards':
          if (parts.length >= 4) {
            return {
              name: parts[0]?.trim() || '',
              issuer: parts[1]?.trim() || '',
              date: parts[2]?.trim() || '',
              description: parts[3]?.trim() || ''
            };
          }
          break;
        case 'languages':
          if (parts.length >= 2) {
            return {
              language: parts[0]?.trim() || '',
              proficiency: parts[1]?.trim() || 'Intermediate'
            };
          }
          break;
        case 'interests':
          if (parts.length >= 2) {
            return {
              interest: parts[0]?.trim() || '',
              description: parts[1]?.trim() || ''
            };
          }
          break;
      }
      
      return line; // fallback to original line if parsing fails
    });
  };

  // Fast generate using quick suggestions
  const handleQuickGenerate = () => {
    if (quickSuggestions.length > 0) {
      const randomSuggestion = quickSuggestions[Math.floor(Math.random() * quickSuggestions.length)];
      if (section === 'personal') {
        setSuggestion(randomSuggestion);
      } else {
        // For structured data, display a formatted preview
        const preview = formatSuggestionPreview(randomSuggestion, section);
        setSuggestion(preview);
      }
    }
  };

  // Format suggestion preview for display
  const formatSuggestionPreview = (suggestion, section) => {
    if (typeof suggestion === 'string') return suggestion;
    
    switch (section) {
      case 'education':
        return `${suggestion.degree} in ${suggestion.field} from ${suggestion.institution} (${suggestion.startDate}-${suggestion.endDate})`;
      case 'experience':
        return `${suggestion.position} at ${suggestion.company} (${suggestion.startDate}-${suggestion.endDate})`;
      case 'projects':
        return `${suggestion.name} - ${suggestion.description}`;
      case 'skills':
        return `${suggestion.name} (${suggestion.level})`;
      case 'certifications':
        return `${suggestion.name} from ${suggestion.issuer} (${suggestion.date})`;
      case 'awards':
        return `${suggestion.name} from ${suggestion.issuer} (${suggestion.date})`;
      case 'languages':
        return `${suggestion.language} (${suggestion.proficiency})`;
      case 'interests':
        return `${suggestion.interest} - ${suggestion.description}`;
      default:
        return JSON.stringify(suggestion);
    }
  };

  // Apply suggestion
  const handleApply = (suggestionText = suggestion) => {
    if (suggestionText.trim()) {
      onApplySuggestion(suggestionText);
      setSuggestion('');
      setShowSuggestions(false);
    }
  };

  // Find original structured suggestion from preview text
  const findOriginalSuggestion = (previewText) => {
    // Check quick suggestions first
    const quickSuggestion = quickSuggestions.find(qs => {
      if (typeof qs === 'string') return qs === previewText;
      return formatSuggestionPreview(qs, section) === previewText;
    });
    
    if (quickSuggestion && typeof quickSuggestion === 'object') {
      return quickSuggestion;
    }
    
    // Check generated suggestions
    const generatedSuggestion = suggestions.find(s => {
      if (typeof s === 'string') return s === previewText;
      return formatSuggestionPreview(s, section) === previewText;
    });
    
    return generatedSuggestion;
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestionText) => {
    handleApply(suggestionText);
  };

  return (
    <div className={`rounded-xl p-2 sm:p-3 shadow-md flex flex-col gap-2 items-stretch ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}> 
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-xs sm:text-sm">AI Suggestions</span>
        {loading && <span className="text-xs text-blue-500">Loading...</span>}
      </div>
      <textarea
        className={`w-full px-2 py-1 rounded border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
        rows={2}
        value={suggestion}
        onChange={e => setSuggestion(e.target.value)}
        placeholder="Paste or type your suggestion..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleApply();
          }
        }}
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          className={`flex-1 py-2 rounded font-semibold text-xs sm:text-sm transition-all duration-200 ${isDark ? 'bg-indigo-700 text-white hover:bg-indigo-800' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'}`}
          onClick={(e) => {
            e.preventDefault();
            handleApply();
          }}
          disabled={loading || !suggestion.trim()}
        >
          Apply
        </button>
        <button
          type="button"
          className={`flex-1 py-2 rounded font-semibold text-xs sm:text-sm transition-all duration-200 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
          onClick={(e) => {
            e.preventDefault();
            handleQuickGenerate();
          }}
          disabled={loading}
        >
          Quick Generate
        </button>
      </div>
      
      {/* Suggestions List */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
          {suggestions.map((suggestionItem, index) => (
            <button
              key={index}
              type="button"
              className={`w-full text-left p-2 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-900'}`}
              onClick={(e) => {
                e.preventDefault();
                const suggestionText = typeof suggestionItem === 'string' ? suggestionItem : formatSuggestionPreview(suggestionItem, section);
                handleSuggestionClick(suggestionText);
              }}
            >
              {typeof suggestionItem === 'string' ? suggestionItem : formatSuggestionPreview(suggestionItem, section)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
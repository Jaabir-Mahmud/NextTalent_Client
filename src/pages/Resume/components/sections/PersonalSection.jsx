import React from 'react';

const PersonalSection = ({ data = {}, updateSection, isDark }) => {
  console.log('PersonalSection data:', data);
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Full Name
          </label>
          <input
            type="text"
            value={data.fullName || ''}
            onChange={(e) => updateSection('personal', { ...data, fullName: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Email
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => updateSection('personal', { ...data, email: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Phone
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => updateSection('personal', { ...data, phone: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Location
          </label>
          <input
            type="text"
            value={data.location || ''}
            onChange={(e) => updateSection('personal', { ...data, location: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
            placeholder="New York, NY"
          />
        </div>
      </div>

      <div>
        <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Professional Summary
        </label>
        <textarea
          value={data.summary || ''}
          onChange={(e) => updateSection('personal', { ...data, summary: e.target.value })}
          rows={4}
          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none ${
            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
          placeholder="Brief professional summary..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            LinkedIn
          </label>
          <input
            type="url"
            value={data.linkedin || ''}
            onChange={(e) => updateSection('personal', { ...data, linkedin: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Portfolio/Website
          </label>
          <input
            type="url"
            value={data.website || ''}
            onChange={(e) => updateSection('personal', { ...data, website: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
            placeholder="https://johndoe.com"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalSection; 
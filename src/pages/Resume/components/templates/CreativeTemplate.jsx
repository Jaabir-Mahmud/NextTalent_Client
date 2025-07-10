import React from 'react';

const CreativeTemplate = ({ data, isDark, fontFamily = 'Arial', fontSize = 16 }) => {
  return (
    <div 
      className={`max-w-4xl mx-auto p-4 sm:p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
      style={{ 
        fontFamily: `${fontFamily}, sans-serif`, 
        fontSize: `${fontSize}px`,
        lineHeight: 1.5
      }}
    >
      {/* Header */}
      <div className="relative mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
          <h1 className="font-bold text-3xl mb-2">{data?.personal?.fullName || 'Your Name'}</h1>
          <p className="text-blue-100 mb-4">{data?.personal?.summary || 'Professional summary goes here'}</p>
          <div className="flex flex-wrap gap-4 text-sm text-blue-100">
            {data?.personal?.email && <span>📧 {data.personal.email}</span>}
            {data?.personal?.phone && <span>📱 {data.personal.phone}</span>}
            {data?.personal?.location && <span>📍 {data.personal.location}</span>}
            {data?.personal?.linkedin && <span>🔗 LinkedIn</span>}
          </div>
        </div>
      </div>

      {/* Experience */}
      {data?.experience?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold mb-6 text-2xl text-blue-600 dark:text-blue-400 flex items-center">
            <span className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">💼</span>
            Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-xl">{exp.position || 'Position'}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <p className="font-medium text-blue-600 dark:text-blue-400 mb-2">{exp.company || 'Company'}</p>
              <p className="text-sm leading-relaxed">{exp.description || 'Description'}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data?.education?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold mb-6 text-2xl text-green-600 dark:text-green-400 flex items-center">
            <span className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">🎓</span>
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-4 p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-xl">{edu.degree || 'Degree'} in {edu.field || 'Field'}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {edu.startDate} - {edu.endDate || 'Present'}
                </span>
              </div>
              <p className="font-medium text-green-600 dark:text-green-400">{edu.institution || 'Institution'}</p>
              {edu.gpa && <p className="text-sm text-gray-600 dark:text-gray-400">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data?.skills?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold mb-6 text-2xl text-purple-600 dark:text-purple-400 flex items-center">
            <span className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">⚡</span>
            Skills
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-lg"
              >
                {skill.name || 'Skill'}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data?.projects?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold mb-6 text-2xl text-orange-600 dark:text-orange-400 flex items-center">
            <span className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full mr-3">🚀</span>
            Projects
          </h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-4 p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-r-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-xl">{project.name || 'Project Name'}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {project.startDate} - {project.endDate || 'Present'}
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-2">{project.description || 'Description'}</p>
              {project.technologies && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Technologies: {project.technologies}</p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default CreativeTemplate; 
import React from 'react';

const MinimalistTemplate = ({ data, isDark, fontFamily = 'Arial', fontSize = 16 }) => {
  return (
    <div 
      className={`max-w-4xl mx-auto p-4 sm:p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
      style={{ 
        fontFamily: `${fontFamily}, sans-serif`, 
        fontSize: `${fontSize}px`,
        lineHeight: 1.6
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-light text-4xl mb-2 tracking-wide">{data?.personal?.fullName || 'Your Name'}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{data?.personal?.summary || 'Professional summary goes here'}</p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          {data?.personal?.email && <span>{data.personal.email}</span>}
          {data?.personal?.phone && <span>{data.personal.phone}</span>}
          {data?.personal?.location && <span>{data.personal.location}</span>}
          {data?.personal?.linkedin && <span>LinkedIn</span>}
        </div>
      </div>

      {/* Experience */}
      {data?.experience?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-light text-2xl mb-6 text-gray-800 dark:text-gray-200">Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-xl">{exp.position || 'Position'}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{exp.company || 'Company'}</p>
              <p className="text-sm leading-relaxed">{exp.description || 'Description'}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data?.education?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-light text-2xl mb-6 text-gray-800 dark:text-gray-200">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-xl">{edu.degree || 'Degree'} in {edu.field || 'Field'}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {edu.startDate} - {edu.endDate || 'Present'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{edu.institution || 'Institution'}</p>
              {edu.gpa && <p className="text-sm text-gray-500 dark:text-gray-400">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data?.skills?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-light text-2xl mb-6 text-gray-800 dark:text-gray-200">Skills</h2>
          <div className="flex flex-wrap gap-3">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
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
          <h2 className="font-light text-2xl mb-6 text-gray-800 dark:text-gray-200">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-xl">{project.name || 'Project Name'}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {project.startDate} - {project.endDate || 'Present'}
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-2">{project.description || 'Description'}</p>
              {project.technologies && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Technologies: {project.technologies}</p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default MinimalistTemplate; 
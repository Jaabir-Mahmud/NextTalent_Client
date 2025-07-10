import React from 'react';

const ModernTemplate = ({ data, isDark, fontFamily = 'Arial', fontSize = 16 }) => {
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
      <div className="text-center mb-8">
        <h1 className="font-bold mb-2 text-3xl">{data?.personal?.fullName || 'Your Name'}</h1>
        <p className="opacity-80 mb-4 text-lg">{data?.personal?.summary || 'Professional summary goes here'}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {data?.personal?.email && <span>📧 {data.personal.email}</span>}
          {data?.personal?.phone && <span>📱 {data.personal.phone}</span>}
          {data?.personal?.location && <span>📍 {data.personal.location}</span>}
          {data?.personal?.linkedin && <span>🔗 LinkedIn</span>}
        </div>
      </div>

      {/* Experience */}
      {data?.experience?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold mb-4 border-b-2 border-indigo-500 pb-2 text-2xl">Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-xl">{exp.position || 'Position'}</h3>
                <span className="text-sm opacity-70">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <p className="font-medium text-indigo-600 mb-2">{exp.company || 'Company'}</p>
              <p className="text-sm leading-relaxed">{exp.description || 'Description'}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data?.education?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold mb-4 border-b-2 border-indigo-500 pb-2 text-2xl">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-xl">{edu.degree || 'Degree'} in {edu.field || 'Field'}</h3>
                <span className="text-sm opacity-70">
                  {edu.startDate} - {edu.endDate || 'Present'}
                </span>
              </div>
              <p className="font-medium text-indigo-600">{edu.institution || 'Institution'}</p>
              {edu.gpa && <p className="text-sm opacity-70">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data?.skills?.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold mb-4 border-b-2 border-indigo-500 pb-2 text-2xl">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
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
          <h2 className="font-bold mb-4 border-b-2 border-indigo-500 pb-2 text-2xl">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-xl">{project.name || 'Project Name'}</h3>
                <span className="text-sm opacity-70">
                  {project.startDate} - {project.endDate || 'Present'}
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-2">{project.description || 'Description'}</p>
              {project.technologies && (
                <p className="text-sm opacity-70">Technologies: {project.technologies}</p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ModernTemplate; 
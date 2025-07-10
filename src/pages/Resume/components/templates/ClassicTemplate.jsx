import React from 'react';

const ClassicTemplate = ({ data, isDark, fontFamily = 'Arial', fontSize = 16 }) => {
  return (
    <div 
      className={`max-w-4xl mx-auto p-4 sm:p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
      style={{ 
        fontFamily: `${fontFamily}, serif`, 
        fontSize: `${fontSize}px`,
        lineHeight: 1.5
      }}
    >
      {/* Header */}
      <div className="border-b-2 border-gray-300 dark:border-gray-600 pb-4 mb-6">
        <h1 className="font-bold text-center mb-2 text-3xl">{data?.personal?.fullName || 'Your Name'}</h1>
        <div className="text-center text-sm space-y-1">
          {data?.personal?.email && <div>Email: {data.personal.email}</div>}
          {data?.personal?.phone && <div>Phone: {data.personal.phone}</div>}
          {data?.personal?.location && <div>Address: {data.personal.location}</div>}
          {data?.personal?.linkedin && <div>LinkedIn: {data.personal.linkedin}</div>}
        </div>
      </div>

      {/* Summary */}
      {data?.personal?.summary && (
        <section className="mb-6">
          <h2 className="font-bold mb-2 border-b border-gray-300 dark:border-gray-600 pb-1 text-xl">PROFESSIONAL SUMMARY</h2>
          <p className="text-sm leading-relaxed">{data.personal.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data?.experience?.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold mb-3 border-b border-gray-300 dark:border-gray-600 pb-1 text-xl">PROFESSIONAL EXPERIENCE</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-lg">{exp.position || 'Position'}</h3>
                <span className="text-sm">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <p className="font-semibold text-sm mb-2">{exp.company || 'Company'}</p>
              <p className="text-sm leading-relaxed">{exp.description || 'Description'}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data?.education?.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold mb-3 border-b border-gray-300 dark:border-gray-600 pb-1 text-xl">EDUCATION</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-lg">{edu.degree || 'Degree'} in {edu.field || 'Field'}</h3>
                <span className="text-sm">
                  {edu.startDate} - {edu.endDate || 'Present'}
                </span>
              </div>
              <p className="font-semibold text-sm">{edu.institution || 'Institution'}</p>
              {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data?.skills?.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold mb-3 border-b border-gray-300 dark:border-gray-600 pb-1 text-xl">TECHNICAL SKILLS</h2>
          <div className="grid grid-cols-2 gap-2">
            {data.skills.map((skill, index) => (
              <div key={index} className="text-sm">
                • {skill.name || 'Skill'} - {skill.level || 'Level'}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data?.projects?.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold mb-3 border-b border-gray-300 dark:border-gray-600 pb-1 text-xl">PROJECTS</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-lg">{project.name || 'Project Name'}</h3>
                <span className="text-sm">
                  {project.startDate} - {project.endDate || 'Present'}
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-1">{project.description || 'Description'}</p>
              {project.technologies && (
                <p className="text-sm">Technologies: {project.technologies}</p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ClassicTemplate; 
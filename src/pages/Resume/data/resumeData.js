export const defaultResumeData = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: ''
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  awards: [],
  languages: [],
  interests: []
};

export const sections = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'certifications', label: 'Certifications', icon: '🏆' },
  { id: 'awards', label: 'Awards', icon: '🏅' },
  { id: 'languages', label: 'Languages', icon: '🌍' },
  { id: 'interests', label: 'Interests', icon: '🎯' }
];

export const templates = [
  { id: 'modern', name: 'Modern', preview: '🔄' },
  { id: 'classic', name: 'Classic', preview: '📄' },
  { id: 'minimalist', name: 'Minimalist', preview: '⚪' },
  { id: 'creative', name: 'Creative', preview: '🎨' }
];

export const sectionDefaults = {
  education: { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' },
  experience: { company: '', position: '', startDate: '', endDate: '', description: '', achievements: [] },
  projects: { name: '', description: '', technologies: '', link: '', startDate: '', endDate: '' },
  skills: { name: '', level: 'Intermediate' },
  certifications: { name: '', issuer: '', date: '', link: '' },
  awards: { name: '', issuer: '', date: '', description: '' },
  languages: { language: '', proficiency: 'Intermediate' },
  interests: { interest: '', description: '' }
}; 
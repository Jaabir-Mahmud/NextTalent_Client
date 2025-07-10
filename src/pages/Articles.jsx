import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Articles = ({ isDark }) => {
  const [activeTab, setActiveTab] = useState('resume');

  const careerTips = {
    resume: [
      {
        title: "Craft a Compelling Summary",
        content: "Start with a powerful 2-3 sentence summary that highlights your key achievements and career goals. Make it specific to the role you're applying for.",
        tips: ["Use action verbs", "Quantify achievements", "Keep it concise"]
      },
      {
        title: "Highlight Relevant Experience",
        content: "Focus on experiences that directly relate to the job you want. Use the STAR method (Situation, Task, Action, Result) to describe your accomplishments.",
        tips: ["Use bullet points", "Include metrics", "Show progression"]
      },
      {
        title: "Optimize for ATS",
        content: "Many companies use Applicant Tracking Systems. Include relevant keywords from the job description and use standard section headings.",
        tips: ["Use standard fonts", "Include keywords", "Avoid graphics"]
      }
    ],
    interview: [
      {
        title: "Research the Company",
        content: "Thoroughly research the company's mission, values, recent news, and the role you're applying for. This shows genuine interest and preparation.",
        tips: ["Visit company website", "Check social media", "Read recent news"]
      },
      {
        title: "Practice Common Questions",
        content: "Prepare answers for common interview questions like 'Tell me about yourself' and 'Why do you want this job?' Practice with a friend or in front of a mirror.",
        tips: ["Use STAR method", "Keep answers concise", "Show enthusiasm"]
      },
      {
        title: "Prepare Questions to Ask",
        content: "Have thoughtful questions ready for the interviewer. This shows engagement and helps you evaluate if the role is right for you.",
        tips: ["Ask about culture", "Inquire about growth", "Show curiosity"]
      }
    ],
    networking: [
      {
        title: "Build Your Online Presence",
        content: "Create and maintain professional profiles on LinkedIn and other relevant platforms. Share industry insights and engage with others' content.",
        tips: ["Optimize LinkedIn profile", "Join industry groups", "Share valuable content"]
      },
      {
        title: "Attend Industry Events",
        content: "Participate in conferences, workshops, and meetups in your field. These are great opportunities to meet professionals and learn about new trends.",
        tips: ["Prepare elevator pitch", "Bring business cards", "Follow up after"]
      },
      {
        title: "Leverage Alumni Networks",
        content: "Connect with alumni from your school or previous companies. They can provide valuable insights and potentially open doors to new opportunities.",
        tips: ["Join alumni groups", "Attend reunions", "Offer help first"]
      }
    ],
    jobsearch: [
      {
        title: "Use Multiple Job Boards",
        content: "Don't limit yourself to one platform. Use job boards, company websites, and professional networks to find opportunities.",
        tips: ["Set up alerts", "Use niche boards", "Check company sites"]
      },
      {
        title: "Tailor Your Applications",
        content: "Customize your resume and cover letter for each position. Highlight relevant skills and experiences that match the job requirements.",
        tips: ["Read job descriptions", "Match keywords", "Show enthusiasm"]
      },
      {
        title: "Follow Up Strategically",
        content: "Send follow-up emails after interviews and applications. This shows persistence and keeps you top of mind with hiring managers.",
        tips: ["Send within 24 hours", "Keep it brief", "Add value"]
      }
    ],
    development: [
      {
        title: "Continuous Learning",
        content: "Stay updated with industry trends and new technologies. Take online courses, attend workshops, and read industry publications.",
        tips: ["Take online courses", "Read industry blogs", "Attend webinars"]
      },
      {
        title: "Seek Mentorship",
        content: "Find mentors who can guide your career development. They can provide valuable advice, introduce you to opportunities, and help you avoid common pitfalls.",
        tips: ["Identify potential mentors", "Be specific about needs", "Show gratitude"]
      },
      {
        title: "Build Transferable Skills",
        content: "Develop skills that are valuable across different roles and industries, such as communication, leadership, and problem-solving.",
        tips: ["Take on new challenges", "Volunteer for projects", "Learn from others"]
      }
    ]
  };

  const tabs = [
    { id: 'resume', label: 'Resume Writing', icon: '📄' },
    { id: 'interview', label: 'Interview Prep', icon: '🤝' },
    { id: 'networking', label: 'Networking', icon: '🌐' },
    { id: 'jobsearch', label: 'Job Search', icon: '🔍' },
    { id: 'development', label: 'Career Development', icon: '📈' }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center py-16 px-4"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          Career Tips & <span className="text-indigo-500">Insights</span>
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Expert advice to help you navigate your career journey, from resume writing to interview preparation and beyond.
        </p>
      </motion.section>

      {/* Tab Navigation */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="max-w-6xl mx-auto px-4 mb-12"
      >
        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Content Section */}
      <motion.section 
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 pb-16"
      >
        <div className="grid gap-8">
          {careerTips[activeTab].map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-2xl p-8 shadow-lg ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <h3 className="text-2xl font-bold mb-4 text-indigo-600">{tip.title}</h3>
              <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {tip.content}
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-500">Key Tips:</h4>
                <ul className="space-y-1">
                  {tip.tips.map((tipItem, tipIndex) => (
                    <li key={tipIndex} className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-indigo-500">•</span>
                      {tipItem}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className={`py-16 px-4 ${isDark ? 'bg-gray-800' : 'bg-indigo-50'}`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Your Career to the Next Level?</h2>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Apply these tips and start seeing results in your job search and career development.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Browse Job Opportunities
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
};

export default Articles; 
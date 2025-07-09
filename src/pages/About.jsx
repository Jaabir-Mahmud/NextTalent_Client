import React from 'react';

const About = ({ isDark }) => (
  <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
    <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
      <div className="flex-1">
        <h2 className="text-4xl font-extrabold mb-4">
          <span className="text-indigo-400">Who</span>
          <span className={isDark ? 'text-white' : 'text-gray-900'}> We Are</span>
        </h2>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>At NextTalent, we’re redefining the hiring journey in Bangladesh. Our mission is to empower employers and job seekers with an innovative platform that connects top talents to their dream roles effortlessly.</p>
      </div>
      <div className="flex-1 flex justify-center">
        <a href="https://ibb.co/RGb4Gwwb" target="_blank" rel="noopener noreferrer">
          <img
            src="https://i.ibb.co/JWtFWJJt/whoWeAre.jpg"
            alt="whoWeAre"
            className="rounded-2xl shadow-lg max-w-full"
            style={{ minWidth: 320, maxWidth: 500 }}
          />
        </a>
      </div>
    </div>
    {/* Mission Section */}
    <div className="max-w-3xl w-full text-center mb-16">
      <h3 className="text-2xl font-bold mb-2 text-indigo-400">Our Mission</h3>
      <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>To simplify recruitment and empower career growth for everyone by connecting the best talents with the right opportunities through innovation, technology, and trust.</p>
    </div>
    {/* Vision Section */}
    <div className="max-w-3xl w-full text-center mb-16">
      <h3 className="text-2xl font-bold mb-2 text-indigo-400">Our Vision</h3>
      <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>To become the leading platform for recruitment and talent development in Bangladesh, fostering a future where every individual and organization can reach their full potential.</p>
    </div>
    {/* Team Section */}
    <div className="max-w-5xl w-full mb-12">
      <h3 className="text-2xl font-bold mb-6 text-indigo-400 text-center">Meet Our Team</h3>
      <div className="flex flex-wrap justify-center gap-8">
        {/* Sample team members, replace with real data as needed */}
        <div className={`flex flex-col items-center p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} style={{ width: 220 }}>
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Team Member" className="w-20 h-20 rounded-full mb-3" />
          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Arif Rahman</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Founder & CEO</div>
        </div>
        <div className={`flex flex-col items-center p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} style={{ width: 220 }}>
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Team Member" className="w-20 h-20 rounded-full mb-3" />
          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Nila Ahmed</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Product Lead</div>
        </div>
        <div className={`flex flex-col items-center p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} style={{ width: 220 }}>
          <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="Team Member" className="w-20 h-20 rounded-full mb-3" />
          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tanvir Hasan</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Engineering</div>
        </div>
        <div className={`flex flex-col items-center p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} style={{ width: 220 }}>
          <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Team Member" className="w-20 h-20 rounded-full mb-3" />
          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sadia Islam</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Community & Support</div>
        </div>
      </div>
    </div>
  </div>
);

export default About; 
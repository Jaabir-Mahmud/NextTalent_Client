import React from 'react';

const Footer = ({ isDark }) => (
  <footer className={`w-full pt-10 pb-4 px-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8 border-b border-gray-200 dark:border-gray-800 pb-8">
      <div className="flex-1 mb-6 md:mb-0">
        <div className="flex items-center mb-3">
          
          <span className="text-2xl font-bold text-indigo-600">NextTalent.</span>
        </div>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>NextTalent connects employers with top talent and empowers job seekers to land their dream roles. From seamless hiring solutions to personalized job matching, Niyog simplifies the journey for everyone.</p>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-8 justify-end">
        <div>
          <div className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Menu</div>
          <ul className="space-y-1">
            <li><a href="/download" className="hover:text-indigo-500">Download</a></li>
            <li><a href="/jobs" className="hover:text-indigo-500">Talents</a></li>
            <li><a href="/about" className="hover:text-indigo-500">About</a></li>
            <li><a href="/articles" className="hover:text-indigo-500">Career Tips</a></li>
            <li><a href="/pricing" className="hover:text-indigo-500">Pricing</a></li>
            <li><a href="/contact" className="hover:text-indigo-500">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Other pages</div>
          <ul className="space-y-1">
            <li><a href="/privacy" className="hover:text-indigo-500">Privacy policy</a></li>
            <li><a href="/terms" className="hover:text-indigo-500">Terms & conditions</a></li>
            <li><a href="/refund" className="hover:text-indigo-500">Refund Policy</a></li>
            <li><a href="/data-deletion" className="hover:text-indigo-500">Data Deletion</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div className="max-w-6xl mx-auto text-center text-xs mt-6 text-gray-400">
      2025 @NextTalent. All rights reserved.
    </div>
  </footer>
);

export default Footer; 
import React, { useState } from 'react';
import FeedbackForm from '../components/FeedbackForm';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const MotionImg = ({ src, alt }) => (
  <motion.img
    whileHover={{ scale: 1.15 }}
    whileFocus={{ scale: 1.15 }}
    transition={{ type: 'spring', stiffness: 300 }}
    src={src}
    alt={alt}
    className="h-12 w-auto grayscale hover:grayscale-0 opacity-80 hover:opacity-100 rounded-lg transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    tabIndex={0}
    aria-label={alt}
  />
);

function Home({ isDark }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "How does NextTalent help employers find candidates?",
      answer: "We connect employers with top talent through curated job listings, smart matching, and a seamless hiring process."
    },
    {
      question: "Can job seekers apply for jobs directly through NextTalent?",
      answer: "Yes! Job seekers can apply for thousands of jobs instantly and track their applications in one place."
    },
    {
      question: "What is included in NextTalent's employee assessment?",
      answer: "Our assessments cover skills, experience, and culture fit to ensure the best matches for both employers and job seekers."
    },
    {
      question: "How secure is my data on NextTalent?",
      answer: "We use industry-standard security practices to keep your data safe and private at all times."
    }
  ];

  return (
    <div className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
      {/* Hero Section */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center py-16 px-4">
        {/* Lottie animation example (replace with your own JSON) */}
        <div className="flex justify-center mb-6">
          {/* Lottie animation placeholder */}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Get Hired <span className="text-indigo-400">Faster</span> with NextTalent
        </h1>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Apply for thousands of jobs instantly. Build your resume, connect with mentors, and unlock rewards.
        </p>
        
      </motion.section>

      {/* Features Grid */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-12 px-4">
        <motion.div whileHover={{ y: -8, scale: 1.03, boxShadow: '0 8px 32px rgba(80,80,255,0.08)' }} className={`rounded-2xl p-8 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}> 
          <h3 className="font-bold text-xl mb-2">Discover Jobs</h3>
          <p>Browse curated listings and get matched with the best opportunities based on your skills and goals.</p>
          <motion.a whileHover={{ color: '#6366f1' }} href="/jobs" className="text-indigo-500 font-semibold mt-3 inline-block">Find Jobs</motion.a>
        </motion.div>
        <motion.div whileHover={{ y: -8, scale: 1.03, boxShadow: '0 8px 32px rgba(80,80,255,0.08)' }} className={`rounded-2xl p-8 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}> 
          <h3 className="font-bold text-xl mb-2">Mentorship</h3>
          <p>Connect with top mentors for career guidance, interview prep, and real-world advice.</p>
          <motion.a whileHover={{ color: '#6366f1' }} href="/about" className="text-indigo-500 font-semibold mt-3 inline-block">Explore Mentors</motion.a>
        </motion.div>
        <motion.div whileHover={{ y: -8, scale: 1.03, boxShadow: '0 8px 32px rgba(80,80,255,0.08)' }} className={`rounded-2xl p-8 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}> 
          <h3 className="font-bold text-xl mb-2">Resume Builder</h3>
          <p>Create a pro-level resume in minutes using our easy, free resume builder.</p>
          <motion.a whileHover={{ color: '#6366f1' }} href="/resume" className="text-indigo-500 font-semibold mt-3 inline-block">Build Resume</motion.a>
        </motion.div>
      </motion.section>

      {/* Articles & Rewards */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 py-12 px-4">
        <motion.div whileHover={{ y: -8, scale: 1.03 }} className={`rounded-2xl p-8 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}> 
          <h3 className="font-bold text-xl mb-2">Career Tips & Articles</h3>
          <p>Stay ahead with expert articles, job hacks, and resume/interview strategies updated weekly.</p>
          <motion.a whileHover={{ color: '#6366f1' }} href="/articles" className="text-indigo-500 font-semibold mt-3 inline-block">Read Articles</motion.a>
        </motion.div>
        <motion.div whileHover={{ y: -8, scale: 1.03 }} className={`rounded-2xl p-8 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}> 
          <h3 className="font-bold text-xl mb-2">Rewards & Points</h3>
          <p>Earn points for using the platform – unlock offers, purchase items, certifications, and exclusive benefits.</p>
        </motion.div>
      </motion.section>

      {/* Success Stories / Testimonials */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.4 }} className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-extrabold text-center mb-10">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 40 }} transition={{ duration: 0.7, delay: 0.1 }} className={`rounded-2xl p-8 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}> 
            <div className="mb-4 text-5xl">"</div>
            <p className="mb-4">NextTalent helped me land my dream job in just two weeks! The resume builder and job matching were spot on.</p>
            <div className="font-bold">— Ayesha K., Product Manager</div>
          </motion.div>
          <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 40 }} transition={{ duration: 0.7, delay: 0.2 }} className={`rounded-2xl p-8 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}> 
            <div className="mb-4 text-5xl">"</div>
            <p className="mb-4">The mentorship program gave me the confidence and skills to ace my interviews. Highly recommended!</p>
            <div className="font-bold">— Rifat H., Software Engineer</div>
          </motion.div>
          <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 40 }} transition={{ duration: 0.7, delay: 0.3 }} className={`rounded-2xl p-8 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}> 
            <div className="mb-4 text-5xl">"</div>
            <p className="mb-4">I love the rewards system! Earning points while growing my career is a game changer.</p>
            <div className="font-bold">— Tanvir I., Marketing Specialist</div>
          </motion.div>
        </div>
      </motion.section>

      {/* Platform Stats (Trust Section) */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.5 }} className="max-w-6xl mx-auto py-12 px-4 text-center">
        <h2 className="text-3xl font-extrabold mb-10">Trusted by Thousands</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-bold text-indigo-500 mb-2"><CountUp end={50000} duration={2} separator="," />+</div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-500 mb-2"><CountUp end={10000} duration={2} separator="," />+</div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>Jobs Posted</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-500 mb-2"><CountUp end={2000} duration={2} separator="," />+</div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>Mentors</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-500 mb-2"><CountUp end={100} duration={2} separator="," />+</div>
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>Top Companies</div>
          </div>
        </div>
      </motion.section>

      

      {/* Enhanced Social Proof Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.7 }}
        className={`py-16 px-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Featured in Leading Publications
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Trusted by top companies and recognized by industry leaders
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
            <motion.div
              whileHover={{ y: -5 }}
              className="flex justify-center"
            >
              <MotionImg
                src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                alt="Google"
              />
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="flex justify-center"
            >
              <MotionImg
                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                alt="Facebook"
              />
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="flex justify-center"
            >
              <MotionImg
                src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                alt="LinkedIn"
              />
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="flex justify-center"
            >
              <MotionImg
                src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                alt="Microsoft"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced FAQ Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.7, delay: 0.8 }} 
        className="py-16 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Frequently Asked Questions
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Everything you need to know about NextTalent
            </p>
          </motion.div>
          
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-2xl border transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' 
                    : 'bg-white border-gray-200 hover:border-indigo-300'
                } ${openFaq === index ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-6 text-left flex justify-between items-center hover:bg-indigo-50 hover:bg-opacity-10 rounded-2xl transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <motion.svg
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-5 h-5 text-indigo-500 flex-shrink-0 ml-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === index ? "auto" : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced Feedback Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.9 }}
        className={`py-16 px-4 ${isDark ? 'bg-gray-800/30' : 'bg-indigo-50/50'}`}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Help Us Improve
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Your feedback drives our innovation. Share your thoughts and help us build better experiences.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`rounded-3xl shadow-xl p-8 ${
              isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-100'
            }`}
          >
            <FeedbackForm isDark={isDark} />
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default Home;
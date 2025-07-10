import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

const db = getFirestore();

const Dashboard = ({ isDark }) => {
  const { user, role, firstName } = useAuth();
  const [userStats, setUserStats] = useState({});
  const [recentJobs, setRecentJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, role]);

  const fetchUserData = async () => {
    try {
      if (role === 'Job Seeker') {
        await Promise.all([
          fetchJobSeekerStats(),
          fetchRecentJobs(),
          fetchApplications(),
          fetchSavedJobs()
        ]);
      } else if (role === 'Employer') {
        await Promise.all([
          fetchEmployerStats(),
          fetchCompanyJobs(),
          fetchJobApplications()
        ]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobSeekerStats = async () => {
    const applicationsSnap = await getDocs(query(collection(db, 'applications'), where('userId', '==', user.uid)));
    const savedJobsSnap = await getDocs(query(collection(db, 'savedJobs'), where('userId', '==', user.uid)));
    
    setUserStats({
      totalApplications: applicationsSnap.size,
      savedJobs: savedJobsSnap.size,
      interviewsScheduled: 0, // TODO: Implement interview tracking
      examsTaken: 0 // TODO: Implement exam tracking
    });
  };

  const fetchEmployerStats = async () => {
    const jobsSnap = await getDocs(query(collection(db, 'jobs'), where('postedBy', '==', user.uid)));
    const applicationsSnap = await getDocs(query(collection(db, 'applications'), where('employerId', '==', user.uid)));
    
    setUserStats({
      totalJobs: jobsSnap.size,
      totalApplications: applicationsSnap.size,
      pendingApplications: 0, // TODO: Count pending applications
      interviewsScheduled: 0 // TODO: Count scheduled interviews
    });
  };

  const fetchRecentJobs = async () => {
    const jobsSnap = await getDocs(query(collection(db, 'jobs'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'), limit(5)));
    setRecentJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchApplications = async () => {
    const applicationsSnap = await getDocs(query(collection(db, 'applications'), where('userId', '==', user.uid), orderBy('appliedAt', 'desc'), limit(5)));
    setApplications(applicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchSavedJobs = async () => {
    const savedSnap = await getDocs(query(collection(db, 'savedJobs'), where('userId', '==', user.uid), orderBy('savedAt', 'desc'), limit(5)));
    setSavedJobs(savedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchCompanyJobs = async () => {
    const jobsSnap = await getDocs(query(collection(db, 'jobs'), where('postedBy', '==', user.uid), orderBy('createdAt', 'desc'), limit(5)));
    setRecentJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchJobApplications = async () => {
    const applicationsSnap = await getDocs(query(collection(db, 'applications'), where('employerId', '==', user.uid), orderBy('appliedAt', 'desc'), limit(5)));
    setApplications(applicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl font-bold">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h2>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {role === 'Job Seeker' ? 'Track your job applications and career progress' :
             role === 'Employer' ? 'Manage your job postings and applications' :
             'Admin dashboard overview'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className={`mb-8 rounded-2xl shadow-md p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}> 
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {role === 'Job Seeker' ? (
              <>
                <Link to="/jobs" className="p-4 rounded-lg border-2 border-dashed flex flex-col items-center hover:border-indigo-400 transition-colors text-center">
                  <svg className="w-8 h-8 mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="font-semibold">Search Jobs</p>
                </Link>
                <Link to="/resume" className="p-4 rounded-lg border-2 border-dashed flex flex-col items-center hover:border-green-400 transition-colors text-center">
                  <svg className="w-8 h-8 mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-semibold">Update Resume</p>
                </Link>
                <Link to="/exams" className="p-4 rounded-lg border-2 border-dashed flex flex-col items-center hover:border-purple-400 transition-colors text-center">
                  <svg className="w-8 h-8 mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold">Take Exams</p>
                </Link>
                <Link to="/interviews" className="p-4 rounded-lg border-2 border-dashed flex flex-col items-center hover:border-orange-400 transition-colors text-center">
                  <svg className="w-8 h-8 mb-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-semibold">Schedule Interview</p>
                </Link>
              </>
            ) : role === 'Employer' ? (
              <>
                <Link to="/post-job" className="p-4 rounded-lg border-2 border-dashed flex flex-col items-center hover:border-indigo-400 transition-colors text-center">
                  <svg className="w-8 h-8 mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="font-semibold">Post New Job</p>
                </Link>
                <Link to="/company-profile" className="p-4 rounded-lg border-2 border-dashed flex flex-col items-center hover:border-green-400 transition-colors text-center">
                  <svg className="w-8 h-8 mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="font-semibold">Company Profile</p>
                </Link>
                <Link to="/applications" className="p-4 rounded-lg border-2 border-dashed flex flex-col items-center hover:border-purple-400 transition-colors text-center">
                  <svg className="w-8 h-8 mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-semibold">Review Applications</p>
                </Link>
                <Link to="/interviews" className="p-4 rounded-lg border-2 border-dashed flex flex-col items-center hover:border-orange-400 transition-colors text-center">
                  <svg className="w-8 h-8 mb-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-semibold">Schedule Interviews</p>
                </Link>
              </>
            ) : null}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <div className={`p-6 rounded-2xl shadow-lg flex flex-col justify-between h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {role === 'Job Seeker' ? 'Recent Job Opportunities' : 'Your Recent Jobs'}
            </h3>
            {recentJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M7 7a4 4 0 110-8 4 4 0 010 8z" /></svg>
                <p className={`text-base mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No jobs {role === 'Job Seeker' ? 'found' : 'posted'} yet</p>
                {role === 'Employer' && (
                  <Link to="/post-job" className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Post a Job</Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className="font-semibold">{job.title}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{job.companyName}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{job.location}</p>
                  </div>
                ))}
              </div>
            )}
            <Link to="/jobs" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium mt-4 inline-block">
              {role === 'Job Seeker' ? 'View all jobs' : 'View all your jobs'}
            </Link>
          </div>

          {/* Recent Applications */}
          <div className={`p-6 rounded-2xl shadow-lg flex flex-col justify-between h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {role === 'Job Seeker' ? 'Your Recent Applications' : 'Recent Applications'}
            </h3>
            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M7 7a4 4 0 110-8 4 4 0 010 8z" /></svg>
                <p className={`text-base mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No applications {role === 'Job Seeker' ? 'yet' : 'received'}</p>
                {role === 'Job Seeker' && (
                  <Link to="/jobs" className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">Apply for Jobs</Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className="font-semibold">{app.jobTitle || 'Job Application'}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{role === 'Job Seeker' ? app.companyName : app.applicantName}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/applications" className="text-purple-600 hover:text-purple-500 text-sm font-medium mt-4 inline-block">
              {role === 'Job Seeker' ? 'View all applications' : 'View all applications'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
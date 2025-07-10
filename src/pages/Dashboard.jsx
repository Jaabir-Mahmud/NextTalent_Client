import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

const db = getFirestore();

const Dashboard = ({ isDark }) => {
  const { user, role, firstName } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    savedJobs: 0,
    myApplications: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, role]);

  const fetchDashboardData = async () => {
    try {
      if (role === 'Employer' || role === 'Admin') {
        await fetchEmployerData();
      } else {
        await fetchJobSeekerData();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployerData = async () => {
    // Fetch employer's posted jobs
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('postedBy', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRecentJobs(jobsData);

    // Fetch applications for employer's jobs
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('employerId', '==', user.uid),
      orderBy('appliedAt', 'desc'),
      limit(5)
    );
    const applicationsSnapshot = await getDocs(applicationsQuery);
    const applicationsData = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRecentApplications(applicationsData);

    // Calculate stats
    const allJobsQuery = query(collection(db, 'jobs'), where('postedBy', '==', user.uid));
    const allJobsSnapshot = await getDocs(allJobsQuery);
    const allJobs = allJobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const allApplicationsQuery = query(collection(db, 'applications'), where('employerId', '==', user.uid));
    const allApplicationsSnapshot = await getDocs(allApplicationsQuery);
    const allApplications = allApplicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setStats({
      totalJobs: allJobs.length,
      activeJobs: allJobs.filter(job => job.status === 'approved').length,
      totalApplications: allApplications.length,
      pendingApplications: allApplications.filter(app => app.status === 'pending').length,
      savedJobs: 0,
      myApplications: 0
    });
  };

  const fetchJobSeekerData = async () => {
    // Fetch user's applications
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('userId', '==', user.uid),
      orderBy('appliedAt', 'desc'),
      limit(5)
    );
    const applicationsSnapshot = await getDocs(applicationsQuery);
    const applicationsData = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRecentApplications(applicationsData);

    // Fetch saved jobs
    const savedJobsQuery = query(
      collection(db, 'savedJobs'),
      where('userId', '==', user.uid)
    );
    const savedJobsSnapshot = await getDocs(savedJobsQuery);
    const savedJobsData = savedJobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate stats
    const allApplicationsQuery = query(collection(db, 'applications'), where('userId', '==', user.uid));
    const allApplicationsSnapshot = await getDocs(allApplicationsQuery);
    const allApplications = allApplicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setStats({
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      pendingApplications: 0,
      savedJobs: savedJobsData.length,
      myApplications: allApplications.length
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl font-bold">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {firstName || user.email?.split('@')[0]}!
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {role === 'Employer' || role === 'Admin' 
              ? 'Manage your job postings and review applications'
              : 'Track your job applications and saved positions'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {role === 'Employer' || role === 'Admin' ? (
            <>
              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Jobs</p>
                    <p className="text-2xl font-bold">{stats.totalJobs}</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Jobs</p>
                    <p className="text-2xl font-bold">{stats.activeJobs}</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Applications</p>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending Reviews</p>
                    <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>My Applications</p>
                    <p className="text-2xl font-bold">{stats.myApplications}</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Saved Jobs</p>
                    <p className="text-2xl font-bold">{stats.savedJobs}</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Exams Taken</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Interviews</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {role === 'Employer' || role === 'Admin' ? (
              <>
                <Link
                  to="/post-job"
                  className={`p-4 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="ml-3 font-medium">Post New Job</span>
                  </div>
                </Link>

                <Link
                  to="/applications"
                  className={`p-4 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="ml-3 font-medium">Review Applications</span>
                  </div>
                </Link>

                <Link
                  to="/interviews"
                  className={`p-4 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="ml-3 font-medium">Schedule Interviews</span>
                  </div>
                </Link>

                <Link
                  to="/exams"
                  className={`p-4 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="ml-3 font-medium">Set Exams</span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/jobs"
                  className={`p-4 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span className="ml-3 font-medium">Find Jobs</span>
                  </div>
                </Link>

                <Link
                  to="/resume"
                  className={`p-4 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="ml-3 font-medium">Build Resume</span>
                  </div>
                </Link>

                <Link
                  to="/exams"
                  className={`p-4 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="ml-3 font-medium">Take Exams</span>
                  </div>
                </Link>

                <Link
                  to="/user-profile"
                  className={`p-4 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="ml-3 font-medium">View Profile</span>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {role === 'Employer' || role === 'Admin' ? (
            <>
              {/* Recent Jobs */}
              <div className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold">Recent Job Postings</h3>
                </div>
                <div className="p-6">
                  {recentJobs.length === 0 ? (
                    <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No jobs posted yet</p>
                  ) : (
                    <div className="space-y-4">
                      {recentJobs.map((job) => (
                        <div key={job.id} className={`p-4 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className="font-semibold mb-1">{job.title}</h4>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{job.companyName}</p>
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                              {job.status}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {job.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Applications */}
              <div className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold">Recent Applications</h3>
                </div>
                <div className="p-6">
                  {recentApplications.length === 0 ? (
                    <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No applications yet</p>
                  ) : (
                    <div className="space-y-4">
                      {recentApplications.map((application) => (
                        <div key={application.id} className={`p-4 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className="font-semibold mb-1">{application.jobTitle}</h4>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Applied by: {application.userName || 'Unknown'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {application.appliedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Recent Applications for Job Seekers */}
              <div className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold">Recent Applications</h3>
                </div>
                <div className="p-6">
                  {recentApplications.length === 0 ? (
                    <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No applications yet</p>
                  ) : (
                    <div className="space-y-4">
                      {recentApplications.map((application) => (
                        <div key={application.id} className={`p-4 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className="font-semibold mb-1">{application.jobTitle}</h4>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{application.companyName}</p>
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {application.appliedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Jobs */}
              <div className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold">Saved Jobs</h3>
                </div>
                <div className="p-6">
                  <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    You have {stats.savedJobs} saved jobs
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/user-profile"
                      className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      View All Saved Jobs
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
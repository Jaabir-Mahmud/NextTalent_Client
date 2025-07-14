import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery';
import { Link } from 'react-router-dom';

const db = getFirestore();

// Memoized Stats Card Component
const StatsCard = React.memo(({ title, value, icon, color, isDark }) => {
  return (
    <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color.bg} ${color.icon}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

// Memoized Recent Item Component
const RecentItem = React.memo(({ item, type, isDark }) => {
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }, []);

  const getItemTitle = () => {
    switch (type) {
      case 'job':
        return item.title;
      case 'savedJob':
        return item.jobTitle || item.title;
      default:
        return item.jobTitle;
    }
  };

  const getItemCompany = () => {
    switch (type) {
      case 'job':
        return item.companyName;
      case 'savedJob':
        return item.companyName;
      default:
        return item.companyName;
    }
  };

  const getItemDate = () => {
    if (type === 'savedJob') {
      return item.savedAt?.toDate?.() ? 
        new Date(item.savedAt.toDate()).toLocaleDateString() : 
        'Recently saved';
    }
    return item.createdAt?.toDate?.() ? 
      new Date(item.createdAt.toDate()).toLocaleDateString() : 
      'Recently';
  };

  return (
    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{getItemTitle()}</h4>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {getItemCompany()}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {getItemDate()}
          </p>
          {type === 'savedJob' && (
            <p className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'} mt-1`}>
              💾 Saved Job
            </p>
          )}
        </div>
        {item.status && type !== 'savedJob' && (
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
});

RecentItem.displayName = 'RecentItem';

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

  // Fetch data based on user role
  const employerJobsQuery = useMemo(() => [
    { type: 'where', field: 'postedBy', operator: '==', value: user?.uid },
    { type: 'orderBy', field: 'createdAt', direction: 'desc' },
    { type: 'limit', value: 5 }
  ], [user?.uid]);

  const employerApplicationsQuery = useMemo(() => [
    { type: 'where', field: 'employerId', operator: '==', value: user?.uid },
    { type: 'orderBy', field: 'appliedAt', direction: 'desc' },
    { type: 'limit', value: 5 }
  ], [user?.uid]);

  const jobSeekerApplicationsQuery = useMemo(() => [
    { type: 'where', field: 'userId', operator: '==', value: user?.uid },
    { type: 'orderBy', field: 'appliedAt', direction: 'desc' },
    { type: 'limit', value: 5 }
  ], [user?.uid]);

  const savedJobsQuery = useMemo(() => [
    { type: 'where', field: 'userId', operator: '==', value: user?.uid }
  ], [user?.uid]);

  // Fetch data using optimized hooks
  const { data: recentJobs } = useFirestoreQuery('jobs', role === 'Employer' || role === 'Admin' ? employerJobsQuery : []);
  const { data: recentApplications } = useFirestoreQuery('applications', 
    role === 'Employer' || role === 'Admin' ? employerApplicationsQuery : jobSeekerApplicationsQuery
  );
  const { data: savedJobsRaw } = useFirestoreQuery('savedJobs', role === 'Job Seeker' ? savedJobsQuery : []);

  // State for processed saved jobs with full job details
  const [savedJobs, setSavedJobs] = useState([]);

  // Calculate stats
  useEffect(() => {
    if (!user) return;

    const calculateStats = async () => {
      try {
        if (role === 'Employer' || role === 'Admin') {
          // Fetch all jobs for stats
          const allJobsQuery = query(collection(db, 'jobs'), where('postedBy', '==', user.uid));
          const allJobsSnapshot = await getDocs(allJobsQuery);
          const allJobs = allJobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Fetch all applications for stats
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
        } else {
          // Fetch all applications for job seeker stats
          const allApplicationsQuery = query(collection(db, 'applications'), where('userId', '==', user.uid));
          const allApplicationsSnapshot = await getDocs(allApplicationsQuery);
          const allApplications = allApplicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          setStats({
            totalJobs: 0,
            activeJobs: 0,
            totalApplications: 0,
            pendingApplications: 0,
            savedJobs: savedJobsRaw.length,
            myApplications: allApplications.length
          });
        }
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };

    calculateStats();
  }, [user, role, savedJobsRaw.length]);

  // Fetch full job details for saved jobs
  useEffect(() => {
    if (!user || role !== 'Job Seeker' || !savedJobsRaw.length) {
      setSavedJobs([]);
      return;
    }

    const fetchSavedJobDetails = async () => {
      try {
        const jobDetailsPromises = savedJobsRaw.map(async (savedJob) => {
          try {
            const jobDocRef = doc(db, 'jobs', savedJob.jobId);
            const jobDoc = await getDoc(jobDocRef);
            
            if (jobDoc.exists()) {
              const jobData = jobDoc.data();
              return {
                id: savedJob.id,
                jobId: savedJob.jobId,
                savedAt: savedJob.savedAt,
                title: jobData.title,
                jobTitle: jobData.title,
                companyName: jobData.companyName,
                location: jobData.location,
                salary: jobData.salary,
                type: jobData.type
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching job ${savedJob.jobId}:`, error);
            return null;
          }
        });

        const jobDetails = await Promise.all(jobDetailsPromises);
        const validJobs = jobDetails.filter(job => job !== null);
        setSavedJobs(validJobs);
      } catch (error) {
        console.error('Error fetching saved job details:', error);
        setSavedJobs([]);
      }
    };

    fetchSavedJobDetails();
  }, [user, role, savedJobsRaw]);

  // Memoized stats cards data
  const statsCards = useMemo(() => {
    if (role === 'Employer' || role === 'Admin') {
      return [
        {
          title: 'Total Jobs',
          value: stats.totalJobs,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          color: { bg: 'bg-blue-100 dark:bg-blue-900', icon: 'text-blue-600 dark:text-blue-400' }
        },
        {
          title: 'Active Jobs',
          value: stats.activeJobs,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: { bg: 'bg-green-100 dark:bg-green-900', icon: 'text-green-600 dark:text-green-400' }
        },
        {
          title: 'Total Applications',
          value: stats.totalApplications,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          color: { bg: 'bg-purple-100 dark:bg-purple-900', icon: 'text-purple-600 dark:text-purple-400' }
        },
        {
          title: 'Pending Applications',
          value: stats.pendingApplications,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: { bg: 'bg-yellow-100 dark:bg-yellow-900', icon: 'text-yellow-600 dark:text-yellow-400' }
        }
      ];
    } else {
      return [
        {
          title: 'Saved Jobs',
          value: stats.savedJobs,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          ),
          color: { bg: 'bg-red-100 dark:bg-red-900', icon: 'text-red-600 dark:text-red-400' }
        },
        {
          title: 'My Applications',
          value: stats.myApplications,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          color: { bg: 'bg-indigo-100 dark:bg-indigo-900', icon: 'text-indigo-600 dark:text-indigo-400' }
        }
      ];
    }
  }, [role, stats]);

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl font-bold">Please log in to view your dashboard.</div>
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
          {statsCards.map((card, index) => (
            <StatsCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              isDark={isDark}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          {(role === 'Employer' || role === 'Admin') && recentJobs.length > 0 && (
            <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Recent Job Postings</h3>
                <Link
                  to="/post-job"
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  Post New Job
                </Link>
              </div>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <RecentItem key={job.id} item={job} type="job" isDark={isDark} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Applications */}
          {recentApplications.length > 0 && (
            <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {role === 'Employer' || role === 'Admin' ? 'Recent Applications' : 'My Recent Applications'}
                </h3>
                <Link
                  to="/applications"
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <RecentItem key={application.id} item={application} type="application" isDark={isDark} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Saved Jobs */}
          {role === 'Job Seeker' && savedJobs.length > 0 && (
            <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Recently Saved Jobs</h3>
                <Link
                  to="/profile"
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  View All Saved
                </Link>
              </div>
              <div className="space-y-4">
                {savedJobs.slice(0, 5).map((savedJob) => (
                  <RecentItem key={savedJob.id} item={savedJob} type="savedJob" isDark={isDark} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state for job seekers with no activity */}
          {role === 'Job Seeker' && recentApplications.length === 0 && savedJobs.length === 0 && (
            <div className={`p-8 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border text-center col-span-full`}>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">Ready to Start Your Job Search?</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Explore thousands of job opportunities and save the ones that interest you.
              </p>
              <Link
                to="/jobs"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Browse Jobs
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/jobs"
              className={`p-4 rounded-lg border text-center transition-all duration-300 hover:shadow-lg ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:border-purple-500 hover:bg-gray-700' 
                  : 'bg-white border-gray-200 hover:border-purple-500 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium">Browse Jobs</div>
            </Link>
            
            <Link
              to="/resume"
              className={`p-4 rounded-lg border text-center transition-all duration-300 hover:shadow-lg ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:border-purple-500 hover:bg-gray-700' 
                  : 'bg-white border-gray-200 hover:border-purple-500 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">Resume Builder</div>
            </Link>
            
            {(role === 'Employer' || role === 'Admin') && (
              <Link
                to="/post-job"
                className={`p-4 rounded-lg border text-center transition-all duration-300 hover:shadow-lg ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:border-purple-500 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 hover:border-purple-500 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">➕</div>
                <div className="font-medium">Post Job</div>
              </Link>
            )}
            
            <Link
              to="/applications"
              className={`p-4 rounded-lg border text-center transition-all duration-300 hover:shadow-lg ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:border-purple-500 hover:bg-gray-700' 
                  : 'bg-white border-gray-200 hover:border-purple-500 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">Applications</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
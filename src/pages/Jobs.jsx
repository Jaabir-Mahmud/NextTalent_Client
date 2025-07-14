import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getFirestore, collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { useSearchFilter, usePagination } from "../utils/performance";
import { validateConfig } from "../config/env";
import Swal from 'sweetalert2';

// Memoized Job Card Component
const JobCard = React.memo(({ job, isDark, isSaved, hasApplied, onSave, onApply, user, role }) => {
  const handleSave = useCallback(() => {
    onSave(job.id);
  }, [job.id, onSave]);

  const handleApply = useCallback(() => {
    onApply(job);
  }, [job, onApply]);

  return (
    <div className={`p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
      isDark ? 'bg-gray-800 border-gray-700 hover:border-purple-500' : 'bg-white border-gray-200 hover:border-purple-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-2">{job.title}</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {job.companyName} • {job.location}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-green-600">{job.salary}</p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {job.createdAt?.toDate?.() ? 
              new Date(job.createdAt.toDate()).toLocaleDateString() : 
              'Recently posted'
            }
          </p>
        </div>
      </div>
      
      <p className={`mb-4 line-clamp-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {job.description}
      </p>
      
      {job.requirements && job.requirements.length > 0 && (
        <div className="mb-4">
          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Requirements:
          </p>
          <div className="flex flex-wrap gap-2">
            {job.requirements.slice(0, 3).map((req, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-full ${
                  isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
                }`}
              >
                {req}
              </span>
            ))}
            {job.requirements.length > 3 && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                +{job.requirements.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
            isSaved
              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800'
          }`}
        >
          {isSaved ? 'Remove' : 'Save'}
        </button>
        
        {user && role === 'Job Seeker' && (
          <button
            onClick={handleApply}
            disabled={hasApplied}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              hasApplied
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            }`}
          >
            {hasApplied ? 'Applied' : 'Apply Now'}
          </button>
        )}
      </div>
    </div>
  );
});

JobCard.displayName = 'JobCard';

// Memoized Search and Filter Component
const SearchAndFilter = React.memo(({ 
  searchTerm, 
  onSearchChange, 
  filterLocation, 
  onLocationChange, 
  filterSalary, 
  onSalaryChange, 
  filterExperience, 
  onExperienceChange, 
  isDark 
}) => {
  return (
    <div className={`p-6 rounded-xl shadow-lg mb-6 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Search Jobs
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Job title, company, or keywords..."
            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Location
          </label>
          <input
            type="text"
            value={filterLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="City, state, or remote"
            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Salary Range
          </label>
          <select
            value={filterSalary}
            onChange={(e) => onSalaryChange(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Any Salary</option>
            <option value="0-30000">$0 - $30,000</option>
            <option value="30000-60000">$30,000 - $60,000</option>
            <option value="60000-90000">$60,000 - $90,000</option>
            <option value="90000-120000">$90,000 - $120,000</option>
            <option value="120000+">$120,000+</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Experience Level
          </label>
          <select
            value={filterExperience}
            onChange={(e) => onExperienceChange(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Any Experience</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="executive">Executive</option>
          </select>
        </div>
      </div>
    </div>
  );
});

SearchAndFilter.displayName = 'SearchAndFilter';

const Jobs = ({ isDark }) => {
  const { user, role } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterSalary, setFilterSalary] = useState("");
  const [filterExperience, setFilterExperience] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobDocs, setSavedJobDocs] = useState({});
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch jobs directly
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        setJobsError(null);
        
        // Check environment variables
        const configValid = validateConfig();
        setDebugInfo(prev => ({ ...prev, configValid }));
        
        if (!configValid) {
          setJobsError('Firebase configuration is missing. Please check your configuration.');
          setJobsLoading(false);
          return;
        }

        const db = getFirestore();
        if (!db) {
          console.error('Firebase not initialized');
          setJobsError('Firebase not initialized');
          setJobsLoading(false);
          return;
        }

        console.log('Fetching jobs from Firebase...');
        const jobsQuery = query(
          collection(db, 'jobs'), 
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        );
        
        const jobsSnap = await getDocs(jobsQuery);
        console.log('Jobs snapshot:', jobsSnap.docs.length, 'documents found');
        
        const jobsData = jobsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Processed jobs data:', jobsData.length, 'jobs');
        setJobs(jobsData);
        setDebugInfo(prev => ({ 
          ...prev, 
          jobsCount: jobsData.length,
          firebaseInitialized: true 
        }));
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobsError(error.message);
        setDebugInfo(prev => ({ ...prev, error: error.message }));
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch saved jobs and applications when user changes
  useEffect(() => {
    if (user) {
      fetchSavedJobs();
      fetchApplications();
    }
  }, [user]);

  const fetchSavedJobs = useCallback(async () => {
    try {
      const db = getFirestore();
      if (!db) return;
      
      const savedSnap = await getDocs(query(collection(db, 'savedJobs'), where('userId', '==', user.uid)));
      const savedJobIds = [];
      const savedDocs = {};
      savedSnap.docs.forEach(doc => {
        const data = doc.data();
        savedJobIds.push(data.jobId);
        savedDocs[data.jobId] = doc.id;
      });
      setSavedJobs(savedJobIds);
      setSavedJobDocs(savedDocs);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  }, [user?.uid]);

  const fetchApplications = useCallback(async () => {
    try {
      const db = getFirestore();
      if (!db) return;
      
      const applicationsSnap = await getDocs(query(collection(db, 'applications'), where('userId', '==', user.uid)));
      setApplications(applicationsSnap.docs.map(doc => doc.data().jobId));
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  }, [user?.uid]);

  // Filter jobs based on search and filters
  const filteredJobs = useSearchFilter(jobs, debouncedSearchTerm, ['title', 'companyName', 'description', 'requirements']);

  // Apply additional filters
  const finalFilteredJobs = useMemo(() => {
    return filteredJobs.filter(job => {
      if (filterLocation && !job.location?.toLowerCase().includes(filterLocation.toLowerCase())) {
        return false;
      }
      if (filterSalary && job.salary) {
        const salary = parseInt(job.salary.replace(/[^0-9]/g, ''));
        const [min, max] = filterSalary.split('-').map(s => s === '+' ? Infinity : parseInt(s));
        if (salary < min || (max !== Infinity && salary > max)) {
          return false;
        }
      }
      if (filterExperience && job.experienceLevel && job.experienceLevel !== filterExperience) {
        return false;
      }
      return true;
    });
  }, [filteredJobs, filterLocation, filterSalary, filterExperience]);

  // Pagination
  const { paginatedItems: displayJobs, currentPage, totalPages, goToPage, hasNextPage, hasPrevPage } = usePagination(finalFilteredJobs, 10);

  const handleSaveJob = useCallback(async (jobId) => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to save jobs',
        confirmButtonColor: '#a78bfa',
      });
      return;
    }

    try {
      const db = getFirestore();
      if (!db) {
        console.error('Firebase not initialized');
        return;
      }

      if (savedJobs.includes(jobId)) {
        const docId = savedJobDocs[jobId];
        if (docId) {
          await deleteDoc(doc(db, 'savedJobs', docId));
          setSavedJobs(prev => prev.filter(id => id !== jobId));
          setSavedJobDocs(prev => {
            const newDocs = { ...prev };
            delete newDocs[jobId];
            return newDocs;
          });
          Swal.fire({
            icon: 'success',
            title: 'Job Removed',
            text: 'Job removed from saved jobs',
            confirmButtonColor: '#a78bfa',
          });
        }
      } else {
        const docRef = await addDoc(collection(db, 'savedJobs'), {
          userId: user.uid,
          jobId: jobId,
          savedAt: serverTimestamp()
        });
        setSavedJobs(prev => [...prev, jobId]);
        setSavedJobDocs(prev => ({ ...prev, [jobId]: docRef.id }));
        Swal.fire({
          icon: 'success',
          title: 'Job Saved',
          text: 'Job added to saved jobs',
          confirmButtonColor: '#a78bfa',
        });
      }
    } catch (error) {
      console.error("Error saving job:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save job',
        confirmButtonColor: '#a78bfa',
      });
    }
  }, [user, savedJobs, savedJobDocs]);

  const handleApplyJob = useCallback(async (job) => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to apply for jobs',
        confirmButtonColor: '#a78bfa',
      });
      return;
    }

    if (role !== 'Job Seeker') {
      Swal.fire({
        icon: 'warning',
        title: 'Access Denied',
        text: 'Only job seekers can apply for jobs',
        confirmButtonColor: '#a78bfa',
      });
      return;
    }

    if (applications.includes(job.id)) {
      Swal.fire({
        icon: 'info',
        title: 'Already Applied',
        text: 'You have already applied for this job',
        confirmButtonColor: '#a78bfa',
      });
      return;
    }

    try {
      const db = getFirestore();
      if (!db) {
        console.error('Firebase not initialized');
        return;
      }

      const resumeDoc = await getDoc(doc(db, 'resumes', user.uid));
      if (!resumeDoc.exists()) {
        Swal.fire({
          icon: 'warning',
          title: 'Resume Required',
          text: 'Please create a resume before applying for jobs',
          confirmButtonColor: '#a78bfa',
        });
        return;
      }

      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        jobId: job.id,
        employerId: job.postedBy,
        jobTitle: job.title,
        companyName: job.companyName,
        status: 'pending',
        appliedAt: serverTimestamp(),
        resumeData: resumeDoc.data()
      });

      setApplications(prev => [...prev, job.id]);
      Swal.fire({
        icon: 'success',
        title: 'Application Submitted',
        text: 'Your application has been submitted successfully',
        confirmButtonColor: '#a78bfa',
      });
    } catch (error) {
      console.error("Error applying for job:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit application',
        confirmButtonColor: '#a78bfa',
      });
    }
  }, [user, role, applications]);

  if (jobsLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="text-xl font-bold mb-4">Loading jobs...</div>
          <div className="text-sm text-gray-500">
            {debugInfo.configValid === false && (
              <div className="text-red-500 mb-2">
                ⚠️ Firebase configuration issue detected
              </div>
            )}
            <div>Debug info: {JSON.stringify(debugInfo)}</div>
          </div>
        </div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center max-w-md">
          <div className="text-xl font-bold text-red-500 mb-4">Error loading jobs</div>
          <div className="text-sm text-gray-500 mb-4">{jobsError}</div>
          <div className="text-xs text-gray-400 mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
            <strong>Debug Info:</strong><br/>
            {JSON.stringify(debugInfo, null, 2)}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Dream Job</h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover thousands of opportunities and take the next step in your career
          </p>
          {debugInfo.jobsCount !== undefined && (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total jobs available: {debugInfo.jobsCount}
            </p>
          )}
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterLocation={filterLocation}
          onLocationChange={setFilterLocation}
          filterSalary={filterSalary}
          onSalaryChange={setFilterSalary}
          filterExperience={filterExperience}
          onExperienceChange={setFilterExperience}
          isDark={isDark}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {displayJobs.length} of {finalFilteredJobs.length} jobs
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {displayJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isDark={isDark}
              isSaved={savedJobs.includes(job.id)}
              hasApplied={applications.includes(job.id)}
              onSave={handleSaveJob}
              onApply={handleApplyJob}
              user={user}
              role={role}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPrevPage}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                hasPrevPage
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              Previous
            </button>
            
            <span className={`px-4 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                hasNextPage
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {displayJobs.length === 0 && (
          <div className="text-center py-12">
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No jobs found matching your criteria. Try adjusting your search or filters.
            </p>
            {debugInfo.jobsCount === 0 && (
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                No jobs found in database. This might be a configuration issue.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Jobs); 
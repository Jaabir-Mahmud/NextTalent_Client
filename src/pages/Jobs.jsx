import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import Swal from 'sweetalert2';

const db = getFirestore();

const Jobs = ({ isDark }) => {
  const { user, role } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterSalary, setFilterSalary] = useState("");
  const [filterExperience, setFilterExperience] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobDocs, setSavedJobDocs] = useState({}); // Store document IDs for deletion

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
      fetchApplications();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const q = query(
        collection(db, "jobs"),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const savedSnap = await getDocs(query(collection(db, 'savedJobs'), where('userId', '==', user.uid)));
      const savedJobIds = [];
      const savedDocs = {};
      savedSnap.docs.forEach(doc => {
        const data = doc.data();
        savedJobIds.push(data.jobId);
        savedDocs[data.jobId] = doc.id; // Store document ID for deletion
      });
      setSavedJobs(savedJobIds);
      setSavedJobDocs(savedDocs);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsSnap = await getDocs(query(collection(db, 'applications'), where('userId', '==', user.uid)));
      setApplications(applicationsSnap.docs.map(doc => doc.data().jobId));
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleSaveJob = async (jobId) => {
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
      if (savedJobs.includes(jobId)) {
        // Remove from saved jobs
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
        // Add to saved jobs
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
  };

  const handleApplyJob = async (job) => {
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
      // Check if user has a resume
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

      // Apply for the job
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
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filterLocation || job.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesSalary = !filterSalary || job.salary.toLowerCase().includes(filterSalary.toLowerCase());
    const matchesExperience = !filterExperience || job.experienceLevel === filterExperience;
    return matchesSearch && matchesLocation && matchesSalary && matchesExperience;
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl font-bold">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto py-10 px-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Find Your Dream Job</h2>
        
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search jobs, companies, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Filter by location..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Filter by salary..."
              value={filterSalary}
              onChange={(e) => setFilterSalary(e.target.value)}
              className="px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <select
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Experience Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="executive">Executive</option>
            </select>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Job Listings */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No jobs found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className={`p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      {applications.includes(job.id) && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Applied
                        </span>
                      )}
                    </div>
                    <p className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{job.companyName}</p>
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      📍 {job.location} • 💰 {job.salary}
                    </p>
                    <p className={`line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {job.description}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <button 
                      onClick={() => handleSaveJob(job.id)}
                      className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                        savedJobs.includes(job.id)
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {savedJobs.includes(job.id) ? 'Saved' : 'Save'}
                    </button>
                    {user && role === "Job Seeker" ? (
                      <button 
                        onClick={() => handleApplyJob(job)}
                        disabled={applications.includes(job.id)}
                        className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
                          applications.includes(job.id)
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {applications.includes(job.id) ? 'Applied' : 'Apply Now'}
                      </button>
                    ) : (
                      <button className="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed font-semibold">
                        Login to Apply
                      </button>
                    )}
                  </div>
                </div>
                
                {job.requirements && job.requirements.length > 0 && (
                  <div className="mt-4">
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Requirements:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, index) => (
                        <span 
                          key={index} 
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isDark 
                              ? 'bg-indigo-900 text-indigo-200' 
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.experienceLevel && (
                  <div className="mt-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      job.experienceLevel === 'entry' ? 'bg-green-100 text-green-800' :
                      job.experienceLevel === 'mid' ? 'bg-yellow-100 text-yellow-800' :
                      job.experienceLevel === 'senior' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs; 
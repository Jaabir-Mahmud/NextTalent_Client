import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "../AuthContext";

const db = getFirestore();

const Jobs = ({ isDark }) => {
  const { user, role } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filterLocation || job.location.toLowerCase().includes(filterLocation.toLowerCase());
    return matchesSearch && matchesLocation;
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
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search jobs, companies, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Filter by location..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
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
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <p className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{job.companyName}</p>
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      📍 {job.location} • 💰 {job.salary}
                    </p>
                    <p className={`line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {job.description}
                    </p>
                  </div>
                  <div className="ml-4">
                    {user && role === "Job Seeker" ? (
                      <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                        Apply Now
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs; 
import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import Swal from 'sweetalert2';

const db = getFirestore();

const AdminDashboard = () => {
  const { user, role } = useAuth();
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user || role !== "Admin") {
    return <div className="p-8 text-center text-lg">You do not have admin access.</div>;
  }

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      const q = query(collection(db, "jobs"), where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingJobs(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    try {
      await updateDoc(doc(db, "jobs", jobId), { status: "approved" });
      Swal.fire({ icon: 'success', title: 'Job approved!', confirmButtonColor: '#a78bfa' });
      fetchPendingJobs();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#a78bfa' });
    }
  };

  const handleReject = async (jobId) => {
    try {
      await updateDoc(doc(db, "jobs", jobId), { status: "rejected" });
      Swal.fire({ icon: 'success', title: 'Job rejected!', confirmButtonColor: '#a78bfa' });
      fetchPendingJobs();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#a78bfa' });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Admin Dashboard</h2>
      <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Pending Job Approvals ({pendingJobs.length})</h3>
      
      {pendingJobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No pending jobs to approve.</div>
      ) : (
        <div className="space-y-4">
          {pendingJobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-white">{job.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{job.companyName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{job.location} • {job.salary}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(job.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(job.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Description:</h5>
                <p className="text-gray-600 dark:text-gray-400">{job.description}</p>
              </div>
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Requirements:</h5>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
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
  );
};

export default AdminDashboard; 
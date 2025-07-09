import React, { useState } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";

const db = getFirestore();

const PostJob = () => {
  const { user, role, firstName } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!user || (role !== "Employer" && role !== "Admin")) {
    return <div className="p-8 text-center text-lg">You do not have permission to post jobs.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addDoc(collection(db, "jobs"), {
        title,
        description,
        requirements: requirements.split(",").map(r => r.trim()).filter(Boolean),
        companyName: companyName || firstName + "'s Company",
        location,
        salary,
        postedBy: user.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      Swal.fire({
        icon: 'success',
        title: 'Job posted!',
        text: 'Your job is submitted for admin approval.',
        confirmButtonColor: '#a78bfa',
      }).then(() => navigate("/dashboard"));
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#a78bfa' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Post a New Job</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements <span className="text-xs">(comma separated)</span></label>
          <input type="text" value={requirements} onChange={e => setRequirements(e.target.value)} placeholder="React, Node.js, Teamwork" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary</label>
          <input type="text" value={salary} onChange={e => setSalary(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-600 transition-all duration-300 disabled:opacity-60">
          {isLoading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
};

export default PostJob; 
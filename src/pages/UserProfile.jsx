import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import Swal from 'sweetalert2';

const db = getFirestore();

const UserProfile = ({ isDark }) => {
  const { user, role, firstName, lastName, photoURL } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    phone: '',
    location: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      fetchSavedJobs();
      fetchApplications();
      fetchUserDetails();
    }
  }, [user]);

  const fetchUserDetails = async () => {
    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setEditForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          location: userData.location || '',
          bio: userData.bio || ''
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
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
        savedDocs[data.jobId] = doc.id;
      });
      
      // Fetch the actual job details
      const jobsData = [];
      for (const jobId of savedJobIds) {
        try {
          const jobDoc = await getDocs(query(collection(db, 'jobs'), where('__name__', '==', jobId)));
          if (!jobDoc.empty) {
            jobsData.push({ 
              id: jobId, 
              ...jobDoc.docs[0].data(),
              savedDocId: savedDocs[jobId] // Store the saved job document ID
            });
          }
        } catch (error) {
          console.error(`Error fetching job ${jobId}:`, error);
        }
      }
      setSavedJobs(jobsData);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsSnap = await getDocs(query(collection(db, 'applications'), where('userId', '==', user.uid)));
      const applicationsData = applicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        location: editForm.location,
        bio: editForm.bio,
        updatedAt: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile has been updated successfully!',
        confirmButtonColor: '#a78bfa',
      });

      setIsEditing(false);
      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update profile. Please try again.',
        confirmButtonColor: '#a78bfa',
      });
    }
  };

  const handleRemoveSavedJob = async (jobId, savedDocId) => {
    try {
      if (savedDocId) {
        await deleteDoc(doc(db, 'savedJobs', savedDocId));
      } else {
        // Fallback: find and delete by query
        const savedSnap = await getDocs(query(collection(db, 'savedJobs'), where('userId', '==', user.uid), where('jobId', '==', jobId)));
        if (!savedSnap.empty) {
          await deleteDoc(doc(db, 'savedJobs', savedSnap.docs[0].id));
        }
      }
      
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      Swal.fire({
        icon: 'success',
        title: 'Job Removed',
        text: 'Job removed from saved jobs',
        confirmButtonColor: '#a78bfa',
      });
    } catch (error) {
      console.error("Error removing saved job:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to remove job',
        confirmButtonColor: '#a78bfa',
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl font-bold">Please log in to view your profile.</div>
      </div>
    );
  }

  if (role === 'Employer' || role === 'Admin') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl font-bold">This profile page is for job seekers only.</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your personal information and job preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className={`mb-8 p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {editForm.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {editForm.firstName && editForm.lastName ? `${editForm.firstName} ${editForm.lastName}` : user.email?.split('@')[0]}
              </h2>
              <p className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</p>
              <p className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                {role || 'Job Seeker'}
              </p>
            </div>
            <div className="text-right">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
              }`}>
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'saved'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Saved Jobs ({savedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'applications'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Applications ({applications.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Personal Information</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className={`w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 ${
                          isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="City, State"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Role
                      </label>
                      <input
                        type="text"
                        value={role || 'Job Seeker'}
                        disabled
                        className={`w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 ${
                          isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Tell us about yourself, your skills, and what you're looking for..."
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          firstName: firstName || '',
                          lastName: lastName || '',
                          phone: '',
                          location: '',
                          bio: ''
                        });
                      }}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName || ''}
                      disabled
                      className={`w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 ${
                        isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName || ''}
                      disabled
                      className={`w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 ${
                        isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className={`w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 ${
                        isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone || 'Not provided'}
                      disabled
                      className={`w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 ${
                        isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location || 'Not provided'}
                      disabled
                      className={`w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 ${
                        isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Role
                    </label>
                    <input
                      type="text"
                      value={role || 'Job Seeker'}
                      disabled
                      className={`w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 ${
                        isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  {editForm.bio && (
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Bio
                      </label>
                      <textarea
                        value={editForm.bio}
                        disabled
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 ${
                          isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Saved Jobs</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-lg">Loading saved jobs...</div>
                </div>
              ) : savedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    No saved jobs yet
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Start browsing jobs and save the ones you're interested in
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <div
                      key={job.id}
                      className={`p-4 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{job.title}</h4>
                          <p className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {job.companyName}
                          </p>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            📍 {job.location} • 💰 {job.salary}
                          </p>
                          <p className={`line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {job.description}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => handleRemoveSavedJob(job.id, job.savedDocId)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Remove
                          </button>
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                            View Job
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Job Applications</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-lg">Loading applications...</div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <div className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    No applications yet
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Start applying for jobs to see your applications here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className={`p-4 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{application.jobTitle}</h4>
                          <p className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {application.companyName}
                          </p>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Applied on: {application.appliedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                          </p>
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'approved' ? 'bg-green-100 text-green-800' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 
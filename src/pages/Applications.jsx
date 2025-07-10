import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

const db = getFirestore();

const Applications = ({ isDark }) => {
  const { user, role } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'interview', 'exam', 'message'
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user && (role === 'Employer' || role === 'Admin')) {
      fetchApplications();
    }
  }, [user, role]);

  const fetchApplications = async () => {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('employerId', '==', user.uid)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applicationsData = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const openModal = (application, type) => {
    setSelectedApplication(application);
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
    setModalType('');
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalType === 'interview') {
        await addDoc(collection(db, 'interviews'), {
          applicationId: selectedApplication.id,
          jobId: selectedApplication.jobId,
          userId: selectedApplication.userId,
          employerId: user.uid,
          jobTitle: selectedApplication.jobTitle,
          companyName: selectedApplication.companyName,
          applicantName: selectedApplication.userName,
          scheduledDate: formData.date,
          scheduledTime: formData.time,
          duration: formData.duration,
          type: formData.type,
          location: formData.location,
          notes: formData.notes,
          status: 'scheduled',
          createdAt: serverTimestamp()
        });

        // Update application status
        await handleStatusUpdate(selectedApplication.id, 'interview_scheduled');
      } else if (modalType === 'exam') {
        await addDoc(collection(db, 'exams'), {
          applicationId: selectedApplication.id,
          jobId: selectedApplication.jobId,
          userId: selectedApplication.userId,
          employerId: user.uid,
          jobTitle: selectedApplication.jobTitle,
          companyName: selectedApplication.companyName,
          applicantName: selectedApplication.userName,
          examTitle: formData.title,
          examDescription: formData.description,
          duration: formData.duration,
          dueDate: formData.dueDate,
          questions: formData.questions || [],
          status: 'assigned',
          createdAt: serverTimestamp()
        });

        // Update application status
        await handleStatusUpdate(selectedApplication.id, 'exam_assigned');
      } else if (modalType === 'message') {
        await addDoc(collection(db, 'messages'), {
          applicationId: selectedApplication.id,
          jobId: selectedApplication.jobId,
          fromUserId: user.uid,
          toUserId: selectedApplication.userId,
          fromRole: role,
          toRole: 'Job Seeker',
          subject: formData.subject,
          message: formData.message,
          read: false,
          createdAt: serverTimestamp()
        });
      }

      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interview_scheduled': return 'bg-blue-100 text-blue-800';
      case 'exam_assigned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl font-bold">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Applications</h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Review and manage applications for your job postings
          </p>
        </div>

        {/* Applications List */}
        <div className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">All Applications ({applications.length})</h2>
          </div>
          
          <div className="p-6">
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No applications received yet</p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Applications will appear here once job seekers apply to your positions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className={`p-6 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{application.jobTitle}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Applied by: {application.userName || 'Unknown'}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Applied on: {application.appliedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {application.status?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Application Details */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Cover Letter:</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} bg-gray-100 dark:bg-gray-600 p-3 rounded`}>
                        {application.coverLetter || 'No cover letter provided'}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'approved')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => openModal(application, 'interview')}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => openModal(application, 'exam')}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                      >
                        Set Exam
                      </button>
                      <button
                        onClick={() => openModal(application, 'message')}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`max-w-md w-full mx-4 rounded-xl shadow-xl ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">
                  {modalType === 'interview' && 'Schedule Interview'}
                  {modalType === 'exam' && 'Set Exam'}
                  {modalType === 'message' && 'Send Message'}
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedApplication?.userName} - {selectedApplication?.jobTitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {modalType === 'interview' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        required
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        value={formData.date || ''}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <input
                        type="time"
                        required
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        value={formData.time || ''}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        required
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <select
                        required
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        value={formData.type || ''}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="">Select type</option>
                        <option value="phone">Phone</option>
                        <option value="video">Video Call</option>
                        <option value="in-person">In Person</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Location/Platform</label>
                      <input
                        type="text"
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Office address, Zoom link, etc."
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <textarea
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        rows="3"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional information for the candidate"
                      />
                    </div>
                  </>
                )}

                {modalType === 'exam' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Exam Title</label>
                      <input
                        type="text"
                        required
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        required
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        rows="3"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        required
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Due Date</label>
                      <input
                        type="datetime-local"
                        required
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        value={formData.dueDate || ''}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {modalType === 'message' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <input
                        type="text"
                        required
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        value={formData.subject || ''}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <textarea
                        required
                        className={`w-full p-2 rounded border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        rows="5"
                        value={formData.message || ''}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Write your message to the candidate..."
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    {modalType === 'interview' && 'Schedule Interview'}
                    {modalType === 'exam' && 'Assign Exam'}
                    {modalType === 'message' && 'Send Message'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications; 
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import Swal from 'sweetalert2';

const Interviews = ({ isDark }) => {
  const { user, role, firstName, lastName } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    duration: 30,
    type: 'video',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchInterviews();
      if (role === 'Employer') {
        fetchApplications();
      }
    }
  }, [user, role]);

  const fetchInterviews = async () => {
    try {
      // Check if Firebase is properly initialized
      const db = getFirestore();
      if (!db) {
        console.error('Firebase not initialized');
        return;
      }

      let interviewsQuery;
      if (role === 'Job Seeker') {
        interviewsQuery = query(collection(db, 'interviews'), where('applicantId', '==', user.uid));
      } else if (role === 'Employer') {
        interviewsQuery = query(collection(db, 'interviews'), where('employerId', '==', user.uid));
      } else {
        // If no valid role, don't fetch interviews
        setLoading(false);
        return;
      }

      const interviewsSnap = await getDocs(interviewsQuery);
      const interviewsData = interviewsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInterviews(interviewsData);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const db = getFirestore();
      if (!db) {
        console.error('Firebase not initialized');
        return;
      }

      const applicationsSnap = await getDocs(query(collection(db, 'applications'), where('employerId', '==', user.uid), where('status', '==', 'approved')));
      const applicationsData = applicationsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    
    try {
      const db = getFirestore();
      if (!db) {
        console.error('Firebase not initialized');
        return;
      }

      const interviewData = {
        applicationId: selectedApplication.id,
        applicantId: selectedApplication.userId,
        employerId: user.uid,
        jobTitle: selectedApplication.jobTitle,
        companyName: selectedApplication.companyName,
        applicantName: selectedApplication.applicantName || `${firstName} ${lastName}`,
        date: scheduleData.date,
        time: scheduleData.time,
        duration: scheduleData.duration,
        type: scheduleData.type,
        notes: scheduleData.notes,
        status: 'scheduled',
        scheduledAt: serverTimestamp()
      };

      await addDoc(collection(db, 'interviews'), interviewData);

      // Update application status
      await updateDoc(doc(db, 'applications', selectedApplication.id), {
        status: 'interview_scheduled'
      });

      Swal.fire({
        icon: 'success',
        title: 'Interview Scheduled',
        text: 'Interview has been scheduled successfully',
        confirmButtonColor: '#a78bfa',
      });

      setShowScheduleForm(false);
      setSelectedApplication(null);
      setScheduleData({
        date: '',
        time: '',
        duration: 30,
        type: 'video',
        notes: ''
      });
      
      fetchInterviews();
      fetchApplications();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to schedule interview',
        confirmButtonColor: '#a78bfa',
      });
    }
  };

  const handleInterviewAction = async (interviewId, action) => {
    try {
      const db = getFirestore();
      if (!db) {
        console.error('Firebase not initialized');
        return;
      }

      const newStatus = action === 'accept' ? 'confirmed' : action === 'decline' ? 'declined' : 'completed';
      
      await updateDoc(doc(db, 'interviews', interviewId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      Swal.fire({
        icon: 'success',
        title: 'Interview Updated',
        text: `Interview has been ${newStatus}`,
        confirmButtonColor: '#a78bfa',
      });

      fetchInterviews();
    } catch (error) {
      console.error('Error updating interview:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update interview',
        confirmButtonColor: '#a78bfa',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return '📹';
      case 'phone': return '📞';
      case 'in-person': return '👥';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl font-bold">Loading interviews...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access interviews</h2>
          <p className="text-gray-600 dark:text-gray-400">Interview management is only available for registered users</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Interview Management</h1>

        {/* Employer Actions */}
        {role === 'Employer' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Schedule Interviews</h2>
              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {showScheduleForm ? 'Cancel' : 'Schedule New Interview'}
              </button>
            </div>

            {showScheduleForm && (
              <div className={`p-6 rounded-xl shadow-lg mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <h3 className="text-xl font-semibold mb-4">Schedule Interview</h3>
                
                {/* Application Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Application</label>
                  <select
                    value={selectedApplication?.id || ''}
                    onChange={(e) => {
                      const app = applications.find(a => a.id === e.target.value);
                      setSelectedApplication(app);
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select an application...</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.jobTitle} - {app.applicantName || 'Applicant'}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedApplication && (
                  <form onSubmit={handleScheduleInterview} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <input
                          type="date"
                          value={scheduleData.date}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Time</label>
                        <input
                          type="time"
                          value={scheduleData.time}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                        <select
                          value={scheduleData.duration}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Interview Type</label>
                        <select
                          value={scheduleData.type}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="video">Video Call</option>
                          <option value="phone">Phone Call</option>
                          <option value="in-person">In-Person</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <textarea
                        value={scheduleData.notes}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        placeholder="Any additional notes or instructions..."
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Schedule Interview
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Interviews List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {role === 'Job Seeker' ? 'Your Interviews' : 'Scheduled Interviews'}
          </h2>
          
          {interviews.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border`}>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {role === 'Job Seeker' ? 'No interviews scheduled yet' : 'No interviews scheduled'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {interviews.map((interview) => (
                <div 
                  key={interview.id} 
                  className={`p-6 rounded-xl shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getTypeIcon(interview.type)}</span>
                        <h3 className="text-xl font-semibold">{interview.jobTitle}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(interview.status)}`}>
                          {interview.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {role === 'Job Seeker' ? interview.companyName : interview.applicantName}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date:</span> {interview.date}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {interview.time}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {interview.duration} minutes
                        </div>
                      </div>

                      {interview.notes && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="font-medium">Notes:</span> {interview.notes}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {role === 'Job Seeker' && interview.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInterviewAction(interview.id, 'accept')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleInterviewAction(interview.id, 'decline')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {role === 'Employer' && interview.status === 'confirmed' && (
                      <button
                        onClick={() => handleInterviewAction(interview.id, 'complete')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>

                  {/* Interview Type Details */}
                  <div className={`mt-4 p-3 rounded-lg ${
                    interview.type === 'video' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    interview.type === 'phone' ? 'bg-green-50 dark:bg-green-900/20' :
                    'bg-purple-50 dark:bg-purple-900/20'
                  }`}>
                    <div className="font-medium mb-1">
                      {interview.type === 'video' ? 'Video Call Details' :
                       interview.type === 'phone' ? 'Phone Call Details' :
                       'In-Person Details'}
                    </div>
                    <div className="text-sm">
                      {interview.type === 'video' && 'A video call link will be sent to your email before the interview.'}
                      {interview.type === 'phone' && 'We will call you at the scheduled time.'}
                      {interview.type === 'in-person' && 'Please arrive 10 minutes before the scheduled time.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interviews; 
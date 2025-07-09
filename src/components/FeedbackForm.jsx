import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

const FeedbackForm = ({ isDark }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        message,
        email: user?.email || '',
        user: user?.displayName || '',
        date: serverTimestamp(),
      });
      setMessage('');
      setStatus('Thank you for your feedback!');
    } catch (err) {
      setStatus('Failed to send feedback. Please try again.');
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`max-w-lg mx-auto p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-900' : 'bg-white'}`}
    >
      <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Send us your Feedback</h2>
      <textarea
        className={`w-full p-3 rounded border ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`}
        rows={4}
        placeholder="Your feedback..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading || !message.trim()}
        className={`mt-4 px-6 py-2 rounded font-semibold ${isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'} transition`}
      >
        {loading ? 'Sending...' : 'Send Feedback'}
      </button>
      {status && <div className={`mt-3 ${status.includes('Thank') ? 'text-green-400' : 'text-red-400'}`}>{status}</div>}
    </form>
  );
};

export default FeedbackForm; 
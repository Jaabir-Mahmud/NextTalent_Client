import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import Swal from 'sweetalert2';

const db = getFirestore();

const CompanyProfile = ({ isDark }) => {
  const { user, role, firstName, lastName } = useAuth();
  const [companyData, setCompanyData] = useState({
    name: '',
    description: '',
    industry: '',
    size: '',
    founded: '',
    website: '',
    location: '',
    logo: '',
    benefits: [],
    culture: '',
    mission: '',
    vision: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: '',
    pros: '',
    cons: ''
  });

  useEffect(() => {
    if (user) {
      fetchCompanyData();
      fetchCompanyJobs();
      fetchCompanyReviews();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      const companyDoc = await getDoc(doc(db, 'companies', user.uid));
      if (companyDoc.exists()) {
        setCompanyData(companyDoc.data());
      } else if (role === 'Employer') {
        // Create default company profile for employers
        const defaultData = {
          name: `${firstName}'s Company`,
          description: '',
          industry: '',
          size: '',
          founded: new Date().getFullYear().toString(),
          website: '',
          location: '',
          logo: '',
          benefits: [],
          culture: '',
          mission: '',
          vision: ''
        };
        setCompanyData(defaultData);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    try {
      const jobsSnap = await getDocs(query(collection(db, 'jobs'), where('postedBy', '==', user.uid), where('status', '==', 'approved')));
      setCompanyJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching company jobs:', error);
    }
  };

  const fetchCompanyReviews = async () => {
    try {
      const reviewsSnap = await getDocs(query(collection(db, 'companyReviews'), where('companyId', '==', user.uid)));
      setReviews(reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching company reviews:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await setDoc(doc(db, 'companies', user.uid), {
        ...companyData,
        updatedAt: serverTimestamp()
      });

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Company profile has been updated successfully',
        confirmButtonColor: '#a78bfa',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving company profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update company profile',
        confirmButtonColor: '#a78bfa',
      });
    }
  };

  const handleAddBenefit = () => {
    setCompanyData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const handleRemoveBenefit = (index) => {
    setCompanyData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleBenefitChange = (index, value) => {
    setCompanyData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'companyReviews'), {
        companyId: user.uid,
        reviewerId: user.uid,
        reviewerName: `${firstName} ${lastName}`,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        pros: reviewData.pros,
        cons: reviewData.cons,
        createdAt: serverTimestamp()
      });

      Swal.fire({
        icon: 'success',
        title: 'Review Submitted',
        text: 'Your review has been submitted successfully',
        confirmButtonColor: '#a78bfa',
      });

      setShowReviewForm(false);
      setReviewData({
        rating: 5,
        title: '',
        comment: '',
        pros: '',
        cons: ''
      });
      
      fetchCompanyReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit review',
        confirmButtonColor: '#a78bfa',
      });
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl font-bold">Loading company profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access company profiles</h2>
          <p className="text-gray-600 dark:text-gray-400">Company profiles are only available for registered users</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Company Profile</h1>
          {role === 'Employer' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header */}
            <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <div className="flex items-center gap-4 mb-4">
                {companyData.logo ? (
                  <img src={companyData.logo} alt="Company Logo" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {companyData.name?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{companyData.name}</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {companyData.industry} • {companyData.size} • Founded {companyData.founded}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500 mr-1">{renderStars(getAverageRating())}</span>
                    <span className="text-sm">{getAverageRating()} ({reviews.length} reviews)</span>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <input
                      type="text"
                      value={companyData.name}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={companyData.description}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Industry</label>
                      <input
                        type="text"
                        value={companyData.industry}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Size</label>
                      <select
                        value={companyData.size}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, size: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Founded</label>
                      <input
                        type="text"
                        value={companyData.founded}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, founded: e.target.value }))}
                        placeholder="Year"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Website</label>
                      <input
                        type="url"
                        value={companyData.website}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <input
                        type="text"
                        value={companyData.location}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    className="w-full px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Save Profile
                  </button>
                </div>
              ) : (
                <div>
                  <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {companyData.description || 'No description available.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {companyData.website && (
                      <a
                        href={companyData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        🌐 Website
                      </a>
                    )}
                    {companyData.location && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        📍 {companyData.location}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mission & Vision */}
            {(companyData.mission || companyData.vision) && (
              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <h3 className="text-xl font-bold mb-4">Mission & Vision</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Mission</label>
                      <textarea
                        value={companyData.mission}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, mission: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Vision</label>
                      <textarea
                        value={companyData.vision}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, vision: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companyData.mission && (
                      <div>
                        <h4 className="font-semibold mb-2">Mission</h4>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{companyData.mission}</p>
                      </div>
                    )}
                    {companyData.vision && (
                      <div>
                        <h4 className="font-semibold mb-2">Vision</h4>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{companyData.vision}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Company Culture */}
            {companyData.culture && (
              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <h3 className="text-xl font-bold mb-4">Company Culture</h3>
                {isEditing ? (
                  <textarea
                    value={companyData.culture}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, culture: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{companyData.culture}</p>
                )}
              </div>
            )}

            {/* Benefits */}
            {companyData.benefits && companyData.benefits.length > 0 && (
              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <h3 className="text-xl font-bold mb-4">Benefits & Perks</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    {companyData.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => handleBenefitChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleRemoveBenefit(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddBenefit}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Benefit
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {companyData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Reviews</h3>
                {role === 'Job Seeker' && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Write Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <select
                        value={reviewData.rating}
                        onChange={(e) => setReviewData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={5}>5 stars - Excellent</option>
                        <option value={4}>4 stars - Very Good</option>
                        <option value={3}>3 stars - Good</option>
                        <option value={2}>2 stars - Fair</option>
                        <option value={1}>1 star - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={reviewData.title}
                        onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Comment</label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                        required
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Pros</label>
                        <textarea
                          value={reviewData.pros}
                          onChange={(e) => setReviewData(prev => ({ ...prev, pros: e.target.value }))}
                          rows={2}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cons</label>
                        <textarea
                          value={reviewData.cons}
                          onChange={(e) => setReviewData(prev => ({ ...prev, cons: e.target.value }))}
                          rows={2}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Submit Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No reviews yet. Be the first to review this company!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{review.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500">{renderStars(review.rating)}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              by {review.reviewerName}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {review.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {review.comment}
                      </p>
                      {(review.pros || review.cons) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {review.pros && (
                            <div>
                              <span className="font-medium text-green-600">Pros:</span> {review.pros}
                            </div>
                          )}
                          {review.cons && (
                            <div>
                              <span className="font-medium text-red-600">Cons:</span> {review.cons}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Jobs */}
            <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <h3 className="text-xl font-bold mb-4">Active Jobs</h3>
              {companyJobs.length === 0 ? (
                <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No active jobs
                </p>
              ) : (
                <div className="space-y-3">
                  {companyJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className="font-semibold">{job.title}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {job.location} • {job.salary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Company Stats */}
            <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <h3 className="text-xl font-bold mb-4">Company Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Active Jobs:</span>
                  <span className="font-semibold">{companyJobs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reviews:</span>
                  <span className="font-semibold">{reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Rating:</span>
                  <span className="font-semibold">{getAverageRating()}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile; 
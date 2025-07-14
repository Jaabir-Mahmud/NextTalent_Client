import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import Notifications from "./Notifications";
import Messages from "./Messages";

// Memoized NavLink Component
const NavLink = React.memo(({ to, children, special, onClick, isDark }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
        isActive
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
          : special
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          : `${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'}`
      }`}
    >
      {children}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

// Memoized Mobile NavLink Component
const MobileNavLink = React.memo(({ to, children, special, onClick, isDark }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
        isActive
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
          : special
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
          : `${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'}`
      }`}
    >
      {children}
    </Link>
  );
});

MobileNavLink.displayName = 'MobileNavLink';

// Memoized Theme Toggle Component
const ThemeToggle = React.memo(({ isDark, toggleDark }) => {
  const handleToggle = useCallback(() => {
    toggleDark();
  }, [toggleDark]);

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
      }`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

const Navbar = ({ isDark, toggleDark }) => {
  const { user, role, firstName, photoURL, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle protected route clicks
  const handleProtectedClick = useCallback((e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { from: location } });
    }
  }, [user, navigate, location]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setProfileMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const toggleProfileMenu = useCallback(() => {
    setProfileMenuOpen(prev => !prev);
  }, []);

  const handleProfileAction = useCallback((action) => {
    setProfileMenuOpen(false);
    if (action === 'dashboard') {
      navigate('/dashboard');
    } else if (action === 'profile') {
      if (role === 'Job Seeker' || role === 'JobSeeker') {
        navigate('/user-profile');
      } else {
        navigate('/company-profile');
      }
    }
  }, [navigate, role]);

  // Memoized user display name
  const userDisplayName = useMemo(() => {
    return firstName || user?.email?.split('@')[0] || 'User';
  }, [firstName, user?.email]);

  // Memoized user avatar
  const userAvatar = useMemo(() => {
    return photoURL || (userDisplayName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase();
  }, [photoURL, userDisplayName, user?.email]);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  return (
    <>
      {user && !user.emailVerified && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-3 text-center text-sm font-medium shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Please verify your email address to access all features.</span>
          </div>
        </div>
      )}
      
      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center group">
              <Link 
                to="/" 
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 dark:from-purple-400 dark:via-pink-400 dark:to-blue-300 bg-clip-text text-transparent flex items-center transition-all duration-300 hover:scale-105"
              >
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300"></div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-purple-600 dark:text-purple-400 relative z-10 group-hover:rotate-12 transition-transform duration-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                NextTalent
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLink to="/" onClick={handleProtectedClick} isDark={isDark}>Home</NavLink>
              <NavLink to="/jobs" isDark={isDark}>Find Jobs</NavLink>
              <NavLink to="/resume" onClick={handleProtectedClick} isDark={isDark}>Resume Builder</NavLink>
              <NavLink to="/exams" onClick={handleProtectedClick} isDark={isDark}>Exams</NavLink>
              <NavLink to="/interviews" onClick={handleProtectedClick} isDark={isDark}>Interviews</NavLink>
              {(role === "Employer" || role === "Admin") && (
                <NavLink to="/post-job" special onClick={handleProtectedClick} isDark={isDark}>Post Job</NavLink>
              )}
            </div>

            {/* Right Side - Auth/Profile Section */}
            <div className="hidden md:flex items-center space-x-4">
              {!loading && (
                <>
                  {!user ? (
                    <>
                      <ThemeToggle isDark={isDark} toggleDark={toggleDark} />
                      <div className="flex items-center space-x-3">
                        <Link
                          to="/signup"
                          className="px-5 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-105"
                        >
                          Sign Up
                        </Link>
                        <Link
                          to="/login"
                          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 hover:from-purple-500 hover:via-pink-400 hover:to-blue-400 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/40 hover:scale-105 group"
                        >
                          <span className="relative z-10">Login</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <ThemeToggle isDark={isDark} toggleDark={toggleDark} />
                      <Notifications isDark={isDark} />
                      <Messages isDark={isDark} />
                      <div className="flex items-center space-x-3">
                        {/* User Info */}
                        <div className="text-right">
                          <div className="font-semibold text-sm text-gray-800 dark:text-white">
                            {userDisplayName}
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400">
                            {role || 'User'}
                          </div>
                        </div>
                        
                        {/* Profile Avatar with Dropdown */}
                        <div className="relative">
                          <button
                            className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-purple-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 hover:scale-105"
                            onClick={toggleProfileMenu}
                          >
                            {photoURL ? (
                              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {userAvatar}
                              </span>
                            )}
                          </button>
                          
                          {profileMenuOpen && (
                            <div 
                              ref={profileMenuRef} 
                              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-700 transform transition-all duration-200 origin-top-right"
                            >
                              {/* Profile Header */}
                              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                                    {photoURL ? (
                                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-white font-bold text-sm">
                                        {userAvatar}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-sm text-gray-800 dark:text-white">
                                      {userDisplayName}
                                    </div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400">
                                      {role || 'User'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Menu Items */}
                              <div className="py-1">
                                {role === 'Admin' && (
                                  <button
                                    onClick={() => { setProfileMenuOpen(false); navigate('/admin'); }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3v6a1 1 0 001 1h4a1 1 0 001-1v-6h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1z" />
                                    </svg>
                                    Admin panel
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleProfileAction('dashboard')} 
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                  </svg>
                                  Dashboard
                                </button>
                                
                                <button 
                                  onClick={() => handleProfileAction('profile')} 
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {role === 'Job Seeker' || role === 'JobSeeker' ? 'My Profile' : 'Company Profile'}
                                </button>
                                
                                <button 
                                  onClick={handleLogout} 
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                  </svg>
                                  Logout
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${isDark ? 'bg-gray-900' : 'bg-white'} border-t border-gray-200 dark:border-gray-700`}>
              <MobileNavLink to="/" onClick={handleProtectedClick} isDark={isDark}>Home</MobileNavLink>
              <MobileNavLink to="/jobs" isDark={isDark}>Find Jobs</MobileNavLink>
              <MobileNavLink to="/resume" onClick={handleProtectedClick} isDark={isDark}>Resume Builder</MobileNavLink>
              <MobileNavLink to="/exams" onClick={handleProtectedClick} isDark={isDark}>Exams</MobileNavLink>
              <MobileNavLink to="/interviews" onClick={handleProtectedClick} isDark={isDark}>Interviews</MobileNavLink>
              {(role === "Employer" || role === "Admin") && (
                <MobileNavLink to="/post-job" special onClick={handleProtectedClick} isDark={isDark}>Post Job</MobileNavLink>
              )}
              
              {!user ? (
                <div className="pt-4 space-y-2">
                  <Link
                    to="/signup"
                    className={`block px-3 py-2 rounded-lg font-medium ${
                      isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <div className="pt-4 space-y-2">
                  <div className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-semibold">{userDisplayName}</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">{role || 'User'}</div>
                  </div>
                  <button
                    onClick={() => handleProfileAction('dashboard')}
                    className={`block w-full text-left px-3 py-2 rounded-lg font-medium ${
                      isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleProfileAction('profile')}
                    className={`block w-full text-left px-3 py-2 rounded-lg font-medium ${
                      isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    {role === 'Job Seeker' || role === 'JobSeeker' ? 'My Profile' : 'Company Profile'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-lg font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default React.memo(Navbar);
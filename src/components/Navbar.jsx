import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import Notifications from "./Notifications";
import Messages from "./Messages";

const Navbar = ({ isDark, toggleDark }) => {
  const { user, role, firstName, photoURL, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close profile menu on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  // Function to handle protected route clicks
  const handleProtectedClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { from: location } });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setProfileMenuOpen(false);
  };

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
              <NavLink to="/" onClick={(e) => handleProtectedClick(e)}>Home</NavLink>
              <NavLink to="/jobs" onClick={(e) => handleProtectedClick(e)}>Find Jobs</NavLink>
              <NavLink to="/resume" onClick={(e) => handleProtectedClick(e)}>Resume Builder</NavLink>
              <NavLink to="/exams" onClick={(e) => handleProtectedClick(e)}>Exams</NavLink>
              <NavLink to="/interviews" onClick={(e) => handleProtectedClick(e)}>Interviews</NavLink>
              {(role === "Employer" || role === "Admin") && (
                <NavLink to="/post-job" special onClick={(e) => handleProtectedClick(e)}>Post Job</NavLink>
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
                            {firstName || user.email?.split('@')[0]}
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400">
                            {role || 'User'}
                          </div>
                        </div>
                        
                        {/* Profile Avatar with Dropdown */}
                        <div className="relative">
                          <button
                            className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-purple-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 hover:scale-105"
                            onClick={() => setProfileMenuOpen((prev) => !prev)}
                          >
                            {photoURL ? (
                              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
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
                                        {firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-sm text-gray-800 dark:text-white">
                                      {firstName || user.email?.split('@')[0]}
                                    </div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400">
                                      {role || 'User'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Menu Items */}
                              <div className="py-1">
                                <button 
                                  onClick={() => {navigate('/dashboard'); setProfileMenuOpen(false);}} 
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                  </svg>
                                  Dashboard
                                </button>
                                
                                <button 
                                  onClick={() => {
                                    if (role === 'Job Seeker' || role === 'JobSeeker') {
                                      navigate('/user-profile');
                                    } else {
                                      navigate('/company-profile');
                                    }
                                    setProfileMenuOpen(false);
                                  }} 
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {role === 'Job Seeker' || role === 'JobSeeker' ? 'My Profile' : 'Company Profile'}
                                </button>
                                
                                {role === 'Admin' && (
                                  <button 
                                    onClick={() => {navigate('/admin'); setProfileMenuOpen(false);}} 
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Admin Panel
                                  </button>
                                )}
                                
                                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                
                                <button 
                                  onClick={handleLogout} 
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                  </svg>
                                  Sign Out
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
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle isDark={isDark} toggleDark={toggleDark} />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 p-2 rounded-xl focus:outline-none transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : 'translate-y-0'}`}></span>
                  <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 translate-y-2 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 translate-y-2' : 'translate-y-4'}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 shadow-xl rounded-lg mx-4 mt-2 py-2 transition-all duration-300">
            <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
            <MobileNavLink to="/jobs" onClick={() => setMobileMenuOpen(false)}>Find Jobs</MobileNavLink>
            <MobileNavLink to="/resume" onClick={() => setMobileMenuOpen(false)}>Resume Builder</MobileNavLink>
            <MobileNavLink to="/exams" onClick={() => setMobileMenuOpen(false)}>Exams</MobileNavLink>
            <MobileNavLink to="/interviews" onClick={() => setMobileMenuOpen(false)}>Interviews</MobileNavLink>
            {(role === "Employer" || role === "Admin") && (
              <MobileNavLink to="/post-job" special onClick={() => setMobileMenuOpen(false)}>Post Job</MobileNavLink>
            )}
            {user && (
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                      {photoURL ? (
                        <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-xs">
                          {firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-800 dark:text-white">
                        {firstName || user.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        {role || 'User'}
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => {navigate('/dashboard'); setMobileMenuOpen(false);}} className="block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-gray-700">Dashboard</button>
                <button onClick={() => {
                  if (role === 'Job Seeker' || role === 'JobSeeker') {
                    navigate('/user-profile');
                  } else {
                    navigate('/company-profile');
                  }
                  setMobileMenuOpen(false);
                }} className="block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-gray-700">
                  {role === 'Job Seeker' || role === 'JobSeeker' ? 'My Profile' : 'Company Profile'}
                </button>
                {role === 'Admin' && (
                  <button onClick={() => {navigate('/admin'); setMobileMenuOpen(false);}} className="block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-gray-700">Admin Panel</button>
                )}
                <button onClick={() => {handleLogout(); setMobileMenuOpen(false);}} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Sign Out</button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

const NavLink = ({ to, children, special, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
        special
          ? "bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:from-purple-500 hover:via-pink-400 hover:to-blue-400 shadow-lg hover:shadow-purple-500/40"
          : isActive
          ? "text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 shadow-lg"
          : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20"
      }`}
    >
      {children}
    </Link>
  );
};

const MobileNavLink = ({ to, children, special, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl ${
        special
          ? "bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white shadow-lg"
          : isActive
          ? "text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 shadow-lg"
          : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20"
      }`}
    >
      {children}
    </Link>
  );
};

const ThemeToggle = ({ isDark, toggleDark }) => {
  return (
    <button
      onClick={toggleDark}
      className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        {isDark ? (
          <svg className="w-5 h-5 transform rotate-0 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 transform rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </div>
    </button>
  );
};

export default Navbar;
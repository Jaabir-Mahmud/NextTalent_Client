import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const Navbar = () => {
  const { user, role, firstName, lastName, photoURL, loading } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle protected route clicks
  const handleProtectedClick = (e, path) => {
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { from: location } });
    }
  };

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  }, []);

  const enableDarkMode = () => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    setIsDark(true);
  };

  const disableDarkMode = () => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    setIsDark(false);
  };

  const toggleDarkMode = () => {
    if (isDark) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      {user && !user.emailVerified && (
        <div className="bg-yellow-100 text-yellow-800 p-3 text-center text-sm font-medium">
          Please verify your email address to access all features.
        </div>
      )}
      <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent flex items-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 mr-2 text-purple-600 dark:text-purple-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                NextTalent
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/" onClick={(e) => handleProtectedClick(e, "/")}>Home</NavLink>
              <NavLink to="/jobs" onClick={(e) => handleProtectedClick(e, "/jobs")}>Find Jobs</NavLink>
              <NavLink to="/mentors" onClick={(e) => handleProtectedClick(e, "/mentors")}>Mentors</NavLink>
              <NavLink to="/resume" onClick={(e) => handleProtectedClick(e, "/resume")}>Resume Builder</NavLink>
              <NavLink to="/articles" onClick={(e) => handleProtectedClick(e, "/articles")}>Career Tips</NavLink>
              {(role === "Employer" || role === "Admin") && (
                <NavLink to="/post-job" special onClick={(e) => handleProtectedClick(e, "/post-job")}>Start Hiring</NavLink>
              )}
              {role === "Admin" && (
                <NavLink to="/admin" onClick={(e) => handleProtectedClick(e, "/admin")}>Admin Panel</NavLink>
              )}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle isDark={isDark} toggleDark={toggleDarkMode} />
              
              {!loading && (
                <>
                  {!user ? (
                    <>
                      <Link
                        to="/signup"
                        className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200"
                      >
                        Sign Up
                      </Link>
                      <Link
                        to="/login"
                        className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-teal-500/30 hover:scale-[1.02]"
                      >
                        Login
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-gray-800 dark:text-white font-medium text-sm truncate max-w-xs">
                            {firstName || user.email}
                          </div>
                          <div className="text-purple-600 dark:text-purple-400 text-xs">
                            {role}
                          </div>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                          {photoURL ? (
                            <img 
                              src={photoURL} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="ml-2 px-4 py-2 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <ThemeToggle isDark={isDark} toggleDark={toggleDarkMode} />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="ml-4 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 p-2 rounded-lg focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 shadow-xl rounded-lg mx-4 mt-2 py-2 transition-all duration-300">
            <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
            <MobileNavLink to="/jobs" onClick={() => setMobileMenuOpen(false)}>Find Jobs</MobileNavLink>
            <MobileNavLink to="/mentors" onClick={() => setMobileMenuOpen(false)}>Mentors</MobileNavLink>
            <MobileNavLink to="/resume" onClick={() => setMobileMenuOpen(false)}>Resume Builder</MobileNavLink>
            <MobileNavLink to="/articles" onClick={() => setMobileMenuOpen(false)}>Career Tips</MobileNavLink>
            {(role === "Employer" || role === "Admin") && (
              <MobileNavLink to="/dashboard" special onClick={() => setMobileMenuOpen(false)}>Start Hiring</MobileNavLink>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-4">
              {!user ? (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/signup"
                    className="w-full text-center px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="w-full text-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                      {photoURL ? (
                        <img 
                          src={photoURL} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-gray-800 dark:text-white font-medium text-sm">
                        {firstName || user.email}
                      </div>
                      <div className="text-purple-600 dark:text-purple-400 text-xs">
                        {role}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
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

// Custom NavLink component for desktop
const NavLink = ({ to, children, special }) => {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative group
        ${special 
          ? "text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg hover:shadow-emerald-500/30"
          : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
    >
      {children}
      {!special && (
        <span className="absolute bottom-1 left-1/2 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 group-hover:w-4/5 group-hover:left-1/10 transition-all duration-300"></span>
      )}
    </Link>
  );
};

// Custom NavLink component for mobile
const MobileNavLink = ({ to, children, special, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-3 text-sm font-medium transition-colors duration-200
        ${special 
          ? "text-white bg-gradient-to-r from-emerald-600 to-teal-600"
          : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
    >
      {children}
    </Link>
  );
};

// Theme Toggle Component
const ThemeToggle = ({ isDark, toggleDark }) => {
  return (
    <button
      onClick={toggleDark}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M12 7a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      )}
    </button>
  );
};

export default Navbar;
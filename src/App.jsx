import React, { Suspense, lazy, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { SocketProvider } from './SocketContext';
import './App.css';
import { getTheme } from './theme';
import { ThemeProvider } from '@mui/material/styles';

// Lazy load components for better performance
const Navbar = lazy(() => import('./components/Navbar'));
const Home = lazy(() => import('./pages/Home'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Mentors = lazy(() => import('./pages/Mentors'));
const Resume = lazy(() => import('./pages/Resume'));
const Articles = lazy(() => import('./pages/Articles'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Login = lazy(() => import('./pages/Login'));
const PostJob = lazy(() => import('./pages/PostJob'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const About = lazy(() => import('./pages/About'));
const Exams = lazy(() => import('./pages/Exams'));
const Interviews = lazy(() => import('./pages/Interviews'));
const Applications = lazy(() => import('./pages/Applications'));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Footer = lazy(() => import('./components/Footer'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

// Memoized AppRoutes component
const AppRoutes = React.memo(({ isDark, toggleDark }) => {
  const { loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';
  
  // Memoized theme
  const theme = useMemo(() => getTheme(isDark), [isDark]);
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Suspense fallback={<LoadingSpinner />}>
        {!isAdminRoute && <Navbar isDark={isDark} toggleDark={toggleDark} />}
        <div style={{ padding: isAdminRoute ? '0' : '1rem' }}>
          <Routes>
            <Route path="/" element={<Home isDark={isDark} />} />
            <Route path="/jobs" element={<Jobs isDark={isDark} />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/resume" element={<Resume isDark={isDark} />} />
            <Route path="/articles" element={<Articles isDark={isDark} />} />
            <Route path="/dashboard" element={<Dashboard isDark={isDark} />} />
            <Route path="/admin" element={<AdminDashboard isDark={isDark} toggleDark={toggleDark} />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About isDark={isDark} />} />
            <Route path="/exams" element={<Exams isDark={isDark} />} />
            <Route path="/interviews" element={<Interviews isDark={isDark} />} />
            <Route path="/applications" element={<Applications isDark={isDark} />} />
            <Route path="/company-profile" element={<CompanyProfile isDark={isDark} />} />
            <Route path="/user-profile" element={<UserProfile isDark={isDark} />} />
          </Routes>
        </div>
        {!isAdminRoute && <Footer isDark={isDark} />}
      </Suspense>
    </ThemeProvider>
  );
});

AppRoutes.displayName = 'AppRoutes';

// Memoized App component
const App = React.memo(() => {
  const [isDark, setIsDark] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  });

  // Memoized theme toggle function
  const toggleDark = React.useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes isDark={isDark} toggleDark={toggleDark} />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
});

App.displayName = 'App';

export default App;

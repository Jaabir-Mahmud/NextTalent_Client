import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Mentors from './pages/Mentors';
import Resume from './pages/Resume';
import Articles from './pages/Articles';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import PostJob from './pages/PostJob';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Exams from './pages/Exams';
import Interviews from './pages/Interviews';
import CompanyProfile from './pages/CompanyProfile';
import UserProfile from './pages/UserProfile';
import { AuthProvider, useAuth } from './AuthContext';
import './App.css';
import { getTheme } from './theme';
import { ThemeProvider } from '@mui/material/styles';
import Footer from './components/Footer';

function AppRoutes({ isDark, toggleDark }) {
  const { loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading...</div>;
  return (
    <>
      <Navbar isDark={isDark} toggleDark={toggleDark} />
      <div style={{ padding: '1rem' }}>
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
          <Route path="/company-profile" element={<CompanyProfile isDark={isDark} />} />
          <Route path="/user-profile" element={<UserProfile isDark={isDark} />} />
        </Routes>
      </div>
      <Footer isDark={isDark} />
    </>
  );
}

function App() {
  const [isDark, setIsDark] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark((prev) => !prev);

  return (
    <AuthProvider>
      <ThemeProvider theme={getTheme(isDark)}>
        <Router>
          <AppRoutes isDark={isDark} toggleDark={toggleDark} />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

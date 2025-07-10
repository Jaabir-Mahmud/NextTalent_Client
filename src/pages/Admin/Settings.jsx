import React, { useState, useEffect } from "react";
import { User, Mail, Palette, Save, Settings as SettingsIcon, Check, Calendar, Shield, Key, Lock, RefreshCw, Bell } from "lucide-react";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { getAuth, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateProfile } from "firebase/auth";
import { useAuth } from "../../AuthContext";
import Swal from 'sweetalert2';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton, TextField as MuiTextField } from '@mui/material';

const db = getFirestore();
const auth = getAuth();

const Settings = ({ isDark = false, toggleDark }) => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [settings, setSettings] = useState({ 
    displayName: '', 
    emailNotifications: 'Enabled',
    pushNotifications: 'Enabled',
    theme: 'system',
    sessionTimeout: 30,
    twoFactorAuth: false
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [twoFAStatusLoading, setTwoFAStatusLoading] = useState(false);

  // Fetch real user data on mount
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Set up session timeout when settings are loaded
  useEffect(() => {
    if (settings.sessionTimeout) {
      setupSessionTimeout(settings.sessionTimeout);
    }
    
    // Cleanup on unmount
    return () => {
      if (window.sessionTimeoutCleanup) {
        window.sessionTimeoutCleanup();
      }
    };
  }, [settings.sessionTimeout]);

  const fetchAdminData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setAdminData(userData);
        setSettings({
          displayName: userData.name || '',
          emailNotifications: userData.emailNotifications || 'Enabled',
          pushNotifications: userData.pushNotifications || 'Enabled',
          theme: userData.theme || 'system',
          sessionTimeout: userData.sessionTimeout || 30,
          twoFactorAuth: userData.twoFactorAuth || false
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load admin data. Please try again.',
        confirmButtonColor: '#6366f1'
      });
    }
  };

  // Fetch admin data when user is available
  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  // Save handler: update displayName in Auth and Firestore
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    
    try {
      // Update displayName in Firebase Auth
      if (user && settings.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: settings.displayName });
      }
      
      // Get form values safely
      const form = e.target;
      const newSettings = {
        name: settings.displayName,
        emailNotifications: form.emailNotifications?.value || settings.emailNotifications,
        pushNotifications: form.pushNotifications?.value || settings.pushNotifications,
        theme: form.theme?.value || settings.theme,
        sessionTimeout: parseInt(form.sessionTimeout?.value || settings.sessionTimeout),
        twoFactorAuth: form.twoFactorAuth?.checked || settings.twoFactorAuth,
        lastUpdated: serverTimestamp()
      };
      
      // Update in Firestore
      await updateDoc(doc(db, "users", user.uid), newSettings);
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        displayName: newSettings.name,
        emailNotifications: newSettings.emailNotifications,
        pushNotifications: newSettings.pushNotifications,
        theme: newSettings.theme,
        sessionTimeout: newSettings.sessionTimeout,
        twoFactorAuth: newSettings.twoFactorAuth
      }));
      
      // Apply theme change immediately
      handleThemeChange(newSettings.theme);
      
      // Set up session timeout
      setupSessionTimeout(newSettings.sessionTimeout);
      
      // Send notification if email notifications are enabled
      if (newSettings.emailNotifications === 'Enabled') {
        await addDoc(collection(db, "notifications"), {
          userId: user.uid,
          type: "settings_updated",
          title: "Settings Updated",
          message: `Your admin settings have been updated successfully. Theme: ${newSettings.theme}, Session Timeout: ${newSettings.sessionTimeout} minutes.`,
          read: false,
          createdAt: serverTimestamp()
        });
      }
      
      setSaveSuccess(true);
      
      Swal.fire({
        icon: 'success',
        title: 'Settings Saved!',
        text: 'Your settings have been updated successfully.',
        confirmButtonColor: '#6366f1'
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save settings. Please try again.',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      await fetchAdminData();
      Swal.fire({
        icon: 'success',
        title: 'Data Refreshed!',
        text: 'Admin data has been refreshed successfully.',
        confirmButtonColor: '#6366f1',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to refresh data. Please try again.',
        confirmButtonColor: '#6366f1'
      });
    }
  };

  const handlePasswordReset = async () => {
    const result = await Swal.fire({
      title: 'Reset Password',
      text: 'This will send a password reset email to your registered email address. Continue?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, send reset email',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await sendPasswordResetEmail(auth, user.email);
        Swal.fire({
          icon: 'success',
          title: 'Reset Email Sent!',
          text: 'Check your email for password reset instructions.',
          confirmButtonColor: '#6366f1'
        });
      } catch (error) {
        console.error('Error sending password reset:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to send password reset email. Please try again.',
          confirmButtonColor: '#6366f1'
        });
      }
    }
  };

  const handleThemeChange = (newTheme) => {
    if (newTheme === 'system') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark !== isDark) {
        toggleDark();
      }
    } else if (newTheme === 'dark' && !isDark) {
      toggleDark();
    } else if (newTheme === 'light' && isDark) {
      toggleDark();
    }
  };

  const setupSessionTimeout = (timeoutMinutes) => {
    // Clear any existing timeout
    if (window.sessionTimeoutId) {
      clearTimeout(window.sessionTimeoutId);
    }
    
    // Set new timeout
    window.sessionTimeoutId = setTimeout(() => {
      Swal.fire({
        title: 'Session Expired',
        text: 'Your session has expired due to inactivity. You will be logged out.',
        icon: 'warning',
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'OK'
      }).then(() => {
        // Log out the user
        auth.signOut();
        window.location.href = '/login';
      });
    }, timeoutMinutes * 60 * 1000); // Convert minutes to milliseconds
    
    // Reset timeout on user activity
    const resetTimeout = () => {
      if (window.sessionTimeoutId) {
        clearTimeout(window.sessionTimeoutId);
        window.sessionTimeoutId = setTimeout(() => {
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired due to inactivity. You will be logged out.',
            icon: 'warning',
            confirmButtonColor: '#6366f1',
            confirmButtonText: 'OK'
          }).then(() => {
            auth.signOut();
            window.location.href = '/login';
          });
        }, timeoutMinutes * 60 * 1000);
      }
    };
    
    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });
    
    // Store the cleanup function
    window.sessionTimeoutCleanup = () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
      if (window.sessionTimeoutId) {
        clearTimeout(window.sessionTimeoutId);
      }
    };
  };

  const handlePasswordChange = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Change Password',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input id="currentPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter current password">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input id="newPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter new password">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input id="confirmPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Confirm new password">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Change Password',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
          Swal.showValidationMessage('All fields are required');
          return false;
        }
        
        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('New passwords do not match');
          return false;
        }
        
        if (newPassword.length < 6) {
          Swal.showValidationMessage('New password must be at least 6 characters');
          return false;
        }
        
        return { currentPassword, newPassword };
      }
    });

    if (formValues) {
      try {
        // Re-authenticate user with current password
        const credential = EmailAuthProvider.credential(user.email, formValues.currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Update password
        await updatePassword(auth.currentUser, formValues.newPassword);
        
        Swal.fire({
          icon: 'success',
          title: 'Password Changed!',
          text: 'Your password has been updated successfully.',
          confirmButtonColor: '#6366f1'
        });
      } catch (error) {
        console.error('Error changing password:', error);
        let errorMessage = 'Failed to change password. Please try again.';
        
        if (error.code === 'auth/wrong-password') {
          errorMessage = 'Current password is incorrect.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'New password is too weak. Please choose a stronger password.';
        } else if (error.code === 'auth/requires-recent-login') {
          errorMessage = 'Please log out and log back in before changing your password.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#6366f1'
        });
      }
    }
  };

  const handle2FAToggle = async () => {
    setTwoFAStatusLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, await Swal.fire({
        title: 'Enter Current Password',
        text: 'To enable/disable two-factor authentication, we need your current password for security.',
        icon: 'warning',
        input: 'password',
        inputPlaceholder: 'Enter your current password',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Enable 2FA',
        cancelButtonText: 'Cancel'
      }).then(result => {
        if (result.isConfirmed) {
          return result.value;
        }
        throw new Error('User cancelled 2FA toggle');
      }));

      await reauthenticateWithCredential(auth.currentUser, credential);

      const newTwoFactorAuth = !settings.twoFactorAuth;
      await updateProfile(auth.currentUser, { twoFactorAuth: newTwoFactorAuth });
      setSettings(prev => ({ ...prev, twoFactorAuth: newTwoFactorAuth }));

      Swal.fire({
        icon: 'success',
        title: newTwoFactorAuth ? 'Two-Factor Authentication Enabled!' : 'Two-Factor Authentication Disabled!',
        text: newTwoFactorAuth ? 'Two-factor authentication is now enabled for your account.' : 'Two-factor authentication is now disabled for your account.',
        confirmButtonColor: '#6366f1'
      });
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      let errorMessage = 'Failed to toggle two-factor authentication. Please try again.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log back in before changing your 2FA status.';
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setTwoFAStatusLoading(false);
    }
  };

  const containerClass = `
    min-h-screen py-4 px-2 sm:py-8 sm:px-4 lg:py-12 lg:px-6
    ${isDark 
      ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }
  `;

  const cardClass = `
    w-full max-w-xs sm:max-w-lg lg:max-w-4xl mx-auto
    ${isDark 
      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
      : 'bg-white border-gray-200'
    }
    border backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden
  `;

  return (
    <div className={containerClass}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className={`
            w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4
            bg-gradient-to-br from-purple-500 to-violet-600 rounded-full
            flex items-center justify-center shadow-lg
          `}>
            <SettingsIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
          </div>
          <h1 className={`
            text-2xl sm:text-3xl lg:text-4xl font-bold mb-2
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            Account Settings
          </h1>
          <p className={`
            text-sm sm:text-base lg:text-lg
            ${isDark ? 'text-gray-300' : 'text-gray-600'}
          `}>
            Manage your admin preferences and account configuration
          </p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm sm:text-base">Settings saved successfully!</span>
            </div>
          </div>
        )}

        {/* Admin Details Card */}
        {!adminData ? (
          <div className={`${cardClass} mb-6`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Loading admin details...
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${cardClass} mb-6`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-purple-500 mr-3" />
                  <h2 className={`text-xl sm:text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Admin Account Details
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshData}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                    ${isDark 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }
                    flex items-center gap-2
                  `}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`
                  p-4 rounded-xl border-2
                  ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}>
                  <div className="flex items-center mb-3">
                    <User className="w-5 h-5 text-purple-500 mr-2" />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Full Name</h3>
                  </div>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {adminData.name || 'Not specified'}
                  </p>
                </div>

                <div className={`
                  p-4 rounded-xl border-2
                  ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}>
                  <div className="flex items-center mb-3">
                    <Mail className="w-5 h-5 text-purple-500 mr-2" />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Email Address</h3>
                  </div>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {adminData.email || 'Not specified'}
                  </p>
                </div>

                <div className={`
                  p-4 rounded-xl border-2
                  ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}>
                  <div className="flex items-center mb-3">
                    <Calendar className="w-5 h-5 text-purple-500 mr-2" />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Created</h3>
                  </div>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {adminData.createdAt ? new Date(adminData.createdAt.toDate ? adminData.createdAt.toDate() : adminData.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>

                <div className={`
                  p-4 rounded-xl border-2
                  ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}>
                  <div className="flex items-center mb-3">
                    <Key className="w-5 h-5 text-purple-500 mr-2" />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Last Updated</h3>
                  </div>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {adminData.lastUpdated ? new Date(adminData.lastUpdated.toDate ? adminData.lastUpdated.toDate() : adminData.lastUpdated).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Card */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
  <form onSubmit={handleSave}>
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <User className="w-7 h-7 text-indigo-500 mr-3" />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Account Settings
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Profile Section */}
        <section className="space-y-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-indigo-50'}`}>
              <User className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className={`ml-3 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Profile Information
            </h3>
          </div>
          
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Display Name
                </label>
                                 <input
                   name="displayName"
                   type="text"
                   value={settings.displayName}
                   onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                   className={`w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 focus:border-indigo-500 text-white' : 'bg-white border-gray-300 focus:border-indigo-400'} focus:ring-2 ${isDark ? 'focus:ring-indigo-700' : 'focus:ring-indigo-200'} transition-colors`}
                   placeholder="Enter your display name"
                 />
                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This name will be visible across the platform
                </p>
              </div>
              
                             <div>
                 <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                   Email Address
                 </label>
                 <div className={`px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                   {user?.email || 'Not available'}
                 </div>
                 <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                   Contact support to change your email
                 </p>
               </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="space-y-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-indigo-50'}`}>
              <Bell className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className={`ml-3 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Notifications
            </h3>
          </div>
          
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Notifications
                </label>
                <select
                  name="emailNotifications"
                  defaultValue={settings.emailNotifications}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 focus:border-indigo-500 text-white' : 'bg-white border-gray-300 focus:border-indigo-400'} focus:ring-2 ${isDark ? 'focus:ring-indigo-700' : 'focus:ring-indigo-200'} transition-colors`}
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Receive important system notifications
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Push Notifications
                </label>
                <select
                  name="pushNotifications"
                  defaultValue={settings.pushNotifications}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 focus:border-indigo-500 text-white' : 'bg-white border-gray-300 focus:border-indigo-400'} focus:ring-2 ${isDark ? 'focus:ring-indigo-700' : 'focus:ring-indigo-200'} transition-colors`}
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Get real-time updates on your device
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-indigo-50'}`}>
              <Shield className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className={`ml-3 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Security
            </h3>
          </div>
          
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2FA */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'} shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Two-Factor Authentication
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="twoFactorAuth"
                      checked={settings.twoFactorAuth}
                      onChange={handle2FAToggle}
                      disabled={twoFAStatusLoading}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${isDark ? 'bg-gray-600 peer-checked:bg-indigo-600' : 'bg-gray-300 peer-checked:bg-indigo-600'}`}></div>
                  </label>
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Extra layer of security for your account
                </p>
              </div>
              
              {/* Session Timeout */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'} shadow-sm`}>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Session Timeout
                </label>
                <select
                  name="sessionTimeout"
                  defaultValue={settings.sessionTimeout}
                  className={`w-full px-3 py-1.5 text-sm rounded-md border ${isDark ? 'bg-gray-700 border-gray-600 focus:border-indigo-500 text-white' : 'bg-white border-gray-300 focus:border-indigo-400'} focus:ring-1 ${isDark ? 'focus:ring-indigo-700' : 'focus:ring-indigo-200'} transition-colors`}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours</option>
                </select>
                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Auto-logout after inactivity
                </p>
              </div>
              
              {/* Login History */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'} shadow-sm`}>
                <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Recent Activity
                </h4>
                <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Last login: Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                <button
                  type="button"
                  className={`text-xs font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'} transition-colors`}
                >
                  View all activity →
                </button>
              </div>
            </div>
            
            {/* Password Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handlePasswordChange}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'} shadow-sm`}
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
              <button
                type="button"
                onClick={handlePasswordReset}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isDark ? 'bg-gray-600 hover:bg-gray-700 text-white border border-gray-500' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'} shadow-sm`}
              >
                <Lock className="w-4 h-4" />
                Reset Password
              </button>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'} shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </form>
</div>

        {/* Feature Cards */}
        <div className="mt-8 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {[
            { icon: User, title: "Profile", desc: "Manage your account details" },
            { icon: Mail, title: "Notifications", desc: "Control email preferences" },
            { icon: Shield, title: "Security", desc: "Two-factor auth & password management" },
            { icon: Palette, title: "Appearance", desc: "Customize your theme" },
            { icon: Calendar, title: "Account Info", desc: "View account creation & updates" },
            { icon: RefreshCw, title: "Data Refresh", desc: "Refresh admin data in real-time" }
          ].map((feature, index) => (
            <div key={index} className={`
              p-4 sm:p-6 rounded-xl border transition-all duration-300
              ${isDark 
                ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                : 'bg-white/50 border-gray-200 hover:border-gray-300'
              }
              hover:shadow-lg
            `}>
              <feature.icon className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
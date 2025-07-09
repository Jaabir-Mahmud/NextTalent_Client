import { createTheme } from '@mui/material/styles';

export const getTheme = (isDark) =>
  createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      background: {
        default: isDark ? '#18181b' : '#f3f4f6',
        paper: isDark ? '#23232a' : '#fff',
      },
      text: {
        primary: isDark ? '#f3f4f6' : '#18181b',
      },
      primary: {
        main: isDark ? '#6366f1' : '#6366f1',
      },
      secondary: {
        main: isDark ? '#a78bfa' : '#a78bfa',
      },
      warning: {
        main: isDark ? '#f59e42' : '#f59e42',
      },
      success: {
        main: isDark ? '#10b981' : '#10b981',
      },
    },
  }); 
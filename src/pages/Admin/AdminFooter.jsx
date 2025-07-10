import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const AdminFooter = ({ isDark }) => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: 'auto',
        bgcolor: isDark ? '#18181b' : '#f8fafc',
        borderTop: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}
    >
      <Container maxWidth="xl">
        <Typography 
          variant="body2" 
          color={isDark ? 'text.secondary' : 'text.secondary'}
          sx={{ fontSize: '0.75rem' }}
        >
          © 2025 NextTalent Admin Panel. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default AdminFooter; 
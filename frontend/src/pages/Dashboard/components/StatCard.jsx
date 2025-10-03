import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon, color = 'text.secondary' }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', height: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" color={color} sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
      {icon && (
        <Box sx={{ color: color, opacity: 0.8 }}>
          {React.cloneElement(icon, { sx: { fontSize: 48 } })}
        </Box>
      )}
    </Paper>
  );
};

export default StatCard;
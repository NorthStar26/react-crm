import React from 'react';
import { Box, Typography } from '@mui/material';

interface StatusLabelProps {
  status: string;
}

const StatusLabel: React.FC<StatusLabelProps> = ({ status }) => {
  // Convert status to lowercase for case-insensitive comparison
  const normalizedStatus = status?.toLowerCase() || '';
  
  let bgColor = '#1976d2'; // default blue
  let textColor = '#fff';
  let displayText = status || 'New';
  
  // Format the display text to be capitalized
  displayText = displayText.charAt(0).toUpperCase() + displayText.slice(1).toLowerCase();
  
  // Set colors based on status
  switch(normalizedStatus) {
    case 'new':
      bgColor = '#339af0'; // blue
      displayText = 'NEW';
      break;
    case 'qualified':
      bgColor = '#51cf66'; // green
      displayText = 'Qualified';
      break;
    case 'disqualified':
      bgColor = '#FA5252'; // red
      displayText = 'Disqualified';
      break;
    case 'recycled':
      bgColor = '#ffa94d'; // orange
      displayText = 'Recycled';
      break;
    default:
      // Keep default blue
      break;
  }
  
  return (
    <Box 
      sx={{
        backgroundColor: bgColor,
        color: textColor,width:"120px",
        height: '30px',
        borderRadius: '30px',
        px: 2,
        py: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '100px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      <Typography 
        variant="body1" 
        sx={{ 
            fontWeight: 'medium',
          textAlign: 'center',
          width: '100%',
          fontSize: '1.1rem'
        }}
      >
        {displayText}
      </Typography>
    </Box>
  );
};

export default StatusLabel;

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function SitemarkIcon() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
      <Typography
        variant="h6"
        component="span"
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(45deg, #4876EF, #00D3AB)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.5rem',
        }}
      >
        ESG VerifAi
      </Typography>
    </Box>
  );
}

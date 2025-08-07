import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';

const items = [
  {
    icon: <VerifiedUserRoundedIcon />,
    title: 'Unbiased & Trustworthy',
    description:
      'Built by a university, this tool provides credible ESG verification backed by peer-reviewed research—free from vendor or investor influence. ',
  },
  {
    icon: <ScienceRoundedIcon />,
    title: 'Research-Backed Intelligence',
    description:
      'Developed on the strength of ongoing ESG and AI research, delivering insights aligned with global reporting standards and emerging ESG risks.',
  },
  {
    icon: <SecurityRoundedIcon />,
    title: 'Tested & Validated',
    description:
      'Extensively tested across diverse scenarios—so you can rely on the results for ESG assurance, compliance, and disclosure accuracy. ',
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Adaptable & Scalable',
    description:
      'From small organisations to large institutions, the tool adjusts to your workflows, data sources, and regulatory requirements.',
  },
  {
    icon: <DashboardRoundedIcon />,
    title: 'Intuitive Interface',
    description:
      "Whether you're a sustainability officer, risk manager, or analyst, the interface simplifies complexity and accelerates ESG reporting tasks.",
  },
  {
    icon: <UpdateRoundedIcon />,
    title: 'Long-Term Support & Evolution',
    description:
      "With continuous updates, responsive expert support, and alignment with changing standards (ISSB, CSRD, etc.), you're always future-ready.",
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'grey.900',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Why Choose ESGVerifAi?
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Discover the key advantages that make ESGVerifAi the trusted choice for ESG verification and compliance.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  borderColor: 'hsla(220, 25%, 25%, 0.3)',
                  backgroundColor: 'grey.800',
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

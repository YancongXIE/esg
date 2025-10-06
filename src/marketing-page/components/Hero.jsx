import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { styled } from '@mui/material/styles';

const StyledBox = styled('div')(({ theme }) => ({
  alignSelf: 'center',
  width: '90%',
  height: 200,
  marginTop: theme.spacing(3),
  borderRadius: (theme.vars || theme).shape.borderRadius,
  boxShadow: '0 0 8px 4px hsla(220, 25%, 80%, 0.2)',
  backgroundColor: theme.palette.grey[100],
  minHeight: 200,
  display: 'block',
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    width: '100%',
    height: 350,
    marginTop: theme.spacing(4),
    minHeight: 350,
    boxShadow: '0 0 10px 6px hsla(220, 25%, 80%, 0.2)',
  },
  [theme.breakpoints.up('md')]: {
    width: '120%',
    height: 500,
    marginTop: theme.spacing(6),
    minHeight: 500,
    boxShadow: '0 0 12px 8px hsla(220, 25%, 80%, 0.2)',
  },
  [theme.breakpoints.up('lg')]: {
    width: '140%',
    height: 700,
    marginTop: theme.spacing(8),
    minHeight: 700,
  },
  ...theme.applyStyles('dark', {
    boxShadow: '0 0 16px 8px hsla(210, 100%, 25%, 0.2)',
    backgroundColor: theme.palette.grey[800],
    [theme.breakpoints.up('sm')]: {
      boxShadow: '0 0 20px 10px hsla(210, 100%, 25%, 0.2)',
    },
    [theme.breakpoints.up('md')]: {
      boxShadow: '0 0 24px 12px hsla(210, 100%, 25%, 0.2)',
    },
  }),
}));

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)',
        ...theme.applyStyles('dark', {
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)',
        }),
      })}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'center', width: { xs: '100%', sm: '70%' } }}
        >
          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: { xs: 'clamp(2rem, 8vw, 2.5rem)', sm: 'clamp(2.5rem, 6vw, 3.5rem)' },
              lineHeight: 1.2,
              textAlign: 'center',
            }}
          >
            Trusted&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={(theme) => ({
                fontSize: 'inherit',
                color: 'primary.main',
                ...theme.applyStyles('dark', {
                  color: 'primary.light',
                }),
              })}
            >
              ESG&nbsp;Insights,&nbsp;
            </Typography>
            Backed&nbsp;by&nbsp;Research
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              width: { sm: '100%', md: '80%' },
            }}
          >
            Explore our AI-powered ESG dashboard, built by RMIT experts to deliver unbiased, evidence-based verification. 
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            useFlexGap
            sx={{ pt: 2, width: { xs: '100%', sm: '500px' } }}
          >
            <InputLabel htmlFor="email-hero" sx={visuallyHidden}>
              Email
            </InputLabel>
            <TextField
              id="email-hero"
              hiddenLabel
              size="small"
              variant="outlined"
              aria-label="Enter your email address"
              placeholder="Your email address"
              fullWidth
              slotProps={{
                htmlInput: {
                  autoComplete: 'off',
                  'aria-label': 'Enter your email address',
                },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ minWidth: 'fit-content' }}
            >
              Start your ESG journey with confidence.
            </Button>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            By clicking &quot;Start now&quot; you agree to our&nbsp;
            <Link href="#" color="primary">
              Terms & Conditions
            </Link>
            .
          </Typography>
        </Stack>
        <StyledBox id="image">
          <Box
            sx={{
              width: '100%',
              height: '100%',
              backgroundImage: `url('Dashboard screenshot.png')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: 'inherit',
            }}
          />
        </StyledBox>
      </Container>
    </Box>
  );
}

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MuiChip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import EdgesensorHighRoundedIcon from '@mui/icons-material/EdgesensorHighRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';

const items = [
  {
    icon: <ViewQuiltRoundedIcon />,
    title: 'Dashboard',
    description:
      'This item could provide a snapshot of the most important metrics or data points related to the product.',
    imageLight: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/dash-light.png")`,
    imageDark: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/dash-dark.png")`,
  },
  {
    icon: <EdgesensorHighRoundedIcon />,
    title: 'Mobile integration',
    description:
      'This item could provide information about the mobile app version of the product.',
    imageLight: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/mobile-light.png")`,
    imageDark: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/mobile-dark.png")`,
  },
  {
    icon: <DevicesRoundedIcon />,
    title: 'Available on all platforms',
    description:
      'This item could let users know the product is available on all platforms, such as web, mobile, and desktop.',
    imageLight: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/devices-light.png")`,
    imageDark: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/devices-dark.png")`,
  },
];

interface ChipProps {
  selected?: boolean;
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
  variants: [
    {
      props: ({ selected }) => !!selected,
      style: {
        background:
          'linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))',
        color: 'hsl(0, 0%, 100%)',
        borderColor: (theme.vars || theme).palette.primary.light,
        '& .MuiChip-label': {
          color: 'hsl(0, 0%, 100%)',
        },
        ...theme.applyStyles('dark', {
          borderColor: (theme.vars || theme).palette.primary.dark,
        }),
      },
    },
  ],
}));

interface MobileLayoutProps {
  selectedItemIndex: number;
  handleItemClick: (index: number) => void;
  selectedFeature: (typeof items)[0];
}

export function MobileLayout({
  selectedItemIndex,
  handleItemClick,
  selectedFeature,
}: MobileLayoutProps) {
  if (!items[selectedItemIndex]) {
    return null;
  }

  return (
    <Box
      sx={{
        display: { xs: 'flex', sm: 'none' },
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, overflow: 'auto' }}>
        {items.map(({ title }, index) => (
          <Chip
            size="medium"
            key={index}
            label={title}
            onClick={() => handleItemClick(index)}
            selected={selectedItemIndex === index}
          />
        ))}
      </Box>
      <Card variant="outlined">
        <Box
          sx={(theme) => ({
            mb: 2,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 280,
            backgroundImage: 'var(--items-imageLight)',
            ...theme.applyStyles('dark', {
              backgroundImage: 'var(--items-imageDark)',
            }),
          })}
          style={
            items[selectedItemIndex]
              ? ({
                  '--items-imageLight': items[selectedItemIndex].imageLight,
                  '--items-imageDark': items[selectedItemIndex].imageDark,
                } as any)
              : {}
          }
        />
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 'medium' }}
          >
            {selectedFeature.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {selectedFeature.description}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

export default function Features() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : '#1a1a1a',
        py: { xs: 8, sm: 16 },
      })}
    >
      <Container id="features">
        <Box sx={{ width: { sm: '100%', md: '100%' } }}>
          <Typography
            component="h2"
            variant="h4"
            gutterBottom
            sx={{ color: 'text.primary' }}
          >
            ESGVerifAi: AI-Powered ESG Verification for Trusted, Actionable Insights
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
          >
            Simplify ESG reporting, ensure compliance, and accelerate sustainability progress—powered by AI.
          </Typography>
          <Box sx={{ mb: { xs: 2, sm: 4 } }}>
            <Typography variant="h6" sx={{ color: 'text.primary', mb: 2 }}>
              Key Features:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                <strong>AI-Driven Verification</strong> – Enhance credibility and accuracy in ESG reporting with automated, auditable insights.
              </Typography>
              <Typography component="li" variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                <strong>Real-Time Regulatory Updates</strong> – Stay ahead of evolving ESG standards with proactive compliance monitoring.
              </Typography>
              <Typography component="li" variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                <strong>Effortless Automation</strong> – Cut manual workloads and reduce errors with seamless data integration.
              </Typography>
              <Typography component="li" variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                <strong>Explainable AI Recommendations</strong> – Make confident, data-backed decisions with transparent AI guidance.
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row-reverse' },
            gap: 2,
          }}
        >
          <div>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                gap: 2,
                height: '100%',
              }}
            >
              {items.map(({ icon, title, description }, index) => (
                <Box
                  key={index}
                  component={Button}
                  onClick={() => handleItemClick(index)}
                  sx={[
                    (theme) => ({
                      p: 2,
                      height: '100%',
                      width: '100%',
                      '&:hover': {
                        backgroundColor: (theme.vars || theme).palette.action.hover,
                      },
                    }),
                    selectedItemIndex === index && {
                      backgroundColor: 'action.selected',
                    },
                  ]}
                >
                  <Box
                    sx={[
                      {
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'left',
                        gap: 1,
                        textAlign: 'left',
                        textTransform: 'none',
                        color: 'text.secondary',
                      },
                      selectedItemIndex === index && {
                        color: 'text.primary',
                      },
                    ]}
                  >
                    {icon}

                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="body2">{description}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <MobileLayout
              selectedItemIndex={selectedItemIndex}
              handleItemClick={handleItemClick}
              selectedFeature={selectedFeature}
            />
          </div>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              width: { xs: '100%', md: '70%' },
              height: 'var(--items-image-height)',
            }}
          >
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                width: '100%',
                display: { xs: 'none', sm: 'flex' },
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={(theme) => ({
                  m: 'auto',
                  width: 420,
                  height: 500,
                  backgroundSize: 'contain',
                  backgroundImage: 'var(--items-imageLight)',
                  ...theme.applyStyles('dark', {
                    backgroundImage: 'var(--items-imageDark)',
                  }),
                })}
                style={
                  items[selectedItemIndex]
                    ? ({
                        '--items-imageLight': items[selectedItemIndex].imageLight,
                        '--items-imageDark': items[selectedItemIndex].imageDark,
                      } as any)
                    : {}
                }
              />
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

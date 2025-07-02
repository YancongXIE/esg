import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CustomDatePicker from './CustomDatePicker';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import MenuButton from './MenuButton';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown.jsx';

import Search from './Search';

export default function Header() {
  const navigate = useNavigate();

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="text"
          size="small"
          startIcon={<HomeRoundedIcon />}
          onClick={() => navigate('/')}
          sx={{ color: 'text.secondary' }}
        >
          Home
        </Button>
      <NavbarBreadcrumbs />
      </Stack>
      <Stack direction="row" sx={{ gap: 1 }}>
        <Search />
        <CustomDatePicker />
        <MenuButton showBadge aria-label="Open notifications">
          <NotificationsRoundedIcon />
        </MenuButton>
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}

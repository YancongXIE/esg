import * as React from 'react';
import { useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import InputRoundedIcon from '@mui/icons-material/InputRounded';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import DetailsRoundedIcon from '@mui/icons-material/DetailsRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const mainListItems = [
  { text: 'My Dashboard', icon: <DashboardRoundedIcon />, hasSubMenu: true, path: '/dashboard' },
  { text: 'ESG Dashboard', icon: <HomeRoundedIcon />, hasSubMenu: true, path: '/ESGdashboard' },
  { text: 'Analytics', icon: <AnalyticsRoundedIcon /> },
  { text: 'Users', icon: <PeopleRoundedIcon /> },
];

const homeSubMenuItems = [
  { text: 'Input', icon: <InputRoundedIcon />, anchor: 'input' },
  { text: 'Latest AASB S2 Standard Update', icon: <UpdateRoundedIcon />, anchor: 'standard-update' },
  { text: 'Summary', icon: <AssessmentRoundedIcon />, anchor: 'summary' },
  { text: 'Details', icon: <DetailsRoundedIcon />, anchor: 'details' },
  { text: 'Materiality Matrix', icon: <GridViewRoundedIcon />, anchor: 'materiality-matrix' },
  { text: 'AI Recommendations', icon: <PsychologyRoundedIcon />, anchor: 'ai-recommendations' },
];

const myDashboardSubMenuItems = [
  { text: 'Activity & Tasks', icon: <TrendingUpRoundedIcon />, anchor: 'activity-tasks' },
  { text: 'ESG News', icon: <ArticleRoundedIcon />, anchor: 'esg-news' },
  { text: 'ESG Performance', icon: <AssessmentRoundedIcon />, anchor: 'esg-performance' },
  { text: 'Priority Actions', icon: <WarningRoundedIcon />, anchor: 'priority-actions' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon /> },
  { text: 'FAQs', icon: <HelpRoundedIcon /> },
  { text: 'About', icon: <InfoRoundedIcon />, link: 'https://rmit-aihub.org.au/' },
];

export default function MenuContent() {
  const location = useLocation();
  
  // Auto-expand submenu based on current path
  const [openHome, setOpenHome] = React.useState(location.pathname === '/ESGdashboard');
  const [openMyDashboard, setOpenMyDashboard] = React.useState(location.pathname === '/dashboard');

  // Update submenu state when location changes
  React.useEffect(() => {
    setOpenHome(location.pathname === '/ESGdashboard');
    setOpenMyDashboard(location.pathname === '/dashboard');
  }, [location.pathname]);

  const handleClick = (menuType, path) => {
    if (menuType === 'home') {
      if (path) {
        // Navigate to ESG Dashboard page
        window.location.href = path;
      } else {
        setOpenHome(!openHome);
      }
    } else if (menuType === 'myDashboard') {
      if (path) {
        // Navigate to My Dashboard page
        window.location.href = path;
      } else {
        setOpenMyDashboard(!openMyDashboard);
      }
    }
  };

  const handleSubMenuClick = (anchor) => {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMyDashboardSubMenuClick = (anchor) => {
    // Use window.location.href to avoid React context issues
    const currentPath = window.location.pathname;
    if (currentPath !== '/dashboard') {
      window.location.href = `/dashboard#${anchor}`;
    } else {
      // If already on dashboard page, just scroll to anchor
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton 
                selected={item.path === location.pathname}
                onClick={item.hasSubMenu ? () => handleClick(item.text === 'ESG Dashboard' ? 'home' : 'myDashboard', item.path) : undefined}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.hasSubMenu && (item.text === 'ESG Dashboard' ? (openHome ? <ExpandLess /> : <ExpandMore />) : (openMyDashboard ? <ExpandLess /> : <ExpandMore />))}
              </ListItemButton>
            </ListItem>
            {item.hasSubMenu && item.text === 'ESG Dashboard' && (
              <Collapse in={openHome} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense>
                  {homeSubMenuItems.map((subItem, subIndex) => (
                    <ListItem key={subIndex} disablePadding sx={{ display: 'block' }}>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => handleSubMenuClick(subItem.anchor)}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
            {item.hasSubMenu && item.text === 'My Dashboard' && (
              <Collapse in={openMyDashboard} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense>
                  {myDashboardSubMenuItems.map((subItem, subIndex) => (
                    <ListItem key={subIndex} disablePadding sx={{ display: 'block' }}>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => handleMyDashboardSubMenuClick(subItem.anchor)}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={item.link ? () => handleExternalLink(item.link) : undefined}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.link && <OpenInNewIcon sx={{ fontSize: 16, ml: 1 }} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

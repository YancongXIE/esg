import * as React from 'react';
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
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  hasSubMenu?: boolean;
}

interface SubMenuItem {
  text: string;
  icon: React.ReactElement;
  anchor: string;
}

const mainListItems: MenuItem[] = [
  { text: 'Home', icon: <HomeRoundedIcon />, hasSubMenu: true },
  { text: 'Analytics', icon: <AnalyticsRoundedIcon /> },
  { text: 'Users', icon: <PeopleRoundedIcon /> },
  { text: 'Tasks', icon: <AssignmentRoundedIcon /> },
];

const homeSubMenuItems: SubMenuItem[] = [
  { text: 'Input', icon: <InputRoundedIcon />, anchor: 'input' },
  { text: 'Latest AASB S2 Standard Update', icon: <UpdateRoundedIcon />, anchor: 'standard-update' },
  { text: 'Summary', icon: <AssessmentRoundedIcon />, anchor: 'summary' },
  { text: 'Details', icon: <DetailsRoundedIcon />, anchor: 'details' },
];

const secondaryListItems: MenuItem[] = [
  { text: 'Settings', icon: <SettingsRoundedIcon /> },
  { text: 'About', icon: <InfoRoundedIcon /> },
  { text: 'Feedback', icon: <HelpRoundedIcon /> },
];

export default function MenuContent() {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleSubMenuClick = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton 
                selected={index === 0}
                onClick={item.hasSubMenu ? handleClick : undefined}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.hasSubMenu && (open ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {item.hasSubMenu && (
              <Collapse in={open} timeout="auto" unmountOnExit>
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
          </React.Fragment>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

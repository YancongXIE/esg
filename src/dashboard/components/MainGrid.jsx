import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material/styles';
import Copyright from '../internals/components/Copyright';
import { useNewsData } from '../hooks/useNewsData';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ArticleIcon from '@mui/icons-material/Article';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ParkIcon from '@mui/icons-material/Park';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
// Enhanced icons for Recent Actions
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
// Enhanced icons for Current Tasks
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FlagIcon from '@mui/icons-material/Flag';

// Mock data for demonstration
const userActivityData = [
  { id: 1, action: 'Uploaded ESG report', time: '2 hours ago', type: 'upload' },
  { id: 2, action: 'Viewed compliance summary', time: '4 hours ago', type: 'view' },
  { id: 3, action: 'Downloaded PDF report', time: '1 day ago', type: 'download' },
  { id: 4, action: 'Updated company profile', time: '2 days ago', type: 'update' },
];

// Chart data for user activity - Material-UI format
const activityTrendData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const activityTypeData = [
  { id: 0, value: 45, label: 'Views', color: '#8884d8' },
  { id: 1, value: 25, label: 'Uploads', color: '#82ca9d' },
  { id: 2, value: 20, label: 'Downloads', color: '#ffc658' },
  { id: 3, value: 10, label: 'Updates', color: '#ff7300' },
];

const taskCompletionData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

// Area gradient component for enhanced charts
function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

// Helper function to get days in month (from existing template)
function getDaysInMonth(month, year) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

const taskReminderData = [
  { id: 1, task: 'Review Q4 ESG metrics', due: 'Due in 3 days', priority: 'high' },
  { id: 2, task: 'Update sustainability goals', due: 'Due in 1 week', priority: 'medium' },
  { id: 3, task: 'Schedule compliance audit', due: 'Due in 2 weeks', priority: 'low' },
];


const esgScores = {
  Environmental: { score: 78, status: 'good', color: '#4caf50' },
  Social: { score: 65, status: 'warning', color: '#ff9800' },
  Governance: { score: 82, status: 'good', color: '#ccc6c6' },
};

const priorityActions = [
  { id: 1, action: 'Address social compliance gaps identified in Q3 audit', priority: 'high', category: 'Social' },
  { id: 2, action: 'Update environmental impact assessment methodology', priority: 'medium', category: 'Environmental' },
  { id: 3, action: 'Review board diversity policies and implementation', priority: 'medium', category: 'Governance' },
  { id: 4, action: 'Schedule stakeholder engagement session for next quarter', priority: 'low', category: 'Social' },
];

function UserActivityCard() {
  // const theme = useTheme();
  const colorPalette = [
    '#90caf9', // primary.light
    '#1976d2', // primary.main
    '#1565c0', // primary.dark
    '#dc004e', // secondary.main
  ];

  const sparkLineData = [12, 18, 15, 22, 16, 8, 6, 14, 19, 17, 21, 13, 9, 11, 16, 20, 18, 15, 12, 14, 17, 19, 16, 13, 10, 8, 12, 15, 18, 20];

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          User Activity
        </Typography>
        
        {/* Activity Summary with SparkLine */}
        <Stack sx={{ justifyContent: 'space-between', mb: 2 }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              156
            </Typography>
            <Chip size="small" color="success" label="+12%" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Total activities this week
          </Typography>
        </Stack>

        {/* SparkLine Chart */}
        <Box sx={{ width: '100%', height: 50, mb: 2 }}>
          <SparkLineChart
            color="#1976d2"
            data={sparkLineData}
            area
            showHighlight
            showTooltip
            xAxis={{
              scaleType: 'band',
              data: getDaysInMonth(4, 2024),
            }}
            sx={{
              [`& .${areaElementClasses.root}`]: {
                fill: "url('#activity-gradient')",
              },
            }}
          >
            <AreaGradient color="#1976d2" id="activity-gradient" />
          </SparkLineChart>
        </Box>

        {/* Recent Activity List */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Recent Actions
        </Typography>
        <List dense sx={{ mb: 2 }}>
          {userActivityData.map((item) => {
            const getIconAndColor = (type) => {
              switch (type) {
                case 'upload':
                  return { 
                    icon: <CloudUploadIcon sx={{ fontSize: 18 }} />, 
                    color: '#4caf50',
                    bgColor: 'rgba(76, 175, 80, 0.1)'
                  };
                case 'view':
                  return { 
                    icon: <VisibilityIcon sx={{ fontSize: 18 }} />, 
                    color: '#2196f3',
                    bgColor: 'rgba(33, 150, 243, 0.1)'
                  };
                case 'download':
                  return { 
                    icon: <DownloadIcon sx={{ fontSize: 18 }} />, 
                    color: '#ff9800',
                    bgColor: 'rgba(255, 152, 0, 0.1)'
                  };
                case 'update':
                  return { 
                    icon: <EditIcon sx={{ fontSize: 18 }} />, 
                    color: '#9c27b0',
                    bgColor: 'rgba(156, 39, 176, 0.1)'
                  };
                default:
                  return { 
                    icon: <ArticleIcon sx={{ fontSize: 18 }} />, 
                    color: '#757575',
                    bgColor: 'rgba(117, 117, 117, 0.1)'
                  };
              }
            };

            const { icon, color, bgColor } = getIconAndColor(item.type);

            return (
              <ListItem key={item.id} sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 48, mr: 0.5 }}>
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: bgColor,
                      border: `2px solid ${color}`,
                      '& .MuiSvgIcon-root': {
                        color: color
                      }
                    }}
                  >
                    {icon}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={item.action}
                  secondary={item.time}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                  secondaryTypographyProps={{ 
                    variant: 'caption',
                    color: 'text.secondary'
                  }}
                />
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Activity Trend Chart */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Daily Activity Trend
        </Typography>
        <Box sx={{ height: 200, mb: 2 }}>
          <LineChart
            colors={colorPalette}
            xAxis={[
              {
                scaleType: 'band',
                data: activityTrendData,
                height: 24,
              },
            ]}
            yAxis={[{ width: 50 }]}
            series={[
              {
                id: 'views',
                label: 'Views',
                data: [12, 18, 15, 22, 16, 8, 6],
                showMark: false,
                curve: 'linear',
                area: true,
                stack: 'total',
                stackOrder: 'ascending',
              },
              {
                id: 'uploads',
                label: 'Uploads',
                data: [4, 6, 3, 8, 5, 2, 1],
                showMark: false,
                curve: 'linear',
                area: true,
                stack: 'total',
                stackOrder: 'ascending',
              },
              {
                id: 'downloads',
                label: 'Downloads',
                data: [2, 3, 1, 4, 2, 1, 0],
                showMark: false,
                curve: 'linear',
                area: true,
                stack: 'total',
                stackOrder: 'ascending',
              },
              {
                id: 'updates',
                label: 'Updates',
                data: [1, 2, 3, 1, 2, 0, 1],
                showMark: false,
                curve: 'linear',
                area: true,
                stack: 'total',
                stackOrder: 'ascending',
              },
            ]}
            height={200}
            margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
            grid={{ horizontal: true }}
            sx={{
              '& .MuiAreaElement-series-views': {
                fill: "url('#views')",
              },
              '& .MuiAreaElement-series-uploads': {
                fill: "url('#uploads')",
              },
              '& .MuiAreaElement-series-downloads': {
                fill: "url('#downloads')",
              },
              '& .MuiAreaElement-series-updates': {
                fill: "url('#updates')",
              },
            }}
            hideLegend
          >
            <AreaGradient color="#90caf9" id="views" />
            <AreaGradient color="#1976d2" id="uploads" />
            <AreaGradient color="#1565c0" id="downloads" />
            <AreaGradient color="#dc004e" id="updates" />
          </LineChart>
        </Box>

      </CardContent>
    </Card>
  );
}

function TaskReminderCard() {
  // const theme = useTheme();
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const colorPalette = [
    '#4caf50', // success.main - Completed
    '#ff9800', // warning.main - Pending
    '#f44336', // error.main - Overdue
  ];

  const taskSparkLineData = [12, 15, 18, 14, 20, 16, 19, 17, 22, 18, 21, 16, 14, 17, 20, 18, 15, 19, 22, 20, 18, 16, 14, 17, 19, 21, 18, 16, 14, 17];

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Task Reminders
        </Typography>
        
        {/* Task Summary with SparkLine */}
        <Stack sx={{ justifyContent: 'space-between', mb: 2 }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              3
            </Typography>
            <Chip size="small" color="warning" label="Pending" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Active tasks requiring attention
          </Typography>
        </Stack>

        {/* SparkLine Chart */}
        <Box sx={{ width: '100%', height: 50, mb: 2 }}>
          <SparkLineChart
            color="#ff9800"
            data={taskSparkLineData}
            area
            showHighlight
            showTooltip
            xAxis={{
              scaleType: 'band',
              data: getDaysInMonth(4, 2024),
            }}
            sx={{
              [`& .${areaElementClasses.root}`]: {
                fill: "url('#task-gradient')",
              },
            }}
          >
            <AreaGradient color="#ff9800" id="task-gradient" />
          </SparkLineChart>
        </Box>
        
        {/* Current Tasks List */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Current Tasks
        </Typography>
        <List dense sx={{ mb: 2 }}>
          {taskReminderData.map((task) => {
            const getTaskIconAndColor = (priority) => {
              switch (priority) {
                case 'high':
                  return { 
                    icon: <FlagIcon sx={{ fontSize: 18 }} />, 
                    color: '#f44336',
                    bgColor: 'rgba(244, 67, 54, 0.1)',
                    borderColor: '#f44336'
                  };
                case 'medium':
                  return { 
                    icon: <ScheduleIcon sx={{ fontSize: 18 }} />, 
                    color: '#ff9800',
                    bgColor: 'rgba(255, 152, 0, 0.1)',
                    borderColor: '#ff9800'
                  };
                case 'low':
                  return { 
                    icon: <AssignmentIcon sx={{ fontSize: 18 }} />, 
                    color: '#2196f3',
                    bgColor: 'rgba(33, 150, 243, 0.1)',
                    borderColor: '#2196f3'
                  };
                default:
                  return { 
                    icon: <AssessmentIcon sx={{ fontSize: 18 }} />, 
                    color: '#757575',
                    bgColor: 'rgba(117, 117, 117, 0.1)',
                    borderColor: '#757575'
                  };
              }
            };

            const { icon, color, bgColor, borderColor } = getTaskIconAndColor(task.priority);

            return (
              <ListItem key={task.id} sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 48, mr: 0.5 }}>
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: bgColor,
                      border: `2px solid ${borderColor}`,
                      '& .MuiSvgIcon-root': {
                        color: color
                      }
                    }}
                  >
                    {icon}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={task.task}
                  secondary={task.due}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                  secondaryTypographyProps={{ 
                    variant: 'caption',
                    color: 'text.secondary'
                  }}
                />
                <Chip
                  label={task.priority}
                  size="small"
                  color={getPriorityColor(task.priority)}
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem'
                  }}
                />
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Task Completion Trend Chart */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Task Completion Trend
        </Typography>
        <Box sx={{ height: 200 }}>
          <BarChart
            borderRadius={8}
            colors={colorPalette}
            xAxis={[
              {
                scaleType: 'band',
                categoryGapRatio: 0.3,
                data: taskCompletionData,
                height: 24,
              },
            ]}
            yAxis={[{ width: 50 }]}
            series={[
              {
                id: 'completed',
                label: 'Completed',
                data: [12, 15, 18, 14, 20, 16],
                stack: 'A',
              },
              {
                id: 'pending',
                label: 'Pending',
                data: [8, 6, 4, 7, 3, 5],
                stack: 'A',
              },
              {
                id: 'overdue',
                label: 'Overdue',
                data: [2, 1, 3, 2, 1, 2],
                stack: 'A',
              },
            ]}
            height={200}
            margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
            grid={{ horizontal: true, vertical: false }}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 0,
              },
            }}
            sx={{
              '& .MuiBarElement-root': {
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  transform: 'scaleY(1.05)',
                },
              },
              '& .MuiChartsLegend-root': {
                fontSize: '0.75rem',
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

function NewsCard({ title, newsData, icon, loading, error, onRefresh, lastUpdated }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Updated {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
            <Tooltip title="Refresh news">
              <IconButton 
                size="small" 
                onClick={onRefresh}
                disabled={loading}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <List dense>
            {/* Always show ASIC link for Australian ESG News */}
            {title === "Australian ESG News" && (
              <>
                <ListItem sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={
                      <Typography
                        component="a"
                        href="https://www.asic.gov.au/newsroom/media-releases/"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        fontWeight={500}
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                            color: 'primary.dark',
                          },
                        }}
                      >
                        ASIC Media Releases
                      </Typography>
                    }
                    secondary="Australian Securities and Investments Commission"
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                {newsData.length > 0 && <Divider sx={{ width: '100%', my: 1 }} />}
              </>
            )}
            
            {/* Show dynamic news data */}
            {newsData.map((news, index) => (
              <React.Fragment key={news.id}>
                <ListItem sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={
                      news.url ? (
                        <Typography
                          component="a"
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                              color: 'primary.dark',
                            },
                          }}
                        >
                          {news.title}
                        </Typography>
                      ) : (
                        <Typography variant="body2" fontWeight={500}>
                          {news.title}
                        </Typography>
                      )
                    }
                    secondary={`${news.source} • ${news.time}`}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                {index < newsData.length - 1 && <Divider sx={{ width: '100%', my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

// Individual ESG Score Cards
function EnvironmentalScoreCard() {
  const data = esgScores.Environmental;
  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'warning': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'error': return <ErrorIcon sx={{ color: '#f44336' }} />;
      default: return <TrendingFlatIcon />;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ParkIcon sx={{ color: data.color, mr: 1, fontSize: 24 }} />
          <Typography variant="h6" sx={{ color: data.color }}>
            Environmental
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h2" sx={{ color: data.color, fontWeight: 'bold', mb: 1 }}>
            {data.score}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Score out of 100
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getStatusIcon(data.status)}
          <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
            {data.status} Performance
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function SocialScoreCard() {
  const data = esgScores.Social;
  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'warning': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'error': return <ErrorIcon sx={{ color: '#f44336' }} />;
      default: return <TrendingFlatIcon />;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GroupsIcon sx={{ color: data.color, mr: 1, fontSize: 24 }} />
          <Typography variant="h6" sx={{ color: data.color }}>
            Social
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h2" sx={{ color: data.color, fontWeight: 'bold', mb: 1 }}>
            {data.score}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Score out of 100
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getStatusIcon(data.status)}
          <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
            {data.status} Performance
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function GovernanceScoreCard() {
  const data = esgScores.Governance;
  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'warning': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'error': return <ErrorIcon sx={{ color: '#f44336' }} />;
      default: return <TrendingFlatIcon />;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountBalanceIcon sx={{ color: data.color, mr: 1, fontSize: 24 }} />
          <Typography variant="h6" sx={{ color: data.color }}>
            Governance
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h2" sx={{ color: data.color, fontWeight: 'bold', mb: 1 }}>
            {data.score}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Score out of 100
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getStatusIcon(data.status)}
          <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
            {data.status} Performance
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function PriorityActionsCard() {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Priority Actions & Alerts
        </Typography>
        <List>
          {priorityActions.map((action) => (
            <React.Fragment key={action.id}>
              <Alert 
                severity={action.priority === 'high' ? 'error' : action.priority === 'medium' ? 'warning' : 'info'}
                sx={{ mb: 1 }}
              >
                <AlertTitle sx={{ fontSize: '0.875rem' }}>
                  {action.category} - {action.priority.toUpperCase()} Priority
                </AlertTitle>
                {action.action}
              </Alert>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default function MainGrid() {
  const { globalNews, australianNews, loading, error, lastUpdated, refreshNews } = useNewsData();

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* First Row: User Activity, Task Reminder */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }} id="activity-tasks">
        Activity & Tasks
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <UserActivityCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TaskReminderCard />
        </Grid>
      </Grid>

      {/* Second Row: Global ESG News, Australian ESG News */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }} id="esg-news">
        ESG News
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <NewsCard
            title="Global ESG News"
            newsData={globalNews}
            icon={<PublicIcon color="primary" />}
            loading={loading}
            error={error}
            onRefresh={refreshNews}
            lastUpdated={lastUpdated}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <NewsCard
            title="Australian ESG News"
            newsData={australianNews}
            icon={<LocationOnIcon color="primary" />}
            loading={loading}
            error={error}
            onRefresh={refreshNews}
            lastUpdated={lastUpdated}
          />
        </Grid>
      </Grid>

               {/* Third Row: ESG Performance - Three Individual Cards */}
               <Typography component="h2" variant="h6" sx={{ mb: 2 }} id="esg-performance">
                 ESG Performance
               </Typography>
               <Grid
                 container
                 spacing={2}
                 columns={12}
                 sx={{ mb: (theme) => theme.spacing(2) }}
               >
                 <Grid size={{ xs: 12, md: 4 }}>
                   <EnvironmentalScoreCard />
                 </Grid>
                 <Grid size={{ xs: 12, md: 4 }}>
                   <SocialScoreCard />
                 </Grid>
                 <Grid size={{ xs: 12, md: 4 }}>
                   <GovernanceScoreCard />
                 </Grid>
               </Grid>

      {/* Fourth Row: Priority Actions & Alerts */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }} id="priority-actions">
        Priority Actions & Alerts
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
      >
        <Grid size={{ xs: 12 }}>
          <PriorityActionsCard />
        </Grid>
      </Grid>

      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}

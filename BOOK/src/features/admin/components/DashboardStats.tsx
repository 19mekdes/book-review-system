import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  useTheme,
  Avatar,
  Tooltip,
  Fade
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Book as BookIcon,
  People as PeopleIcon,
  RateReview as ReviewIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer} from 'recharts';
import { format, subDays } from 'date-fns';

// Types
export interface DashboardStatsProps {
  timeframe?: 'day' | 'week' | 'month' | 'year';
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
  className?: string;
}

export interface StatCardData {
  id: string;
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  trendLabel?: string;
  secondaryValue?: string;
  progress?: number;
}

// Chart data types
interface ChartDataPoint {
  date: string;
  users: number;
  books: number;
  reviews: number;
}

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

interface RatingDataPoint {
  name: string;
  value: number;
  color: string;
}

// Stats data type
interface StatsData {
  stats: {
    users: {
      total: number;
      trend: number;
      active: number;
      new: number;
      byRole: {
        admin: number;
        moderator: number;
        user: number;
      };
    };
    books: {
      total: number;
      trend: number;
      newThisMonth: number;
      popular: number;
      byCategory: Record<string, number>;
    };
    reviews: {
      total: number;
      trend: number;
      averageRating: number;
      pending: number;
      flagged: number;
      byRating: Record<string, number>;
    };
    categories: {
      total: number;
      trend: number;
      mostUsed: string;
      leastUsed: string;
    };
  };
  chartData: ChartDataPoint[];
  pieData: PieDataPoint[];
  ratingData: RatingDataPoint[];
}

// Sample data - replace with actual API data
const generateStatsData = (timeframe: string): StatsData => {
  const data = {
    users: {
      total: 1243,
      trend: 12.5,
      active: 892,
      new: 145,
      byRole: {
        admin: 3,
        moderator: 15,
        user: 1225
      }
    },
    books: {
      total: 567,
      trend: 8.3,
      newThisMonth: 23,
      popular: 45,
      byCategory: {
        fiction: 234,
        nonFiction: 156,
        sciFi: 89,
        mystery: 67,
        biography: 21
      }
    },
    reviews: {
      total: 3421,
      trend: 23.7,
      averageRating: 4.2,
      pending: 23,
      flagged: 5,
      byRating: {
        5: 1243,
        4: 987,
        3: 654,
        2: 321,
        1: 216
      }
    },
    categories: {
      total: 15,
      trend: 0,
      mostUsed: 'Fiction',
      leastUsed: 'Poetry'
    }
  };

  // Generate chart data
  const generateChartData = (days: number): ChartDataPoint[] => {
    return Array.from({ length: days }).map((_, i) => ({
      date: format(subDays(new Date(), days - 1 - i), 'MMM dd'),
      users: Math.floor(Math.random() * 50) + 100,
      books: Math.floor(Math.random() * 30) + 50,
      reviews: Math.floor(Math.random() * 100) + 200,
    }));
  };

  const generatePieData = (): PieDataPoint[] => [
    { name: 'Fiction', value: 234, color: '#8884d8' },
    { name: 'Non-Fiction', value: 156, color: '#82ca9d' },
    { name: 'Sci-Fi', value: 89, color: '#ffc658' },
    { name: 'Mystery', value: 67, color: '#ff8042' },
    { name: 'Others', value: 21, color: '#0088fe' },
  ];

  const generateRatingData = (): RatingDataPoint[] => [
    { name: '5 Stars', value: 1243, color: '#4caf50' },
    { name: '4 Stars', value: 987, color: '#8bc34a' },
    { name: '3 Stars', value: 654, color: '#ffc107' },
    { name: '2 Stars', value: 321, color: '#ff9800' },
    { name: '1 Star', value: 216, color: '#f44336' },
  ];

  return {
    stats: data,
    chartData: generateChartData(timeframe === 'week' ? 7 : 30),
    pieData: generatePieData(),
    ratingData: generateRatingData(),
  };
};

// Stat Card Component
const StatCard: React.FC<{
  data: StatCardData;
  onClick?: () => void;
}> = ({ data, onClick }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                bgcolor: data.color,
                width: 48,
                height: 48,
              }}
            >
              {data.icon}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {data.title}
              </Typography>
              <Typography variant="h4" component="div" fontWeight={600}>
                {data.value}
              </Typography>
            </Box>
          </Box>
          
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            TransitionComponent={Fade}
          >
            <MenuItem onClick={handleMenuClose}>
              <AssessmentIcon sx={{ mr: 1 }} fontSize="small" />
              View Details
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
              Export Data
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <RefreshIcon sx={{ mr: 1 }} fontSize="small" />
              Refresh
            </MenuItem>
          </Menu>
        </Box>

        {/* Trend Indicator */}
        {data.trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              size="small"
              icon={data.trend > 0 ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              label={`${Math.abs(data.trend)}%`}
              color={data.trend > 0 ? 'success' : 'error'}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              {data.trendLabel || 'vs last month'}
            </Typography>
          </Box>
        )}

        {/* Secondary Value */}
        {data.secondaryValue && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {data.secondaryValue}
          </Typography>
        )}

        {/* Progress Bar */}
        {data.progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={data.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: `${data.color}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: data.color,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Active Users Chart Component
const ActiveUsersChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Active Users
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Daily active users over time
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip />
          <Area
            type="monotone"
            dataKey="users"
            stroke={theme.palette.primary.main}
            fill="url(#userGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

// Books & Reviews Chart Component
const BooksReviewsChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Books & Reviews
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Daily additions
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <RechartsTooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="books"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="reviews"
            stroke={theme.palette.warning.main}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};


// Category Distribution Pie Chart
const CategoryPieChart: React.FC<{ data: PieDataPoint[] }> = ({ data }) => {
  
  // eslint-disable-next-line no-empty-pattern
  const [] = useState(0);

  

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Books by Category
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Distribution across categories
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
         <Pie
  data={data}
  cx="50%"
  cy="50%"
  innerRadius={60}
  outerRadius={80}
  dataKey="value"
  label
>
  {data.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.color} />
  ))}
</Pie>

          <RechartsTooltip />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};


// Rating Distribution Bar Chart
const RatingBarChart: React.FC<{ data: RatingDataPoint[] }> = ({ data }) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Rating Distribution
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Reviews by star rating
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

// Main DashboardStats Component
const DashboardStats: React.FC<DashboardStatsProps> = ({
  timeframe = 'month',
  onRefresh,
  onExport,
  className
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatsData | null>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [timeframeAnchorEl, setTimeframeAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setData(generateStatsData(timeframe));
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeframe]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateStatsData(timeframe));
      setLoading(false);
      if (onRefresh) onRefresh();
    }, 1000);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    handleExportClose();
    if (onExport) onExport(format);
  };

  const handleTimeframeClick = (event: React.MouseEvent<HTMLElement>) => {
    setTimeframeAnchorEl(event.currentTarget);
  };

  const handleTimeframeClose = () => {
    setTimeframeAnchorEl(null);
  };

  if (loading || !data) {
    return (
      <Box sx={{ p: 3 }} className={className}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Loading dashboard statistics...
        </Typography>
      </Box>
    );
  }

  const statCards: StatCardData[] = [
    {
      id: 'users',
      title: 'Total Users',
      value: data.stats.users.total,
      icon: <PeopleIcon />,
      color: '#1976d2',
      trend: data.stats.users.trend,
      secondaryValue: `${data.stats.users.active} active`,
      progress: (data.stats.users.active / data.stats.users.total) * 100,
    },
    {
      id: 'books',
      title: 'Total Books',
      value: data.stats.books.total,
      icon: <BookIcon />,
      color: '#2e7d32',
      trend: data.stats.books.trend,
      secondaryValue: `${data.stats.books.newThisMonth} new this month`,
      progress: (data.stats.books.newThisMonth / data.stats.books.total) * 100,
    },
    {
      id: 'reviews',
      title: 'Total Reviews',
      value: data.stats.reviews.total,
      icon: <ReviewIcon />,
      color: '#ed6c02',
      trend: data.stats.reviews.trend,
      secondaryValue: `Avg: ${data.stats.reviews.averageRating} ⭐`,
      progress: (data.stats.reviews.averageRating / 5) * 100,
    },
    {
      id: 'categories',
      title: 'Categories',
      value: data.stats.categories.total,
      icon: <CategoryIcon />,
      color: '#0288d1',
      trend: data.stats.categories.trend,
      secondaryValue: `Top: ${data.stats.categories.mostUsed}`,
    },
  ];

  return (
    <Box className={className}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, Admin! Here's what's happening with your platform.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Change timeframe">
            <IconButton onClick={handleTimeframeClick}>
              <CalendarIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export">
            <IconButton onClick={handleExportClick}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Timeframe Menu */}
      <Menu
        anchorEl={timeframeAnchorEl}
        open={Boolean(timeframeAnchorEl)}
        onClose={handleTimeframeClose}
      >
        <MenuItem onClick={handleTimeframeClose}>Last 7 Days</MenuItem>
        <MenuItem onClick={handleTimeframeClose}>Last 30 Days</MenuItem>
        <MenuItem onClick={handleTimeframeClose}>Last 3 Months</MenuItem>
        <MenuItem onClick={handleTimeframeClose}>Last Year</MenuItem>
      </Menu>

      {/* Export Menu */}
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleExportClose}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Export as CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Export as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Export as Excel
        </MenuItem>
      </Menu>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.id}>
            <StatCard data={stat} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ActiveUsersChart data={data.chartData} />
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <CategoryPieChart data={data.pieData} />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <BooksReviewsChart data={data.chartData} />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <RatingBarChart data={data.ratingData} />
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Quick Stats
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <CommentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight={600}>
                    {data.stats.reviews.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Reviews
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <StarIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight={600}>
                    {data.stats.reviews.flagged}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Flagged Reviews
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Role Distribution
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 100 }}>
              {Object.entries(data.stats.users.byRole).map(([role, count]) => (
                <Box key={role} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={600}>
                    {count as number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {role}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardStats;
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  useTheme,
  Rating,
  Collapse,
  Switch,
  FormControlLabel,
  SelectChangeEvent
} from '@mui/material';
import {
  Print as PrintIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Book as BookIcon,
  RateReview as ReviewIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon
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
  ResponsiveContainer
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, differenceInDays } from 'date-fns';


export interface ReportsProps {
  className?: string;
}

export interface ReportData {
  id: string;
  name: string;
  type: 'users' | 'books' | 'reviews' | 'categories' | 'revenue' | 'engagement';
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    total: number;
    growth: number;
    average?: number;
    topItems?: Array<{
      id: number;
      name: string;
      category: string;
      count: number;
      rating: string;
      growth: number;
    }>;
  };
  chartData: Array<{
    date: string;
    value: number;
    previous: number;
  }>;
  tableData: Array<{
    id: number;
    name: string;
    category: string;
    count: number;
    rating: string;
    growth: number;
  }>;
}

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Generate sample data - replace with actual API calls
const generateReportData = (type: string, days: number): ReportData => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  const generateChartData = () => {
    return Array.from({ length: days }).map((_, i) => ({
      date: format(subDays(endDate, days - 1 - i), 'MMM dd'),
      value: Math.floor(Math.random() * 100) + 50,
      previous: Math.floor(Math.random() * 100) + 30,
    }));
  };

  const generateTableData = () => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      category: ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery'][Math.floor(Math.random() * 4)],
      count: Math.floor(Math.random() * 1000) + 100,
      rating: (Math.random() * 2 + 3).toFixed(1),
      growth: Math.floor(Math.random() * 40) - 10,
    }));
  };

  const getMetrics = () => {
    const total = Math.floor(Math.random() * 5000) + 1000;
    const previousTotal = Math.floor(Math.random() * 4000) + 800;
    const growth = ((total - previousTotal) / previousTotal) * 100;

    return {
      total,
      growth,
      average: type === 'reviews' ? 4.2 : undefined,
      topItems: generateTableData().slice(0, 5),
    };
  };

  return {
    id: `${type}-${Date.now()}`,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: type as any,
    dateRange: {
      start: startDate,
      end: endDate,
    },
    metrics: getMetrics(),
    chartData: generateChartData(),
    tableData: generateTableData(),
  };
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  growth?: number;
  subtitle?: string;
}> = ({ title, value, icon, color, growth, subtitle }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {growth !== undefined && (
            <Chip
              size="small"
              icon={growth > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${Math.abs(growth).toFixed(1)}%`}
              color={growth > 0 ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="h4" component="div" fontWeight={600} gutterBottom>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Chart Type Selector
const ChartTypeSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <Tooltip title="Line Chart">
        <IconButton
          color={value === 'line' ? 'primary' : 'default'}
          onClick={() => onChange('line')}
        >
          <LineChartIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bar Chart">
        <IconButton
          color={value === 'bar' ? 'primary' : 'default'}
          onClick={() => onChange('bar')}
        >
          <BarChartIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Area Chart">
        <IconButton
          color={value === 'area' ? 'primary' : 'default'}
          onClick={() => onChange('area')}
        >
          <TimelineIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Pie Chart">
        <IconButton
          color={value === 'pie' ? 'primary' : 'default'}
          onClick={() => onChange('pie')}
        >
          <PieChartIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// Report Chart Component
const ReportChart: React.FC<{
  data: Array<{ date: string; value: number; previous: number }>;
  type: string;
  chartType: string;
}> = ({ data, chartType }) => {
  const theme = useTheme();

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Current Period"
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke={theme.palette.grey[400]}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
              name="Previous Period"
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="value" fill={theme.palette.primary.main} name="Current Period" />
            <Bar dataKey="previous" fill={theme.palette.grey[400]} name="Previous Period" />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke={theme.palette.primary.main}
              fill="url(#colorValue)"
              name="Current Period"
            />
          </AreaChart>
        );

      case 'pie':
        { const pieData = [
          { name: 'Fiction', value: 400, color: '#8884d8' },
          { name: 'Non-Fiction', value: 300, color: '#82ca9d' },
          { name: 'Sci-Fi', value: 200, color: '#ffc658' },
          { name: 'Mystery', value: 150, color: '#ff8042' },
          { name: 'Others', value: 100, color: '#0088fe' },
        ];
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={(entry: any) => entry.name}
              outerRadius={80}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        ); }

      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

// Main Reports Component
const Reports: React.FC<ReportsProps> = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState('users');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'custom'>('30');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(subDays(new Date(), 30));
  const [customEndDate, setCustomEndDate] = useState<Date | null>(new Date());
  const [chartType, setChartType] = useState('line');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const days = dateRange === 'custom' 
        ? differenceInDays(customEndDate || new Date(), customStartDate || new Date())
        : parseInt(dateRange);
      
      const data = generateReportData(reportType, days);
      setReportData(data);
    } catch {
      showNotification('Error fetching report data', 'error');
    } finally {
      setLoading(false);
    }
  }, [reportType, dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    showNotification(`Exporting as ${format.toUpperCase()}...`, 'info');
    // Implement actual export logic here
    setTimeout(() => {
      showNotification(`Report exported as ${format.toUpperCase()} successfully`, 'success');
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    showNotification('Share link copied to clipboard', 'success');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value);
  };

  const handleDateRangeChange = (event: SelectChangeEvent) => {
    setDateRange(event.target.value as '7' | '30' | '90' | 'custom');
  };

  const filteredData = reportData?.tableData?.filter(
    (item) =>
      (item?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item?.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const reportTypes = [
    { value: 'users', label: 'Users Report', icon: <PeopleIcon /> },
    { value: 'books', label: 'Books Report', icon: <BookIcon /> },
    { value: 'reviews', label: 'Reviews Report', icon: <ReviewIcon /> },
    { value: 'categories', label: 'Categories Report', icon: <CategoryIcon /> },
    { value: 'engagement', label: 'Engagement Report', icon: <TrendingUpIcon /> },
  ];

  return (
    <Box className={className}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate and analyze detailed reports about your platform's performance.
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Report Type */}
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={handleReportTypeChange}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Range */}
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={handleDateRangeChange}
              >
                <MenuItem value="7">Last 7 Days</MenuItem>
                <MenuItem value="30">Last 30 Days</MenuItem>
                <MenuItem value="90">Last 90 Days</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid size={{ xs: 12, md: 3 }}>
                <DatePicker
                  label="Start Date"
                  value={customStartDate}
                  onChange={(newValue) => setCustomStartDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <DatePicker
                  label="End Date"
                  value={customEndDate}
                  onChange={(newValue) => setCustomEndDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
            </LocalizationProvider>
          )}

          {/* Action Buttons */}
          <Grid size={{ xs: 12, md: dateRange === 'custom' ? 12 : 3 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchReportData}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export PDF">
                <IconButton onClick={() => handleExport('pdf')}>
                  <PdfIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export CSV">
                <IconButton onClick={() => handleExport('csv')}>
                  <TableChartIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print">
                <IconButton onClick={handlePrint}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          {/* Filters Toggle */}
          <Grid size={{ xs: 12 }}>
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>

          {/* Advanced Filters */}
          <Collapse in={showFilters} sx={{ width: '100%' }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: searchTerm && (
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <ClearIcon />
                        </IconButton>
                      ),
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={compareMode}
                      onChange={(e) => setCompareMode(e.target.checked)}
                    />
                  }
                  label="Compare with previous period"
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </Paper>

      {/* Report Content */}
      {loading ? (
        <Box sx={{ width: '100%', py: 4 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Generating report...
          </Typography>
        </Box>
      ) : reportData ? (
        <>
          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <MetricCard
                title={`Total ${reportData.name}`}
                value={reportData.metrics.total}
                icon={reportTypes.find(t => t.value === reportType)?.icon || <AssessmentIcon />}
                color="#1976d2"
                growth={reportData.metrics.growth}
                subtitle={`vs previous ${dateRange} days`}
              />
            </Grid>
            {reportData.metrics.average && (
              <Grid size={{ xs: 12, md: 3 }}>
                <MetricCard
                  title="Average Rating"
                  value={reportData.metrics.average}
                  icon={<StarIcon />}
                  color="#ed6c02"
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 3 }}>
              <MetricCard
                title="Growth Rate"
                value={`${reportData.metrics.growth.toFixed(1)}%`}
                icon={<TrendingUpIcon />}
                color={reportData.metrics.growth > 0 ? '#2e7d32' : '#d32f2f'}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <MetricCard
                title="Date Range"
                value={differenceInDays(reportData.dateRange.end, reportData.dateRange.start)}
                icon={<CalendarIcon />}
                color="#0288d1"
                subtitle="days"
              />
            </Grid>
          </Grid>

          {/* Chart Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                {reportData.name} Trend
              </Typography>
              <ChartTypeSelector value={chartType} onChange={setChartType} />
            </Box>
            <ReportChart
              data={reportData.chartData}
              type={reportType}
              chartType={chartType}
            />
          </Paper>

          {/* Tabs for different views */}
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="report tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Table View" icon={<TableChartIcon />} iconPosition="start" />
              <Tab label="Tops" icon={<StarIcon />} iconPosition="start" />
              <Tab label="Distribution" icon={<PieChartIcon />} iconPosition="start" />
            </Tabs>

            {/* Table View Tab */}
            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Rating</TableCell>
                      <TableCell align="right">Growth</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>
                            <Chip label={row.category} size="small" />
                          </TableCell>
                          <TableCell align="right">{row.count.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              <Rating value={parseFloat(row.rating)} precision={0.1} readOnly size="small" />
                              <Typography variant="caption">({row.rating})</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              size="small"
                              icon={row.growth > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              label={`${Math.abs(row.growth)}%`}
                              color={row.growth > 0 ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TabPanel>

            {/* Tops Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {reportData.metrics.topItems?.map((item, index) => (
                  <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#1976d2' }}>
                            {index + 1}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.category}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight={600}>
                              {item.count.toLocaleString()}
                            </Typography>
                            <Chip
                              size="small"
                              icon={item.growth > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              label={`${Math.abs(item.growth)}%`}
                              color={item.growth > 0 ? 'success' : 'error'}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Distribution Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Category Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Fiction', value: 400 },
                            { name: 'Non-Fiction', value: 300 },
                            { name: 'Sci-Fi', value: 200 },
                            { name: 'Mystery', value: 150 },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          label={(entry: any) => entry.name}
                        >
                          <Cell fill="#8884d8" />
                          <Cell fill="#82ca9d" />
                          <Cell fill="#ffc658" />
                          <Cell fill="#ff8042" />
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Rating Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { rating: '5 Stars', count: 1243 },
                          { rating: '4 Stars', count: 987 },
                          { rating: '3 Stars', count: 654 },
                          { rating: '2 Stars', count: 321 },
                          { rating: '1 Star', count: 216 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#1976d2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </>
      ) : null}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
// C:\Users\PC_1\OneDrive\Desktop\Book Review\BOOK\src\pages\admin\ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Rating,
  Divider,
  Stack,
  Card,
  CardContent,
  useTheme,
  alpha,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  SelectChangeEvent
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Book as BookIcon,
  RateReview as ReviewIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableChartIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Share as ShareAltIcon,
  Email as EmailIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CopyToClipboard from 'react-copy-to-clipboard';

// ============================================
// Types
// ============================================

export type ReportType = 'users' | 'books' | 'reviews' | 'categories' | 'engagement' | 'revenue';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type ReportFormat = 'pdf' | 'csv' | 'excel' | 'json';

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  period: ReportPeriod;
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    total: number;
    previous: number;
    growth: number;
    average?: number;
    max?: number;
    min?: number;
  };
  chartData: unknown[];
  tableData: unknown[];
  summary: string;
  generatedAt: Date;
  generatedBy: string;
  format?: ReportFormat;
  fileUrl?: string;
}

export interface SavedReport {
  id: string;
  name: string;
  type: ReportType;
  period: ReportPeriod;
  createdAt: Date;
  createdBy: string;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    nextRun: Date;
  };
}

// ============================================
// Report Card Component
// ============================================

interface ReportCardProps {
  report: SavedReport;
  onView: (id: string) => void;
  onDownload: (id: string, format: ReportFormat) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onView,
  onDownload,
  onShare,
  onDelete
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getTypeIcon = () => {
    switch (report.type) {
      case 'users': return <PeopleIcon />;
      case 'books': return <BookIcon />;
      case 'reviews': return <ReviewIcon />;
      case 'categories': return <CategoryIcon />;
      case 'engagement': return <TrendingUpIcon />;
      default: return <AssessmentIcon />;
    }
  };

  const getTypeColor = () => {
    switch (report.type) {
      case 'users': return '#1976d2';
      case 'books': return '#4caf50';
      case 'reviews': return '#ff9800';
      case 'categories': return '#9c27b0';
      case 'engagement': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(getTypeColor(), 0.1), color: getTypeColor() }}>
              {getTypeIcon()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {report.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {report.type.charAt(0).toUpperCase() + report.type.slice(1)} • {report.period}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Created: {format(new Date(report.createdAt), 'MMM dd, yyyy')}
          </Typography>
          {report.schedule && (
            <Chip
              size="small"
              label={`Scheduled: ${report.schedule.frequency}`}
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onView(report.id)}
          >
            View
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onDownload(report.id, 'pdf')}
          >
            Download
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onShare(report.id)}
          >
            Share
          </Button>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          onView(report.id);
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          onDownload(report.id, 'pdf');
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          onDownload(report.id, 'csv');
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          onDownload(report.id, 'excel');
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download Excel</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          onShare(report.id);
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <ShareAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          onDelete(report.id);
          setAnchorEl(null);
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

// ============================================
// Share Dialog Component
// ============================================

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  reportName: string;
  shareUrl: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  reportName,
  shareUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    // Send email logic
    console.log('Sending to:', email);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Report</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" gutterBottom>
          Share "{reportName}"
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Copy link
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={shareUrl}
              InputProps={{ readOnly: true }}
            />
            <CopyToClipboard text={shareUrl} onCopy={handleCopy}>
              <Button variant="outlined">
                {copied ? <CheckIcon /> : <ContentCopyIcon />}
              </Button>
            </CopyToClipboard>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Send via email
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button variant="contained" onClick={handleSendEmail}>
              <EmailIcon />
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Schedule Dialog Component
// ============================================

interface ScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (schedule: unknown) => void;
  reportType: ReportType;
}

const ScheduleDialog: React.FC<ScheduleDialogProps> = ({
  open,
  onClose,
  onSchedule
}) => {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recipients, setRecipients] = useState('');
  const [format, setFormat] = useState<ReportFormat>('pdf');

  const handleSchedule = () => {
    onSchedule({
      frequency,
      recipients: recipients.split(',').map(e => e.trim()),
      format
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Report</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select
              value={frequency}
              label="Frequency"
              onChange={(e: SelectChangeEvent) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Email Recipients"
            placeholder="email1@example.com, email2@example.com"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            helperText="Separate multiple emails with commas"
          />

          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={format}
              label="Format"
              onChange={(e: SelectChangeEvent) => setFormat(e.target.value as ReportFormat)}
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSchedule}>
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Main Component
// ============================================

const ReportsPage: React.FC = () => {
  const theme = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState<ReportType>('users');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly');
  const [customDateRange, setCustomDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Chart data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartData, setChartData] = useState<any[]>([]);
  const [, setComparisonData] = useState<unknown[]>([]);
  const [pieData, setPieData] = useState<unknown[]>([]);
  const [tableData, setTableData] = useState<unknown[]>([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    generateReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, reportPeriod, customDateRange]);

  useEffect(() => {
    // Load saved reports
    loadSavedReports();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const days = reportPeriod === 'custom'
        ? differenceInDays(customDateRange.end || new Date(), customDateRange.start || new Date())
        : reportPeriod === 'daily' ? 1
        : reportPeriod === 'weekly' ? 7
        : reportPeriod === 'monthly' ? 30
        : reportPeriod === 'quarterly' ? 90
        : 365;

      // Generate chart data based on report type
      const mockChartData = Array.from({ length: days > 0 ? days : 1 }).map((_, i) => ({
        date: format(subDays(new Date(), (days > 0 ? days : 1) - 1 - i), 'MMM dd'),
        value: Math.floor(Math.random() * 500) + 100,
        previous: Math.floor(Math.random() * 400) + 50,
        ...(reportType === 'reviews' && { rating: (Math.random() * 2 + 3).toFixed(1) })
      }));

      // Generate pie data based on report type
      const mockPieData = reportType === 'users' ? [
        { name: 'Active', value: 5678, color: '#4caf50' },
        { name: 'Inactive', value: 2345, color: '#ff9800' },
        { name: 'Suspended', value: 456, color: '#f44336' },
        { name: 'Pending', value: 234, color: '#2196f3' }
      ] : reportType === 'books' ? [
        { name: 'Published', value: 4567, color: '#4caf50' },
        { name: 'Draft', value: 1234, color: '#ff9800' },
        { name: 'Archived', value: 567, color: '#f44336' },
        { name: 'Pending', value: 345, color: '#2196f3' }
      ] : reportType === 'categories' ? [
        { name: 'Fiction', value: 2345, color: '#8884d8' },
        { name: 'Non-Fiction', value: 1876, color: '#82ca9d' },
        { name: 'Science Fiction', value: 1234, color: '#ffc658' },
        { name: 'Mystery', value: 987, color: '#ff8042' },
        { name: 'Others', value: 2323, color: '#0088fe' }
      ] : [
        { name: '5 Stars', value: 15432, color: '#4caf50' },
        { name: '4 Stars', value: 12345, color: '#8bc34a' },
        { name: '3 Stars', value: 8765, color: '#ffc107' },
        { name: '2 Stars', value: 4321, color: '#ff9800' },
        { name: '1 Star', value: 2347, color: '#f44336' }
      ];

      // Generate comparison data
      const mockComparisonData = [
        { name: 'Current Period', value: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Previous Period', value: Math.floor(Math.random() * 4000) + 800 }
      ];

      // Generate table data
      const mockTableData = Array.from({ length: 25 }).map((_, i) => ({
        id: i + 1,
        name: reportType === 'users' ? `User ${i + 1}` :
              reportType === 'books' ? `Book ${i + 1}` :
              reportType === 'categories' ? `Category ${i + 1}` :
              `Item ${i + 1}`,
        category: ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery'][Math.floor(Math.random() * 4)],
        count: Math.floor(Math.random() * 1000) + 100,
        rating: (Math.random() * 2 + 3).toFixed(1),
        growth: Math.floor(Math.random() * 40) - 10
      }));

      setChartData(mockChartData);
      setPieData(mockPieData);
      setComparisonData(mockComparisonData);
      setTableData(mockTableData);

      // Set current report - FIXED SYNTAX HERE
      setCurrentReport({
        id: `report-${Date.now()}`,
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        type: reportType,
        period: reportPeriod,
        dateRange: {
          start: customDateRange.start || new Date(),
          end: customDateRange.end || new Date()
        },
        metrics: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          total: mockTableData.reduce((acc: number, item: any) => acc + item.count, 0),
          previous: Math.floor(Math.random() * 5000) + 500,
          growth: Math.floor(Math.random() * 30) - 5,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          average: mockTableData.reduce((acc: number, item: any) => acc + item.count, 0) / mockTableData.length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          max: Math.max(...mockTableData.map((item: any) => item.count)),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          min: Math.min(...mockTableData.map((item: any) => item.count))
        },
        chartData: mockChartData,
        tableData: mockTableData,
        summary: `This report shows ${reportType} activity over the selected period.`,
        generatedAt: new Date(),
        generatedBy: 'Admin User'
      });

      setError(null);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedReports = async () => {
    // Mock saved reports
    setSavedReports([
      {
        id: '1',
        name: 'Monthly Users Report',
        type: 'users',
        period: 'monthly',
        createdAt: new Date(),
        createdBy: 'Admin',
        schedule: {
          frequency: 'weekly',
          recipients: ['admin@example.com'],
          nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: '2',
        name: 'Books Performance',
        type: 'books',
        period: 'weekly',
        createdAt: subDays(new Date(), 7),
        createdBy: 'Admin'
      },
      {
        id: '3',
        name: 'Review Analytics',
        type: 'reviews',
        period: 'daily',
        createdAt: subDays(new Date(), 1),
        createdBy: 'Admin'
      }
    ]);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExport = (format: ReportFormat) => {
    showNotification(`Exporting as ${format.toUpperCase()}...`, 'info');
    // Implement actual export logic
  };

  const handleSave = () => {
    if (currentReport) {
      const savedReport: SavedReport = {
        id: `saved-${Date.now()}`,
        name: `${currentReport.type} Report - ${format(new Date(), 'yyyy-MM-dd')}`,
        type: currentReport.type,
        period: currentReport.period,
        createdAt: new Date(),
        createdBy: 'Admin'
      };
      setSavedReports(prev => [savedReport, ...prev]);
      showNotification('Report saved successfully', 'success');
    }
  };

  const handleSchedule = () => {
    showNotification('Report scheduled successfully', 'success');
    setScheduleDialogOpen(false);
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleDownload = (id: string, format: ReportFormat) => {
    showNotification(`Downloading report as ${format.toUpperCase()}...`, 'info');
  };

  const handleViewReport = (id: string) => {
    // Load and view saved report
    console.log('Viewing report:', id);
  };

  const handleDeleteReport = (id: string) => {
    setSavedReports(prev => prev.filter(r => r.id !== id));
    showNotification('Report deleted successfully', 'success');
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const getReportTypes = () => [
    { value: 'users', label: 'Users Report', icon: <PeopleIcon /> },
    { value: 'books', label: 'Books Report', icon: <BookIcon /> },
    { value: 'reviews', label: 'Reviews Report', icon: <ReviewIcon /> },
    { value: 'categories', label: 'Categories Report', icon: <CategoryIcon /> },
    { value: 'engagement', label: 'Engagement Report', icon: <TrendingUpIcon /> }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate and analyze detailed reports about your platform's performance.
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Generate Report" />
          <Tab label="Saved Reports" />
          <Tab label="Scheduled Reports" />
        </Tabs>
      </Paper>

      {/* Generate Report Tab */}
      {tabValue === 0 && (
        <>
          {/* Report Controls */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    label="Report Type"
                    onChange={(e: SelectChangeEvent) => setReportType(e.target.value as ReportType)}
                  >
                    {getReportTypes().map(type => (
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

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={reportPeriod}
                    label="Period"
                    onChange={(e: SelectChangeEvent) => setReportPeriod(e.target.value as ReportPeriod)}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {reportPeriod === 'custom' && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <DatePicker
                      label="Start Date"
                      value={customDateRange.start}
                      onChange={(date: Date | null) => setCustomDateRange({ ...customDateRange, start: date })}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <DatePicker
                      label="End Date"
                      value={customDateRange.end}
                      onChange={(date: Date | null) => setCustomDateRange({ ...customDateRange, end: date })}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </Grid>
                </LocalizationProvider>
              )}

              <Grid size={{ xs: 12, md: reportPeriod === 'custom' ? 12 : 6 }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Tooltip title="Refresh">
                    <IconButton onClick={generateReport}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Save Report">
                    <IconButton onClick={handleSave}>
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Schedule">
                    <IconButton onClick={() => setScheduleDialogOpen(true)}>
                      <CalendarIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton onClick={handleShare}>
                      <ShareAltIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export">
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Export Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { handleExport('pdf'); setAnchorEl(null); }}>
              <ListItemIcon>
                <PdfIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export as PDF</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleExport('csv'); setAnchorEl(null); }}>
              <ListItemIcon>
                <TableChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export as CSV</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleExport('excel'); setAnchorEl(null); }}>
              <ListItemIcon>
                <TableChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export as Excel</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleExport('json'); setAnchorEl(null); }}>
              <ListItemIcon>
                <TableChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export as JSON</ListItemText>
            </MenuItem>
          </Menu>

          {/* Loading State */}
          {loading && (
            <Box sx={{ width: '100%', py: 4 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Generating report...
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Report Content */}
          {!loading && !error && currentReport && (
            <>
              {/* Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Total {reportType}
                      </Typography>
                      <Typography variant="h4" fontWeight={600}>
                        {currentReport.metrics.total.toLocaleString()}
                      </Typography>
                      <Chip
                        size="small"
                        icon={currentReport.metrics.growth > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={`${Math.abs(currentReport.metrics.growth)}% vs previous`}
                        color={currentReport.metrics.growth > 0 ? 'success' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Average
                      </Typography>
                      <Typography variant="h4" fontWeight={600}>
                        {Math.round(currentReport.metrics.average || 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Maximum
                      </Typography>
                      <Typography variant="h4" fontWeight={600}>
                        {currentReport.metrics.max?.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Date Range
                      </Typography>
                      <Typography variant="body2">
                        {format(currentReport.dateRange.start, 'MMM dd, yyyy')} - {format(currentReport.dateRange.end, 'MMM dd, yyyy')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Trend Analysis
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
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
                          name="Previous Period"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Detailed Data
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Count</TableCell>
                            <TableCell align="right">Rating</TableCell>
                            <TableCell align="right">Growth</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tableData
                            .slice(page * limit, page * limit + limit)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .map((row: any) => (
                              <TableRow key={row.id}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>
                                  <Chip size="small" label={row.category} />
                                </TableCell>
                                <TableCell align="right">{row.count.toLocaleString()}</TableCell>
                                <TableCell align="right">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
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
                      count={tableData.length}
                      rowsPerPage={limit}
                      page={page}
                      onPageChange={(_event, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(event) => {
                        setLimit(parseInt(event.target.value, 10));
                        setPage(0);
                      }}
                      sx={{ mt: 2 }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}

      {/* Saved Reports Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {savedReports.map((report) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report.id}>
              <ReportCard
                report={report}
                onView={handleViewReport}
                onDownload={handleDownload}
                onShare={() => setShareDialogOpen(true)}
                onDelete={handleDeleteReport}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Scheduled Reports Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Scheduled Reports
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Next Run</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedReports
                  .filter(r => r.schedule)
                  .map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.name}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={report.schedule?.frequency}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>{report.schedule?.recipients.join(', ')}</TableCell>
                      <TableCell>
                        {report.schedule?.nextRun && format(report.schedule.nextRun, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>PDF</TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialogs */}
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        reportName={currentReport?.name || 'Report'}
        shareUrl={`${window.location.origin}/reports/${currentReport?.id}`}
      />

      <ScheduleDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onSchedule={handleSchedule}
        reportType={reportType}
      />

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
    </Container>
  );
};

export default ReportsPage;
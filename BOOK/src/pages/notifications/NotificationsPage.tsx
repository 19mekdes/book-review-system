import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Button,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  alpha,
  CircularProgress} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  EmojiEvents as AchievementIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  Markunread as MarkUnreadIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

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
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const NotificationsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  } = useNotifications();

  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredNotifications = tabValue === 0 
    ? notifications 
    : notifications.filter(n => !n.read);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'review_like':
        return <FavoriteIcon sx={{ color: '#f44336' }} />;
      case 'review_comment':
        return <CommentIcon sx={{ color: '#2196f3' }} />;
      case 'achievement':
        return <AchievementIcon sx={{ color: '#ff9800' }} />;
      default:
        return <InfoIcon sx={{ color: '#757575' }} />;
    }
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={700}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                color="primary"
                size="small"
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              startIcon={<DoneAllIcon />}
              onClick={markAllAsRead}
              variant="outlined"
              size="small"
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label="All" 
              icon={<Badge badgeContent={notifications.length} color="primary" />}
              iconPosition="end"
            />
            <Tab 
              label="Unread" 
              icon={<Badge badgeContent={unreadCount} color="error" />}
              iconPosition="end"
            />
          </Tabs>
        </Box>

        {/* Notifications List */}
        <TabPanel value={tabValue} index={0}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notifications
              </Typography>
              <Typography variant="body2" color="text.disabled">
                When you get notifications, they'll appear here
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem onClick={() => handleNotificationClick(notification)} sx={{
                      bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: notification.read ? 'action.hover' : alpha(theme.palette.primary.main, 0.08),
                      },
                      position: 'relative'
                    }}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={notification.read ? 400 : 600}>
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip
                              size="small"
                              label="New"
                              color="primary"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.disabled">
                              {getTimeAgo(notification.createdAt)}
                            </Typography>
                            <Box>
                              <Tooltip title="Mark as read">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  disabled={notification.read}
                                >
                                  <MarkUnreadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle delete
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider variant="inset" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MarkUnreadIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No unread notifications
              </Typography>
              <Typography variant="body2" color="text.disabled">
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem onClick={() => handleNotificationClick(notification)} sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.disabled">
                              {getTimeAgo(notification.createdAt)}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              Mark as read
                            </Button>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider variant="inset" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>
    </Container>
  )
};

export default NotificationsPage;
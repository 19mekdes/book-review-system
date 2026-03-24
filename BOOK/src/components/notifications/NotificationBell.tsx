// src/components/notifications/NotificationBell.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Box,
  Typography,
  Divider,
  Button,
  List,
  ListItemButton, // Add this import
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  EmojiEvents as AchievementIcon,
  Info as InfoIcon,
  DoneAll as DoneAllIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell: React.FC = () => {
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Use requestIdleCallback for non-critical fetch
    if ('requestIdleCallback' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).requestIdleCallback(() => fetchNotifications(), { timeout: 1000 });
    } else {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNotificationClick = useCallback((notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    handleClose();
  }, [markAsRead, navigate, handleClose]);

  const handleViewAll = useCallback(() => {
    navigate('/notifications');
    handleClose();
  }, [navigate, handleClose]);

  const getNotificationIcon = useCallback((type: string) => {
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
  }, []);

  const getTimeAgo = useCallback((date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  }, []);

  // Memoize the notification list to prevent unnecessary re-renders
  const notificationList = useMemo(() => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      );
    }

    if (notifications.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
          <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No notifications yet
          </Typography>
        </Box>
      );
    }

    return (
      <List disablePadding>
        {notifications.slice(0, 5).map((notification) => (
          <React.Fragment key={notification.id}>
            {/* Replace ListItem with ListItemButton for clickable items */}
            <ListItemButton
              onClick={() => handleNotificationClick(notification)}
              sx={{
                bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                '&:hover': {
                  bgcolor: notification.read ? 'action.hover' : alpha(theme.palette.primary.main, 0.08),
                },
                py: 1.5,
                px: 2,
                transition: 'background-color 0.2s'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 1,
                        maxWidth: '200px'
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {getTimeAgo(notification.createdAt)}
                    </Typography>
                  </>
                }
              />
              {!notification.read && (
                <Chip
                  size="small"
                  label="New"
                  color="primary"
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </ListItemButton>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  }, [notifications, loading, theme, handleNotificationClick, getNotificationIcon, getTimeAgo]);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          color="inherit"
          aria-controls={open ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1.5,
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: theme.shadows[8]
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                color="primary"
                size="small"
                sx={{ height: 20 }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={markAllAsRead}
              sx={{ textTransform: 'none' }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Notifications List */}
        <Box sx={{ overflowY: 'auto', maxHeight: 350 }}>
          {notificationList}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
              <Button
                fullWidth
                size="small"
                endIcon={<OpenInNewIcon />}
                onClick={handleViewAll}
                sx={{ textTransform: 'none' }}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default React.memo(NotificationBell);
import React, { useEffect, forwardRef, type ReactElement } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Slide,
  Zoom,
  Fade,
  Grow,
  styled,
  useMediaQuery,
  useTheme,
  type SlideProps,
  type ZoomProps,
  type FadeProps,
  type GrowProps,
  type Breakpoint
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Types
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'confirm';
export type ModalAnimation = 'slide' | 'zoom' | 'fade' | 'grow' | 'none';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  animation?: ModalAnimation;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  fullScreen?: boolean;
  fullWidth?: boolean;
  maxWidth?: ModalSize;
  dividers?: boolean;
  hideBackdrop?: boolean;
  disablePortal?: boolean;
  keepMounted?: boolean;
  className?: string;
  style?: React.CSSProperties;
  titleIcon?: React.ReactNode;
  onExited?: () => void;
  onEntered?: () => void;
}

// Styled Dialog
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': { borderRadius: 12, boxShadow: theme.shadows[10], margin: 16 },
  '& .MuiDialogTitle-root': { padding: '16px 24px', borderBottom: `1px solid ${theme.palette.divider}` },
  '& .MuiDialogContent-root': { padding: 24 },
  '& .MuiDialogActions-root': { padding: '16px 24px', borderTop: `1px solid ${theme.palette.divider}` },
}));

const TitleIcon = styled(Box)<{ $variant: ModalVariant }>(({ theme, $variant }) => {
  const colors = {
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    confirm: theme.palette.primary.main,
    default: 'transparent',
  };
  return { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing(1.5), color: colors[$variant], '& svg': { fontSize: 28 } };
});

// Transitions (children must be ReactElement)
const SlideTransition = forwardRef<unknown, SlideProps>((props, ref) => <Slide direction="up" ref={ref} {...props} />);
const ZoomTransition = forwardRef<unknown, ZoomProps>((props, ref) => <Zoom ref={ref} {...props}>{props.children as ReactElement}</Zoom>);
const FadeTransition = forwardRef<unknown, FadeProps>((props, ref) => <Fade ref={ref} {...props}>{props.children as ReactElement}</Fade>);
const GrowTransition = forwardRef<unknown, GrowProps>((props, ref) => <Grow ref={ref} {...props}>{props.children as ReactElement}</Grow>);

const getTransitionComponent = (animation: ModalAnimation) => {
  switch (animation) {
    case 'slide': return SlideTransition;
    case 'zoom': return ZoomTransition;
    case 'fade': return FadeTransition;
    case 'grow': return GrowTransition;
    default: return undefined;
  }
};

const getVariantIcon = (variant: ModalVariant) => {
  switch (variant) {
    case 'success': return <CheckCircleIcon />;
    case 'error': return <ErrorIcon />;
    case 'warning': return <WarningIcon />;
    case 'info': return <InfoIcon />;
    case 'confirm': return <WarningIcon />;
    default: return null;
  }
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  variant = 'default',
  animation = 'fade',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  fullScreen = false,
  fullWidth = true,
  maxWidth,
  dividers = true,
  hideBackdrop = false,
  disablePortal = false,
  keepMounted = false,
  className,
  style,
  titleIcon,
  onExited,
  onEntered,
}) => {
  const theme = useTheme();
  const fullScreenBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));

  // Determine actual fullScreen & maxWidth
  const isFullScreen = fullScreen || fullScreenBreakpoint || size === 'full';
  const dialogMaxWidth: false | Breakpoint | undefined = maxWidth === 'full' ? undefined : maxWidth || (size === 'full' ? undefined : size);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, open, onClose]);

  const handleBackdropClick = () => { if (closeOnBackdropClick) onClose(); };
  const icon = titleIcon || getVariantIcon(variant);

  return (
    <StyledDialog
  open={open}
  onClose={onClose}
  fullScreen={isFullScreen}
  fullWidth={fullWidth}
  maxWidth={dialogMaxWidth}
  TransitionComponent={getTransitionComponent(animation)}
  TransitionProps={{
    onExited,
    onEntered,
  }}
  hideBackdrop={hideBackdrop}
  disablePortal={disablePortal}
  keepMounted={keepMounted}
  className={className}
  style={style}
  PaperProps={{ elevation: 24 }}
  BackdropProps={{ onClick: handleBackdropClick }}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
      {(title || showCloseButton) && (
        <DialogTitle id="modal-title">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              {icon && <TitleIcon $variant={variant}>{icon}</TitleIcon>}
              {typeof title === 'string' ? <Typography variant="h6" component="span" fontWeight={600}>{title}</Typography> : title}
            </Box>
            {showCloseButton && (
              <IconButton aria-label="close" onClick={onClose} size="small"
                sx={{ color: 'grey.500', '&:hover': { color: 'grey.700', backgroundColor: 'rgba(0,0,0,0.04)' } }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}
      <DialogContent id="modal-description" dividers={dividers}>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </StyledDialog>
  );
};

export default Modal;
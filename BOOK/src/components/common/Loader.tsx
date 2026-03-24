import React from 'react';
import {
  CircularProgress,
  LinearProgress,
  Box,
  Typography,
  Skeleton,
  Backdrop,
  styled,
  keyframes
} from '@mui/material';

// Types
export type LoaderType = 'circular' | 'linear' | 'dots' | 'spinner' | 'skeleton';
export type LoaderSize = 'small' | 'medium' | 'large';
export type LoaderColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';

export interface LoaderProps {
  type?: LoaderType;
  size?: LoaderSize;
  color?: LoaderColor;
  fullScreen?: boolean;
  overlay?: boolean;
  text?: string;
  progress?: number;
  variant?: 'determinate' | 'indeterminate';
  skeletonVariant?: 'text' | 'rectangular' | 'circular';
  skeletonWidth?: number | string;
  skeletonHeight?: number | string;
  skeletonCount?: number;
  className?: string;
}

// Animations
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled components
const LoaderContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
});

const DotsContainer = styled(Box)({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  justifyContent: 'center',
});

const Dot = styled(Box)<{ $color: string; $size: number; $delay: number }>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  animation: ${bounce} 1.4s infinite ease-in-out;
  animation-delay: ${props => props.$delay}s;
`;

const SpinnerContainer = styled(Box)<{ $size: number }>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: ${rotate} 0.8s linear infinite;
`;

// Size mappings
const sizeMap = {
  small: {
    circular: 24,
    spinner: 24,
    dot: 8,
    linear: 4,
    skeleton: 40
  },
  medium: {
    circular: 40,
    spinner: 40,
    dot: 12,
    linear: 6,
    skeleton: 60
  },
  large: {
    circular: 56,
    spinner: 56,
    dot: 16,
    linear: 8,
    skeleton: 80
  }
};

// Dots Loader
const DotsLoader: React.FC<{ color: string; size: LoaderSize }> = ({ color, size }) => {
  const dotSize = sizeMap[size].dot;
  
  return (
    <DotsContainer>
      <Dot $color={color} $size={dotSize} $delay={0} />
      <Dot $color={color} $size={dotSize} $delay={0.2} />
      <Dot $color={color} $size={dotSize} $delay={0.4} />
    </DotsContainer>
  );
};

// Spinner Loader
const SpinnerLoader: React.FC<{ color: string; size: LoaderSize }> = ({ color, size }) => {
  const spinnerSize = sizeMap[size].spinner;
  
  return (
    <SpinnerContainer $size={spinnerSize} sx={{ color }} />
  );
};

// Skeleton Loader
const SkeletonLoader: React.FC<{
  variant: 'text' | 'rectangular' | 'circular';
  count: number;
  width?: number | string;
  height?: number | string;
}> = ({ variant, count, width, height }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          width={width}
          height={height}
          animation="wave"
          sx={{ mb: index < count - 1 ? 1 : 0 }}
        />
      ))}
    </Box>
  );
};

// Main Loader component
const Loader: React.FC<LoaderProps> = ({
  type = 'circular',
  size = 'medium',
  color = 'primary',
  fullScreen = false,
  overlay = false,
  text,
  progress,
  variant = 'indeterminate',
  skeletonVariant = 'rectangular',
  skeletonWidth,
  skeletonHeight,
  skeletonCount = 1,
  className
}) => {
  const getColorValue = () => {
    const colorMap = {
      primary: 'primary.main',
      secondary: 'secondary.main',
      error: 'error.main',
      info: 'info.main',
      success: 'success.main',
      warning: 'warning.main',
      inherit: 'inherit'
    };
    return colorMap[color];
  };

  const renderLoader = () => {
    switch (type) {
      case 'circular':
        return (
          <CircularProgress
            size={sizeMap[size].circular}
            color={color}
            variant={variant}
            value={progress}
          />
        );

      case 'linear':
        return (
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              color={color}
              variant={variant}
              value={progress}
              sx={{ height: sizeMap[size].linear }}
            />
          </Box>
        );

      case 'dots':
        return <DotsLoader color={getColorValue()} size={size} />;

      case 'spinner':
        return <SpinnerLoader color={getColorValue()} size={size} />;

      case 'skeleton':
        return (
          <SkeletonLoader
            variant={skeletonVariant}
            count={skeletonCount}
            width={skeletonWidth}
            height={skeletonHeight || sizeMap[size].skeleton}
          />
        );

      default:
        return <CircularProgress size={sizeMap[size].circular} color={color} />;
    }
  };

  const content = (
    <LoaderContainer className={className}>
      {renderLoader()}
      {text && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, animation: `${pulse} 1.5s ease-in-out infinite` }}
        >
          {text}
        </Typography>
      )}
    </LoaderContainer>
  );

  // Full screen loader with backdrop
  if (fullScreen || overlay) {
    return (
      <Backdrop
        open={true}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: overlay ? 'rgba(0, 0, 0, 0.5)' : undefined
        }}
      >
        {content}
      </Backdrop>
    );
  }

  return content;
};

// Pre-defined loader components
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <Loader type="circular" size="large" fullScreen text={text} />
);

export const ButtonLoader: React.FC<{ text?: string }> = ({ text }) => (
  <Loader type="circular" size="small" text={text} />
);

export const ContentLoader: React.FC<{ text?: string }> = ({ text }) => (
  <Loader type="dots" size="medium" text={text} />
);

export const TableLoader: React.FC = () => (
  <Loader type="skeleton" skeletonVariant="rectangular" skeletonCount={5} skeletonHeight={60} />
);

export const TextLoader: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <Loader type="skeleton" skeletonVariant="text" skeletonCount={lines} />
);

export const CardLoader: React.FC = () => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ width: 300 }}>
        <Skeleton variant="rectangular" height={200} />
        <Skeleton variant="text" sx={{ mt: 1 }} />
        <Skeleton variant="text" width="60%" />
      </Box>
    ))}
  </Box>
);

export default Loader;
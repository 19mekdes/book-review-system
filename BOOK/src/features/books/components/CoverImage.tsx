// src/features/books/components/CoverImage.tsx
import React, { useState } from 'react';
import { Box, Avatar, Skeleton, Dialog, IconButton, Tooltip } from '@mui/material';
import { ZoomIn as ZoomInIcon, Close as CloseIcon } from '@mui/icons-material';

interface CoverImageProps {
  src?: string;
  title: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'rounded' | 'square';
  onClick?: () => void;
  showZoom?: boolean;
  fallbackImage?: string;
}

const CoverImage: React.FC<CoverImageProps> = ({
  src,
  title,
  size = 'medium',
  variant = 'rounded',
  onClick,
  showZoom = true,
  fallbackImage = 'https://via.placeholder.com/300x450?text=No+Cover'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 120 };
      case 'large':
        return { width: 200, height: 280 };
      default:
        return { width: 150, height: 210 };
    }
  };

  const dimensions = getDimensions();
  const finalSrc = imageError ? fallbackImage : src;

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          cursor: onClick || showZoom ? 'pointer' : 'default',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: onClick || showZoom ? 'scale(1.05)' : 'none'
          }
        }}
        onClick={() => {
          if (onClick) {
            onClick();
          } else if (showZoom && src) {
            setZoomed(true);
          }
        }}
      >
        {!imageLoaded && (
          <Skeleton
            variant={variant === 'rounded' ? 'rounded' : 'rectangular'}
            width={dimensions.width}
            height={dimensions.height}
            animation="wave"
          />
        )}
        
        <Avatar
          src={finalSrc}
          alt={title}
          variant={variant === 'rounded' ? 'rounded' : 'square'}
          sx={{
            width: dimensions.width,
            height: dimensions.height,
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.2s',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
          imgProps={{
            onLoad: () => setImageLoaded(true),
            onError: () => setImageError(true)
          }}
        />
        
        {showZoom && src && (
          <Tooltip title="Click to zoom">
            <Box
              sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                bgcolor: 'rgba(0,0,0,0.6)',
                borderRadius: '50%',
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ZoomInIcon sx={{ fontSize: 16, color: 'white' }} />
            </Box>
          </Tooltip>
        )}
      </Box>

      <Dialog
        open={zoomed}
        onClose={() => setZoomed(false)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            position: 'relative'
          }
        }}
      >
        <IconButton
          onClick={() => setZoomed(false)}
          sx={{
            position: 'absolute',
            top: -40,
            right: 0,
            color: 'white',
            zIndex: 1
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          component="img"
          src={finalSrc}
          alt={title}
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: 2,
            boxShadow: 8
          }}
        />
      </Dialog>
    </>
  );
};

export default CoverImage;
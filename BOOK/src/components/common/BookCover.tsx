import React, { useState, useEffect } from 'react';
import { CardMedia, Box, Typography, Skeleton } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';

interface BookCoverProps {
  src?: string;
  title: string;
  height?: number | string;
  width?: number | string;
  index?: number; // For rotating through available images
}

const BookCover: React.FC<BookCoverProps> = ({ 
  src, 
  title, 
  height = 200, 
  width = '100%',
  index = 0
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Available fallback images
  const fallbackImages = [
    '/images/books/book-1.jpg',
    '/images/books/book-2.jpg',
    '/images/books/book-3.jpg',
    '/images/books/book-4.jpg',
    '/images/books/placeholder.png'
  ];

  // Get a consistent fallback based on index
  const getFallbackImage = () => {
    if (index !== undefined) {
      return fallbackImages[index % fallbackImages.length];
    }
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  };

  // Try to load the image
  useEffect(() => {
    if (!src) {
      // No src provided, use fallback
       
      setImageSrc(getFallbackImage());
      setError(false);
      return;
    }

    // Test if the provided src is valid
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setError(false);
      setLoading(false);
    };
    img.onerror = () => {
      // Primary image failed, try fallback
      setImageSrc(getFallbackImage());
      setError(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, index]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    if (imageSrc !== '/images/books/placeholder.png') {
      // Try placeholder as last resort
      setImageSrc('/images/books/placeholder.png');
    } else {
      // Even placeholder failed, show error state
      setError(true);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Box
        sx={{
          height,
          width,
          bgcolor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}
      >
        <MenuBookIcon sx={{ fontSize: 48, color: '#999', mb: 1 }} />
        <Typography variant="caption" color="text.secondary" align="center" sx={{ px: 1 }}>
          {title.length > 30 ? title.substring(0, 30) + '...' : title}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height, width }}>
      {loading && (
        <Skeleton 
          variant="rectangular" 
          height={height} 
          width={width} 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: 1
          }} 
        />
      )}
      <CardMedia
        component="img"
        height={height}
        image={imageSrc}
        alt={title}
        onLoad={handleImageLoad}
        onError={handleImageError}
        sx={{
          objectFit: 'cover',
          display: loading ? 'none' : 'block',
          borderRadius: 1
        }}
      />
    </Box>
  );
};

export default BookCover;
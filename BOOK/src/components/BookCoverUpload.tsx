import React, { useState } from 'react';
import {
  Box,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import api from '../services/api';

interface BookCoverUploadProps {
  bookId: number;
  currentCover?: string;
  onCoverUpdate: (coverUrl: string) => void;
}

const BookCoverUpload: React.FC<BookCoverUploadProps> = ({ 
  bookId, 
  currentCover, 
  onCoverUpdate 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append('cover', file);

    setUploading(true);
    setError('');

    try {
      const response = await api.post(`/upload/books/${bookId}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSnackbar({
        open: true,
        message: 'Cover image uploaded successfully!',
        severity: 'success'
      });

      onCoverUpdate(response.data.coverImage);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    // Optionally add API call to remove image
  };

  return (
    <Box sx={{ textAlign: 'center', mb: 2 }}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          src={preview || (currentCover ? `http://localhost:3000${currentCover}` : undefined)}
          variant="rounded"
          sx={{
            width: 200,
            height: 250,
            border: '2px solid',
            borderColor: 'primary.main',
            bgcolor: 'grey.100'
          }}
        >
          {!preview && !currentCover && 'No Cover'}
        </Avatar>
        
        {uploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.5)',
              borderRadius: 1
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<PhotoCamera />}
          disabled={uploading}
          size="small"
        >
          Upload Cover
          <input
            type="file"
            hidden
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
          />
        </Button>
        
        {(preview || currentCover) && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleRemove}
            disabled={uploading}
            size="small"
          >
            Remove
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookCoverUpload;
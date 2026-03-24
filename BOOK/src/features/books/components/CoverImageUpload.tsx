// src/features/books/components/CoverImageUpload.tsx
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import api from '../../../services/api';

interface CoverImageUploadProps {
  bookId?: number;
  currentImage?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageDeleted?: () => void;
  disabled?: boolean;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
  bookId,
  currentImage,
  onImageUploaded,
  onImageDeleted,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('coverImage', file);
      if (bookId) {
        formData.append('bookId', bookId.toString());
      }

      const response = await api.post('/books/upload-cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onImageUploaded(response.data.data.coverImage);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) return;

    setUploading(true);
    setError(null);

    try {

      onImageUploaded(imageUrl);
      setUrlDialogOpen(false);
      setImageUrl('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set cover image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!bookId) return;

    setUploading(true);
    try {
      await api.delete(`/books/${bookId}/cover`);
      if (onImageDeleted) onImageDeleted();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete cover image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      {currentImage && (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            src={currentImage}
            variant="rounded"
            sx={{ width: 150, height: 210, borderRadius: 2, boxShadow: 3 }}
          />
          {!disabled && (
            <IconButton
              onClick={handleDelete}
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' }
              }}
              size="small"
              disabled={uploading}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}

      {!currentImage && (
        <Box
          sx={{
            width: 150,
            height: 210,
            bgcolor: 'grey.100',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed grey.300'
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="caption">No cover</Typography>
        </Box>
      )}

      {!disabled && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="small"
          >
            Upload
          </Button>
          <Button
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={() => setUrlDialogOpen(true)}
            disabled={uploading}
            size="small"
          >
            URL
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {uploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="caption">Uploading...</Typography>
        </Box>
      )}

      <Dialog open={urlDialogOpen} onClose={() => setUrlDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Cover from URL</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/book-cover.jpg"
            margin="normal"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUrlDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUrlSubmit} variant="contained" disabled={!imageUrl.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoverImageUpload;
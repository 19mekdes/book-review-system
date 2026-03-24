import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  TextField,
  Button,
  Alert,
  Snackbar,
  Avatar,
  Divider,
  IconButton,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Send as SendIcon
} from '@mui/icons-material';
import api from '../../services/api';

const ContactPage: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const contactInfo = [
    {
      icon: <EmailIcon />,
      title: 'Email',
      info: 'Mekdi@bookreview.com',
      action: 'mailto:support@bookreview.com'
    },
    {
      icon: <PhoneIcon />,
      title: 'Phone',
      info: '0980536095',
      action: 'tel:+251980536095'
    },
    {
      icon: <LocationIcon />,
      title: 'Address',
      info: '123 Book Street, Reading City, RC 12345',
      action: null
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.length < 10) newErrors.message = 'Message must be at least 10 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await api.post('/contact', formData);
      setNotification({
        open: true,
        message: 'Message sent successfully! We\'ll get back to you soon.',
        severity: 'success'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: theme.palette.primary.main,
        color: 'white',
        py: 6,
        mb: 6,
        borderRadius: 2
      }}>
        <Typography variant="h2" component="h1" fontWeight={700} gutterBottom align="center">
          Contact Us
        </Typography>
        <Typography variant="h5" align="center" sx={{ maxWidth: 800, mx: 'auto' }}>
          Have questions? We'd love to hear from you
        </Typography>
      </Box>

      <Grid container spacing={6}>
        {/* Contact Information */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Get in Touch
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Have a question about a book? Need help with your account? 
            Want to report an issue? We're here to help!
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            {contactInfo.map((info, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mr: 2
                }}>
                  {info.icon}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {info.title}
                  </Typography>
                  {info.action ? (
                    <Button href={info.action} sx={{ p: 0, textTransform: 'none' }}>
                      <Typography variant="body2" color="primary">
                        {info.info}
                      </Typography>
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {info.info}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Follow Us
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton href="https://facebook.com" target="_blank" sx={{ bgcolor: alpha('#1877f2', 0.1), color: '#1877f2' }}>
              <FacebookIcon />
            </IconButton>
            <IconButton href="https://twitter.com" target="_blank" sx={{ bgcolor: alpha('#1da1f2', 0.1), color: '#1da1f2' }}>
              <TwitterIcon />
            </IconButton>
            <IconButton href="https://instagram.com" target="_blank" sx={{ bgcolor: alpha('#e4405f', 0.1), color: '#e4405f' }}>
              <InstagramIcon />
            </IconButton>
          </Box>
        </Grid>
        
        {/* Contact Form */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Send us a Message
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We'll respond within 24-48 hours
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    error={!!errors.subject}
                    helperText={errors.subject}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    error={!!errors.message}
                    helperText={errors.message}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContactPage;
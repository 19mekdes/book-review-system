// src/pages/public/AboutPage.tsx
import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  Avatar,
  useTheme,
  alpha,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Chip,
  IconButton
} from '@mui/material';
import {
  MenuBook as BookIcon,
  RateReview as ReviewIcon,
  Group as GroupIcon,
  EmojiEvents as TrophyIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Star as StarIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const stats = [
    { value: '10,000+', label: 'Books', icon: <BookIcon />, color: '#1976d2' },
    { value: '5,000+', label: 'Reviews', icon: <ReviewIcon />, color: '#4caf50' },
    { value: '2,000+', label: 'Active Users', icon: <GroupIcon />, color: '#ff9800' },
    { value: '500+', label: 'Daily Reviews', icon: <TrophyIcon />, color: '#f44336' }
  ];

  const features = [
    {
      icon: <CheckCircleIcon />,
      title: 'Authentic Reviews',
      description: 'All reviews come from verified users who have actually read the books.',
      color: '#4caf50'
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Personalized Recommendations',
      description: 'Get book suggestions based on your reading history and preferences.',
      color: '#2196f3'
    },
    {
      icon: <SecurityIcon />,
      title: 'Trusted Community',
      description: 'Safe and moderated platform for genuine book discussions.',
      color: '#9c27b0'
    },
    {
      icon: <SpeedIcon />,
      title: 'Fast & Responsive',
      description: 'Modern UI with smooth navigation and quick search results.',
      color: '#ff5722'
    }
  ];

  const userBenefits = [
    { icon: <FavoriteIcon />, text: 'Create personalized reading lists' },
    { icon: <StarIcon />, text: 'Rate and review books you\'ve read' },
    { icon: <BookmarkIcon />, text: 'Bookmark books to read later' },
    { icon: <ShareIcon />, text: 'Share reviews with friends and community' }
  ];

  const teamMembers = [
    {
      name: 'John Anderson',
      role: 'Lead Developer & Founder',
      bio: 'Passionate about books and technology. John built the platform to connect readers worldwide.',
      avatar: 'J',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    },
    {
      name: 'Sarah Mitchell',
      role: 'Product Manager',
      bio: 'Book enthusiast with 10+ years in publishing. Sarah ensures the best user experience.',
      avatar: 'S',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    },
    {
      name: 'David Chen',
      role: 'Community Manager',
      bio: 'Avid reader and community builder. David moderates reviews and engages with readers.',
      avatar: 'D',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    }
  ];

  const milestones = [
    { year: '2023', event: 'Platform Launch', description: 'BookReview went live with 1,000+ books' },
    { year: '2024', event: '10,000 Books', description: 'Reached 10,000 books in our catalog' },
    { year: '2024', event: 'Community Growth', description: '5,000+ active users joined our community' },
    { year: '2025', event: 'Future Goals', description: 'Launching mobile app and AI recommendations' }
  ];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white',
        py: { xs: 6, md: 10 },
        mb: 6,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight={800} 
            gutterBottom 
            align="center"
            sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
          >
            About BookReview
          </Typography>
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ maxWidth: 700, mx: 'auto', opacity: 0.95, mb: 4 }}
          >
            Connecting readers with great books through authentic reviews and a passionate community
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              onClick={() => navigate('/books')}
            >
              Start Reading
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Mission Section */}
        <Grid container spacing={6} sx={{ mb: 8 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip 
              label="Our Mission" 
              color="primary" 
              sx={{ mb: 2, fontWeight: 600 }}
            />
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
              Why We Built This Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              In a world flooded with book recommendations, finding genuine reviews can be challenging. 
              BookReview was created to provide a trusted space where readers can share honest opinions 
              and discover books that truly resonate with them.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              We believe that every book deserves a fair review and every reader deserves to find 
              their next favorite read. Our platform empowers readers to make informed decisions 
              through authentic, community-driven reviews.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/register')}
              sx={{ mt: 2 }}
            >
              Join Our Community
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 4,
              p: 4,
              textAlign: 'center',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                📚✨
              </Typography>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                "Read more, share more, discover more"
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join thousands of readers who are already discovering their next favorite book
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Stats Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" align="center" fontWeight={700} gutterBottom>
            Our Impact
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
            Numbers that show how our community is growing and helping readers find great books
          </Typography>
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[4] }
                }}>
                  <Avatar sx={{ 
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" align="center" fontWeight={700} gutterBottom>
            What Makes Us Different
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
            Discover the features that set BookReview apart from other platforms
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card sx={{ 
                  p: 3, 
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: theme.shadows[4] }
                }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Avatar sx={{ 
                      bgcolor: alpha(feature.color, 0.1),
                      color: feature.color,
                      width: 56,
                      height: 56
                    }}>
                      {feature.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* User Benefits Section */}
        <Box sx={{ mb: 8, bgcolor: 'white', borderRadius: 4, p: { xs: 3, md: 5 }, boxShadow: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                What You Can Do
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                As a BookReview member, you get access to powerful tools to enhance your reading journey
              </Typography>
              <List>
                {userBenefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                      {benefit.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={benefit.text}
                      primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 4,
                p: 4,
                textAlign: 'center'
              }}>
                <Typography variant="h2" sx={{ fontSize: '3rem', mb: 2 }}>
                  🎯
                </Typography>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Ready to Start?
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Join thousands of readers who are already discovering great books
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ mt: 2 }}
                >
                  Create Free Account
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Timeline Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" align="center" fontWeight={700} gutterBottom>
            Our Journey
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            The milestones that shaped BookReview
          </Typography>
          <Grid container spacing={3}>
            {milestones.map((milestone, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  position: 'relative',
                  '&::before': index !== milestones.length - 1 ? {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    right: '-20px',
                    width: '40px',
                    height: '2px',
                    bgcolor: alpha(theme.palette.primary.main, 0.3),
                    display: { xs: 'none', md: 'block' }
                  } : {}
                }}>
                  <Typography variant="h4" color="primary" fontWeight={800}>
                    {milestone.year}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {milestone.event}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {milestone.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" align="center" fontWeight={700} gutterBottom>
            Meet the Team
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
            Passionate individuals working to make reading better for everyone
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 4, 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <Avatar
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '2.5rem'
                    }}
                  >
                    {member.avatar}
                  </Avatar>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {member.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {member.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {member.bio}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton href={member.github} target="_blank" size="small" sx={{ color: '#333' }}>
                      <GitHubIcon />
                    </IconButton>
                    <IconButton href={member.linkedin} target="_blank" size="small" sx={{ color: '#0077b5' }}>
                      <LinkedInIcon />
                    </IconButton>
                    <IconButton href={member.twitter} target="_blank" size="small" sx={{ color: '#1da1f2' }}>
                      <TwitterIcon />
                    </IconButton>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Paper sx={{ 
          p: { xs: 4, md: 6 }, 
          textAlign: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          borderRadius: 4
        }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Join Our Reading Community
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            Be part of a growing community of readers who share their passion for books
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/register')}
            >
              Create Free Account
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/books')}
            >
              Browse Books
            </Button>
            <Button 
              variant="text" 
              size="large"
              startIcon={<EmailIcon />}
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutPage;
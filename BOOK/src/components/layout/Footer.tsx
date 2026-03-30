import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Props interface
export interface FooterProps {
  companyName?: string;
  description?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  quickLinks?: Array<{ label: string; url: string }>;
  variant?: 'light' | 'dark' | 'primary';
  backgroundColor?: string;
}

// Styled Components
const FooterWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$variant' && prop !== '$bgColor',
})<{ $variant?: string; $bgColor?: string }>(({ theme, $variant, $bgColor }) => {
  // Default to primary.main (same blue as header)
  let bg = $bgColor || theme.palette.primary.main;
  let textColor = '#ffffff';

  if ($variant === 'light') {
    bg = $bgColor || theme.palette.background.paper;
    textColor = theme.palette.text.primary;
  } else if ($variant === 'dark') {
    bg = $bgColor || theme.palette.primary.dark;
    textColor = '#ffffff';
  } else if ($variant === 'primary') {
    bg = $bgColor || theme.palette.primary.main;
    textColor = '#ffffff';
  }

  return {
    backgroundColor: bg,
    color: textColor,
    padding: theme.spacing(6, 0, 4, 0),
    marginTop: 'auto',
  };
});

const FooterLink = styled(Link)(({ theme }) => ({
  color: 'inherit',
  textDecoration: 'none',
  opacity: 0.85,
  '&:hover': {
    opacity: 1,
    color: theme.palette.secondary.main,
  },
}));

// Main Footer Component
const Footer: React.FC<FooterProps> = ({
  companyName = 'Book Review System',
  description = 'Discover great books. Read honest reviews. Join the community of readers.',
  socialLinks = {},
  quickLinks = [
    { label: 'Home', url: '/' },
    { label: 'Books', url: '/books' },
    { label: 'About', url: '/about' },
    { label: 'Contact', url: '/contact' },
    { label: 'Privacy', url: '/privacy' },
  ],
  variant = 'primary',
  backgroundColor,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterWrapper $variant={variant} $bgColor={backgroundColor}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Left - Brand & Description */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ letterSpacing: '0.5px' }}
            >
             {companyName}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 420, mb: 3 }}>
              {description}
            </Typography>

            {/* Social Icons */}
            <Stack direction="row" spacing={1.5}>
              {socialLinks.facebook && (
                <IconButton
                  component="a"
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  sx={{
                    color: 'inherit',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <FacebookIcon />
                </IconButton>
              )}

              {socialLinks.twitter && (
                <IconButton
                  component="a"
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  sx={{
                    color: 'inherit',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <TwitterIcon />
                </IconButton>
              )}

              {socialLinks.instagram && (
                <IconButton
                  component="a"
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  sx={{
                    color: 'inherit',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <InstagramIcon />
                </IconButton>
              )}

              {socialLinks.linkedin && (
                <IconButton
                  component="a"
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  sx={{
                    color: 'inherit',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
              )}

              {socialLinks.github && (
                <IconButton
                  component="a"
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  sx={{
                    color: 'inherit',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <GitHubIcon />
                </IconButton>
              )}
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Quick Links
            </Typography>
            <Stack spacing={1.2}>
              {quickLinks.slice(0, 6).map((link, i) => (
                <FooterLink 
                  key={i} 
                  href={link.url} 
                  underline="hover"
                >
                  {link.label}
                </FooterLink>
              ))}
            </Stack>
          </Grid>

          {/* Support Column */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Support
            </Typography>
            <Stack spacing={1.2}>
              <FooterLink href="/help" underline="hover">
                Help Center
              </FooterLink>
              <FooterLink href="/faq" underline="hover">
                FAQs
              </FooterLink>
              <FooterLink href="/terms" underline="hover">
                Terms of Service
              </FooterLink>
              <FooterLink href="/privacy" underline="hover">
                Privacy Policy
              </FooterLink>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.12)' }} />

        {/* Bottom bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            opacity: 0.75,
            fontSize: '0.875rem',
          }}
        >
          <Typography variant="body2">
            © {currentYear} {companyName}. All rights reserved.
          </Typography>

          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            Made with <FavoriteIcon sx={{ color: '#ff1744', fontSize: 16 }} /> in Ethiopia
          </Typography>
        </Box>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;
import React from 'react';
import type { ReactNode } from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
}

const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 16px',
  transition: 'all 0.2s ease-in-out',

  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },

  '&:active': {
    transform: 'translateY(0)',
  },

  '&.Mui-disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
}));

function Button({
  children,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  startIcon: startIconProp,
  endIcon: endIconProp,
  ...props
}: ButtonProps) {

  const startIcon =
    React.isValidElement(icon) && iconPosition === 'left'
      ? icon
      : startIconProp;

  const endIcon =
    React.isValidElement(icon) && iconPosition === 'right'
      ? icon
      : endIconProp;

  return (
    <StyledButton
      disabled={disabled || loading}
      startIcon={!loading ? startIcon : undefined}
      endIcon={!loading ? endIcon : undefined}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CircularProgress size={20} color="inherit" />
          {children}
        </span>
      ) : (
        children
      )}
    </StyledButton>
  );
}

export const PrimaryButton = (props: ButtonProps) => (
  <Button variant="contained" color="primary" {...props} />
);

export const SecondaryButton = (props: ButtonProps) => (
  <Button variant="outlined" color="primary" {...props} />
);

export const DangerButton = (props: ButtonProps) => (
  <Button variant="contained" color="error" {...props} />
);

export const SuccessButton = (props: ButtonProps) => (
  <Button variant="contained" color="success" {...props} />
);

export const TextButton = (props: ButtonProps) => (
  <Button variant="text" color="primary" {...props} />
);

export default Button;
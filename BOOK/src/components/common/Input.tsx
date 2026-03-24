import { useState } from "react";
import type { ReactNode, ChangeEvent, FocusEvent } from "react";

import {
  TextField as MuiTextField,
  InputAdornment,
  IconButton,
  FormHelperText,
  Box,
  Typography
} from "@mui/material";

import type { TextFieldProps as MuiTextFieldProps } from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

export interface InputProps extends Omit<MuiTextFieldProps, "variant"> {
  label?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  type?: string;
  value?: unknown;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  showPasswordToggle?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  validate?: (value: string) => string | undefined;
  mask?: (value: string) => string;
  size?: "small" | "medium";
  variant?: "outlined" | "filled" | "standard";
}

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main
      }
    },
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: "2px"
      }
    }
  }
}));

function CharacterCount({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isAtLimit = current >= max;

  return (
    <Typography
      variant="caption"
      color={isAtLimit ? "error" : isNearLimit ? "warning.main" : "text.secondary"}
      sx={{ mt: 0.5, display: "block", textAlign: "right" }}
    >
      {current}/{max}
    </Typography>
  );
}

function Input({
  label,
  error = false,
  helperText,
  fullWidth = true,
  required = false,
  disabled = false,
  readOnly = false,
  placeholder,
  type = "text",
  value,
  onChange,
  onBlur,
  startIcon,
  endIcon,
  showPasswordToggle = false,
  maxLength,
  minLength,
  pattern,
  validate,
  mask,
  size = "medium",
  variant = "outlined",
  ...props
}: InputProps) {

  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const inputType =
    showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;

    if (mask) {
      newValue = mask(newValue);
      event.target.value = newValue;
    }

    onChange?.(event);

    if (touched && internalError) {
      setInternalError(undefined);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setTouched(true);

    if (validate && event.target.value) {
      const validationError = validate(event.target.value);
      setInternalError(validationError);
    }

    if (pattern && event.target.value) {
      const regex = new RegExp(pattern);
      if (!regex.test(event.target.value)) {
        setInternalError("Invalid format");
      }
    }

    if (minLength && event.target.value.length < minLength) {
      setInternalError(`Minimum ${minLength} characters required`);
    }

    onBlur?.(event);
  };

  const hasError = error || !!internalError;
  const displayHelperText = internalError || helperText;

  const startAdornment = startIcon ? (
    <InputAdornment position="start">{startIcon}</InputAdornment>
  ) : null;

  const passwordAdornment = showPasswordToggle ? (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={handleTogglePassword}
        edge="end"
        size="small"
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  ) : null;

  const endAdornment = endIcon && !showPasswordToggle ? (
    <InputAdornment position="end">{endIcon}</InputAdornment>
  ) : passwordAdornment;

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <StyledTextField
        {...props}
        label={label}
        error={hasError}
        fullWidth={fullWidth}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        type={inputType}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        size={size}
        variant={variant}
        inputProps={{
          maxLength,
          minLength,
          pattern,
          readOnly,
          "aria-label": label
        }}
        InputProps={{
          startAdornment,
          endAdornment
        }}
      />

     {maxLength && value != null && (
  <CharacterCount
    current={String(value).length}
    max={maxLength}
  />
)}
      {displayHelperText && (
        <FormHelperText error={hasError} sx={{ mx: 0 }}>
          {displayHelperText}
        </FormHelperText>
      )}
    </Box>
  );
}

export default Input;
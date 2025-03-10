import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, InputAdornment, IconButton, LinearProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const PasswordInput = ({
  id,
  label,
  name,
  hint,
  value,
  onChange,
  required = false,
  disabled = false,
  error = '',
  className = 'figmaInputs',
}) => {
  const [showPassword, setShowPassword] = useState(false); // State to toggle visibility
  const [passwordStrength, setPasswordStrength] = useState(''); // Optional for password strength
  const [strengthPercentage, setStrengthPercentage] = useState(0); // Percentage for progress bar
  const [strengthColor, setStrengthColor] = useState(''); // Color for password strength

  // Calculate password strength based on criteria
  const calculatePasswordStrength = (password) => {
    const lengthCriteria = password.length >= 8;
    const upperCaseCriteria = /[A-Z]/.test(password);
    const lowerCaseCriteria = /[a-z]/.test(password);
    const numberCriteria = /\d/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strength = 'Weak';
    let strengthColor = '#f44336'; // Red for weak by default
    let percentage = 0;

    if (password.length >= 8) {
      if (upperCaseCriteria && lowerCaseCriteria && numberCriteria && specialCharCriteria) {
        strength = 'Strong';
        strengthColor = '#4caf50'; // Green for strong
        percentage = 100;
      } else if ((upperCaseCriteria || lowerCaseCriteria) && (numberCriteria || specialCharCriteria)) {
        strength = 'Medium';
        strengthColor = '#ffeb3b'; // Yellow for medium
        percentage = 70;
      } else {
        strength = 'Weak';
        strengthColor = '#f44336'; // Red for weak
        percentage = 40;
      }
    } else {
      strength = 'Weak';
      strengthColor = '#f44336'; // Red for weak
      percentage = 40;
    }

    return { strength, strengthColor, percentage };
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    onChange(e); // Pass the valid input back to parent

    const { strength, strengthColor, percentage } = calculatePasswordStrength(inputValue);
    setPasswordStrength(strength);
    setStrengthColor(strengthColor);
    setStrengthPercentage(percentage);
  };
  

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState); // Toggle password visibility
  };

  return (
    <div className={`password-input-wrapper ${disabled ? 'disabled' : ''}`} >
      <TextField
        id={id}
        name={name}
        label={label}
        type={showPassword ? 'text' : 'password'} // Toggle between text and password type
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        error={!!error} // Display error state if there's an error
        helperText={error} // Display error message
        fullWidth
        variant="outlined"
        className={`${className} ${error ? 'error' : ''}`}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={togglePasswordVisibility}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        placeholder={hint}
      />

      {/* Password strength progress bar */}
      {value && (
        <div className="password-strength mt-2">
          <div className="text-muted">Strength:</div>
          <LinearProgress
            variant="determinate"
            value={strengthPercentage}
            sx={{
              height: 4,
              borderRadius: '2px',
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: strengthColor,
              },
            }}
          />
          <div className={`text-sm mt-1 ${passwordStrength.toLowerCase()}`}>
            {passwordStrength || 'Enter password'}
          </div>
        </div>
      )}
    </div>
  );
};

PasswordInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  hint: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default PasswordInput;

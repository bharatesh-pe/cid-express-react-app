import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, InputAdornment, IconButton } from '@mui/material';
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
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Ensure the input value is numeric and no longer than 6 digits
    if (/^\d{0,6}$/.test(inputValue)) {
      onChange(e); // Pass the valid input back to the parent
    }
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

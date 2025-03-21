import React, { useRef , useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import PropTypes from 'prop-types';

const OTPInputComponent = ({ length, value, onChange }) => {
  const inputRefs = useRef([]);

  // Handle Input Change
  const handleChange = (event, index) => {
    const newValue = event.target.value.replace(/\D/g, ''); // Allow only numbers

    // Update OTP value
    const otpArray = value.split('');
    otpArray[index] = newValue;
    onChange(otpArray.join(''));

    // Move focus to next field
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Key Press (Backspace to move back)
  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
      // Set focus on the first TextField when the component mounts
      inputRefs.current[0]?.focus();
  }, []);

  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      {Array.from({ length }).map((_, index) => (
        <TextField
          key={index}
          inputRef={(el) => (inputRefs.current[index] = el)}
          value={value[index] || ''}
          onChange={(event) => handleChange(event, index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          inputProps={{
            maxLength: 1,
            style: { textAlign: 'center', fontSize: '20px', width: '40px' },
          }}
          variant="outlined"
        />
      ))}
    </Box>
  );
};

// Prop Types
OTPInputComponent.propTypes = {
  length: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default OTPInputComponent;

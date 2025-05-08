import React from 'react';
import TextField from '@mui/material/TextField';
import './ShortText.css'
import { Box, InputAdornment, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';

const ValueRangeField = ({ field, formData, errors, onChange, onFocus, isFocused, onHistory, readOnly }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {field.heading && <h4 className={`form-field-heading ${readOnly || field.disabled ? 'disabled' : ''}`}>{field.heading}</h4>}
      <TextField
        error={Boolean(errors?.[field?.name])}  // Use Boolean to convert error to true or false
        fullWidth
        id="outlined-basic"
        variant="outlined"
        className='selectHideHistory'
        label={
            <div style={{ display: 'flex', alignItems: 'center',color: Boolean(errors?.[field?.name]) ? '#F04438' : '' }}>
                <span>
                    {field.label}
                </span>
                <span className="anekKannada" style={{ marginTop: '6px' }}>
                    {field.kannada ? '/ ' + field.kannada + ' ' : ''}
                </span>
                {field.required && (
                    <span
                        style={{
                            padding: '0px 0px 0px 5px', 
                            verticalAlign: 'middle'
                        }} 
                        className='MuiFormLabel-asterisk MuiInputLabel-asterisk css-1ljffdk-MuiFormLabel-asterisk'
                    >
                        {'*'}
                    </span>
                )}
                {field.info && (
                    <Tooltip title={field.info ? field.info : ''} arrow placement="top">
                        <InfoIcon className='infoIcon' sx={{
                            color: '#1570EF', 
                            padding: '0px 0px 0px 3px', 
                            fontSize: '20px',
                            verticalAlign: 'middle',
                            marginBottom:'3px'
                        }}/>
                    </Tooltip>
                )}
                {field.history && (
                    <HistoryIcon
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onHistory) {
                                onHistory();
                            } else {
                                console.log("clicked");
                            }
                        }}
                        className='historyIcon' sx={{
                        color: '#1570EF', 
                        padding: '0 1px', 
                        fontSize: '20px',
                        verticalAlign: 'middle',
                        marginBottom:'3px'
                    }}/>
                )}
            </div>
        }
        name={field.name}
        // name={textToSnakecase(field.label)}
        value={formData && formData[field.name] || ''}
        helperText={errors?.[field?.name] || field.supportingText || ' '}  // Display the error if it exists, else fallback to supportingText
        inputProps={{ minLength: field.minLength, maxLength: field.maxLength }}
        // required={field.required === true}
        disabled={readOnly || field.disabled === true}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">{field.prefix}</InputAdornment>,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            // backgroundColor: '#fff', // Inner input background color
          },
            '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: isFocused ? '2px' : '1px', // Apply border width based on focus
                borderColor: isFocused ? '#1570EF' : Boolean(errors?.[field?.name]) ? '#F04438' : '#D0D5DD', // Apply border color based on focus
                boxShadow: isFocused ? '0px 0px 0px 3px #D1E9FF' : 'none', // Apply shadow based on focus
            },
        }}
        onChange={(e) => onChange(e)}
        onFocus={onFocus}
        // focused={isFocused || false}
      />
    </Box>
  );
};

export default ValueRangeField;
